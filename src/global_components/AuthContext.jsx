import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import bcrypt from "bcryptjs";


const USERS_KEY = "pantrypal_users";
const CURRENT_USER_KEY = "pantrypal_currentUser";
const AUTH_CHANGED_EVENT = "pantrypal_auth_changed";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    // Load current user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing stored user:", error);
                localStorage.removeItem(CURRENT_USER_KEY);
            }
        }
    }, []);

    const register = (username, email, password) => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        
        if (!username || !email || !password) {
            throw new Error("All fields are required");
        }
        
        if (users.find((u) => u.email === email)) {
            throw new Error("Email already in use");
        }
        
        if (users.find((u) => u.username === username)) {
            throw new Error("Username already in use");
        }

        try {
            const passwordHash = bcrypt.hashSync(password, 10);
            const newUser = { username, email, passwordHash };
            users.push(newUser);
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            
            const { passwordHash: _, ...userWithoutPassword } = newUser;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
            setCurrentUser(userWithoutPassword);
            
            console.log("User registered successfully:", userWithoutPassword);
            return true;
        } catch (error) {
            console.error("Error during registration:", error);
            throw new Error("Failed to register user");
        }
    };

    const login = (username, password) => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        const user = users.find((u) => u.username === username);
        
        if (!user) {
            throw new Error("Invalid username or password");
        }

        const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
        if (!passwordMatch) {
            throw new Error("Invalid username or password");
        }

        const { passwordHash: _, ...userWithoutPassword } = user;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        setCurrentUser(userWithoutPassword);
        
        console.log("User logged in successfully:", userWithoutPassword);
        return true;
    };

    const logout = () => {
        localStorage.removeItem(CURRENT_USER_KEY);
        setCurrentUser(null);
        console.log("User logged out");
    };

    const value = {
        currentUser,
        register,
        login,
        logout,
        isAuthenticated: currentUser !== null
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

