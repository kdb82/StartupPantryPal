import React from "react";
import "../global.css";
import "./recipes.css";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../apiRequest";
import { useAuth } from "../global_components/AuthContext";

export function Recipes() {
    const [notifications, setNotifications] = useState([]);
    const [shoppingListMessage, setShoppingListMessage] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [showDaySelector, setShowDaySelector] = useState(false);
    const [selectedRecipeForCalendar, setSelectedRecipeForCalendar] = useState(null);
    const { authReady, isAuthenticated } = useAuth();

    useEffect(() => {
        let notificationInterval;

        if (!authReady || !isAuthenticated) {
			setNotifications([]);
			return undefined;
		}

        const loadNotifications = async () => {
            try {
                const response = await apiRequest("/api/friends/activity", { method: "GET" });
                const activityItems = Array.isArray(response.items) ? response.items : [];

                if (activityItems.length === 0) {
                    setNotifications([]);
                    return;
                }

                let activityIndex = 0;
                setNotifications([activityItems[activityIndex]]);

                notificationInterval = setInterval(() => {
                    activityIndex = (activityIndex + 1) % activityItems.length;
                    const nextItem = {
                        ...activityItems[activityIndex],
                        id: `${activityItems[activityIndex].id}-${Date.now()}`,
                        timestamp: new Date().toLocaleTimeString(),
                    };

                    setNotifications((prev) => [nextItem, ...prev].slice(0, 2));
                }, 3000);
            } catch (error) {
                console.error("Failed to load friend activity:", error);
                setNotifications([]);
            }
        };

        loadNotifications();

        return () => {
            if (notificationInterval) {
                clearInterval(notificationInterval);
            }
        };
    }, [authReady, isAuthenticated]);

    useEffect(() => {
        if (!authReady || !isAuthenticated) {
			setRecipes([]);
			return;
		}

        const loadRecipes = async () => {
            const recipes = await apiRequest("/api/recipes", { method: "GET" });
            setRecipes(Array.isArray(recipes) ? recipes : []);
        };
        loadRecipes();
    }, [authReady, isAuthenticated]);

    // Handle save ingredients
    const handleSaveIngredients = async (missingIngredients, recipeName, recipeId) => {
        try {
            // Handle both array and string inputs
            let ingredientsList;
            if (Array.isArray(missingIngredients)) {
                ingredientsList = missingIngredients;
            } else if (typeof missingIngredients === 'string') {
                ingredientsList = missingIngredients.split(',').map(i => i.trim());
            } else {
                throw new Error('Invalid ingredients format');
            }

            if (ingredientsList.length === 0) {
                setShoppingListMessage('No ingredients to add');
                setTimeout(() => setShoppingListMessage(""), 3000);
                return;
            }

            // Get existing shopping list
            const shoppingResponse = await apiRequest("/api/shopping-list", { method: "GET" });
            const shoppingList = Array.isArray(shoppingResponse.items) ? shoppingResponse.items : [];

            // Add new ingredients (avoid duplicates)
            const addedIngredients = [];
            ingredientsList.forEach(ingredient => {
                const existingItem = shoppingList.find(
                    item => item.name.toLowerCase() === ingredient.toLowerCase()
                );
                
                if (!existingItem) {
                    shoppingList.push({
                        id: `recipe_${Date.now()}_${Math.random()}`,
                        name: ingredient,
                        checked: false,
                        neededFor: [recipeName]
                    });
                    addedIngredients.push(ingredient);
                } else {
                    // Update neededFor if this recipe isn't already listed
                    if (!existingItem.neededFor.includes(recipeName)) {
                        existingItem.neededFor.push(recipeName);
                    }
                }
            });

            await apiRequest("/api/shopping-list", {
                method: "PUT",
                body: JSON.stringify({ items: shoppingList }),
            });

            if (addedIngredients.length === 0) {
                setShoppingListMessage('Already added to shopping list');
            } else {
                setShoppingListMessage(`✓ Added ${addedIngredients.length} items to shopping list`);
            }
            setTimeout(() => setShoppingListMessage(""), 3000);

            // Close the Bootstrap modal
            if (recipeId) {
                const modalElement = document.getElementById(`recipeModal-${recipeId}`);
                if (modalElement) {
                    const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
                    if (bootstrapModal) bootstrapModal.hide();
                }
            }
        } catch (error) {
            console.error("Error saving ingredients:", error);
            setShoppingListMessage(`Error: ${error.message}`);
            setTimeout(() => setShoppingListMessage(""), 3000);
        }
    };

    // Handle add recipe to calendar
    const handleAddRecipeToCalendar = async (day) => {
        if (!selectedRecipeForCalendar) return;

        const recipe = selectedRecipeForCalendar;
        
        // Calculate the current week's Monday
        const today = new Date();
        const currentDay = today.getDay();
        const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
        const weekStart = new Date(today.setDate(diff));
        
        const key = `${weekStart.toISOString().split('T')[0]}_${day}`;
        
        // Get existing meal plan
        const mealPlanResponse = await apiRequest("/api/meal-plan", { method: "GET" });
        const mealPlan = mealPlanResponse.plan && typeof mealPlanResponse.plan === "object"
            ? mealPlanResponse.plan
            : {};

        if (!mealPlan[key]) {
            mealPlan[key] = [];
        }

        // Avoid duplicates
        if (!mealPlan[key].some(r => r.id === recipe.recipeId)) {
            mealPlan[key].push({ id: recipe.recipeId, name: recipe.name });
        }

        await apiRequest("/api/meal-plan", {
            method: "PUT",
            body: JSON.stringify({ plan: mealPlan }),
        });
        setShoppingListMessage(`✓ Added "${recipe.name}" to ${day}`);
        setTimeout(() => setShoppingListMessage(""), 3000);
        
        // Close the Bootstrap modal
        const modalElement = document.getElementById(`recipeModal-${recipe.recipeId}`);
        if (modalElement) {
            const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
            if (bootstrapModal) bootstrapModal.hide();
        }
        
        setShowDaySelector(false);
        setSelectedRecipeForCalendar(null);
    };

    // Handle delete recipe
    const handleDeleteRecipe = async (recipeId, recipeName) => {
        const confirmed = window.confirm(`Are you sure you want to delete "${recipeName}"? This action cannot be undone.`);
        if (confirmed) {
            await apiRequest(`/api/recipes/${recipeId}`, { method: "DELETE" });
            setRecipes((prev) => prev.filter((recipe) => recipe.recipeId !== recipeId));
            return true;
        }
        return false;
    };

    return (
        <div className="page-recipes">\n            <main id="main-content">
                <div className="container">
                    <h2>Recipes</h2>

                    <section aria-labelledby="recipe-api-title" className="placeholder-card">
                        <h3 id="recipe-api-title">
                            Friends' Activity
                        </h3>
                        <p className="muted">
                            Recent recipe activity from the backend API
                        </p>

                        <ul className="notification-feed" role="log" aria-live="polite" aria-label="Recipe notifications">
                            {notifications.length === 0 ? (
                                <li className="muted">Waiting for notifications...</li>
                            ) : (
                                notifications.map(notif => (
                                    <li key={notif.id}>
                                        <span className="notification-message">{notif.message}</span>
                                        <span className="notification-time">{notif.timestamp}</span>
                                    </li>
                                ))
                            )}
                        </ul>

                        {shoppingListMessage && (
                            <p className="feedback-message" role="status">{shoppingListMessage}</p>
                        )}
                    </section>

                    {/* View Toggle */}
                    <div className="recipe-filters">
                        <NavLink to="/recipes"
                            data-filter="my-recipes"
                            className="filter-btn"
                            end
                        >
                            My Recipes
                        </NavLink>
                        <NavLink
                            className="filter-btn"
                            to="/recipes/friends"
                            data-filter="friends-recipes"
                        >
                            Friends' Recipes
                        </NavLink>
                    </div>

                    {/* My Recipes View */}
                    <section id="my-recipes" className="recipe-view active">
                        <h3>Your Saved Recipes</h3>
                        <div className="recipe-grid">
                            {recipes.length === 0 ? (<p className="muted">You haven't saved any recipes yet. Find recipes with the AI assistant to start!</p>) : (
                                recipes.map(recipe => (
                                    <button
                                        key={recipe.recipeId}
                                        type="button"
                                        className="recipe-card-trigger"
                                        data-bs-toggle="modal"
                                        data-bs-target={`#recipeModal-${recipe.recipeId}`}
                                    >
                                        <article className="recipe-card">
                                            <h4>{recipe.name}</h4>
                                            <p className="recipe-meta">Shared by You</p>
                                            <p className="recipe-description">
                                                {recipe.description || "No description provided."}
                                            </p>
                                            <ul className="recipe-ingredients">
                                                {recipe.ingredients.map((ingredient, idx) => (
                                                    <li key={idx}>{ingredient}</li>
                                                ))}
                                            </ul>
                                        </article>
                                    </button>
                                ))
                            )}
                            </div>

                    {/* Dynamic Recipe Modals */}
                    {recipes.map(recipe => (
                        <div
                            key={recipe.recipeId}
                            className="modal fade"
                            id={`recipeModal-${recipe.recipeId}`}
                            tabIndex="-1"
                            aria-hidden="true"
                        >
                            <div className="modal-dialog modal-dialog-centered modal-lg">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">{recipe.name}</h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"
                                            aria-label="Close"
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <p className="text-muted mb-3">
                                            Shared by You{recipe.time ? ` • ${recipe.time} minutes` : ''}
                                        </p>
                                        <p>{recipe.description || "No description"}</p>
                                        <h6>Ingredients</h6>
                                        <ul>
                                            {recipe.ingredients.map((ingredient, idx) => (
                                                <li key={idx}>{ingredient}</li>
                                            ))}
                                        </ul>
                                        <h6>Steps</h6>
                                        <ol>
                                            {recipe.steps.map((step, idx) => (
                                                <li key={idx}>{step}</li>
                                            ))}
                                        </ol>
                                        <h6>Missing Ingredients</h6>
                                        <ul>
                                            {recipe.missingIngredients && recipe.missingIngredients.length > 0 ? (
                                                recipe.missingIngredients.map((ingredient, idx) => (
                                                    <li key={idx}>{ingredient}</li>
                                                ))
                                            ) : (
                                                <li>None! You have all the ingredients.</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            data-bs-dismiss="modal"
                                        >
                                            Close
                                        </button>
                                        {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleSaveIngredients(recipe.missingIngredients, recipe.name, recipe.recipeId)}
                                            >
                                                Add Missing Ingredients to Shopping List
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            style={{backgroundColor: "#b6d6b7", borderColor: "white"}}
                                            id= "add-to-calendar-btn"
                                            className="btn btn-success"
                                            onClick={() => {
                                                setSelectedRecipeForCalendar(recipe);
                                                setShowDaySelector(true);
                                            }}
                                        >
                                            Add to Calendar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger delete-recipe"
                                            onClick={async () => {
                                                const deleted = await handleDeleteRecipe(recipe.recipeId, recipe.name);
                                                if (deleted) {
                                                    const modal = bootstrap.Modal.getInstance(document.getElementById(`recipeModal-${recipe.recipeId}`));
                                                    if (modal) modal.hide();
                                                }
                                            }}
                                        >
                                            Delete recipe
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    </section>

                    {/* Day Selector Modal */}
                    {showDaySelector && (
                        <div
                            style={{
                                position: "fixed",
                                inset: 0,
                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 1060,
                            }}
                            onClick={() => setShowDaySelector(false)}
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    backgroundColor: "white",
                                    borderRadius: "var(--radius-md)",
                                    padding: "var(--space-lg)",
                                    maxWidth: "400px",
                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                <h3 style={{ marginTop: 0 }}>Select Day</h3>
                                <p className="muted">Which day would you like to add this recipe to?</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
                                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                                        <button
                                            key={day}
                                            onClick={() => handleAddRecipeToCalendar(day)}
                                            style={{
                                                width: "100%",
                                                textAlign: "left",
                                                padding: "var(--space-sm)",
                                                backgroundColor: "#f3f4f6",
                                                border: "1px solid #d1d5db",
                                                borderRadius: "var(--radius-sm)",
                                                cursor: "pointer",
                                                fontSize: "0.95rem",
                                                textTransform: "capitalize",
                                            }}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowDaySelector(false)}
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
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export function FriendsRecipes() {
    const [notifications, setNotifications] = useState([]);
    const [shoppingListMessage, setShoppingListMessage] = useState("");
    const [friendsRecipes, setFriendsRecipes] = useState([]);
    const [pantryItems, setPantryItems] = useState([]);
    const [showDaySelector, setShowDaySelector] = useState(false);
    const [selectedRecipeForCalendar, setSelectedRecipeForCalendar] = useState(null);
    const { authReady, isAuthenticated } = useAuth();

    useEffect(() => {
        let notificationInterval;
        let recipeInterval;

        if (!authReady || !isAuthenticated) {
			setNotifications([]);
			setFriendsRecipes([]);
			return undefined;
		}

        const loadFriendRecipes = async () => {
            try {
                const [activityResponse, recipesResponse] = await Promise.all([
                    apiRequest("/api/friends/activity", { method: "GET" }),
                    apiRequest("/api/friends/recipes", { method: "GET" }),
                ]);

                const activityItems = Array.isArray(activityResponse.items) ? activityResponse.items : [];
                const recipeItems = Array.isArray(recipesResponse.items) ? recipesResponse.items : [];

                if (activityItems.length > 0) {
                    let activityIndex = 0;
                    setNotifications([activityItems[activityIndex]]);

                    notificationInterval = setInterval(() => {
                        activityIndex = (activityIndex + 1) % activityItems.length;
                        const nextItem = {
                            ...activityItems[activityIndex],
                            id: `${activityItems[activityIndex].id}-${Date.now()}`,
                            timestamp: new Date().toLocaleTimeString(),
                        };

                        setNotifications((prev) => [nextItem, ...prev].slice(0, 2));
                    }, 3000);
                } else {
                    setNotifications([]);
                }

                if (recipeItems.length > 0) {
                    let recipeIndex = 0;
                    setFriendsRecipes([recipeItems[recipeIndex]]);

                    recipeInterval = setInterval(() => {
                        recipeIndex = (recipeIndex + 1) % recipeItems.length;
                        const nextRecipe = recipeItems[recipeIndex];

                        setFriendsRecipes((prev) => {
                            const remainingRecipes = prev.filter(
                                (recipe) => recipe.recipeId !== nextRecipe.recipeId
                            );
                            return [nextRecipe, ...remainingRecipes];
                        });
                    }, 3000);
                } else {
                    setFriendsRecipes([]);
                }
            } catch (error) {
                console.error("Failed to load friend recipe data:", error);
                setNotifications([]);
                setFriendsRecipes([]);
            }
        };

        loadFriendRecipes();

        return () => {
            if (notificationInterval) {
                clearInterval(notificationInterval);
            }
            if (recipeInterval) {
                clearInterval(recipeInterval);
            }
        };
    }, [authReady, isAuthenticated]);

    useEffect(() => {
        if (!authReady || !isAuthenticated) {
			setPantryItems([]);
			return;
		}

        const loadPantry = async () => {
            try {
                const pantry = await apiRequest("/api/pantry", { method: "GET" });
                setPantryItems(Array.isArray(pantry.items) ? pantry.items : []);
            } catch (error) {
                console.error("Failed to load pantry for recipe comparison:", error);
                setPantryItems([]);
            }
        };

        loadPantry();
    }, [authReady, isAuthenticated]);

    // Calculate missing ingredients based on user's pantry
    const calculateMissingIngredients = (recipeIngredients) => {
        if (!pantryItems.length) {
            return recipeIngredients; // All ingredients are missing if no pantry
        }

        const normalizeIngredient = (item) =>
            item.replace(/\s*\(\s*\d+\s*\)\s*$/, "").trim().toLowerCase();

        const pantryNames = pantryItems.map((item) => normalizeIngredient(item.name));

        return recipeIngredients.filter((ingredient) =>
            !pantryNames.includes(normalizeIngredient(ingredient))
        );
    };

    // Handle save ingredients
    const handleSaveIngredients = async (missingIngredients, recipeName, recipeId) => {
        try {
            // Handle both array and string inputs
            let ingredientsList;
            if (Array.isArray(missingIngredients)) {
                ingredientsList = missingIngredients;
            } else if (typeof missingIngredients === 'string') {
                ingredientsList = missingIngredients.split(',').map(i => i.trim());
            } else {
                throw new Error('Invalid ingredients format');
            }

            if (ingredientsList.length === 0) {
                setShoppingListMessage('No ingredients to add');
                setTimeout(() => setShoppingListMessage(""), 3000);
                return;
            }

            // Get existing shopping list
            const shoppingResponse = await apiRequest("/api/shopping-list", { method: "GET" });
            const shoppingList = Array.isArray(shoppingResponse.items) ? shoppingResponse.items : [];

            // Add new ingredients (avoid duplicates)
            const addedIngredients = [];
            ingredientsList.forEach(ingredient => {
                const existingItem = shoppingList.find(
                    item => item.name.toLowerCase() === ingredient.toLowerCase()
                );
                
                if (!existingItem) {
                    shoppingList.push({
                        id: `recipe_${Date.now()}_${Math.random()}`,
                        name: ingredient,
                        checked: false,
                        neededFor: [recipeName]
                    });
                    addedIngredients.push(ingredient);
                } else {
                    // Update neededFor if this recipe isn't already listed
                    if (!existingItem.neededFor.includes(recipeName)) {
                        existingItem.neededFor.push(recipeName);
                    }
                }
            });

            await apiRequest("/api/shopping-list", {
                method: "PUT",
                body: JSON.stringify({ items: shoppingList }),
            });

            if (addedIngredients.length === 0) {
                setShoppingListMessage('Already added to shopping list');
            } else {
                setShoppingListMessage(`✓ Added ${addedIngredients.length} items to shopping list`);
            }
            setTimeout(() => setShoppingListMessage(""), 3000);

            // Close the Bootstrap modal
            if (recipeId) {
                const modalElement = document.getElementById(`recipeModal-${recipeId}`);
                if (modalElement) {
                    const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
                    if (bootstrapModal) bootstrapModal.hide();
                }
            }
        } catch (error) {
            console.error("Error saving ingredients:", error);
            setShoppingListMessage(`Error: ${error.message}`);
            setTimeout(() => setShoppingListMessage(""), 3000);
        }
    };

    // Handle add recipe to calendar
    const handleAddRecipeToCalendar = async (day) => {
        if (!selectedRecipeForCalendar) return;

        const recipe = selectedRecipeForCalendar;
        
        // Calculate the current week's Monday
        const today = new Date();
        const currentDay = today.getDay();
        const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
        const weekStart = new Date(today.setDate(diff));
        
        const key = `${weekStart.toISOString().split('T')[0]}_${day}`;
        
        // Get existing meal plan
        const mealPlanResponse = await apiRequest("/api/meal-plan", { method: "GET" });
        const mealPlan = mealPlanResponse.plan && typeof mealPlanResponse.plan === "object"
            ? mealPlanResponse.plan
            : {};

        if (!mealPlan[key]) {
            mealPlan[key] = [];
        }

        // Avoid duplicates
        if (!mealPlan[key].some(r => r.id === recipe.recipeId)) {
            mealPlan[key].push({ id: recipe.recipeId, name: recipe.name });
        }

        await apiRequest("/api/meal-plan", {
            method: "PUT",
            body: JSON.stringify({ plan: mealPlan }),
        });
        setShoppingListMessage(`✓ Added "${recipe.name}" to ${day}`);
        setTimeout(() => setShoppingListMessage(""), 3000);
        
        // Close the Bootstrap modal
        const modalElement = document.getElementById(`recipeModal-${recipe.recipeId}`);
        if (modalElement) {
            const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
            if (bootstrapModal) bootstrapModal.hide();
        }
        
        setShowDaySelector(false);
        setSelectedRecipeForCalendar(null);
    };

    // Handle delete recipe
    const handleDeleteRecipe = (recipeId, recipeName) => {
        const confirmed = window.confirm(`Are you sure you want to delete "${recipeName}"? This action cannot be undone.`);
        if (confirmed) {
            setFriendsRecipes((prev) => prev.filter((recipe) => recipe.recipeId !== recipeId));
            return true;
        }
        return false;
    };

    return (
        <div className="page-recipes">
            <main id="main-content">
                <div className="container">
                    <h2>Recipes</h2>

                    <section aria-labelledby="recipe-api-title" className="placeholder-card">
                        <h3 id="recipe-api-title">
                            Friends' Activity
                        </h3>
                        <p className="muted">
                            Recent recipe activity from the backend API
                        </p>

                        <ul className="notification-feed" role="log" aria-live="polite" aria-label="Recipe notifications">
                            {notifications.length === 0 ? (
                                <li className="muted">Waiting for notifications...</li>
                            ) : (
                                notifications.map(notif => (
                                    <li key={notif.id}>
                                        <span className="notification-message">{notif.message}</span>
                                        <span className="notification-time">{notif.timestamp}</span>
                                    </li>
                                ))
                            )}
                        </ul>

                        {shoppingListMessage && (
                            <p className="feedback-message" role="status">{shoppingListMessage}</p>
                        )}
                    </section>

                    {/* View Toggle */}
                    <div className="recipe-filters">
                        <NavLink to="/recipes" 
                            data-filter="my-recipes" 
                            className="filter-btn"
                            end
                        >
                            My Recipes
                        </NavLink>
                        <NavLink
                            to="/recipes/friends"
                            className="filter-btn"
                            data-filter="friends-recipes"
                        >
                            Friends' Recipes
                        </NavLink>
                    </div>

                    {/* Friends' Recipes View */}
                    <section id="friends-recipes" className="recipe-view">
                        <h3>Friends' Saved Recipes</h3>
                        <div className="recipe-grid">
                            {friendsRecipes.length === 0 ? (
                                <p className="muted">No recipes from friends yet. Check back soon!</p>
                            ) : (
                                friendsRecipes.map(recipe => (
                                    <button
                                        key={recipe.recipeId}
                                        type="button"
                                        className="recipe-card-trigger"
                                        data-bs-toggle="modal"
                                        data-bs-target={`#recipeModal-${recipe.recipeId}`}
                                    >
                                        <article className="recipe-card">
                                            <h4>{recipe.name}</h4>
                                            <p className="recipe-meta">Shared by {recipe.sharedBy}</p>
                                            <p className="recipe-description">{recipe.description}</p>
                                            <ul className="recipe-ingredients">
                                                {recipe.ingredients.map((ingredient, idx) => (
                                                    <li key={idx}>{ingredient}</li>
                                                ))}
                                            </ul>
                                        </article>
                                    </button>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Dynamic Friend Recipe Modals */}
                    {friendsRecipes.map(recipe => (
                        <div
                            key={recipe.recipeId}
                            className="modal fade"
                            id={`recipeModal-${recipe.recipeId}`}
                            tabIndex="-1"
                            aria-hidden="true"
                        >
                            <div className="modal-dialog modal-dialog-centered modal-lg">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">{recipe.name}</h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"
                                            aria-label="Close"
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <p className="text-muted mb-3">
                                            Shared by {recipe.sharedBy}{recipe.time ? ` • ${recipe.time} minutes` : ''}
                                        </p>
                                        <p>{recipe.description || "No description"}</p>
                                        <h6>Ingredients</h6>
                                        <ul>
                                            {recipe.ingredients.map((ingredient, idx) => (
                                                <li key={idx}>{ingredient}</li>
                                            ))}
                                        </ul>
                                        <h6>Steps</h6>
                                        <ol>
                                            {recipe.steps.map((step, idx) => (
                                                <li key={idx}>{step}</li>
                                            ))}
                                        </ol>
                                        <h6>Missing Ingredients</h6>
                                        <ul>
                                            {(() => {
                                                const missing = calculateMissingIngredients(recipe.ingredients);
                                                return missing.length > 0 ? (
                                                    missing.map((ingredient, idx) => (
                                                        <li key={idx}>{ingredient}</li>
                                                    ))
                                                ) : (
                                                    <li>None! You have all the ingredients.</li>
                                                );
                                            })()}
                                        </ul>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            data-bs-dismiss="modal"
                                        >
                                            Close
                                        </button>
                                        {(() => {
                                            const missing = calculateMissingIngredients(recipe.ingredients);
                                            return missing.length > 0 ? (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleSaveIngredients(missing, recipe.name, recipe.recipeId)}
                                                >
                                                    Add Missing Ingredients to Shopping List
                                                </button>
                                            ) : null;
                                        })()}
                                        <button
                                            type="button"
                                            className="btn btn-success"
                                            onClick={() => {
                                                setSelectedRecipeForCalendar(recipe);
                                                setShowDaySelector(true);
                                            }}
                                        >
                                            Add to Calendar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger delete-recipe"
                                            onClick={() => {
                                                const deleted = handleDeleteRecipe(recipe.recipeId, recipe.name);
                                                if (deleted) {
                                                    const modal = bootstrap.Modal.getInstance(document.getElementById(`recipeModal-${recipe.recipeId}`));
                                                    if (modal) modal.hide();
                                                }
                                            }}
                                        >
                                            Delete recipe
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Day Selector Modal */}
                    {showDaySelector && (
                        <div
                            style={{
                                position: "fixed",
                                inset: 0,
                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 1060,
                            }}
                            onClick={() => setShowDaySelector(false)}
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    backgroundColor: "white",
                                    borderRadius: "var(--radius-md)",
                                    padding: "var(--space-lg)",
                                    maxWidth: "400px",
                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                <h3 style={{ marginTop: 0 }}>Select Day</h3>
                                <p className="muted">Which day would you like to add this recipe to?</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
                                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                                        <button
                                            className='add-to-calendar-days-btn'
                                            key={day}
                                            onClick={() => handleAddRecipeToCalendar(day)}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowDaySelector(false)}
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
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}