const subscriptionModel = require("../models/subscription.model")
const { createOrder, verifyWebhookSignature } = require("../services/payment.service")
const logger = require("../config/logger")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")


/**
 * @description Controller to create a Razorpay order for the monthly plan.
 * The client completes the payment with Razorpay checkout using this order id.
 */
async function createOrderController(req, res) {

    const order = await createOrder(req.user.id)

    res.status(201).json({
        message: "Order created successfully.",
        order: {
            id: order.id,
            amount: order.amount,
            currency: order.currency
        },
        keyId: process.env.RAZORPAY_KEY_ID
    })
}


/**
 * @description Razorpay webhook handler. Verifies the signature over the raw body and
 * activates the user's subscription for one month on payment capture.
 * Mounted with express.raw so req.body is the raw Buffer.
 */
async function webhookController(req, res) {

    const signature = req.headers["x-razorpay-signature"]

    if (!verifyWebhookSignature(req.body, signature)) {
        throw new AppError(400, "Invalid webhook signature.")
    }

    const event = JSON.parse(req.body.toString())

    if (event.event === "payment.captured") {

        const payment = event.payload.payment.entity
        const userId = payment.notes && payment.notes.userId

        if (!userId) {
            logger.warn({ paymentId: payment.id }, "Payment captured without userId note")
            return res.status(200).json({ received: true })
        }

        const currentPeriodEnd = new Date()
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)

        await subscriptionModel.findOneAndUpdate(
            { user: userId },
            {
                plan: "paid",
                status: "active",
                currentPeriodEnd,
                razorpayOrderId: payment.order_id,
                razorpayPaymentId: payment.id
            },
            { upsert: true, new: true }
        )

        logger.info({ userId, paymentId: payment.id }, "Subscription activated")
    }

    res.status(200).json({ received: true })
}


/**
 * @description Controller to get the logged in user's subscription (defaults to free tier).
 */
async function getSubscriptionController(req, res) {

    const subscription = await subscriptionModel.findOne({ user: req.user.id })

    res.status(200).json({
        message: "Subscription fetched successfully.",
        subscription: subscription || { plan: "free", status: "active" }
    })
}


module.exports = {
    createOrderController: catchAsync(createOrderController),
    webhookController: catchAsync(webhookController),
    getSubscriptionController: catchAsync(getSubscriptionController)
}
