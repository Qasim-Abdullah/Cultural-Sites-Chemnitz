import { createContext, useContext, useEffect, useState } from "react";
import { is_authenticated, login,register } from "../routes/endpoints/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const nav = useNavigate()

    const get_authenticated = async () => {
        try {
            const success = await is_authenticated();
            setIsAuthenticated(success)
        } catch {
            setIsAuthenticated(false)
        } finally {
            setLoading(false)
        }

    }
    const login_user = async (username, password) => {
        const success = await login(username, password);
        if (success) {
            setIsAuthenticated(true)
            nav('/')
        }
    }

    const register_user = async (username, email, password, confirm_password) => {
        try {
            if (password === confirm_password) {
                await register(username, email, password)
                alert('User successfully registered')
                nav('/login')
            }
        } catch {
            alert('error registering user')
        }
    }

    useEffect(() => {
        get_authenticated()

    }, [window.location.pathname])
    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login_user,register_user }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);