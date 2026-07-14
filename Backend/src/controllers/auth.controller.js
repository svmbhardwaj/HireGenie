const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")
const { signAccessToken, signRefreshToken, setAuthCookies, clearAuthCookies } = require("../utils/token")


/*
 * Blacklist a token until its own natural expiry so the TTL index can reap it.
 * Falls back to a short window if the token can't be decoded.
 */
async function blacklistToken(token) {
    let expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    const decoded = jwt.decode(token)
    if (decoded && decoded.exp) {
        expiresAt = new Date(decoded.exp * 1000)
    }

    await tokenBlacklistModel.create({ token, expiresAt })
}


/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {

    const { username, email, password } = req.body

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    if (isUserAlreadyExists) {
        throw new AppError(409, "Account already exists with this email address or username")
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    setAuthCookies(res, {
        accessToken: signAccessToken(user),
        refreshToken: signRefreshToken(user)
    })

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        throw new AppError(400, "Invalid email or password")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        throw new AppError(400, "Invalid email or password")
    }

    setAuthCookies(res, {
        accessToken: signAccessToken(user),
        refreshToken: signRefreshToken(user)
    })

    res.status(200).json({
        message: "User loggedIn successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name refreshTokenController
 * @description exchange a valid refresh token cookie for a fresh access + refresh token pair
 * @access Public (requires a valid refresh cookie)
 */
async function refreshTokenController(req, res) {

    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        throw new AppError(401, "Refresh token not provided.")
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({ token: refreshToken })

    if (isBlacklisted) {
        throw new AppError(401, "Refresh token is invalid.")
    }

    let decoded
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch (err) {
        throw new AppError(401, "Invalid refresh token.")
    }

    const user = await userModel.findById(decoded.id)

    if (!user) {
        throw new AppError(401, "User no longer exists.")
    }

    // Rotate: invalidate the used refresh token, then issue a new pair
    await blacklistToken(refreshToken)

    setAuthCookies(res, {
        accessToken: signAccessToken(user),
        refreshToken: signRefreshToken(user)
    })

    res.status(200).json({
        message: "Token refreshed successfully."
    })
}


/**
 * @name logoutUserController
 * @description clear tokens from user cookies and add them in the blacklist
 * @access public
 */
async function logoutUserController(req, res) {

    const token = req.cookies.token
    const refreshToken = req.cookies.refreshToken

    if (token) {
        await blacklistToken(token)
    }

    if (refreshToken) {
        await blacklistToken(refreshToken)
    }

    clearAuthCookies(res)

    res.status(200).json({
        message: "User logged out successfully"
    })
}


/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)

    if (!user) {
        throw new AppError(404, "User not found.")
    }

    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


module.exports = {
    registerUserController: catchAsync(registerUserController),
    loginUserController: catchAsync(loginUserController),
    refreshTokenController: catchAsync(refreshTokenController),
    logoutUserController: catchAsync(logoutUserController),
    getMeController: catchAsync(getMeController)
}
