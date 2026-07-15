const crypto = require("crypto")


const MONTHLY_PLAN_AMOUNT_PAISE = Number(process.env.MONTHLY_PLAN_AMOUNT_PAISE) || 49900 // ₹499


function getRazorpayClient() {
    const Razorpay = require("razorpay")

    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
}


/**
 * @name createOrder
 * @description Create a Razorpay order for the monthly plan, tagged with the user id
 * so the webhook can attribute the payment.
 */
async function createOrder(userId) {

    const razorpay = getRazorpayClient()

    const order = await razorpay.orders.create({
        amount: MONTHLY_PLAN_AMOUNT_PAISE,
        currency: "INR",
        notes: { userId: String(userId) }
    })

    return order
}


/**
 * @name verifyWebhookSignature
 * @description Verify a Razorpay webhook: HMAC SHA256 of the raw body with the webhook
 * secret must match the x-razorpay-signature header. Uses a timing-safe comparison.
 */
function verifyWebhookSignature(rawBody, signature) {

    if (!signature) return false

    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex")

    const expectedBuffer = Buffer.from(expected)
    const signatureBuffer = Buffer.from(signature)

    if (expectedBuffer.length !== signatureBuffer.length) return false

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
}


module.exports = { createOrder, verifyWebhookSignature, MONTHLY_PLAN_AMOUNT_PAISE }
