import React from "react";
import "./global.css";
import { BrowserRouter, NavLink, Routes, Route, useNavigate } from "react-router-dom";
import { Login } from "./login/login";
import { Register } from "./register/register";
import { Pantry } from "./pantry/pantry";
import { FriendsRecipes, Recipes } from "./recipes/recipes";
import { Calendar } from "./calendar/calendar";
import { AILanding } from "./aiLanding/ailanding";
import { ProtectedRoute } from "./global_components/ProtectedRoute";
import { useAuth } from "./global_components/AuthContext";

function AppContent() {
	const { currentUser, logout, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};
	return (
		<div className="app">
			<header className="app-header">
				<div className="container">
					<h1>PantryPal</h1>
					<div className="navigation-container">
						<nav aria-label="Primary">
							<ul className="nav-list">
							{isAuthenticated ? (
								<>
									<li><NavLink to="/pantry">Pantry</NavLink></li>
									<li><NavLink to="/recipes">Recipes</NavLink></li>
									<li><NavLink to="/calendar">Calendar</NavLink></li>
									<li><NavLink to="/ai-assistant">AI Assistant</NavLink></li>
									<li className="user-info"><em>Welcome, {currentUser.username}!</em></li>
									<li><button onClick={handleLogout} className="logout-button">Logout</button></li>
								</>
							) : (
								<>
									<li><NavLink to="/login">Login</NavLink></li>
								</>
								)}
							</ul>
						</nav>
					</div>
				</div>
			</header>

			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/" element={<Login />} />
				<Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
				<Route path="/recipes/friends" element={<ProtectedRoute><FriendsRecipes /></ProtectedRoute>} />
				<Route path="/register" element={<Register />} />
				<Route path="/pantry" element={<ProtectedRoute><Pantry /></ProtectedRoute>} />
				<Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
				<Route path="/ai-assistant" element={<ProtectedRoute><AILanding /></ProtectedRoute>} />
			</Routes>

			<footer className="app-footer">
				<div className="container">
					<p className="built-by">Built by Kaden Bradshaw</p>
					<p className="github-link">
						<a
							href="https://github.com/kdb82/StartupPantryPal"
							target="_blank"
							rel="noreferrer"
						>View on GitHub</a
						>
					</p>
					<p className="copyright">&copy; 2026 PantryPal</p>
				</div>
			</footer>
		</div>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<AppContent />
		</BrowserRouter>
	);
}