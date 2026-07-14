# Architecture

This document covers how HireGenie works today, what's wrong with that, and the plan to fix it. Read it in that order if you're new to the repo.

## 1. Current architecture (as it exists now)

```
Client (React, Vite)
   │  HTTPS, cookie-based auth
   ▼
Express API (single process, port 3000)
   ├── /api/auth       → register, login, logout, get-me
   ├── /api/interview  → generate report, list reports, get report, generate PDF
   │
   ├── middlewares: authUser (JWT + blacklist check), multer (file upload)
   │
   ├── services/ai.service.js
   │     ├── generateInterviewReport()  → one Gemini call, structured JSON output
   │     └── generateResumePdf()        → Gemini generates HTML, Puppeteer renders PDF
   │
   └── models (Mongoose): users, interviewReports, blacklistTokens

MongoDB — single database, no caching layer, no queue
```

### Request flow: generating an interview report

1. Client sends `POST /api/interview` with a resume file (multipart), self-description, and job description.
2. `authUser` middleware checks the JWT cookie against the blacklist, then decodes it.
3. `multer` buffers the resume file in memory.
4. Controller extracts text from the PDF using `pdf-parse`.
5. Controller calls `generateInterviewReport()`, which sends one prompt to Gemini with a Zod-derived JSON schema, and waits for the full response.
6. Result is saved to MongoDB and returned to the client.

Steps 4-6 all happen inside a single HTTP request-response cycle. There's no queue, no background worker, nothing async about it.

### Why this doesn't scale

- **The Gemini call blocks the request.** If the model takes 15-20 seconds (common for a large structured output), the client's HTTP connection sits open that whole time. Slow connections or proxies will time out before this finishes.
- **Puppeteer inside a request handler is worse.** Launching a headless Chrome instance per request is expensive (memory, CPU, cold-start time) and doing it synchronously means one slow PDF generation can hold up the whole event loop's perceived responsiveness for other requests.
- **No backpressure.** If ten users hit "generate report" at once, you get ten concurrent Gemini calls and no way to queue, throttle, or prioritize them. Your Gemini bill and your server's memory both take the hit at the same time.
- **No retry.** If Gemini returns a malformed response or times out, the user just gets a 500. There's no retry logic anywhere.
- **Auth is thin.** One JWT, no rotation, no httpOnly/secure/sameSite flags on the cookie, blacklist collection grows forever with no expiry.
- **No validation layer.** Controllers assume the request body is well-formed. `jobDescription`/`selfDescription` aren't even checked for existence in the interview controller before being sent to Gemini.

## 2. Target architecture (what this is being rebuilt into)

```
Client (React)
   │  HTTPS
   ▼
Express API — stateless, horizontally scalable
   ├── /api/auth        → access + refresh tokens, hardened cookies
   ├── /api/interview    → validates input, enqueues job, returns 202 immediately
   ├── /api/mock         → live turn-based interview sessions (+ socket.io)
   ├── /api/billing      → Razorpay orders + webhook
   ├── /api/dashboard    → aggregated stats across a user's reports
   │
   ├── middlewares: authUser, validateRequest(zod), rateLimiter, errorHandler, requestLogger
   │
   ├── services/
   │    ai.service.js        — Gemini calls, wrapped so the provider can be swapped later
   │    queue.service.js     — BullMQ producer, enqueues report/PDF/voice jobs
   │    storage.service.js   — Cloudinary/S3 upload for resumes and generated PDFs
   │    email.service.js     — Resend/nodemailer for prep-plan reminders
   │    payment.service.js   — Razorpay order creation + webhook verification
   │    socket.service.js    — job progress push + live mock interview messages
   │
   └── models (Mongoose): users, interviewReports, mockSessions, subscriptions, blacklistTokens

Worker process — separate entrypoint (worker.js), same codebase
   └── consumes the BullMQ queue
        → runs the actual Gemini + Puppeteer calls
        → writes results to MongoDB
        → pushes progress to the client over socket.io

Redis
   └── BullMQ queue + rate-limit store

MongoDB
   └── primary datastore, resumes stored as URLs (Cloudinary/S3), not raw text/binary

External services: Gemini API, Cloudinary/S3, Resend, Razorpay
```

