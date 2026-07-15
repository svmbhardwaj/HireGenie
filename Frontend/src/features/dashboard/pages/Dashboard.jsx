import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useInterview } from '../../interview/hooks/useInterview'
import './Dashboard.css'

const Dashboard = () => {
    const { reports, loading } = useInterview()
    const navigate = useNavigate()

    // Derive stats from reports
    const latestReport = reports?.[0]
    const matchScore = latestReport?.matchScore || 0
    const totalReports = reports?.length || 0
    const avgScore = totalReports > 0
        ? Math.round(reports.reduce((sum, r) => sum + (r.matchScore || 0), 0) / totalReports)
        : 0

    // Count all skill gaps across reports
    const allSkillGaps = reports?.flatMap(r => r.skillGaps || []) || []
    const uniqueGaps = [...new Set(allSkillGaps.map(g => g.skill))]

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p className="loading-text">Loading dashboard...</p>
            </div>
        )
    }

    return (
        <div className="dashboard animate-in">
            <header className="dashboard__header">
                <div>
                    <h1 className="dashboard__title">Dashboard</h1>
                    <p className="dashboard__subtitle">Your career readiness at a glance</p>
                </div>
                <button
                    className="btn-accent"
                    onClick={() => navigate('/interview-prep')}
                    id="new-interview-btn"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Interview
                </button>
            </header>

            {/* Main stats grid */}
            <div className="dashboard__grid stagger-children">

                {/* Match Score — Hero gauge */}
                <div className="dash-card glass dash-card--match" id="match-score-card">
                    <p className="dash-card__label">Match Score</p>
                    <div className="match-gauge">
                        <svg className="match-gauge__svg" viewBox="0 0 120 120">
                            <defs>
                                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="50%" stopColor="#06b6d4" />
                                    <stop offset="100%" stopColor="#14b8a6" />
                                </linearGradient>
                            </defs>
                            {/* Background ring */}
                            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                            {/* Progress ring with gradient */}
                            <circle
                                cx="60" cy="60" r="50"
                                fill="none"
                                stroke="url(#gaugeGrad)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${matchScore * 3.14} ${314 - matchScore * 3.14}`}
                                strokeDashoffset="78.5"
                                style={{
                                    transition: 'stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                    filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.4))'
                                }}
                            />
                        </svg>
                        <div className="match-gauge__text">
                            <span className="match-gauge__value">{matchScore}</span>
                            <span className="match-gauge__pct">%</span>
                        </div>
                    </div>
                    <p className="dash-card__sub">
                        {matchScore >= 80 ? 'Excellent fit' : matchScore >= 60 ? 'Good match' : 'Room for growth'}
                    </p>
                </div>

                {/* Next Interview countdown */}
                <div className="dash-card glass dash-card--countdown" id="next-interview-card">
                    <p className="dash-card__label">Next Interview</p>
                    <div className="countdown-display">
                        <div className="countdown-unit glass-elevated">
                            <span className="countdown-unit__value">02</span>
                            <span className="countdown-unit__label">Days</span>
                        </div>
                        <span className="countdown-sep">:</span>
                        <div className="countdown-unit glass-elevated">
                            <span className="countdown-unit__value">14</span>
                            <span className="countdown-unit__label">Hrs</span>
                        </div>
                        <span className="countdown-sep">:</span>
                        <div className="countdown-unit glass-elevated">
                            <span className="countdown-unit__value">35</span>
                            <span className="countdown-unit__label">Min</span>
                        </div>
                    </div>
                    <p className="dash-card__sub">Google — Senior PM, Oct 26</p>
                </div>

                {/* Quick stats row */}
                <div className="dash-card glass dash-card--stat" id="total-reports-card">
                    <div className="stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    </div>
                    <span className="stat-value">{totalReports}</span>
                    <span className="stat-label">Reports Generated</span>
                </div>

                <div className="dash-card glass dash-card--stat" id="avg-score-card">
                    <div className="stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    </div>
                    <span className="stat-value">{avgScore}%</span>
                    <span className="stat-label">Avg Match Score</span>
                </div>

                <div className="dash-card glass dash-card--stat" id="skill-gaps-count-card">
                    <div className="stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <span className="stat-value">{uniqueGaps.length}</span>
                    <span className="stat-label">Skill Gaps Found</span>
                </div>

                {/* Skill Gaps summary */}
                <div className="dash-card glass dash-card--gaps" id="skill-gaps-summary">
                    <p className="dash-card__label">Top Skill Gaps</p>
                    <div className="gaps-list stagger-children">
                        {(latestReport?.skillGaps || [
                            { skill: 'System Design', severity: 'high' },
                            { skill: 'Data Analysis', severity: 'medium' },
                            { skill: 'Leadership', severity: 'low' }
                        ]).slice(0, 4).map((gap, i) => (
                            <div key={i} className="gap-bar">
                                <div className="gap-bar__info">
                                    <span className="gap-bar__name">{gap.skill}</span>
                                    <span className={`badge badge--${gap.severity === 'high' ? 'danger' : gap.severity === 'medium' ? 'warning' : 'success'}`}>
                                        {gap.severity}
                                    </span>
                                </div>
                                <div className="gap-bar__track">
                                    <div
                                        className={`gap-bar__fill gap-bar__fill--${gap.severity}`}
                                        style={{
                                            width: gap.severity === 'high' ? '85%' : gap.severity === 'medium' ? '55%' : '25%'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Reports */}
                <div className="dash-card glass dash-card--recent" id="recent-reports-card">
                    <p className="dash-card__label">Recent Reports</p>
                    <div className="recent-list">
                        {(reports?.length > 0 ? reports.slice(0, 3) : [
                            { _id: 'demo1', title: 'Senior Frontend Engineer', matchScore: 85, createdAt: new Date() },
                            { _id: 'demo2', title: 'Full-Stack Developer', matchScore: 72, createdAt: new Date() },
                        ]).map((report) => (
                            <div
                                key={report._id}
                                className="recent-item glass-elevated"
                                onClick={() => navigate(`/interview-prep`)}
                            >
                                <div className="recent-item__info">
                                    <h4 className="recent-item__title">{report.title || 'Untitled Position'}</h4>
                                    <span className="recent-item__date">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="recent-item__score">
                                    <span className="recent-item__score-value">{report.matchScore}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
