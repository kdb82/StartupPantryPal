import React from 'react';

export function Login() {
  return (
    <main id="main" class="app-main">
				<div class="container">
					<img
						src="/pantrypal_logo.png"
						alt="PantryPal Logo"
						class="logo"
					/>
					<form id="loginForm" method="post" action="/api/login">
						<div class="email_field">
							<label for="email">Email:</label>
							<input type="email" id="email" name="email" required />
						</div>
						<div class="password_field">
							<label for="password">Password:</label>
							<input type="password" id="password" name="password" required />
						</div>
						<div class="form-actions">
							<button type="submit" class="login-button">Login</button>
						</div>
						<div class="error-message" id="loginError" hidden>
							Invalid email or password. Please try again.
						</div>
						<div class="success-message" id="loginSuccess" hidden>
							Login successful! Redirecting...
						</div>
					</form>
					<a href="register.html">New user? Create an account.</a>

					<section aria-labelledby="about-title" class="placeholder-card">
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
						<p class="muted">
							Today this is a front-end placeholder. The structure and IDs are
							set up so the real backend integrations can be wired in later with
							minimal HTML changes.
						</p>
					</section>
				</div>
			</main>
  );
}