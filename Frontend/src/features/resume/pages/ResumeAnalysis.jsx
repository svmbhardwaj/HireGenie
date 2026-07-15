import React, { useState, useRef } from 'react'
import { useInterview } from '../../interview/hooks/useInterview'
import { useNavigate } from 'react-router'
import './ResumeAnalysis.css'

const ResumeAnalysis = () => {
    const { loading, generateReport, reports } = useInterview()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [charCount, setCharCount] = useState(0)
    const resumeInputRef = useRef()
    const [fileName, setFileName] = useState("")
    const navigate = useNavigate()

    const latestReport = reports?.[0]

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) setFileName(file.name)
    }

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current.files[0]
        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        navigate(`/interview-prep`)
    }

    const handleJdChange = (e) => {
        setJobDescription(e.target.value)
        setCharCount(e.target.value.length)
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p className="loading-text">Analyzing your resume...</p>
            </div>
        )
    }

    return (
        <div className="resume-analysis animate-in">
            <header className="resume-analysis__header">
                <h1 className="resume-analysis__title">Resume Analysis</h1>
                <p className="resume-analysis__subtitle">AI-powered analysis to match your profile against any job description</p>
            </header>

            <div className="resume-layout">

                {/* Left: Resume Document Panel */}
                <div className="resume-panel glass" id="resume-document-panel">
                    <div className="resume-panel__header">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <h2>Upload & Describe</h2>
                        <span className="badge badge--accent">AI Analysis</span>
                    </div>

                    {/* Resume Upload */}
                    <div className="resume-upload">
                        <label className="resume-dropzone glass-elevated" htmlFor="resume-file" id="resume-dropzone">
                            <div className="resume-dropzone__icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <polyline points="16 16 12 12 8 16" />
                                    <line x1="12" y1="12" x2="12" y2="21" />
                                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                </svg>
                            </div>
                            <p className="resume-dropzone__title">
                                {fileName || 'Click to upload your resume'}
                            </p>
                            <p className="resume-dropzone__sub">PDF or DOCX (Max 5MB)</p>
                            <input
                                ref={resumeInputRef}
                                onChange={handleFileChange}
                                hidden
                                type="file"
                                id="resume-file"
                                name="resume"
                                accept=".pdf,.docx"
                            />
                        </label>
                    </div>

                    {/* OR separator */}
                    <div className="resume-or">
                        <span>OR</span>
                    </div>

                    {/* Self Description */}
                    <div className="resume-field">
                        <label className="resume-field__label" htmlFor="self-description">Quick Self-Description</label>
                        <textarea
                            id="self-description"
                            className="textarea-glass"
                            placeholder="Describe your experience, key skills, and career highlights..."
                            rows={4}
                            onChange={(e) => setSelfDescription(e.target.value)}
                        />
                    </div>

                    {/* Job Description */}
                    <div className="resume-field">
                        <div className="resume-field__header">
                            <label className="resume-field__label" htmlFor="job-desc">Target Job Description</label>
                            <span className="badge badge--accent">Required</span>
                        </div>
                        <textarea
                            id="job-desc"
                            className="textarea-glass resume-jd-textarea"
                            placeholder="Paste the full job description here..."
                            maxLength={5000}
                            onChange={handleJdChange}
                        />
                        <span className="resume-char-count">{charCount} / 5000</span>
                    </div>

                    <button
                        className="btn-accent glow-pulse resume-analyze-btn"
                        onClick={handleGenerateReport}
                        id="analyze-resume-btn"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                        Analyze Resume
                    </button>
                </div>

                {/* Right: Analysis Results */}
                <div className="resume-results">

                    {/* Match Score Gauge */}
                    <div className="resume-score-card glass" id="resume-score-card">
                        <p className="resume-score-card__label">Match Score</p>
                        <div className="resume-score-gauge">
                            <svg viewBox="0 0 100 100" className="resume-score-gauge__svg">
                                <defs>
                                    <linearGradient id="resumeGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="50%" stopColor="#06b6d4" />
                                        <stop offset="100%" stopColor="#14b8a6" />
                                    </linearGradient>
                                </defs>
                                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                <circle
                                    cx="50" cy="50" r="40"
                                    fill="none"
                                    stroke="url(#resumeGaugeGrad)"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(latestReport?.matchScore || 78) * 2.51} ${251 - (latestReport?.matchScore || 78) * 2.51}`}
                                    strokeDashoffset="62.8"
                                    style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))' }}
                                />
                            </svg>
                            <div className="resume-score-gauge__text">
                                <span className="resume-score-gauge__value">{latestReport?.matchScore || 78}</span>
                                <span className="resume-score-gauge__pct">%</span>
                            </div>
                        </div>
                    </div>

                    {/* Annotations / Feedback tags */}
                    <div className="resume-feedback glass" id="resume-feedback-panel">
                        <div className="resume-feedback__section">
                            <div className="feedback-tag feedback-tag--strength glass-elevated">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                <span>Strengths</span>
                            </div>
                            <p className="resume-feedback__text">Strong technical skills, relevant experience, good project showcase.</p>
                        </div>
                        <div className="resume-feedback__section">
                            <div className="feedback-tag feedback-tag--weakness glass-elevated">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <span>Weaknesses</span>
                            </div>
                            <p className="resume-feedback__text">Quantify achievements more, improve formatting, add metrics.</p>
                        </div>
                        <div className="resume-feedback__section">
                            <div className="feedback-tag feedback-tag--rec glass-elevated">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                                <span>Recommendations</span>
                            </div>
                            <p className="resume-feedback__text">Add specific metrics, tailor summary to job description, highlight leadership.</p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="resume-actions">
                        <button className="btn-glass" id="re-analyze-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            Re-Analyze
                        </button>
                        <button className="btn-glass" id="save-report-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" />
                            </svg>
                            Save Report
                        </button>
                        <button className="btn-glass" id="share-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResumeAnalysis
