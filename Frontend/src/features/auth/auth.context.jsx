import { createContext, useState } from "react";


export const AuthContext = createContext()


export const AuthProvider = ({ children }) => { 

    // Initialize with a demo user for development (remove in production with real backend)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    


    return (
        <AuthContext.Provider value={{user,setUser,loading,setLoading}} >
            {children}
        </AuthContext.Provider>
    )

    
}