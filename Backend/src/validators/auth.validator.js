const { z } = require("zod")


const registerSchema = {
    body: z.object({
        username: z.string().trim().min(3, "Username must be at least 3 characters").max(30),
        email: z.string().trim().toLowerCase().email("A valid email is required"),
        password: z.string().min(6, "Password must be at least 6 characters").max(128)
    })
}


const loginSchema = {
    body: z.object({
        email: z.string().trim().toLowerCase().email("A valid email is required"),
        password: z.string().min(1, "Password is required")
    })
}


module.exports = { registerSchema, loginSchema }