### Request flow: generating an interview report (target state)

1. Client sends `POST /api/interview`. Zod middleware validates the body before it touches a controller.
2. Controller uploads the resume to Cloudinary/S3, extracts text, and enqueues a job on the `interview-report-generation` queue. Responds immediately with `{ jobId, status: "queued" }`.
3. Client either polls `GET /api/interview/job/:jobId/status` or listens on its socket.io room for a completion event.
4. The worker process picks up the job, calls Gemini, saves the result to MongoDB, and emits a `report:complete` event to that user's socket room.
5. Client updates the UI the moment the event arrives, no polling delay.

This decouples "accepting the request" from "doing the expensive work," which is the single biggest structural fix here.

### Why a separate worker process (not just `setImmediate` or a background promise)

Running the job in-process without a real queue still ties the work to the API server's lifecycle. If the server restarts (deploys, crashes, autoscaling events), in-flight jobs vanish. A real queue (BullMQ backed by Redis) persists jobs, retries failures automatically, and lets you scale workers independently of API instances. If Gemini calls become the bottleneck, you add more worker instances without touching the API layer at all.

## 3. Data model

### Current

```
users
  username, email, password (hashed)

interviewReports
  user (ref), jobDescription, resume (full text), selfDescription,
  matchScore, technicalQuestions[], behavioralQuestions[],
  skillGaps[], preparationPlan[], title

blacklistTokens
  token
```

### Planned additions

```
mockSessions (NEW)
  user (ref), interviewReport (ref), messages[] (role, content, timestamp),
  status (active | completed), createdAt

subscriptions (NEW)
  user (ref), plan (free | pro), razorpayOrderId, status,
  quotaUsed, quotaResetAt

interviewReports (updated)
  resumeUrl (Cloudinary/S3 link) instead of full resume text,
  extractedTextSummary (short, for AI context) instead of the full raw text

blacklistTokens (updated)
  add a TTL index so expired tokens clean themselves up instead of
  growing the collection forever
```

## 4. Security

Current state and what's changing:

| Area | Now | Target |
|---|---|---|
| Token | Single JWT, 1-day expiry | Access token (short-lived) + refresh token (rotated) |
| Cookie flags | None set | `httpOnly`, `secure` (prod), `sameSite` |
| Input validation | None | Zod schema per route |
| Rate limiting | None | `express-rate-limit`, stricter on auth + AI routes |
| Error responses | Raw stack traces possible | Centralized error handler, no internals leaked |
| Blacklist cleanup | Never expires | TTL index on the collection |

## 5. Build phases

The rebuild is sequenced so each phase is independently testable and shippable:

1. **Harden what exists** — validation, cookie security, refresh tokens, error handling, rate limiting, logging. No new features, just making the current thing correct.
2. **Async job processing** — Redis, BullMQ, worker process, socket.io. This is the architectural shift that everything else depends on.
3. **New features** — cloud storage, live mock interview mode, email reminders, dashboard stats, payments/quotas.

Each phase builds on the last. Don't skip phase 1 to get to the interesting features in phase 3, the queue and workers in phase 2 are much easier to reason about once the request layer is already validated and error-safe.

## 6. Open questions / decisions to make later

- **Voice mock interviews**: which STT/TTS provider (Web Speech API client-side vs a server-side service like Deepgram/ElevenLabs) depends on cost tolerance and how real-time it needs to feel.
- **Cloudinary vs S3**: Cloudinary is faster to integrate and handles PDF/image transforms out of the box; S3 is cheaper at scale and more standard if this ever needs multi-region.
- **Provider lock-in on Gemini**: `ai.service.js` should get an interface layer so swapping to Claude or GPT later doesn't mean rewriting every prompt call site.