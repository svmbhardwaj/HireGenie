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

app.use(express.json())
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


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)


/* 404 + centralized error handling, registered last */
app.use(notFound)
app.use(errorMiddleware)


module.exports = app
