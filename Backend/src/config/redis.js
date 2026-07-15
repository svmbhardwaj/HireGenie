const IORedis = require("ioredis")


/*
 * Shared redis connection factory. BullMQ requires maxRetriesPerRequest to be null.
 * Each consumer (queues, workers, socket adapter) should duplicate this base connection
 * when it needs a dedicated one (e.g. pub/sub).
 */
const redisConnection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null
})


module.exports = redisConnection
