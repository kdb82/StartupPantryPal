import React from "react";
import './styles.css';
import { BrowserRouter, NavLink, Routes, Route } from "react-router-dom";
import { Login } from "./login/login";
// import { Register } from "./register/register";
// import { Pantry } from "./pantry/pantry";
// import { Recipes } from "./recipes/recipes";
// import { Calendar } from "./calendar/calendar";
// import { AILanding } from "./ailanding/ailanding";
 
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
									<li><a href="index.html" aria-current="page">Home</a></li>
									<li><a href="pantry.html">Pantry</a></li>
									<li><a href="recipes.html">Recipes</a></li>
									<li><a href="calendar.html">Calendar</a></li>
									<li><a href="ailanding.html">AI Assistant</a></li>
								</ul>
							</nav>
						</div>
					</div>
				</header>

				<Routes>
					{/* Define your routes here */}
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
						<p>&copy; 2026 PantryPal</p>
					</div>
				</footer>
			</div>
		</BrowserRouter>
	);
}