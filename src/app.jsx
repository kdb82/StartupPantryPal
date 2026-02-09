import React from "react";
import './styles.css';
import { BrowserRouter, NavLink, Routes, Route } from "react-router-dom";
import { Login } from ".login/login";
import { Register } from "./register/register";
import { Pantry } from "./pantry/pantry";
import { Recipes } from "./recipes/recipes";
import { Calendar } from "./calendar/calendar";
import { AILanding } from "./ailanding/ailanding";
 
export default function App() {
	return (
		<BrowserRouter>
			<div class="app">
				<header class="app-header">
					<div class="container">
						<h1>PantryPal</h1>
						<div class="navigation-container">
							<nav aria-label="Primary">
								<ul class="nav-list">
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

				<footer class="app-footer">
					<div class="container">
						<p class="built-by">Built by Kaden Bradshaw</p>
						<p class="github-link">
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