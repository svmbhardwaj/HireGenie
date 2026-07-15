const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const mockController = require("../controllers/mock.controller")
const validate = require("../middlewares/validate.middleware")
const { aiLimiter } = require("../middlewares/rateLimit.middleware")
const { enforceQuota } = require("../middlewares/quota.middleware")
const { startMockSessionSchema, answerMockSessionSchema, sessionIdParamSchema } = require("../validators/mock.validator")

const mockRouter = express.Router()



/**
 * @route POST /api/mock/start
 * @description start a new mock interview session from an existing interview report.
 * @access private (quota: free tier limited per month)
 */
mockRouter.post("/start", authMiddleware.authUser, aiLimiter, validate(startMockSessionSchema), enforceQuota("mock-interview"), mockController.startMockSessionController)


/**
 * @route POST /api/mock/:sessionId/answer
 * @description submit an answer and get the next AI follow-up question.
 * @access private
 */
mockRouter.post("/:sessionId/answer", authMiddleware.authUser, aiLimiter, validate(answerMockSessionSchema), mockController.answerMockSessionController)


/**
 * @route GET /api/mock/:sessionId
 * @description get a mock session with its conversation history.
 * @access private
 */
mockRouter.get("/:sessionId", authMiddleware.authUser, validate(sessionIdParamSchema), mockController.getMockSessionController)


/**
 * @route POST /api/mock/:sessionId/end
 * @description end a mock session.
 * @access private
 */
mockRouter.post("/:sessionId/end", authMiddleware.authUser, validate(sessionIdParamSchema), mockController.endMockSessionController)



module.exports = mockRouter
