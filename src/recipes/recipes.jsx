import React from "react";
import "../global.css";
import "./recipes.css";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { addToShoppingListTool } from "../services/recipeTools";

export function Recipes() {
    const [notifications, setNotifications] = useState([]);
    const [shoppingListMessage, setShoppingListMessage] = useState("");

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

            setNotifications(prev => [newNotification, ...prev].slice(0, 2)); // Keep last 5
        }, 3000);

        return () => clearInterval(notificationInterval);
    }, []);

    // Handle save ingredients
    const handleSaveIngredients = async (missingIngredients) => {
        try {
            const ingredientsList = missingIngredients.split(',').map(i => i.trim());
            await addToShoppingListTool.execute({ ingredients: ingredientsList });
            setShoppingListMessage(`✓ Added ${ingredientsList.length} items to shopping list`);
            setTimeout(() => setShoppingListMessage(""), 3000);
        } catch (error) {
            console.error("Error saving ingredients:", error);
            setShoppingListMessage("Error adding to shopping list");
        }
    };

    // Handle delete recipe
    const handleDeleteRecipe = (recipeName) => {
        alert(`Recipe "${recipeName}" deleted (mock)`);
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
                            <button
                                type="button"
                                className="recipe-card-trigger"
                                data-bs-toggle="modal"
                                data-bs-target="#recipeModal-garlic-pasta"
                            >
                                <article className="recipe-card">
                                    <h4>Garlic Pasta</h4>
                                    <p className="recipe-meta">Shared by You</p>
                                    <p className="recipe-description">
                                        Creamy garlic pasta with fresh herbs and parmesan cheese.
                                    </p>
                                    <ul className="recipe-ingredients">
                                        <li>Pasta</li>
                                        <li>Garlic</li>
                                        <li>Olive Oil</li>
                                        <li>Parmesan</li>
                                    </ul>
                                </article>
                            </button>

                            <button
                                type="button"
                                className="recipe-card-trigger"
                                data-bs-toggle="modal"
                                data-bs-target="#recipeModal-chicken-salad"
                            >
                                <article className="recipe-card">
                                    <h4>Grilled Chicken Salad</h4>
                                    <p className="recipe-meta">Shared by You</p>
                                    <p className="recipe-description">
                                        Healthy grilled chicken with mixed greens and vinaigrette.
                                    </p>
                                    <ul className="recipe-ingredients">
                                        <li>Chicken</li>
                                        <li>Mixed Greens</li>
                                        <li>Tomatoes</li>
                                        <li>Vinaigrette</li>
                                    </ul>
                                </article>
                            </button>

                            <button
                                type="button"
                                className="recipe-card-trigger"
                                data-bs-toggle="modal"
                                data-bs-target="#recipeModal-cookies"
                            >
                                <article className="recipe-card">
                                    <h4>Chocolate Chip Cookies</h4>
                                    <p className="recipe-meta">Shared by You</p>
                                    <p className="recipe-description">
                                        Classic homemade chocolate chip cookies.
                                    </p>
                                    <ul className="recipe-ingredients">
                                        <li>Flour</li>
                                        <li>Butter</li>
                                        <li>Sugar</li>
                                        <li>Chocolate Chips</li>
                                        <li>Eggs</li>
                                    </ul>
                                </article>
                            </button>
                        </div>
                    </section>

                    {/* Recipe Modals (Bootstrap) */}

                    <div
                        className="modal fade"
                        id="recipeModal-garlic-pasta"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Garlic Pasta</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p className="text-muted mb-3">
                                        Shared by You • 20–30 minutes (placeholder)
                                    </p>
                                    <p>
                                        Creamy garlic pasta with fresh herbs and parmesan cheese.
                                    </p>
                                    <h6>Ingredients</h6>
                                    <ul>
                                        <li>Pasta</li>
                                        <li>Garlic</li>
                                        <li>Olive Oil</li>
                                        <li>Parmesan</li>
                                    </ul>
                                    <h6>Missing (to add to shopping list)</h6>
                                    <p className="mb-0">
                                        <span className="badge text-bg-light">Garlic</span>
                                        <span className="badge text-bg-light">Parmesan</span>
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-dismiss="modal"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary save-ingredients"
                                        onClick={() => {
                                            handleSaveIngredients("garlic,parmesan");
                                            const modal = bootstrap.Modal.getInstance(document.getElementById("recipeModal-garlic-pasta"));
                                            if (modal) modal.hide();
                                        }}
                                    >
                                        Save ingredients
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger delete-recipe"
                                        onClick={() => {
                                            handleDeleteRecipe("Garlic Pasta");
                                            const modal = bootstrap.Modal.getInstance(document.getElementById("recipeModal-garlic-pasta"));
                                            if (modal) modal.hide();
                                        }}
                                    >
                                        Delete recipe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="modal fade"
                        id="recipeModal-chicken-salad"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Grilled Chicken Salad</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p className="text-muted mb-3">
                                        Shared by You • 20–30 minutes (placeholder)
                                    </p>
                                    <p>
                                        Healthy grilled chicken with mixed greens and vinaigrette.
                                    </p>
                                    <h6>Ingredients</h6>
                                    <ul>
                                        <li>Chicken</li>
                                        <li>Mixed Greens</li>
                                        <li>Tomatoes</li>
                                        <li>Vinaigrette</li>
                                    </ul>
                                    <h6>Missing (to add to shopping list)</h6>
                                    <p className="mb-0">
                                        <span className="badge text-bg-light">Mixed Greens</span>
                                        <span className="badge text-bg-light">Vinaigrette</span>
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-dismiss="modal"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary save-ingredients"
                                        onClick={() => {
                                            handleSaveIngredients("mixed-greens,vinaigrette");
                                            const modal = bootstrap.Modal.getInstance(document.getElementById("recipeModal-chicken-salad"));
                                            if (modal) modal.hide();
                                        }}
                                    >
                                        Save ingredients
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger delete-recipe"
                                        onClick={() => {
                                            handleDeleteRecipe("Grilled Chicken Salad");
                                            const modal = bootstrap.Modal.getInstance(document.getElementById("recipeModal-chicken-salad"));
                                            if (modal) modal.hide();
                                        }}
                                    >
                                        Delete recipe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="modal fade"
                        id="recipeModal-cookies"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Chocolate Chip Cookies</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p className="text-muted mb-3">
                                        Shared by You • 30–45 minutes (placeholder)
                                    </p>
                                    <p>Classic homemade chocolate chip cookies.</p>
                                    <h6>Ingredients</h6>
                                    <ul>
                                        <li>Flour</li>
                                        <li>Butter</li>
                                        <li>Sugar</li>
                                        <li>Chocolate Chips</li>
                                        <li>Eggs</li>
                                    </ul>
                                    <h6>Missing (to add to shopping list)</h6>
                                    <p className="mb-0">
                                        <span className="badge text-bg-light">Chocolate Chips</span>
                                        <span className="badge text-bg-light">Sugar</span>
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-dismiss="modal"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary save-ingredients"
                                        onClick={() => {
                                            handleSaveIngredients("chocolate-chips,sugar");
                                            const modal = bootstrap.Modal.getInstance(document.getElementById("recipeModal-cookies"));
                                            if (modal) modal.hide();
                                        }}
                                    >
                                        Save ingredients
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger delete-recipe"
                                        onClick={() => {
                                            handleDeleteRecipe("Chocolate Chip Cookies");
                                            const modal = bootstrap.Modal.getInstance(document.getElementById("recipeModal-cookies"));
                                            if (modal) modal.hide();
                                        }}
                                    >
                                        Delete recipe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export function FriendsRecipes() {
    const [notifications, setNotifications] = useState([]);
    const [shoppingListMessage, setShoppingListMessage] = useState("");

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

            setNotifications(prev => [newNotification, ...prev].slice(0, 5)); // Keep last 5
        }, 2000);

        return () => clearInterval(notificationInterval);
    }, []);

    // Handle save ingredients
    const handleSaveIngredients = async (missingIngredients) => {
        try {
            const ingredientsList = missingIngredients.split(',').map(i => i.trim());
            await addToShoppingListTool.execute({ ingredients: ingredientsList });
            setShoppingListMessage(`✓ Added ${ingredientsList.length} items to shopping list`);
            setTimeout(() => setShoppingListMessage(""), 3000);
        } catch (error) {
            console.error("Error saving ingredients:", error);
            setShoppingListMessage("Error adding to shopping list");
        }
    };

    // Handle delete recipe
    const handleDeleteRecipe = (recipeName) => {
        alert(`Recipe "${recipeName}" deleted (mock)`);
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
                            <button
                                type="button"
                                className="recipe-card-trigger"
                                data-bs-toggle="modal"
                                data-bs-target="#recipeModal-salmon-teriyaki"
                            >
                                <article className="recipe-card">
                                    <h4>Salmon Teriyaki</h4>
                                    <p className="recipe-meta">Shared by Sarah</p>
                                    <p className="recipe-description">
                                        Glazed salmon with teriyaki sauce and rice.
                                    </p>
                                    <ul className="recipe-ingredients">
                                        <li>Salmon</li>
                                        <li>Soy Sauce</li>
                                        <li>Ginger</li>
                                        <li>Rice</li>
                                    </ul>
                                </article>
                            </button>

                            <button
                                type="button"
                                className="recipe-card-trigger"
                                data-bs-toggle="modal"
                                data-bs-target="#recipeModal-veg-stir-fry"
                            >
                                <article className="recipe-card">
                                    <h4>Vegetable Stir Fry</h4>
                                    <p className="recipe-meta">Shared by Mike</p>
                                    <p className="recipe-description">
                                        Quick and colorful stir fry with seasonal vegetables.
                                    </p>
                                    <ul className="recipe-ingredients">
                                        <li>Broccoli</li>
                                        <li>Carrots</li>
                                        <li>Bell Peppers</li>
                                        <li>Soy Sauce</li>
                                        <li>Ginger</li>
                                    </ul>
                                </article>
                            </button>

                            <button
                                type="button"
                                className="recipe-card-trigger"
                                data-bs-toggle="modal"
                                data-bs-target="#recipeModal-spicy-tacos"
                            >
                                <article className="recipe-card">
                                    <h4>Spicy Tacos</h4>
                                    <p className="recipe-meta">Shared by Alex</p>
                                    <p className="recipe-description">
                                        Flavorful tacos with seasoned beef and fresh toppings.
                                    </p>
                                    <ul className="recipe-ingredients">
                                        <li>Beef</li>
                                        <li>Tortillas</li>
                                        <li>Cilantro</li>
                                        <li>Lime</li>
                                        <li>Jalapeños</li>
                                    </ul>
                                </article>
                            </button>
                        </div>
                    </section>

                    {/* Friend Recipe Modals (Bootstrap) */}

                    <div
                        className="modal fade"
                        id="recipeModal-salmon-teriyaki"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Salmon Teriyaki</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p className="text-muted mb-3">
                                        Shared by Sarah • 25–35 minutes (placeholder)
                                    </p>
                                    <p>Glazed salmon with teriyaki sauce and rice.</p>
                                    <h6>Ingredients</h6>
                                    <ul>
                                        <li>Salmon</li>
                                        <li>Soy Sauce</li>
                                        <li>Ginger</li>
                                        <li>Rice</li>
                                    </ul>
                                    <h6>Missing (to add to shopping list)</h6>
                                    <p className="mb-0">
                                        <span className="badge text-bg-light">Ginger</span>
                                        <span className="badge text-bg-light">Soy Sauce</span>
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-dismiss="modal"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary save-ingredients"
                                        onClick={() => {
                                            handleSaveIngredients("ginger,soy-sauce");
                                            const modal = bootstrap.Modal.getInstance(document.getElementById("recipeModal-salmon-teriyaki"));
                                            if (modal) modal.hide();
                                        }}
                                    >
                                        Save ingredients
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger delete-recipe"
                                        onClick={() => {
                                            handleDeleteRecipe("Salmon Teriyaki");
                                            const modal = bootstrap.Modal.getInstance(document.getElementById("recipeModal-salmon-teriyaki"));
                                            if (modal) modal.hide();
                                        }}
                                    >
                                        Delete recipe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="modal fade"
                        id="recipeModal-veg-stir-fry"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Vegetable Stir Fry</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p className="text-muted mb-3">
                                        Shared by Mike • 20–25 minutes (placeholder)
                                    </p>
                                    <p>Quick and colorful stir fry with seasonal vegetables.</p>
                                    <h6>Ingredients</h6>
                                    <ul>
                                        <li>Broccoli</li>
                                        <li>Carrots</li>
                                        <li>Bell Peppers</li>
                                        <li>Soy Sauce</li>
                                        <li>Ginger</li>
                                    </ul>
                                    <h6>Missing (to add to shopping list)</h6>
                                    <p className="mb-0">
                                        <span className="badge text-bg-light">Ginger</span>
                                        <span className="badge text-bg-light">Soy Sauce</span>
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-dismiss="modal"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary save-ingredients"
                                        onClick={() => {
                                            handleSaveIngredients("ginger,soy-sauce");
                                            const modal = bootstrap.Modal.getInstance(document.getElementById("recipeModal-veg-stir-fry"));
                                            if (modal) modal.hide();
                                        }}
                                    >
                                        Save ingredients
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger delete-recipe"
                                        onClick={() => {
                                            handleDeleteRecipe("Vegetable Stir Fry");
                                            const modal = bootstrap.Modal.getInstance(document.getElementById("recipeModal-veg-stir-fry"));
                                            if (modal) modal.hide();
                                        }}
                                    >
                                        Delete recipe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="modal fade"
                        id="recipeModal-spicy-tacos"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Spicy Tacos</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p className="text-muted mb-3">
                                        Shared by Alex • 20–30 minutes (placeholder)
                                    </p>
                                    <p>Flavorful tacos with seasoned beef and fresh toppings.</p>
                                    <h6>Ingredients</h6>
                                    <ul>
                                        <li>Beef</li>
                                        <li>Tortillas</li>
                                        <li>Cilantro</li>
                                        <li>Lime</li>
                                        <li>Jalapeños</li>
                                    </ul>
                                    <h6>Missing (to add to shopping list)</h6>
                                    <p className="mb-0">
                                        <span className="badge text-bg-light">Tortillas</span>
                                        <span className="badge text-bg-light">Cilantro</span>
                                        <span className="badge text-bg-light">Lime</span>
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-dismiss="modal"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary save-ingredients"
                                        onClick={() => {
                                            handleSaveIngredients("tortillas,cilantro,lime");
                                            const modal = bootstrap.Modal.getInstance(document.getElementById("recipeModal-spicy-tacos"));
                                            if (modal) modal.hide();
                                        }}
                                    >
                                        Save ingredients
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger delete-recipe"
                                        onClick={() => {
                                            handleDeleteRecipe("Spicy Tacos");
                                            const modal = bootstrap.Modal.getInstance(document.getElementById("recipeModal-spicy-tacos"));
                                            if (modal) modal.hide();
                                        }}
                                    >
                                        Delete recipe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}