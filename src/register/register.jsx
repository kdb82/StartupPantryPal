import React from "react";
import "../global.css";
import { NavLink } from "react-router-dom";
import { useAuth } from "../global_components/AuthContext";
import { useNavigate } from "react-router-dom";

export function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [email, setEmail] = React.useState("");
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Validate password match
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        try {
            await register(username, email, password);
            setSuccess(true);
            setTimeout(() => {
                navigate("/pantry", { replace: true }); // Redirect to pantry page after successful registration
            }, 1000);
        } catch (err) {
            setSuccess(false);
            setError(err.message);
        }
    };

    return (
        <main id="main" className="app-main">
            <div className="container">
                <img
                    src="/pantrypal_logo.png"
                    alt="PantryPal Logo"
                    className="logo"
                />
                <form id="registerForm" onSubmit={handleSubmit}>
                    <div className="email_field">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="username_field">
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" name="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="password_field">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="confirm_password_field">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit">Create Account</button>
                    </div>
                    {error && <div className="error-message" id="registerError">{error}</div>}
                    {success && <div className="success-message" id="registerSuccess">Account created successfully! Redirecting...</div>}
                </form>
            <NavLink to="/login">Already have an account? Log in here.</NavLink>
            </div>
        </main>
    );
}