import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children }) {
    const { isAuthenticated, authReady } = useAuth();
    if (!authReady) {
        return <div>Loading...</div>;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
}