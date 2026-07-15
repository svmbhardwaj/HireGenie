const mongoose = require("mongoose")


const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [ true, "User is required" ],
        unique: true
    },
    plan: {
        type: String,
        enum: [ "free", "paid" ],
        default: "free"
    },
    status: {
        type: String,
        enum: [ "active", "cancelled", "expired" ],
        default: "active"
    },
    currentPeriodEnd: {
        type: Date
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    }
}, {
    timestamps: true
})

const subscriptionModel = mongoose.model("Subscription", subscriptionSchema)


module.exports = subscriptionModel
