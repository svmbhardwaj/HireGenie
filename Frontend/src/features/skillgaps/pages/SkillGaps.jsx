import React, { useState } from 'react'
import { useInterview } from '../../interview/hooks/useInterview'
import './SkillGaps.css'

const DEMO_SKILLS = [
    { skill: 'Machine Learning', current: 65, market: 85, severity: 'high', description: 'Gap detected. Mastering ML will significantly boost your career prospects.' },
    { skill: 'Cloud Computing (AWS/Azure)', current: 50, market: 80, severity: 'medium', description: 'Expand your cloud expertise to meet job requirements.' },
    { skill: 'System Design', current: 40, market: 90, severity: 'high', description: 'Crucial for senior roles. Strengthen your system architecture knowledge.' },
    { skill: 'Data Science', current: 70, market: 82, severity: 'low', description: 'Close to market demand. A few targeted courses will bridge the gap.' },
    { skill: 'Full-Stack Development', current: 75, market: 85, severity: 'low', description: 'Strong foundation. Focus on advanced patterns and frameworks.' },
    { skill: 'Project Management', current: 55, market: 70, severity: 'medium', description: 'Leadership and PM skills increasingly valued for senior positions.' },
    { skill: 'UI/UX Design', current: 60, market: 75, severity: 'medium', description: 'Understanding design principles will make you a stronger engineer.' },
    { skill: 'Cybersecurity', current: 30, market: 65, severity: 'high', description: 'Growing demand. Security knowledge is becoming essential for all roles.' },
]

