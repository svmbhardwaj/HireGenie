require("dotenv").config()
const http = require("http")
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const logger = require("./src/config/logger")
const { initSocket } = require("./src/services/socket.service")
const { startCronJobs } = require("./src/config/cron")

const PORT = process.env.PORT || 3000

connectToDB()

const server = http.createServer(app)

initSocket(server)
startCronJobs()

server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`)
})
