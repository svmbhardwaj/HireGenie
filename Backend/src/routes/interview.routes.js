const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")
const validate = require("../middlewares/validate.middleware")
const { aiLimiter } = require("../middlewares/rateLimit.middleware")
const { enforceQuota } = require("../middlewares/quota.middleware")
const {
    generateReportSchema,
    interviewIdParamSchema,
    interviewReportIdParamSchema,
    jobIdParamSchema
} = require("../validators/interview.validator")

const interviewRouter = express.Router()



/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
interviewRouter.post("/", authMiddleware.authUser, aiLimiter, upload.single("resume"), validate(generateReportSchema), interviewController.generateInterViewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, validate(interviewIdParamSchema), interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)


/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, aiLimiter, validate(interviewReportIdParamSchema), enforceQuota("resume-pdf"), interviewController.generateResumePdfController)


/**
 * @route GET /api/interview/job/:jobId/status
 * @description poll the status of a queued generation job (fallback for clients without sockets).
 * @access private
 */
interviewRouter.get("/job/:jobId/status", authMiddleware.authUser, validate(jobIdParamSchema), interviewController.getJobStatusController)



module.exports = interviewRouter