const SkillGaps = () => {
    const { report, loading } = useInterview()
    const [hoveredSkill, setHoveredSkill] = useState(null)

    const skills = report?.skillGaps?.length > 0
        ? report.skillGaps.map(g => ({
            ...g,
            current: Math.round(Math.random() * 40 + 30),
            market: Math.round(Math.random() * 20 + 70),
            description: `Focus on improving ${g.skill} to match market demand.`,
        }))
        : DEMO_SKILLS

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p className="loading-text">Analyzing skill gaps...</p>
            </div>
        )
    }

    return (
        <div className="skill-gaps-page animate-in">
            <header className="sg-header">
                <div>
                    <h1 className="sg-header__title">Skill Gap Detection</h1>
                    <p className="sg-header__subtitle">Analyze your skills against market demand and unlock personalized learning</p>
                </div>
            </header>

            <div className="sg-layout">

                {/* Radar Chart Area */}
                <div className="sg-chart-card glass" id="skill-radar-chart">
                    <div className="sg-chart-header">
                        <div className="sg-legend">
                            <div className="sg-legend__item">
                                <span className="sg-legend__dot sg-legend__dot--current" />
                                <span>Current Skills</span>
                            </div>
                            <div className="sg-legend__item">
                                <span className="sg-legend__dot sg-legend__dot--market" />
                                <span>Market Demand</span>
                            </div>
                        </div>
                    </div>

                    {/* SVG Radar chart */}
                    <div className="sg-radar-container">
                        <svg viewBox="0 0 400 400" className="sg-radar-svg">
                            <defs>
                                <linearGradient id="radarCurrentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.7" />
                                </linearGradient>
                                <linearGradient id="radarMarketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f472b6" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#fb7185" stopOpacity="0.4" />
                                </linearGradient>
                            </defs>

                            {/* Grid circles */}
                            {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                                <circle key={i} cx="200" cy="200" r={150 * scale}
                                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                            ))}

                            {/* Axis lines and labels */}
                            {skills.slice(0, 8).map((skill, i) => {
                                const angle = (Math.PI * 2 * i) / Math.min(skills.length, 8) - Math.PI / 2
                                const x = 200 + 150 * Math.cos(angle)
                                const y = 200 + 150 * Math.sin(angle)
                                const labelX = 200 + 175 * Math.cos(angle)
                                const labelY = 200 + 175 * Math.sin(angle)
                                return (
                                    <g key={i}>
                                        <line x1="200" y1="200" x2={x} y2={y}
                                            stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                                        <text x={labelX} y={labelY}
                                            textAnchor="middle" dominantBaseline="middle"
                                            fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Manrope, sans-serif">
                                            {skill.skill.length > 14 ? skill.skill.slice(0, 14) + '...' : skill.skill}
                                        </text>
                                    </g>
                                )
                            })}

                            {/* Market demand polygon */}
                            <polygon
                                points={skills.slice(0, 8).map((skill, i) => {
                                    const angle = (Math.PI * 2 * i) / Math.min(skills.length, 8) - Math.PI / 2
                                    const r = (skill.market / 100) * 150
                                    return `${200 + r * Math.cos(angle)},${200 + r * Math.sin(angle)}`
                                }).join(' ')}
                                fill="url(#radarMarketGrad)"
                                stroke="#f472b6"
                                strokeWidth="1.5"
                                strokeOpacity="0.5"
                            />

                            {/* Current skills polygon */}
                            <polygon
                                points={skills.slice(0, 8).map((skill, i) => {
                                    const angle = (Math.PI * 2 * i) / Math.min(skills.length, 8) - Math.PI / 2
                                    const r = (skill.current / 100) * 150
                                    return `${200 + r * Math.cos(angle)},${200 + r * Math.sin(angle)}`
                                }).join(' ')}
                                fill="url(#radarCurrentGrad)"
                                stroke="#8b5cf6"
                                strokeWidth="2"
                                style={{ filter: 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.4))' }}
                            />

                            {/* Data points */}
                            {skills.slice(0, 8).map((skill, i) => {
                                const angle = (Math.PI * 2 * i) / Math.min(skills.length, 8) - Math.PI / 2
                                const r = (skill.current / 100) * 150
                                return (
                                    <circle key={i}
                                        cx={200 + r * Math.cos(angle)}
                                        cy={200 + r * Math.sin(angle)}
                                        r="4" fill="#8b5cf6" stroke="#fff" strokeWidth="1.5"
                                        style={{ filter: 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.6))' }}
                                    />
                                )
                            })}
                        </svg>
                    </div>
                </div>

                {/* Right: Skill detail cards */}
                <div className="sg-cards stagger-children">
                    {skills.map((skill, i) => (
                        <div
                            key={i}
                            className={`sg-skill-card glass ${hoveredSkill === i ? 'sg-skill-card--hover' : ''}`}
                            onMouseEnter={() => setHoveredSkill(i)}
                            onMouseLeave={() => setHoveredSkill(null)}
                            id={`skill-card-${i}`}
                        >
                            <div className="sg-skill-card__top">
                                <div className="sg-skill-card__icon glass-elevated">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                                    </svg>
                                </div>
                                <div className="sg-skill-card__info">
                                    <h3 className="sg-skill-card__name">{skill.skill}</h3>
                                    <div className="sg-skill-card__bar-wrap">
                                        <div className="sg-skill-card__bar-track">
                                            <div
                                                className="sg-skill-card__bar-fill"
                                                style={{ width: `${skill.current}%` }}
                                            />
                                        </div>
                                        <span className="sg-skill-card__bar-pct">{skill.current}%</span>
                                    </div>
                                </div>
                                <span className={`badge badge--${skill.severity === 'high' ? 'danger' : skill.severity === 'medium' ? 'warning' : 'success'}`}>
                                    Impact: {skill.severity.charAt(0).toUpperCase() + skill.severity.slice(1)}
                                </span>
                            </div>
                            <p className="sg-skill-card__desc">{skill.description}</p>
                            <button className="btn-glass sg-skill-card__btn" id={`view-resources-${i}`}>
                                View Resources
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="sg-cta">
                <button className="btn-accent glow-pulse sg-cta__btn" id="start-learning-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Start Learning
                </button>
                <p className="sg-cta__sub">Get a personalized study plan and access premium learning content.</p>
            </div>
        </div>
    )
}

export default SkillGaps
