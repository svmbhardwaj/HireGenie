import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import './Login.css'

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleRegister({ username, email, password })
        navigate("/")
    }

    if (loading) {
        return (
            <div className="hg-app-shell">
                <div className="hg-bg-mesh"><div className="hg-bg-blob-3" /></div>
                <div className="loading-screen">
                    <div className="loading-spinner" />
                    <p className="loading-text">Creating your account...</p>
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
                <div className="login-card glass animate-in" id="register-card">
                    <div className="login-brand">
                        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                            <defs>
                                <linearGradient id="regLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="50%" stopColor="#06b6d4" />
                                    <stop offset="100%" stopColor="#14b8a6" />
                                </linearGradient>
                            </defs>
                            <circle cx="16" cy="16" r="14" stroke="url(#regLogoGrad)" strokeWidth="2.5" fill="none" />
                            <path d="M12 10 C12 10 10 16 16 16 C22 16 20 22 20 22" stroke="url(#regLogoGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                            <circle cx="13" cy="9" r="1.5" fill="url(#regLogoGrad)" />
                            <circle cx="19" cy="23" r="1.5" fill="url(#regLogoGrad)" />
                        </svg>
                        <h1 className="login-brand__title">Join HireGenie</h1>
                        <p className="login-brand__subtitle">Create your account to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-field">
                            <label htmlFor="reg-username" className="login-label">Username</label>
                            <input
                                onChange={(e) => setUsername(e.target.value)}
                                type="text"
                                id="reg-username"
                                name="username"
                                placeholder="Choose a username"
                                className="input-glass"
                                required
                            />
                        </div>
                        <div className="login-field">
                            <label htmlFor="reg-email" className="login-label">Email</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                id="reg-email"
                                name="email"
                                placeholder="you@example.com"
                                className="input-glass"
                                required
                            />
                        </div>
                        <div className="login-field">
                            <label htmlFor="reg-password" className="login-label">Password</label>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                id="reg-password"
                                name="password"
                                placeholder="••••••••"
                                className="input-glass"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-accent glow-pulse login-submit" id="register-btn">
                            Create Account
                        </button>
                    </form>

                    <p className="login-footer-text">
                        Already have an account?{' '}
                        <Link to="/login" id="login-link">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register