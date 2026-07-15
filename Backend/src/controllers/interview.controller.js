const pdfParse = require("pdf-parse")
const interviewReportModel = require("../models/interviewReport.model")
const { enqueueReport, enqueueResumePdf, getJobById } = require("../services/queue.service")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")


/**
 * @description Controller to queue interview report generation based on user self description,
 * resume and job description. Responds immediately with a job id; the worker process does the
 * AI generation and notifies the user via socket.io when the report is ready.
 */
async function generateInterViewReportController(req, res) {

    if (!req.file) {
        throw new AppError(400, "A resume PDF file is required.")
    }

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const { selfDescription, jobDescription } = req.body

    const jobId = await enqueueReport({
        userId: req.user.id,
        resume: resumeContent.text,
        resumeFileBase64: req.file.buffer.toString("base64"),
        selfDescription,
        jobDescription
    })

    res.status(202).json({
        jobId,
        status: "queued",
        message: "Interview report generation queued."
    })

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        throw new AppError(404, "Interview report not found.")
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to queue resume PDF generation for an interview report.
 * Responds immediately with a job id; the worker notifies via socket.io when done.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

    if (!interviewReport) {
        throw new AppError(404, "Interview report not found.")
    }

    const jobId = await enqueueResumePdf({
        userId: req.user.id,
        interviewReportId
    })

    res.status(202).json({
        jobId,
        status: "queued",
        message: "Resume PDF generation queued."
    })
}


/**
 * @description Controller to poll the status of a queued job, as a fallback for clients
 * not connected via socket.io. Returns the job state and its result once completed.
 */
async function getJobStatusController(req, res) {
    const { jobId } = req.params

    const job = await getJobById(jobId)

    if (!job || job.data.userId !== req.user.id) {
        throw new AppError(404, "Job not found.")
    }

    const state = await job.getState()

    res.status(200).json({
        jobId,
        status: state,
        ...(state === "completed" ? { result: job.returnvalue } : {}),
        ...(state === "failed" ? { failedReason: job.failedReason } : {})
    })
}


module.exports = {
    generateInterViewReportController: catchAsync(generateInterViewReportController),
    getInterviewReportByIdController: catchAsync(getInterviewReportByIdController),
    getAllInterviewReportsController: catchAsync(getAllInterviewReportsController),
    generateResumePdfController: catchAsync(generateResumePdfController),
    getJobStatusController: catchAsync(getJobStatusController)
}
