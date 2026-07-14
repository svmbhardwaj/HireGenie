const AppError = require("../utils/AppError")
const logger = require("../config/logger")


/**
 * @name notFound
 * @description Catch-all for unmatched routes, forwards a 404 AppError to the error handler.
 */
function notFound(req, res, next) {
    next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`))
}


/**
 * @name errorMiddleware
 * @description Centralized error handler. Converts known error shapes (AppError,
 * Mongoose validation / duplicate key / cast errors) into clean HTTP responses and
 * hides internal details for anything unexpected.
 */
function errorMiddleware(err, req, res, next) {

    let statusCode = err.statusCode || 500
    let message = err.message || "Internal server error"
    let details = err.details

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400
        message = "Validation failed"
        details = Object.values(err.errors).map(e => e.message)
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409
        message = "Resource already exists"
        details = err.keyValue
    }

    // Mongoose invalid ObjectId
    if (err.name === "CastError") {
        statusCode = 400
        message = `Invalid ${err.path}: ${err.value}`
    }

    const isServerError = statusCode >= 500

    if (isServerError) {
        logger.error({ err, reqId: req.id }, "Unhandled server error")
        // Never leak internal error details to the client on a 500
        message = "Internal server error"
        details = undefined
    } else {
        logger.warn({ reqId: req.id, statusCode, message }, "Request failed")
    }

    res.status(statusCode).json({
        message,
        ...(details ? { details } : {})
    })
}


module.exports = { notFound, errorMiddleware }
