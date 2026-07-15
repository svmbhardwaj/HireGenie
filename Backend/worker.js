require("dotenv").config()

const { Worker } = require("bullmq")
const connectToDB = require("./src/config/database")
const redisConnection = require("./src/config/redis")
const logger = require("./src/config/logger")
const { REPORT_QUEUE_NAME, RESUME_PDF_QUEUE_NAME } = require("./src/services/queue.service")
const { generateInterviewReport, generateResumePdf } = require("./src/services/ai.service")
const { emitToUser } = require("./src/services/socket.service")
const { uploadFile } = require("./src/services/storage.service")
const interviewReportModel = require("./src/models/interviewReport.model")

connectToDB()

/*
 * Only a truncated slice of the extracted resume text is stored on the report —
 * enough for AI context in later features; the original file lives in cloud storage.
 */
const RESUME_TEXT_MAX_CHARS = Number(process.env.RESUME_TEXT_MAX_CHARS) || 8000


/**
 * @name processReportJob
 * @description Generate an interview report with AI, upload the original resume file to
 * cloud storage, persist the report to Mongo and notify the user's socket room.
 * The returned value is exposed on the polling status endpoint.
 */
async function processReportJob(job) {

    const { userId, resume, resumeFileBase64, selfDescription, jobDescription } = job.data

    const interViewReportByAi = await generateInterviewReport({
        resume,
        selfDescription,
        jobDescription
    })

    let resumeFileUrl
    try {
        const uploaded = await uploadFile(Buffer.from(resumeFileBase64, "base64"), {
            folder: `resumes/${userId}`,
            filename: `original-${job.id}.pdf`,
            contentType: "application/pdf"
        })
        resumeFileUrl = uploaded.url
    } catch (err) {
        // storage being down should not lose the generated report
        logger.error({ err, jobId: job.id }, "Failed to upload original resume file")
    }

    const interviewReport = await interviewReportModel.create({
        user: userId,
        resume: resume.slice(0, RESUME_TEXT_MAX_CHARS),
        resumeFileUrl,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    await emitToUser(userId, "report:ready", {
        jobId: job.id,
        interviewReportId: interviewReport._id
    })

    return { interviewReportId: interviewReport._id }
}


/**
 * @name processResumePdfJob
 * @description Generate a tailored resume PDF for an existing interview report, upload it
 * to cloud storage, save the URL on the report and notify the user's socket room.
 */
async function processResumePdfJob(job) {

    const { userId, interviewReportId } = job.data

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        throw new Error("Interview report not found.")
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    const { url: resumePdfUrl } = await uploadFile(Buffer.from(pdfBuffer), {
        folder: `generated-pdfs/${userId}`,
        filename: `resume-${interviewReportId}.pdf`,
        contentType: "application/pdf"
    })

    interviewReport.resumePdfUrl = resumePdfUrl
    await interviewReport.save()

    await emitToUser(userId, "pdf:ready", {
        jobId: job.id,
        interviewReportId,
        resumePdfUrl
    })

    return { interviewReportId, resumePdfUrl }
}


const reportWorker = new Worker(REPORT_QUEUE_NAME, processReportJob, {
    connection: redisConnection,
    concurrency: 2
})

const resumePdfWorker = new Worker(RESUME_PDF_QUEUE_NAME, processResumePdfJob, {
    connection: redisConnection,
    concurrency: 1
})


for (const worker of [ reportWorker, resumePdfWorker ]) {

    worker.on("completed", function (job) {
        logger.info({ queue: worker.name, jobId: job.id }, "Job completed")
    })

    worker.on("failed", function (job, err) {
        logger.error({ queue: worker.name, jobId: job && job.id, err }, "Job failed")

        if (job && job.data.userId && job.attemptsMade >= job.opts.attempts) {
            emitToUser(job.data.userId, "job:failed", {
                jobId: job.id,
                message: "Generation failed, please try again."
            }).catch(function (publishErr) {
                logger.error({ err: publishErr }, "Failed to publish job failure event")
            })
        }
    })
}

logger.info("Worker started, processing queues: " + [ REPORT_QUEUE_NAME, RESUME_PDF_QUEUE_NAME ].join(", "))


async function shutdown() {
    logger.info("Shutting down workers...")
    await Promise.all([ reportWorker.close(), resumePdfWorker.close() ])
    process.exit(0)
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
