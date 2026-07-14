const { z } = require("zod")


const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id")


const generateReportSchema = {
    body: z.object({
        selfDescription: z.string().trim().min(1, "Self description is required").max(5000),
        jobDescription: z.string().trim().min(1, "Job description is required").max(20000)
    })
}


const interviewIdParamSchema = {
    params: z.object({
        interviewId: objectId
    })
}


const interviewReportIdParamSchema = {
    params: z.object({
        interviewReportId: objectId
    })
}


const jobIdParamSchema = {
    params: z.object({
        jobId: z.string().min(1, "Job id is required")
    })
}


module.exports = {
    generateReportSchema,
    interviewIdParamSchema,
    interviewReportIdParamSchema,
    jobIdParamSchema
}
