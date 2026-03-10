import React from "react";
import { createContext, useContext, useState, useEffect } from "react";

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
                const user = await apiRequest("/api/user/me", { method: "GET" });
                setCurrentUser(user);
            } catch {
                setCurrentUser(null);
            } finally {
                setAuthReady(true);
            }
        };
        
        loadCurrentUser();
    }, []);

    const apiRequest = async (url, options = {}) => {
        const response = await fetch(url, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
            ...options,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || "Request failed");
        }

        return data;
    };

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

