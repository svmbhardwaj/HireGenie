const mongoose = require('mongoose')


const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [ true, "token is required to be added in blacklist" ]
    },
    expiresAt: {
        type: Date,
        required: [ true, "expiry is required so the entry can auto-expire" ]
    }
}, {
    timestamps: true
})

// TTL index: Mongo removes each document once the wall clock passes expiresAt,
// so the blacklist never grows beyond the set of not-yet-expired tokens.
blacklistTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)


module.exports = tokenBlacklistModel