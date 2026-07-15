import React, { useState } from 'react'
import { useInterview } from '../../interview/hooks/useInterview'
import './StudyPlan.css'

const TASKS_TODAY = [
    { id: 1, label: 'Upload updated portfolio', done: true },
    { id: 2, label: 'Review feedback from AI coach', done: false, action: 'Start Task' },
    { id: 3, label: 'Complete project showcase section', done: true },
    { id: 4, label: 'Practice presenting projects', done: false, action: 'Continue' },
]

const WEEK_PLAN = [
    { day: 1, title: 'Resume Analysis', progress: 100 },
    { day: 2, title: 'Mock Interview — Behavioral', progress: 100 },
    { day: 3, title: 'Technical Quiz — Data Structures', progress: 60 },
    { day: 4, title: 'Portfolio Review', progress: 40 },
    { day: 5, title: 'Company Research', progress: 0 },
    { day: 6, title: 'Mock Interview — System Design', progress: 0 },
    { day: 7, title: 'Final Prep & Relaxation', progress: 0 },
]

const StudyPlan = () => {
    const { report, loading } = useInterview()
    const [currentWeek, setCurrentWeek] = useState(1)
    const [tasks, setTasks] = useState(TASKS_TODAY)
    const today = 4 // Day 4 is "today"

    const plan = report?.preparationPlan || WEEK_PLAN.map(d => ({
        day: d.day,
        focus: d.title,
        tasks: []
    }))

    const toggleTask = (id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p className="loading-text">Loading study plan...</p>
            </div>
        )
    }

    return (
        <div className="study-plan animate-in">
            <header className="sp-header">
                <div>
                    <h1 className="sp-header__title">Study Plan</h1>
                    <p className="sp-header__subtitle">Your day-wise preparation roadmap</p>
                </div>
                <div className="sp-header__nav">
                    <button className="btn-glass" onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))} id="prev-week-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                        Previous
                    </button>
                    <span className="sp-header__week">Week {currentWeek}</span>
                    <button className="btn-glass" onClick={() => setCurrentWeek(currentWeek + 1)} id="next-week-btn">
                        Next
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                </div>
            </header>

            <div className="sp-layout">

                {/* Day cards grid */}
                <div className="sp-days stagger-children" id="day-cards-grid">
                    {WEEK_PLAN.map(dayItem => {
                        const planDay = plan.find(p => p.day === dayItem.day) || { focus: dayItem.title }
                        const isToday = dayItem.day === today
                        const isCompleted = dayItem.progress === 100
                        const isInProgress = dayItem.progress > 0 && dayItem.progress < 100

                        return (
                            <div
                                key={dayItem.day}
                                className={`sp-day-card glass ${isToday ? 'sp-day-card--today' : ''} ${isCompleted ? 'sp-day-card--done' : ''}`}
                                id={`day-card-${dayItem.day}`}
                            >
                                <div className="sp-day-card__top">
                                    <span className="sp-day-card__label">Day {dayItem.day}</span>
                                    {isToday && <span className="badge badge--accent">Today</span>}
                                    {isCompleted && <span className="badge badge--success">Done</span>}
                                </div>
                                <h3 className="sp-day-card__title">{planDay.focus || dayItem.title}</h3>

                                {/* Progress bar */}
                                <div className="sp-day-card__progress-track">
                                    <div
                                        className={`sp-day-card__progress-fill ${isToday || isCompleted ? 'sp-day-card__progress-fill--accent' : ''}`}
                                        style={{ width: `${dayItem.progress}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Today's tasks */}
                <div className="sp-today glass" id="today-tasks-panel">
                    <div className="sp-today__header">
                        <h2 className="sp-today__title">Tasks for Today</h2>
                        <span className="sp-today__count">{tasks.filter(t => t.done).length}/{tasks.length} done</span>
                    </div>

                    <div className="sp-tasks stagger-children">
                        {tasks.map(task => (
                            <div key={task.id} className={`sp-task glass-elevated ${task.done ? 'sp-task--done' : ''}`}>
                                <button
                                    className={`sp-task__check ${task.done ? 'sp-task__check--checked' : ''}`}
                                    onClick={() => toggleTask(task.id)}
                                    id={`task-check-${task.id}`}
                                >
                                    {task.done && (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    )}
                                </button>
                                <span className="sp-task__label">{task.label}</span>
                                {task.done ? (
                                    <span className="sp-task__status sp-task__status--done">Marked as Done</span>
                                ) : task.action ? (
                                    <button className="btn-accent sp-task__action" id={`task-action-${task.id}`}>
                                        {task.action}
                                    </button>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick actions */}
                <div className="sp-actions">
                    <button className="btn-accent" id="view-schedule-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        View Full Schedule
                    </button>
                </div>
            </div>
        </div>
    )
}

export default StudyPlan
