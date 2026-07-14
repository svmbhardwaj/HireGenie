const mongoose = require("mongoose")
const logger = require("./logger")



async function connectToDB() {

    try {
        await mongoose.connect(process.env.MONGO_URI)

        logger.info("Connected to Database")
    }
    catch (err) {
        logger.error({ err }, "Failed to connect to Database")
        process.exit(1)
    }
}

module.exports = connectToDB
