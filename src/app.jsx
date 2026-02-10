import React from "react";
import "./global.css";
import { BrowserRouter, NavLink, Routes, Route } from "react-router-dom";
import { Login } from "./login/login";
import { Register } from "./register/register";
import { Pantry } from "./pantry/pantry";
import { FriendsRecipes, Recipes } from "./recipes/recipes";
import { Calendar } from "./calendar/calendar";
import { AILanding } from "./aiLanding/ailanding";

export default function App() {
	return (
		<BrowserRouter>
			<div className="app">
				<header className="app-header">
					<div className="container">
						<h1>PantryPal</h1>
						<div className="navigation-container">
							<nav aria-label="Primary">
								<ul className="nav-list">
									<li><NavLink to="/login">Home</NavLink></li>
									<li><NavLink to="/pantry">Pantry</NavLink></li>
									<li><NavLink to="/recipes">Recipes</NavLink></li>
									<li><NavLink to="/calendar">Calendar</NavLink></li>
									<li><NavLink to="/ai-assistant">AI Assistant</NavLink></li>
								</ul>
							</nav>
						</div>
					</div>
				</header>

				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/" element={<Login />} />
					<Route path="/recipes" element={<Recipes />} />
					<Route path="/recipes/friends" element={<FriendsRecipes />} />
					<Route path="/register" element={<Register />} />
					<Route path="/pantry" element={<Pantry />} />
					<Route path="/calendar" element={<Calendar />} />
					<Route path="/ai-assistant" element={<AILanding />} />
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
		</BrowserRouter>
	);
}