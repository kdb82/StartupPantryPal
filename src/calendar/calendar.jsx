import React from "react";
import "../global.css";
import "./calendar.css";
import { useState, useEffect } from "react";
import { apiRequest } from "../apiRequest";

function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

export function Calendar() {
    const [shoppingList, setShoppingList] = useState([]);
    const [newIngredient, setNewIngredient] = useState("");
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
    const [mealPlan, setMealPlan] = useState({});
    const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        const loadSavedRecipes = async () => {
            try {
                const recipes = await apiRequest("/api/recipes", { method: "GET" });
                setSavedRecipes(Array.isArray(recipes) ? recipes : []);
            } catch (error) {
                console.error("Error loading saved recipes:", error);
                setSavedRecipes([]);
            }
        };
        loadSavedRecipes();
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [shopping, meal] = await Promise.all([
                    apiRequest("/api/shopping-list", { method: "GET" }),
                    apiRequest("/api/meal-plan", { method: "GET" })
                ]);

                setShoppingList(Array.isArray(shopping.items) ? shopping.items : []);
                setMealPlan(meal.plan && typeof meal.plan === "object" ? meal.plan : {});
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };
        loadData();
    }, []);


    const formatDate = (date) => {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };


    const saveMealPlan = async (plan) => {
        try {
            const result = await apiRequest("/api/meal-plan", {
                method: "PUT",
                body: JSON.stringify({ plan }),
            });
            setMealPlan(result.plan && typeof result.plan === "object" ? result.plan : {});
        } catch (error) {
            console.error("Error saving meal plan:", error);
        }
    };

    const handleAddRecipeToDay = async (dayName, recipeId, recipeName) => {
        const key = `${weekStart.toISOString().split('T')[0]}_${dayName}`;
        const updatedPlan = { ...mealPlan };

        if (!updatedPlan[key]) {
            updatedPlan[key] = [];
        }

        // Avoid duplicates
        if (!updatedPlan[key].some(r => r.id === recipeId)) {
            updatedPlan[key].push({ id: recipeId, name: recipeName });
        }

        await saveMealPlan(updatedPlan);
    };

    const handleRemoveRecipeFromDay = async (dayName, recipeId) => {
        const key = `${weekStart.toISOString().split('T')[0]}_${dayName}`;
        const updatedPlan = { ...mealPlan };

        if (updatedPlan[key]) {
            updatedPlan[key] = updatedPlan[key].filter(r => r.id !== recipeId);
            if (updatedPlan[key].length === 0) {
                delete updatedPlan[key];
            }
        }

        await saveMealPlan(updatedPlan);
    };

    const saveShoppingList = async (list) => {
        try {
            const result = await apiRequest("/api/shopping-list", {
                method: "PUT",
                body: JSON.stringify({ items: list }),
            });
            setShoppingList(Array.isArray(result.items) ? result.items : []);
        } catch (error) {
            console.error("Error saving shopping list:", error);
        }
    };

    const handlePrevWeek = () => {
        setWeekStart(prev => addDays(prev, -7));
    };

    const handleNextWeek = () => {
        setWeekStart(prev => addDays(prev, 7));
    };

    const handleToggleItem = async (itemId) => {
        const updatedList = shoppingList.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        await saveShoppingList(updatedList);
    };

    const handleClearList = async (clearAll) => {
        if (!clearAll) {
            const uncheckedItems = shoppingList.filter(item => !item.checked);
            await saveShoppingList(uncheckedItems);
        } else {
            if (window.confirm("Are you sure you want to clear your ENTIRE shopping list?")) {
                await saveShoppingList([]);
            }
        }
    }

    const handleAddItem = async () => {
        const ingredient = newIngredient.trim();
        const exists = shoppingList.find(item => item.name.toLowerCase() === ingredient.toLowerCase());

        if (exists) {
            alert("This ingredient is already in your shopping list.");
            return;
        }

        const newItem = {
            id: `manual_${Date.now()}`,
            name: ingredient,
            checked: false,
            neededFor: ["Manually Added"]
        }

        await saveShoppingList([...shoppingList, newItem]);
        setNewIngredient("");
    };

    return (
        <div className="page-calendar">
            <main id="main-content">
                <div className="container">
                    <section aria-labelledby="calendar-title">
                        <h2 id="calendar-title">This Week’s Meal Plan:</h2>
                        <div className="calendar-controls">
                            <button type="button" aria-label="View previous week" onClick={handlePrevWeek}>
                                ← Previous
                            </button>
                            <p id="week-range">
                                <strong>Week of: </strong>
                                <span data-start={weekStart.toISOString().split('T')[0]}>{formatDate(weekStart)}</span> {" - "}
                                <span data-end={addDays(weekStart, 6).toISOString().split('T')[0]}>{formatDate(addDays(weekStart, 6))}</span>
                            </p>
                            <button type="button" aria-label="View next week" onClick={handleNextWeek}>Next →</button>
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
                                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => {
                                        const key = `${weekStart.toISOString().split('T')[0]}_${day}`;
                                        const dayRecipes = mealPlan[key] || [];
                                        
                                        return (
                                            <td key={day} data-day={day}>
                                                <div className="meal-cell">
                                                    <strong>Saved Recipes:</strong>
                                                    {dayRecipes.length > 0 ? (
                                                        <ul style={{ listStyle: "none", padding: 0, margin: "var(--space-sm) 0" }}>
                                                            {dayRecipes.map(recipe => (
                                                                <li key={recipe.id} style={{ marginBottom: "var(--space-xs)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                    <span>{recipe.name}</span>
                                                                    <button 
                                                                        onClick={() => handleRemoveRecipeFromDay(day, recipe.id)}
                                                                        style={{ marginLeft: "var(--space-xs)", fontSize: "0.7rem", padding: "2px 6px" }}
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="muted" style={{ margin: "var(--space-xs) 0" }}>No recipes scheduled</p>
                                                    )}
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedDay(day);
                                                            setShowAddRecipeModal(true);
                                                        }}
                                                        style={{ fontSize: "0.8rem", marginTop: "var(--space-xs)" }}
                                                    >
                                                        + Add Recipe
                                                    </button>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    {/* Shopping List Section */}
                    <section aria-labelledby="shopping-title">
                        <h2 id="shopping-title">Shopping List</h2>
                        <p className="muted">Missing ingredients from your saved recipes</p>
                        <ul className="shopping-list">
                            {shoppingList.length === 0 ? (
                                <li className="empty-message">
                                    <p className="muted">Your shopping list is empty! Missing ingredients from your saved recipes will appear here.</p>
                                    <p className="muted">You can add missing ingredients by recipe with the AI, directly from your saved recipes, or with the add button below.</p>
                                </li>
                            ) : (
                                shoppingList.map(item => (
                                    <li key={item.id} className={item.checked ? "checked" : ""}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={item.checked}
                                                name="shopping-item"
                                                onChange={() => handleToggleItem(item.id)}
                                            />
                                            {item.name}
                                        </label>
                                        {item.neededFor && <span className="recipe-source">
                                            Needed for: {item.neededFor.join(", ")}
                                        </span>}
                                    </li>
                                ))
                            )}
                        </ul>
                        <div className="shopping-actions">
                            <input
                                type="text"
                                placeholder="Add ingredient..."
                                value={newIngredient}
                                onChange={(e) => setNewIngredient(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                            />
                            <button type="button" className="btn-add" onClick={handleAddItem}>
                                Add Item
                            </button>
                            <button type="button" className="btn-clear" onClick={() => handleClearList(false)}>
                                Remove Checked Items
                            </button>
                            <button type="button" className="btn-clear" id="clear-all" onClick={() => handleClearList(true)}>
                                Clear Entire List
                            </button>
                        </div>
                    </section>
                </div>

                {showAddRecipeModal && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1000,
                        }}
                        onClick={() => setShowAddRecipeModal(false)}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: "white",
                                borderRadius: "var(--radius-md)",
                                padding: "var(--space-lg)",
                                maxWidth: "400px",
                                maxHeight: "80vh",
                                overflowY: "auto",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <h3 style={{ marginTop: 0 }}>Select Recipe for {selectedDay}</h3>
                            <div style={{ marginBottom: "var(--space-md)" }}>
                                {savedRecipes.length > 0 ? (
                                    savedRecipes.map((recipe) => (
                                        <div
                                            key={recipe.recipeId}
                                            style={{
                                                padding: "var(--space-sm)",
                                                borderBottom: "1px solid #e5e7eb",
                                            }}
                                        >
                                            <button
                                                onClick={() => {
                                                    handleAddRecipeToDay(selectedDay, recipe.recipeId, recipe.name);
                                                }}
                                                style={{
                                                    width: "100%",
                                                    textAlign: "left",
                                                    padding: "var(--space-sm)",
                                                    backgroundColor: "#f3f4f6",
                                                    border: "1px solid #d1d5db",
                                                    borderRadius: "var(--radius-sm)",
                                                    cursor: "pointer",
                                                    fontSize: "0.95rem",
                                                }}
                                            >
                                                {recipe.name}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="muted">No saved recipes found. Create a recipe first!</p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowAddRecipeModal(false)}
                                style={{
                                    width: "100%",
                                    padding: "var(--space-sm)",
                                    backgroundColor: "#f3f4f6",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "var(--radius-sm)",
                                    cursor: "pointer",
                                    fontSize: "0.95rem",
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}