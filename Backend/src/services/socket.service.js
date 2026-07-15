const { Server } = require("socket.io")
const jwt = require("jsonwebtoken")
const redisConnection = require("../config/redis")
const logger = require("../config/logger")


const SOCKET_EVENTS_CHANNEL = "hiregenie:socket-events"

let io = null


/*
 * Minimal cookie header parser so the socket handshake can reuse the same
 * http-only auth cookie as the REST API.
 */
function parseCookies(cookieHeader) {
    const cookies = {}

    if (!cookieHeader) return cookies

    for (const pair of cookieHeader.split(";")) {
        const index = pair.indexOf("=")
        if (index === -1) continue
        cookies[pair.slice(0, index).trim()] = decodeURIComponent(pair.slice(index + 1).trim())
    }

    return cookies
}


/**
 * @name initSocket
 * @description Attach socket.io to the http server. Sockets authenticate with the same
 * JWT access token as the REST API (cookie or handshake auth) and join a room keyed by
 * their user id so background workers can push events to a specific user.
 */
function initSocket(server) {

    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true
        }
    })

    io.use(function (socket, next) {
        const cookies = parseCookies(socket.handshake.headers.cookie)
        const token = cookies.token || socket.handshake.auth.token

        if (!token) {
            return next(new Error("Token not provided."))
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            socket.user = decoded
            next()
        } catch (err) {
            next(new Error("Invalid token."))
        }
    })

    io.on("connection", function (socket) {
        socket.join(`user:${socket.user.id}`)

        logger.debug({ userId: socket.user.id }, "Socket connected")
    })

    subscribeToSocketEvents()

    return io
}


/*
 * The API process subscribes to the redis channel so events published by the
 * worker process (or any other process) are relayed into socket.io rooms.
 */
function subscribeToSocketEvents() {
    const subscriber = redisConnection.duplicate()

    subscriber.subscribe(SOCKET_EVENTS_CHANNEL)

    subscriber.on("message", function (channel, message) {
        try {
            const { userId, event, payload } = JSON.parse(message)
            io.to(`user:${userId}`).emit(event, payload)
        } catch (err) {
            logger.error({ err }, "Failed to relay socket event")
        }
    })
}


/**
 * @name emitToUser
 * @description Publish an event for a specific user. Safe to call from any process
 * (api or worker) — delivery happens via redis pub/sub in the process that owns io.
 */
async function emitToUser(userId, event, payload) {
    await redisConnection.publish(SOCKET_EVENTS_CHANNEL, JSON.stringify({ userId, event, payload }))
}


module.exports = { initSocket, emitToUser }
