const { Router } = require('express')
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const validate = require("../middlewares/validate.middleware")
const { registerSchema, loginSchema } = require("../validators/auth.validator")
const { authLimiter } = require("../middlewares/rateLimit.middleware")

const authRouter = Router()

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", authLimiter, validate(registerSchema), authController.registerUserController)


/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */
authRouter.post("/login", authLimiter, validate(loginSchema), authController.loginUserController)


/**
 * @route POST /api/auth/refresh
 * @description exchange a valid refresh token for a fresh access + refresh token pair
 * @access Public (requires refresh cookie)
 */
authRouter.post("/refresh", authLimiter, authController.refreshTokenController)


/**
 * @route GET /api/auth/logout
 * @description clear tokens from user cookies and add them in blacklist
 * @access public
 */
authRouter.get("/logout", authController.logoutUserController)


/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)


module.exports = authRouter
