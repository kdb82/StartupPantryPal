import React from "react";
import "../global.css";
import "./recipes.css";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../global_components/AuthContext";

export function Recipes() {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [shoppingListMessage, setShoppingListMessage] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [showDaySelector, setShowDaySelector] = useState(false);
    const [selectedRecipeForCalendar, setSelectedRecipeForCalendar] = useState(null);

    // Mock WebSocket notifications - users saving recipes
    useEffect(() => {
        const mockUserNames = ["Sarah", "Mike", "Alex", "Jessica", "Tom", "Emma", "Chris"];
        const mockRecipeNames = ["Garlic Pasta", "Chicken Salad", "Cookies", "Salmon Teriyaki", "Stir Fry", "Tacos"];

        const notificationInterval = setInterval(() => {
            const randomUser = mockUserNames[Math.floor(Math.random() * mockUserNames.length)];
            const randomRecipe = mockRecipeNames[Math.floor(Math.random() * mockRecipeNames.length)];
            
            const newNotification = {
                id: Date.now(),
                message: `${randomUser} saved "${randomRecipe}" to their recipes`,
                timestamp: new Date().toLocaleTimeString()
            };

            setNotifications(prev => [newNotification, ...prev].slice(0, 2)); // Keep last 2
        }, 3000);

        return () => clearInterval(notificationInterval);
    }, []);

    useEffect(() => {
        const loadRecipes = () => {
            const savedRecipes = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("recipe_")) {
                    const recipeData = localStorage.getItem(key);
                    if (recipeData) {
                        savedRecipes.push(JSON.parse(recipeData));
                    }
                }
            }
            setRecipes(savedRecipes);
        };
        loadRecipes();
    }, []);

    // Handle save ingredients
    const handleSaveIngredients = async (missingIngredients, recipeName, recipeId) => {
        try {
            const SHOPPING_LIST_KEY = "shopping_list_items";
            
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
            let shoppingList = [];
            const storedList = localStorage.getItem(SHOPPING_LIST_KEY);
            if (storedList) {
                try {
                    shoppingList = JSON.parse(storedList);
                } catch (error) {
                    console.error("Error parsing shopping list:", error);
                }
            }

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

            // Save to localStorage
            localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(shoppingList));

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
    const handleAddRecipeToCalendar = (day) => {
        if (!selectedRecipeForCalendar) return;

        const MEAL_PLAN_KEY = "meal_plan_data";
        const recipe = selectedRecipeForCalendar;
        
        // Calculate the current week's Monday
        const today = new Date();
        const currentDay = today.getDay();
        const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
        const weekStart = new Date(today.setDate(diff));
        
        const key = `${weekStart.toISOString().split('T')[0]}_${day}`;
        
        // Get existing meal plan
        let mealPlan = {};
        const storedPlan = localStorage.getItem(MEAL_PLAN_KEY);
        if (storedPlan) {
            try {
                mealPlan = JSON.parse(storedPlan);
            } catch (error) {
                console.error("Error parsing meal plan:", error);
            }
        }

        if (!mealPlan[key]) {
            mealPlan[key] = [];
        }

        // Avoid duplicates
        if (!mealPlan[key].some(r => r.id === recipe.recipeId)) {
            mealPlan[key].push({ id: recipe.recipeId, name: recipe.name });
        }

        localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(mealPlan));
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
            localStorage.removeItem(`recipe_${recipeId}`);
            setRecipes(recipes.filter(recipe => recipe.recipeId !== recipeId));
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
                            Friends' Activity (Mock WebSocket)
                        </h3>
                        <p className="muted">
                            Real-time notifications of friends saving recipes
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
    const [showDaySelector, setShowDaySelector] = useState(false);
    const [selectedRecipeForCalendar, setSelectedRecipeForCalendar] = useState(null);

    // Mock WebSocket notifications - users saving recipes
    useEffect(() => {
        const mockUserNames = ["Sarah", "Mike", "Alex", "Jessica", "Tom", "Emma", "Chris"];
        const mockRecipeNames = ["Garlic Pasta", "Chicken Salad", "Cookies", "Salmon Teriyaki", "Stir Fry", "Tacos"];
        const mockDescriptions = {
            "Garlic Pasta": "Creamy garlic pasta with fresh herbs",
            "Chicken Salad": "Fresh greens with grilled chicken",
            "Cookies": "Delicious homemade chocolate chip cookies",
            "Salmon Teriyaki": "Glazed salmon with teriyaki sauce",
            "Stir Fry": "Quick and colorful vegetable stir fry",
            "Tacos": "Flavorful tacos with seasoned filling"
        };

        const notificationInterval = setInterval(() => {
            const randomUser = mockUserNames[Math.floor(Math.random() * mockUserNames.length)];
            const randomRecipe = mockRecipeNames[Math.floor(Math.random() * mockRecipeNames.length)];
            const recipeId = `friends_${Date.now()}`;
            
            const newNotification = {
                id: Date.now(),
                message: `${randomUser} saved "${randomRecipe}" to their recipes`,
                timestamp: new Date().toLocaleTimeString()
            };

            // Create a mock recipe object
            const mockRecipe = {
                recipeId,
                name: randomRecipe,
                description: mockDescriptions[randomRecipe] || "A delicious recipe",
                ingredients: ["Sample ingredient 1", "Sample ingredient 2", "Sample ingredient 3"],
                steps: ["Step 1", "Step 2", "Step 3"],
                sharedBy: randomUser,
                time: 30
            };

            localStorage.setItem(`friends_recipe_${recipeId}`, JSON.stringify(mockRecipe));

            setNotifications(prev => [newNotification, ...prev].slice(0, 2));
            setFriendsRecipes(prev => [mockRecipe, ...prev]);
        }, 3000);

        return () => clearInterval(notificationInterval);
    }, []);

    // Load friends' recipes from localStorage on mount
    useEffect(() => {
        const loadFriendsRecipes = () => {
            const savedFriendsRecipes = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("friends_recipe_")) {
                    const recipeData = localStorage.getItem(key);
                    if (recipeData) {
                        savedFriendsRecipes.push(JSON.parse(recipeData));
                    }
                }
            }
            setFriendsRecipes(savedFriendsRecipes);
        };
        loadFriendsRecipes();
    }, []);

    // Calculate missing ingredients based on user's pantry
    const calculateMissingIngredients = (recipeIngredients) => {
        const PANTRY_KEY = "user_pantry_data";
        const pantryData = localStorage.getItem(PANTRY_KEY);
        
        if (!pantryData) {
            return recipeIngredients; // All ingredients are missing if no pantry
        }

        try {
            const pantryItems = JSON.parse(pantryData);
            const normalizeIngredient = (item) =>
                item.replace(/\s*\(\s*\d+\s*\)\s*$/, "").trim().toLowerCase();
            
            const pantryNames = pantryItems.map(item => normalizeIngredient(item.name));
            
            return recipeIngredients.filter(ingredient => 
                !pantryNames.includes(normalizeIngredient(ingredient))
            );
        } catch (error) {
            console.error("Error parsing pantry data:", error);
            return recipeIngredients;
        }
    };

    // Handle save ingredients
    const handleSaveIngredients = async (missingIngredients, recipeName, recipeId) => {
        try {
            const SHOPPING_LIST_KEY = "shopping_list_items";
            
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
            let shoppingList = [];
            const storedList = localStorage.getItem(SHOPPING_LIST_KEY);
            if (storedList) {
                try {
                    shoppingList = JSON.parse(storedList);
                } catch (error) {
                    console.error("Error parsing shopping list:", error);
                }
            }

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

            // Save to localStorage
            localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(shoppingList));

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
    const handleAddRecipeToCalendar = (day) => {
        if (!selectedRecipeForCalendar) return;

        const MEAL_PLAN_KEY = "meal_plan_data";
        const recipe = selectedRecipeForCalendar;
        
        // Calculate the current week's Monday
        const today = new Date();
        const currentDay = today.getDay();
        const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
        const weekStart = new Date(today.setDate(diff));
        
        const key = `${weekStart.toISOString().split('T')[0]}_${day}`;
        
        // Get existing meal plan
        let mealPlan = {};
        const storedPlan = localStorage.getItem(MEAL_PLAN_KEY);
        if (storedPlan) {
            try {
                mealPlan = JSON.parse(storedPlan);
            } catch (error) {
                console.error("Error parsing meal plan:", error);
            }
        }

        if (!mealPlan[key]) {
            mealPlan[key] = [];
        }

        // Avoid duplicates
        if (!mealPlan[key].some(r => r.id === recipe.recipeId)) {
            mealPlan[key].push({ id: recipe.recipeId, name: recipe.name });
        }

        localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(mealPlan));
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
            localStorage.removeItem(`friends_recipe_${recipeId}`);
            setFriendsRecipes(friendsRecipes.filter(recipe => recipe.recipeId !== recipeId));
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
                            Friends' Activity (Mock WebSocket)
                        </h3>
                        <p className="muted">
                            Real-time notifications of friends saving recipes
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