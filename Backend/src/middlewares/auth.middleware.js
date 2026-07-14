const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")


/**
 * @name authUser
 * @description Authenticate a request using the http-only access token cookie.
 * Rejects missing, blacklisted, or invalid tokens and attaches the decoded user to req.
 */
async function authUser(req, res, next) {

    const token = req.cookies.token

    if (!token) {
        throw new AppError(401, "Token not provided.")
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token })

    if (isTokenBlacklisted) {
        throw new AppError(401, "Token is invalid.")
    }

    let decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        throw new AppError(401, "Invalid token.")
    }

    req.user = decoded

    next()
}


module.exports = { authUser: catchAsync(authUser) }
