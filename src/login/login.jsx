import React from 'react';
import "../global.css";
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../global_components/AuthContext';

export function Login() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [username, setUsername] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [error, setError] = React.useState(null);
	const [success, setSuccess] = React.useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		try {
			await login(username, password);
			setSuccess(true);
			setTimeout(() => {
				navigate("/pantry", {replace: true}); // Redirect to pantry page after successful login
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
				<form id="loginForm" method="post" action="/api/login" onSubmit={handleSubmit}>
					<div className="username_field">
						<label htmlFor="username">Username:</label>
						<input type="text" id="username" name="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
					</div>
					<div className="password_field">
						<label htmlFor="password">Password:</label>
						<input type="password" id="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
					</div>
					<div className="form-actions">
						<button type="submit" className="login-button">Login</button>
					</div>
					<div className="error-message" id="loginError" hidden>
						{error}
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