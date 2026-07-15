const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const crypto = require("crypto")
const pinoHttp = require("pino-http")

const logger = require("./config/logger")
const { globalLimiter } = require("./middlewares/rateLimit.middleware")
const { notFound, errorMiddleware } = require("./middlewares/error.middleware")

const app = express()

// Attach a request id to every request and log it via pino.
app.use(pinoHttp({
    logger,
    genReqId: function (req, res) {
        const existing = req.headers["x-request-id"]
        const id = existing || crypto.randomUUID()
        res.setHeader("x-request-id", id)
        return id
    }
}))

// Razorpay webhook signature is computed over the raw body, so the global JSON
// parser must skip it — the webhook route mounts express.raw itself.
app.use(function (req, res, next) {
    if (req.originalUrl === "/api/payment/webhook") return next()
    express.json()(req, res, next)
})
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(globalLimiter)


/**
 * @route GET /health
 * @description liveness probe for load balancers / uptime checks
 * @access public
 */
app.get("/health", function (req, res) {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime()
    })
})


/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const mockRouter = require("./routes/mock.routes")
const dashboardRouter = require("./routes/dashboard.routes")
const paymentRouter = require("./routes/payment.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/mock", mockRouter)
app.use("/api/dashboard", dashboardRouter)
app.use("/api/payment", paymentRouter)


/* 404 + centralized error handling, registered last */
app.use(notFound)
app.use(errorMiddleware)


module.exports = app
