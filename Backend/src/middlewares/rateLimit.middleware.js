const rateLimit = require("express-rate-limit")


const standardHeaders = "draft-7"

/*
 * Loose limiter applied to every request as a baseline abuse guard.
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." }
})


/*
 * Strict limiter for authentication endpoints to slow down credential stuffing.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders,
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again later." }
})


/*
 * Strict limiter for the AI-cost routes (report + resume generation).
 */
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    standardHeaders,
    legacyHeaders: false,
    message: { message: "AI request limit reached, please try again later." }
})


module.exports = { globalLimiter, authLimiter, aiLimiter }
