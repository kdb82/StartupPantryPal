import React from "react";

export function Calendar() {
    return (
        <div className="page-calendar">
            <main id="main-content">
                <div className="container">
                    <section aria-labelledby="calendar-title">
                        <h2 id="calendar-title">This Week’s Meal Plan:</h2>
                        <div className="calendar-controls">
                            <button type="button" aria-label="View previous week">
                                ← Previous
                            </button>
                            <p id="week-range">
                                <strong>Week of:</strong>
                                <span data-start="2026-01-26"> Jan 26</span> – 
                                <span data-end="2026-02-01"> Feb 1</span>
                            </p>
                            <button type="button" aria-label="View next week">Next →</button>
                        </div>
                    </section>
                    <section aria-labelledby="week-grid-title">
                        <h2 id="week-grid-title">Weekly Grid:</h2>
                        <table className="meal-calendar">
                            <thead>
                                <tr>
                                    <th scope="col">Mon</th>
                                    <th scope="col">Tue</th>
                                    <th scope="col">Wed</th>
                                    <th scope="col">Thu</th>
                                    <th scope="col">Fri</th>
                                    <th scope="col">Sat</th>
                                    <th scope="col">Sun</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td data-day="monday">
                                        <div className="meal-cell">
                                            <strong>Saved Recipes:</strong> Tacos<br /><em
                                            >Missing: </em
                                            >
                                             tortillas
                                        </div>
                                    </td>
                                    <td data-day="tuesday">
                                        <div className="meal-cell">
                                            <strong>Saved Recipes:</strong> Stir Fry
                                        </div>
                                    </td>
                                    <td data-day="wednesday">
                                        <div className="meal-cell">
                                            <strong>Saved Recipes:</strong> Pasta
                                        </div>
                                    </td>
                                    <td data-day="thursday">
                                        <div className="meal-cell">
                                            <strong>Saved Recipes:</strong> Soup
                                        </div>
                                    </td>
                                    <td data-day="friday">
                                        <div className="meal-cell">
                                            <strong>Saved Recipes:</strong> Pizza
                                        </div>
                                    </td>
                                    <td data-day="saturday">
                                        <div className="meal-cell">
                                            <strong>Saved Recipes:</strong> Salmon
                                        </div>
                                    </td>
                                    <td data-day="sunday">
                                        <div className="meal-cell">
                                            <strong>Saved Recipes:</strong> Leftovers
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    {/* Shopping List Section */}
                    <section aria-labelledby="shopping-title">
                        <h2 id="shopping-title">Shopping List</h2>
                        <p className="muted">Missing ingredients from your saved recipes</p>
                        <ul className="shopping-list">
                            <li>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="shopping-item"
                                        value="tortillas"
                                    />
                                    Tortillas
                                </label>
                                <span className="recipe-source">Needed for: Tacos</span>
                            </li>
                            <li>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="shopping-item"
                                        value="mixed-greens"
                                    />
                                    Mixed Greens
                                </label>
                                <span className="recipe-source">Needed for: Chicken Salad</span>
                            </li>
                            <li>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="shopping-item"
                                        value="chocolate-chips"
                                    />
                                    Chocolate Chips
                                </label>
                                <span className="recipe-source">Needed for: Cookies</span>
                            </li>
                            <li>
                                <label>
                                    <input type="checkbox" name="shopping-item" value="sugar" />
                                    Sugar
                                </label>
                                <span className="recipe-source">Needed for: Cookies</span>
                            </li>
                            <li>
                                <label>
                                    <input type="checkbox" name="shopping-item" value="ginger" />
                                    Ginger
                                </label>
                                <span className="recipe-source"
                                >Needed for: Salmon Teriyaki, Stir Fry</span
                                >
                            </li>
                        </ul>
                        <div className="shopping-actions">
                            <button type="button" className="btn-clear">Clear List</button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}