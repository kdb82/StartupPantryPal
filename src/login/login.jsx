import React from 'react';
import "../global.css";
import { NavLink } from 'react-router-dom';

export function Login() {
  return (
    <main id="main" className="app-main">
				<div className="container">
					<img
						src="/pantrypal_logo.png"
						alt="PantryPal Logo"
						className="logo"
					/>
					<form id="loginForm" method="post" action="/api/login">
						<div className="email_field">
							<label htmlFor="email">Email:</label>
							<input type="email" id="email" name="email" required />
						</div>
						<div className="password_field">
							<label htmlFor="password">Password:</label>
							<input type="password" id="password" name="password" required />
						</div>
						<div className="form-actions">
							<button type="submit" className="login-button">Login</button>
						</div>
						<div className="error-message" id="loginError" hidden>
							Invalid email or password. Please try again.
						</div>
						<div className="success-message" id="loginSuccess" hidden>
							Login successful! Redirecting...
						</div>
					</form>
					<NavLink to="/register">New user? Create an account.</NavLink>

					<section aria-labelledby="about-title" className="placeholder-card">
						<h2 id="about-title">What PantryPal does</h2>
						<p>
							PantryPal helps you track pantry items, discover recipes, and plan
							meals for the week.
						</p>
						<ul>
							<li>
								<strong>Database (placeholder):</strong> login + pantry items
								stored per user
							</li>
							<li>
								<strong>3rd-party API (placeholder):</strong> recipe discovery
								and nutrition info
							</li>
							<li>
								<strong>WebSocket (placeholder):</strong> live updates across
								devices and shared plans
							</li>
						</ul>
						<p className="muted">
							Today this is a front-end placeholder. The structure and IDs are
							set up so the real backend integrations can be wired in later with
							minimal HTML changes.
						</p>
					</section>
				</div>
			</main>
  );
}