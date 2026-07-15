const logger = require("../config/logger")


/**
 * @name sendEmail
 * @description Send an email via Resend. No-ops with a warning when RESEND_API_KEY
 * is not configured so local development works without an email account.
 */
async function sendEmail({ to, subject, html }) {

    if (!process.env.RESEND_API_KEY) {
        logger.warn({ to, subject }, "RESEND_API_KEY not set, skipping email")
        return
    }

    const { Resend } = require("resend")

    const resend = new Resend(process.env.RESEND_API_KEY)

    const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "HireGenie <onboarding@resend.dev>",
        to,
        subject,
        html
    })

    if (error) {
        throw new Error(`Failed to send email: ${error.message}`)
    }

    logger.info({ to, subject }, "Email sent")
}


module.exports = { sendEmail }
