const cron = require("node-cron")
const interviewReportModel = require("../models/interviewReport.model")
const { sendEmail } = require("../services/email.service")
const logger = require("./logger")


const PREP_REMINDER_DAYS = Number(process.env.PREP_REMINDER_DAYS) || 7


/**
 * @name sendPrepPlanReminders
 * @description For every interview report created in the last PREP_REMINDER_DAYS days,
 * email the owner the preparation plan entry for their next day (day 1 the day after
 * the report was created, day 2 the day after that, and so on).
 */
async function sendPrepPlanReminders() {

    const since = new Date(Date.now() - PREP_REMINDER_DAYS * 24 * 60 * 60 * 1000)

    const reports = await interviewReportModel
        .find({ createdAt: { $gte: since } })
        .populate("user", "email username")

    logger.info({ count: reports.length }, "Sending prep plan reminders")

    for (const report of reports) {
        try {
            const daysSinceCreated = Math.floor((Date.now() - report.createdAt.getTime()) / (24 * 60 * 60 * 1000))
            const nextDay = daysSinceCreated + 1

            const planForDay = report.preparationPlan.find(plan => plan.day === nextDay)

            if (!planForDay || !report.user) continue

            await sendEmail({
                to: report.user.email,
                subject: `Day ${planForDay.day} prep for ${report.title}: ${planForDay.focus}`,
                html: `<p>Hi ${report.user.username},</p>
                       <p>Here is your day ${planForDay.day} preparation plan for <strong>${report.title}</strong>.</p>
                       <p><strong>Focus:</strong> ${planForDay.focus}</p>
                       <ul>${planForDay.tasks.map(task => `<li>${task}</li>`).join("")}</ul>
                       <p>Good luck!<br/>— HireGenie</p>`
            })
        } catch (err) {
            logger.error({ err, reportId: report._id }, "Failed to send prep reminder")
        }
    }
}


/**
 * @name startCronJobs
 * @description Register scheduled jobs. Called only from the API entrypoint so the
 * worker process doesn't double-send emails.
 */
function startCronJobs() {

    // every day at 08:00 server time
    cron.schedule(process.env.PREP_REMINDER_CRON || "0 8 * * *", function () {
        sendPrepPlanReminders().catch(function (err) {
            logger.error({ err }, "Prep plan reminder run failed")
        })
    })

    logger.info("Cron jobs registered")
}


module.exports = { startCronJobs, sendPrepPlanReminders }
