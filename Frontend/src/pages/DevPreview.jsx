import React, { useState } from 'react'
import AppLayout from '../components/AppLayout'
import Dashboard from '../features/dashboard/pages/Dashboard'
import ResumeAnalysis from '../features/resume/pages/ResumeAnalysis'
import InterviewPrep from '../features/interview/pages/InterviewPrep'
import StudyPlan from '../features/studyplan/pages/StudyPlan'
import SkillGaps from '../features/skillgaps/pages/SkillGaps'

const SCREENS = [
    { id: 'dashboard', label: 'Dashboard', Component: Dashboard },
    { id: 'resume', label: 'Resume Analysis', Component: ResumeAnalysis },
    { id: 'study', label: 'Study Plan', Component: StudyPlan },
    { id: 'skills', label: 'Skill Gaps', Component: SkillGaps },
]

const DevPreview = () => {
    const [active, setActive] = useState('dashboard')
    const ActiveComponent = SCREENS.find(s => s.id === active)?.Component || Dashboard

    return (
        <div className="hg-app-shell">
            <div className="hg-bg-mesh">
                <div className="hg-bg-blob-3" />
            </div>

            {/* Simple preview nav */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
                display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem',
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <span style={{ fontWeight: 800, color: '#a78bfa', marginRight: 'auto', fontSize: '0.9rem' }}>
                    HireGenie Preview
                </span>
                {SCREENS.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActive(s.id)}
                        style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '8px',
                            border: active === s.id ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                            background: active === s.id ? 'rgba(139,92,246,0.15)' : 'transparent',
                            color: active === s.id ? '#fff' : 'rgba(255,255,255,0.6)',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            <main style={{ paddingTop: '4rem', padding: '4rem 2.5rem 2rem', position: 'relative', zIndex: 1 }}>
                <ActiveComponent />
            </main>
        </div>
    )
}

export default DevPreview
