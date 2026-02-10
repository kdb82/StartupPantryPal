import React from "react";
import { NavLink } from "react-router-dom";

export function Register() {
    return (
        <main id="main" className="app-main">
            <div className="container">
                <img
                    src="/pantrypal_logo.png"
                    alt="PantryPal Logo"
                    className="logo"
                />
                <form id="registerForm" method="post" action="/api/register">
                    <div className="email_field">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    <div className="password_field">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" required />
                    </div>
                    <div className="confirm_password_field">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit">Create Account</button>
                    </div>
                    <div className="error-message" id="registerError" style={{display: "none"}}>
                        Registration failed. Please try again.
                    </div>
                    <div
                        className="success-message"
                        id="registerSuccess"
                        style={{display: "none"}}
                    >
                        Account created successfully! Redirecting...
                    </div>
                </form>

                <NavLink to="/login">Already have an account? Log in here.</NavLink>
            </div>
        </main>
    );
}