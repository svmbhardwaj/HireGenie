require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const logger = require("./src/config/logger")

const PORT = process.env.PORT || 3000

connectToDB()


app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`)
})
