const jwt = require("jsonwebtoken")


const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m"
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || "7d"

const isProduction = process.env.NODE_ENV === "production"

/*
 * Shared cookie options. httpOnly keeps the tokens out of reach of client-side JS,
 * secure is only enforced in production (so local http still works), and sameSite
 * "lax" allows top-level navigations while blocking most CSRF.
 */
const cookieBaseOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax"
}


/**
 * @name signAccessToken
 * @description Sign a short-lived access token used to authenticate API requests.
 */
function signAccessToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL }
    )
}


/**
 * @name signRefreshToken
 * @description Sign a longer-lived refresh token used only to mint new access tokens.
 */
function signRefreshToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_TTL }
    )
}


/**
 * @name setAuthCookies
 * @description Set the access and refresh tokens as hardened http-only cookies.
 */
function setAuthCookies(res, { accessToken, refreshToken }) {
    res.cookie("token", accessToken, {
        ...cookieBaseOptions,
        maxAge: 15 * 60 * 1000
    })

    res.cookie("refreshToken", refreshToken, {
        ...cookieBaseOptions,
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}


/**
 * @name clearAuthCookies
 * @description Clear both auth cookies on logout.
 */
function clearAuthCookies(res) {
    res.clearCookie("token", cookieBaseOptions)
    res.clearCookie("refreshToken", { ...cookieBaseOptions, path: "/api/auth/refresh" })
}


module.exports = {
    signAccessToken,
    signRefreshToken,
    setAuthCookies,
    clearAuthCookies
}
