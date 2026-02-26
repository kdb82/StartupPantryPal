import React from "react";
import "../global.css";
import "./calendar.css";
import { useState, useEffect } from "react";
import { date } from "zod";

export function Calendar() {
    const SHOPPING_LIST_KEY = "shopping_list_items";
    const [shoppingList, setShoppingList] = useState([]);
    const [newIngredient, setNewIngredient] = useState("");


    const startOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const formatDate = (date) => {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
    const MEAL_PLAN_KEY = "meal_plan_data";
    const [mealPlan, setMealPlan] = useState({});

    useEffect(() => {
        const storedList = localStorage.getItem(SHOPPING_LIST_KEY);
        if (storedList) {
            try {
                setShoppingList(JSON.parse(storedList));
            } catch (error) {
                console.error("Error parsing shopping list:", error);
                localStorage.removeItem(SHOPPING_LIST_KEY);
            }
        }
    }, []);

    useEffect(() => {
        const storedPlan = localStorage.getItem(MEAL_PLAN_KEY);
        if (storedPlan) {
            try {
                setMealPlan(JSON.parse(storedPlan));
            } catch (error) {
                console.error("Error parsing meal plan:", error);
                localStorage.removeItem(MEAL_PLAN_KEY);
            }
        }
    }, []);

    const saveMealPlan = (plan) => {
        localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));
        setMealPlan(plan);
    };

    const saveShoppingList = (list) => {
        localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(list));
        setShoppingList(list);
    };

    const handlePrevWeek = () => {
        setWeekStart(prev => addDays(prev, -7));
    };

    const handleNextWeek = () => {
        setWeekStart(prev => addDays(prev, 7));
    };

    const handleToggleItem = (itemId) => {
        const updatedList = shoppingList.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        saveShoppingList(updatedList);
    };

    const handleClearList = (clearAll) => {
        if (!clearAll) {
            const uncheckedItems = shoppingList.filter(item => !item.checked);
            saveShoppingList(uncheckedItems);
        } else {
            if (window.confirm("Are you sure you want to clear your ENTIRE shopping list?")) {
                saveShoppingList([]);
            }
        }
    }

    const handleAddItem = () => {
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

        saveShoppingList([...shoppingList, newItem]);
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
                                Clear Checked Items
                            </button>
                            <button type="button" className="btn-clear" id="clear-all" onClick={() => handleClearList(true)}>
                                Clear Entire List
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}