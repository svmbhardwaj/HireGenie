/**
 * @name AppError
 * @description Operational error with an HTTP status code. Anything thrown as an
 * AppError is considered an expected error and its message is safe to send to the client.
 */
class AppError extends Error {
    constructor(statusCode, message, details) {
        super(message)

        this.statusCode = statusCode
        this.isOperational = true
        this.details = details

        Error.captureStackTrace(this, this.constructor)
    }
}


module.exports = AppError
