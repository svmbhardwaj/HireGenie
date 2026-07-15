const { Queue } = require("bullmq")
const crypto = require("crypto")
const redisConnection = require("../config/redis")


const REPORT_QUEUE_NAME = "interview-report-generation"
const RESUME_PDF_QUEUE_NAME = "resume-pdf-generation"

/*
 * Keep completed/failed jobs around briefly so the polling status endpoint can
 * read results, but never let them accumulate in redis forever.
 */
const defaultJobOptions = {
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 3600, count: 500 },
    removeOnFail: { age: 24 * 3600 }
}

const reportQueue = new Queue(REPORT_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions
})

const resumePdfQueue = new Queue(RESUME_PDF_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions
})


/**
 * @name enqueueReport
 * @description Enqueue an interview report generation job. Job ids are prefixed with
 * "report-" so the status endpoint can tell which queue a job belongs to.
 */
async function enqueueReport(data) {
    const jobId = `report-${crypto.randomUUID()}`

    await reportQueue.add("generate-report", data, { jobId })

    return jobId
}


/**
 * @name enqueueResumePdf
 * @description Enqueue a resume PDF generation job. Job ids are prefixed with "pdf-".
 */
async function enqueueResumePdf(data) {
    const jobId = `pdf-${crypto.randomUUID()}`

    await resumePdfQueue.add("generate-resume-pdf", data, { jobId })

    return jobId
}


/**
 * @name getJobById
 * @description Look up a job in the queue matching the job id prefix.
 * Returns null for unknown prefixes or missing jobs.
 */
async function getJobById(jobId) {
    if (jobId.startsWith("report-")) {
        return reportQueue.getJob(jobId)
    }

    if (jobId.startsWith("pdf-")) {
        return resumePdfQueue.getJob(jobId)
    }

    return null
}


module.exports = {
    REPORT_QUEUE_NAME,
    RESUME_PDF_QUEUE_NAME,
    reportQueue,
    resumePdfQueue,
    enqueueReport,
    enqueueResumePdf,
    getJobById
}
