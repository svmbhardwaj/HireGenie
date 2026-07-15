const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const dashboardController = require("../controllers/dashboard.controller")

const dashboardRouter = express.Router()



/**
 * @route GET /api/dashboard/stats
 * @description matchScore trend over time + aggregated skill gap frequency for the logged in user.
 * @access private
 */
dashboardRouter.get("/stats", authMiddleware.authUser, dashboardController.getDashboardStatsController)



module.exports = dashboardRouter
