import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import './Login.css'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({ email, password })
        navigate('/')
    }

    if (loading) {
        return (
            <div className="hg-app-shell">
                <div className="hg-bg-mesh"><div className="hg-bg-blob-3" /></div>
                <div className="loading-screen">
                    <div className="loading-spinner" />
                    <p className="loading-text">Authenticating...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="hg-app-shell">
            <div className="hg-bg-mesh">
                <div className="hg-bg-blob-3" />
            </div>

            <div className="login-container">
                <div className="login-card glass animate-in" id="login-card">

                    {/* Logo */}
                    <div className="login-brand">
                        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                            <defs>
                                <linearGradient id="loginLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="50%" stopColor="#06b6d4" />
                                    <stop offset="100%" stopColor="#14b8a6" />
                                </linearGradient>
                            </defs>
                            <circle cx="16" cy="16" r="14" stroke="url(#loginLogoGrad)" strokeWidth="2.5" fill="none" />
                            <path d="M12 10 C12 10 10 16 16 16 C22 16 20 22 20 22" stroke="url(#loginLogoGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                            <circle cx="13" cy="9" r="1.5" fill="url(#loginLogoGrad)" />
                            <circle cx="19" cy="23" r="1.5" fill="url(#loginLogoGrad)" />
                        </svg>
                        <h1 className="login-brand__title">HireGenie</h1>
                        <p className="login-brand__subtitle">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-field">
                            <label htmlFor="login-email" className="login-label">Email</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                id="login-email"
                                name="email"
                                placeholder="you@example.com"
                                className="input-glass"
                                required
                            />
                        </div>
                        <div className="login-field">
                            <label htmlFor="login-password" className="login-label">Password</label>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                id="login-password"
                                name="password"
                                placeholder="••••••••"
                                className="input-glass"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-accent glow-pulse login-submit" id="login-btn">
                            Sign In
                        </button>
                    </form>

                    <p className="login-footer-text">
                        Don't have an account?{' '}
                        <Link to="/register" id="register-link">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login