<div align="center">

# 🧞 HireGenie

**Your interview prep, but it actually does the work for you.**

Upload a resume. Paste a job description. Get a match score, real interview questions with real answers, your skill gaps, a day-wise study plan, and a resume rewritten for that exact job.

[Features](#what-it-does) · [Stack](#tech-stack) · [Setup](#getting-started) · [API](#api-overview) · [Architecture](./ARCHITECTURE.md) · [Roadmap](#roadmap)

</div>

---

## Why this exists

Most "AI resume tools" out there give you a generic score and call it a day. HireGenie tries to actually get you ready: it doesn't just tell you what's wrong, it hands you the questions, the answers, and a plan to close the gap before your interview.

## What it does

🎯 **Match score** — how well your resume actually lines up with the job, not a vibe check

💬 **Interview questions** — technical and behavioral, each with why they'd ask it and how to answer it well

📉 **Skill gap detection** — what you're missing, ranked by how much it'll actually cost you

📅 **Day-wise prep plan** — a real schedule, not "just study more"

📄 **Tailored resume rewrite** — regenerated as a clean, ATS-friendly PDF built around the specific job

## Tech stack

**Backend** — Node.js · Express 5 · MongoDB (Mongoose) · JWT · Gemini (`@google/genai`) · Puppeteer · Zod

**Frontend** — React · Vite

Full system design, request flow, and where this is headed lives in **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## Project structure

```
HireGenie/
├── Backend/
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/          # DB connection
│       ├── controllers/     # auth, interview
│       ├── middlewares/     # auth check, file upload
│       ├── models/          # user, interviewReport, blacklistTokens
│       ├── routes/          # auth, interview
│       └── services/        # ai.service.js — Gemini + Puppeteer
└── Frontend/
    └── src/
        ├── features/
        │   ├── auth/
        │   └── interview/
        └── app.routes.jsx
```

## Getting started

**You'll need:** Node.js 18+, MongoDB (local or Atlas), and a Gemini API key from [Google AI Studio](https://aistudio.google.com/).

### Backend

```bash
cd Backend
npm install
```

Drop a `.env` in `Backend/`:

```env
MONGO_URI=mongodb://localhost:27017/hiregenie
JWT_SECRET=your_jwt_secret_here
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
```

```bash
npm run dev
```

Server's up on `http://localhost:3000`.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

## API overview

| Method | Route | Auth | What it does |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Log in |
| GET | `/api/auth/logout` | Public | Log out, blacklists the token |
| GET | `/api/auth/get-me` | Private | Current user details |
| POST | `/api/interview/` | Private | Upload resume + JD, generate a report |
| GET | `/api/interview/` | Private | List all your reports |
| GET | `/api/interview/report/:interviewId` | Private | Get one report |
| POST | `/api/interview/resume/pdf/:interviewReportId` | Private | Generate a tailored resume PDF |

> Auth runs on an httpOnly cookie. Every frontend request needs `credentials: "include"`, or you'll just get 401s and confusion.

## Roadmap

Currently being rebuilt to survive real traffic, not just a demo run:

- [ ] Refresh tokens + hardened auth cookies
- [ ] Async job processing — no more requests that block on Gemini or Puppeteer
- [ ] Live, turn-based mock interview mode
- [ ] Voice-based mock interviews
- [ ] Progress dashboard across multiple reports
- [ ] Cloud storage for resumes and generated PDFs
- [ ] Freemium tiers via Razorpay
- [ ] Rate limiting + centralized error handling

Full plan, phase by phase, in **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## License

Not picked yet. Add one before this goes public.

---

<div align="center">

Built with late nights, too much coffee, and a healthy grudge against boring resume tools.

</div>
