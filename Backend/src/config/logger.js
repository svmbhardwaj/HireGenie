const pino = require("pino")


const isProduction = process.env.NODE_ENV === "production"

/*
 * Structured application logger. In development it pretty-prints for readability,
 * in production it emits raw JSON so log aggregators can parse it.
 */
const logger = pino({
    level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
    transport: isProduction
        ? undefined
        : {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname"
            }
        }
})


module.exports = logger
