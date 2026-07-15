const { z } = require("zod")


const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id")


const startMockSessionSchema = {
    body: z.object({
        interviewReportId: objectId
    })
}


const answerMockSessionSchema = {
    params: z.object({
        sessionId: objectId
    }),
    body: z.object({
        answer: z.string().trim().min(1, "Answer is required").max(10000)
    })
}


const sessionIdParamSchema = {
    params: z.object({
        sessionId: objectId
    })
}


module.exports = { startMockSessionSchema, answerMockSessionSchema, sessionIdParamSchema }
