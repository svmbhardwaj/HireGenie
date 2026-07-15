const mongoose = require("mongoose")


const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: [ "user", "model" ],
        required: [ true, "Message role is required" ]
    },
    content: {
        type: String,
        required: [ true, "Message content is required" ]
    }
}, {
    _id: false,
    timestamps: { createdAt: true, updatedAt: false }
})

const mockSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [ true, "User is required" ]
    },
    interviewReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport",
        required: [ true, "Interview report is required" ]
    },
    systemPrompt: {
        type: String,
        required: [ true, "System prompt is required" ]
    },
    messages: [ messageSchema ],
    status: {
        type: String,
        enum: [ "active", "ended" ],
        default: "active"
    }
}, {
    timestamps: true
})

const mockSessionModel = mongoose.model("MockSession", mockSessionSchema)


module.exports = mockSessionModel
