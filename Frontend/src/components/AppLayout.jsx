import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import './AppLayout.css'

const NAV_ITEMS = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        )
    },
    {
        path: '/resume-analysis',
        label: 'Resume Analysis',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        )
    },
    {
        path: '/interview-prep',
        label: 'Interview Prep',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        )
    },
    {
        path: '/study-plan',
        label: 'Study Plan',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        )
    },
    {
        path: '/skill-gaps',
        label: 'Skill Gaps',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
        )
    }
]

const AppLayout = () => {
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()

    const onLogout = async () => {
        await handleLogout()
        navigate('/login')
    }

    return (
        <div className="hg-app-shell">
            {/* Animated gradient mesh background */}
            <div className="hg-bg-mesh">
                <div className="hg-bg-blob-3" />
            </div>

            {/* Glass sidebar navigation */}
            <nav className="hg-sidebar glass" id="main-nav">
                <div className="hg-sidebar__brand">
                    <div className="hg-logo">
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                            <defs>
                                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="50%" stopColor="#06b6d4" />
                                    <stop offset="100%" stopColor="#14b8a6" />
                                </linearGradient>
                            </defs>
                            <circle cx="16" cy="16" r="14" stroke="url(#logoGrad)" strokeWidth="2.5" fill="none" />
                            <path d="M12 10 C12 10 10 16 16 16 C22 16 20 22 20 22" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                            <circle cx="13" cy="9" r="1.5" fill="url(#logoGrad)" />
                            <circle cx="19" cy="23" r="1.5" fill="url(#logoGrad)" />
                        </svg>
                    </div>
                    <span className="hg-sidebar__title">HireGenie</span>
                </div>

                <div className="hg-sidebar__nav stagger-children">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `hg-nav-item ${isActive ? 'hg-nav-item--active' : ''}`
                            }
                            id={`nav-${item.path.slice(1)}`}
                        >
                            <span className="hg-nav-item__icon">{item.icon}</span>
                            <span className="hg-nav-item__label">{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="hg-sidebar__footer">
                    <div className="hg-user-card glass-elevated">
                        <div className="hg-user-avatar">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="hg-user-info">
                            <span className="hg-user-name">{user?.username || 'User'}</span>
                            <span className="hg-user-email">{user?.email || ''}</span>
                        </div>
                    </div>
                    <button className="btn-glass hg-logout-btn" onClick={onLogout} id="logout-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </nav>

            {/* Main content area */}
            <main className="hg-main">
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout
