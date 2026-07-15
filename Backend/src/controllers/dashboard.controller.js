const mongoose = require("mongoose")
const interviewReportModel = require("../models/interviewReport.model")
const catchAsync = require("../utils/catchAsync")


/**
 * @description Controller to get dashboard stats for the logged in user:
 * matchScore trend over time and skill gap frequency aggregated across all reports.
 */
async function getDashboardStatsController(req, res) {

    const userId = new mongoose.Types.ObjectId(String(req.user.id))

    const [ matchScoreTrend, skillGapFrequency ] = await Promise.all([

        interviewReportModel.aggregate([
            { $match: { user: userId, matchScore: { $ne: null } } },
            { $sort: { createdAt: 1 } },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    matchScore: 1,
                    createdAt: 1
                }
            }
        ]),

        interviewReportModel.aggregate([
            { $match: { user: userId } },
            { $unwind: "$skillGaps" },
            {
                $group: {
                    _id: "$skillGaps.skill",
                    count: { $sum: 1 },
                    severities: { $push: "$skillGaps.severity" }
                }
            },
            {
                $project: {
                    _id: 0,
                    skill: "$_id",
                    count: 1,
                    highCount: {
                        $size: {
                            $filter: {
                                input: "$severities",
                                as: "severity",
                                cond: { $eq: [ "$$severity", "high" ] }
                            }
                        }
                    }
                }
            },
            { $sort: { count: -1, highCount: -1 } }
        ])
    ])

    res.status(200).json({
        message: "Dashboard stats fetched successfully.",
        stats: {
            totalReports: matchScoreTrend.length,
            matchScoreTrend,
            skillGapFrequency
        }
    })
}


module.exports = { getDashboardStatsController: catchAsync(getDashboardStatsController) }
