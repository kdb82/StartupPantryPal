import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../service/apiClient";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                const session = await apiRequest("/api/auth/session", { method: "GET" });
                if (session.authenticated && session.user) {
                    setCurrentUser(session.user);
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Failed to load auth session:", error);
                setCurrentUser(null);
            } finally {
                setAuthReady(true);
            }
        };
        
        loadCurrentUser();
    }, []);

    const register = async(username, email, password) => {
        const user = await apiRequest("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ username, email, password }),
        });
        setCurrentUser(user);
        console.log("User registered successfully");
        return true;
    };

    const login = async (username, password) => {
        const user = await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });
        setCurrentUser(user);
        console.log("User logged in successfully");
        return true;
    };

    const logout = async () => {
        try {
            await apiRequest("/api/auth/logout", { method: "DELETE" });
        } finally {
            setCurrentUser(null);
            console.log("User logged out successfully");
        }
    };

    const value = {
        currentUser,
        register,
        login,
        logout,
        isAuthenticated: currentUser !== null,
        authReady
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

