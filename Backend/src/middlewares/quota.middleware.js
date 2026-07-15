const subscriptionModel = require("../models/subscription.model")
const usageEventModel = require("../models/usageEvent.model")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")


const FREE_TIER_MONTHLY_LIMIT = Number(process.env.FREE_TIER_MONTHLY_LIMIT) || 3


/**
 * @name enforceQuota
 * @description Build a middleware that gates a metered feature. Users on an active paid
 * subscription pass through; free-tier users get FREE_TIER_MONTHLY_LIMIT uses per feature
 * per calendar month. On success the usage event is recorded before the controller runs.
 */
function enforceQuota(feature) {
    return catchAsync(async function (req, res, next) {

        const subscription = await subscriptionModel.findOne({ user: req.user.id })

        const isPaid = subscription
            && subscription.plan === "paid"
            && subscription.status === "active"
            && (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date())

        if (!isPaid) {
            const monthStart = new Date()
            monthStart.setDate(1)
            monthStart.setHours(0, 0, 0, 0)

            const usedThisMonth = await usageEventModel.countDocuments({
                user: req.user.id,
                feature,
                createdAt: { $gte: monthStart }
            })

            if (usedThisMonth >= FREE_TIER_MONTHLY_LIMIT) {
                throw new AppError(402, `Free tier limit of ${FREE_TIER_MONTHLY_LIMIT} ${feature} uses per month reached. Upgrade to continue.`)
            }
        }

        await usageEventModel.create({ user: req.user.id, feature })

        next()
    })
}


module.exports = { enforceQuota }
