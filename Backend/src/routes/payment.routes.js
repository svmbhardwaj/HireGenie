const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const paymentController = require("../controllers/payment.controller")

const paymentRouter = express.Router()



/**
 * @route POST /api/payment/create-order
 * @description create a Razorpay order for the monthly plan.
 * @access private
 */
paymentRouter.post("/create-order", authMiddleware.authUser, paymentController.createOrderController)


/**
 * @route POST /api/payment/webhook
 * @description Razorpay webhook (signature verified over the raw body).
 * @access public (verified by signature)
 */
paymentRouter.post("/webhook", express.raw({ type: "application/json" }), paymentController.webhookController)


/**
 * @route GET /api/payment/subscription
 * @description get the logged in user's subscription.
 * @access private
 */
paymentRouter.get("/subscription", authMiddleware.authUser, paymentController.getSubscriptionController)



module.exports = paymentRouter
