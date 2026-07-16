import React, { useState, useEffect } from 'react'
import { useInterview } from '../hooks/useInterview'
import { useNavigate } from 'react-router'
import './InterviewPrep.css'

const NAV_TABS = [
    {
        id: 'technical', label: 'Technical',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    },
    {
        id: 'behavioral', label: 'Behavioral',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    },
    {
        id: 'roadmap', label: 'Road Map',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
    },
]

const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className={`ip-qcard glass ${open ? 'ip-qcard--open' : ''}`}>
            <div className="ip-qcard__header" onClick={() => setOpen(o => !o)}>
                <span className="ip-qcard__index">Q{index + 1}</span>
                <p className="ip-qcard__question">{item.question}</p>
                <span className={`ip-qcard__chevron ${open ? 'ip-qcard__chevron--open' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className="ip-qcard__body">
                    <div className="ip-qcard__section">
                        <span className="ip-qcard__tag ip-qcard__tag--intention">Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className="ip-qcard__section">
                        <span className="ip-qcard__tag ip-qcard__tag--answer">Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className="ip-roadmap-day">
        <div className="ip-roadmap-day__dot" />
        <div className="ip-roadmap-day__content glass">
            <div className="ip-roadmap-day__header">
                <span className="ip-roadmap-day__badge">Day {day.day}</span>
                <h3 className="ip-roadmap-day__focus">{day.focus}</h3>
            </div>
            <ul className="ip-roadmap-day__tasks">
                {day.tasks.map((task, i) => (
                    <li key={i}>
                        <span className="ip-roadmap-day__bullet" />
                        {task}
                    </li>
                ))}
            </ul>
        </div>
    </div>
)

const InterviewPrep = () => {
    const [activeTab, setActiveTab] = useState('technical')
    const { report, loading, getResumePdf } = useInterview()
    const navigate = useNavigate()

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p className="loading-text">Loading interview prep...</p>
            </div>
        )
    }

    if (!report) {
        return (
            <div className="interview-prep animate-in">
                <header className="ip-header">
                    <div>
                        <h1 className="ip-header__title">Interview Prep</h1>
                        <p className="ip-header__subtitle">AI-curated questions, answers, and preparation roadmap</p>
                    </div>
                </header>
                <div className="ip-empty glass" id="interview-empty-state">
                    <div className="ip-empty__icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <h2 className="ip-empty__title">No Interview Report Yet</h2>
                    <p className="ip-empty__desc">Generate a report from the Resume Analysis page to unlock AI-curated interview questions, model answers, and a personalized preparation roadmap.</p>
                    <button className="btn-accent" onClick={() => navigate('/resume-analysis')} id="go-to-resume-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        Go to Resume Analysis
                    </button>
                </div>
            </div>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'

    return (
        <div className="interview-prep animate-in">
            <header className="ip-header">
                <div>
                    <h1 className="ip-header__title">Interview Prep</h1>
                    <p className="ip-header__subtitle">AI-curated questions, answers, and preparation roadmap</p>
                </div>
            </header>

            <div className="ip-layout">

                {/* Tab bar */}
                <div className="ip-tabs glass" id="interview-tabs">
                    {NAV_TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`ip-tab ${activeTab === tab.id ? 'ip-tab--active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            id={`tab-${tab.id}`}
                        >
                            <span className="ip-tab__icon">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="ip-content-area">
                    {/* Main Content */}
                    <div className="ip-content">
                        {activeTab === 'technical' && (
                            <section className="animate-in">
                                <div className="ip-content__header">
                                    <h2>Technical Questions</h2>
                                    <span className="ip-content__count glass-elevated">{report.technicalQuestions.length} questions</span>
                                </div>
                                <div className="ip-qlist stagger-children">
                                    {report.technicalQuestions.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeTab === 'behavioral' && (
                            <section className="animate-in">
                                <div className="ip-content__header">
                                    <h2>Behavioral Questions</h2>
                                    <span className="ip-content__count glass-elevated">{report.behavioralQuestions.length} questions</span>
                                </div>
                                <div className="ip-qlist stagger-children">
                                    {report.behavioralQuestions.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeTab === 'roadmap' && (
                            <section className="animate-in">
                                <div className="ip-content__header">
                                    <h2>Preparation Road Map</h2>
                                    <span className="ip-content__count glass-elevated">{report.preparationPlan.length}-day plan</span>
                                </div>
                                <div className="ip-roadmap-list">
                                    <div className="ip-roadmap-line" />
                                    {report.preparationPlan.map((day) => (
                                        <RoadMapDay key={day.day} day={day} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="ip-sidebar">
                        {/* AI Feedback */}
                        <div className="ip-feedback glass" id="ai-feedback-panel">
                            <p className="ip-feedback__label">AI Feedback</p>
                            <div className="ip-feedback__items">
                                <div className="ip-feedback__item">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    <span>Strong delivery.</span>
                                </div>
                                <div className="ip-feedback__item">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    <span>Try to vary your pace slightly.</span>
                                </div>
                                <div className="ip-feedback__item">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    <span>Maintain good posture.</span>
                                </div>
                            </div>
                        </div>

                        {/* Match Score */}
                        <div className="ip-score glass" id="ip-match-score">
                            <p className="ip-score__label">Match Score</p>
                            <div className="ip-score__ring">
                                <svg viewBox="0 0 100 100" className="ip-score__svg">
                                    <defs>
                                        <linearGradient id="ipGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="50%" stopColor="#06b6d4" />
                                            <stop offset="100%" stopColor="#14b8a6" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                                    <circle
                                        cx="50" cy="50" r="40"
                                        fill="none"
                                        stroke="url(#ipGaugeGrad)"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        strokeDasharray={`${report.matchScore * 2.51} ${251 - report.matchScore * 2.51}`}
                                        strokeDashoffset="62.8"
                                        style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.5))' }}
                                    />
                                </svg>
                                <div className="ip-score__text">
                                    <span className="ip-score__value">{report.matchScore}</span>
                                    <span className="ip-score__pct">%</span>
                                </div>
                            </div>
                        </div>

                        {/* Skill Gaps */}
                        <div className="ip-gaps glass" id="ip-skill-gaps">
                            <p className="ip-gaps__label">Skill Gaps</p>
                            <div className="ip-gaps__list">
                                {report.skillGaps.map((gap, i) => (
                                    <span key={i} className={`ip-gap-tag badge badge--${gap.severity === 'high' ? 'danger' : gap.severity === 'medium' ? 'warning' : 'success'}`}>
                                        {gap.skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Download */}
                        <button
                            onClick={() => getResumePdf(report._id)}
                            className="btn-accent ip-download-btn"
                            id="download-resume-btn"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download Resume
                        </button>
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default InterviewPrep
