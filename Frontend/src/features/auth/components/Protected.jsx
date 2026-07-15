import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'

const Protected = ({children}) => {
    const { loading, user } = useAuth()

    if(loading){
        return (
            <div className="hg-app-shell">
                <div className="hg-bg-mesh"><div className="hg-bg-blob-3" /></div>
                <div className="loading-screen">
                    <div className="loading-spinner" />
                    <p className="loading-text">Loading...</p>
                </div>
            </div>
        )
    }

    if(!user){
        return <Navigate to={'/login'} />
    }
    
    return children
}

export default Protected