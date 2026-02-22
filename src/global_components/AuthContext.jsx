import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import bcrypt from "bcryptjs";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    // Load current user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing stored user:", error);
                localStorage.removeItem("currentUser");
            }
        }
    }, []);

    const value = {
        currentUser,
        isAuthenticated: currentUser !== null
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function getUsers() {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
}

export function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

export function getCurrentUser() {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

export function removeCurrentUser() {
    localStorage.removeItem("currentUser");
}

export async function registerUser(username, email, password) {
    const users = getUsers();
    if (users.find((u) => u.email === email)) {
        throw new Error("Email already in use");
    }
    if (users.find((u) => u.username === username)) {
        throw new Error("Username already in use");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
        console.error("Error hashing password:", error);
        throw new Error("Failed to register user");
    }
    const newUser = { username, email, password: hashedPassword };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    console.log("User register success:", newUser);
    return true;
}

export async function loginUser(email, password) {
    const users = getUsers();
    const user = users.find((u) => u.email === email);
    if (!user) {
        console.error("Login failed: User not found for email", email);
        throw new Error("User not found");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        console.error("Login failed: Incorrect password for user", user.username);
        throw new Error("Incorrect password");
    }

    setCurrentUser(user);
    console.log("User login success:", user);
    return true;
}

export const logoutUser = () => {
    removeCurrentUser();
    console.log("User logged out");
};