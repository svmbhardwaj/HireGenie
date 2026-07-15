const mongoose = require("mongoose")


/*
 * One document per metered action (mock interview started, resume PDF requested).
 * The quota middleware counts these per user per calendar month.
 */
const usageEventSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [ true, "User is required" ],
        index: true
    },
    feature: {
        type: String,
        enum: [ "mock-interview", "resume-pdf" ],
        required: [ true, "Feature is required" ]
    }
}, {
    timestamps: true
})

const usageEventModel = mongoose.model("UsageEvent", usageEventSchema)


module.exports = usageEventModel
