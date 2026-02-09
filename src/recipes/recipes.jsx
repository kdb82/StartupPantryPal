import React from "react";
import { NavLink } from "react-router-dom";

export function Recipes() {
    return (
        <div className="page-recipes">
            <main id="main-content">
                <div className="container">
                    <h2>Recipes</h2>

                    <section aria-labelledby="recipe-api-title" className="placeholder-card">
                        <h3 id="recipe-api-title">
                            Discover new recipes (Database placeholder)
                        </h3>
                        <p className="muted">
                            This section will be show recipes stored by the DB. For now it
                            shows mock renderings of DB data.
                        </p>

                        <p
                            id="recipeApiStatus"
                            className="muted"
                            role="status"
                            aria-live="polite"
                        >
                            Not connected (placeholder).
                        </p>

                        <details>
                            <summary>Planned DB request/response (placeholder)</summary>
                            <pre className="code-block">{`GET /api/recipes?q=chicken&maxReadyTime=30

    200 OK
    {
    "results": [
        {"id": "recipe_123", "title": "Lemon Garlic Chicken", "readyInMinutes": 30 },
        {"id": "recipe_456", "title": "Veggie Stir Fry", "readyInMinutes": 20 }
    ]
    }`}</pre>
                        </details>
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
                                        data-recipe="garlic-pasta"
                                        data-missing="garlic,parmesan"
                                        data-bs-dismiss="modal"
                                    >
                                        Save ingredients
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger delete-recipe"
                                        data-recipe="garlic-pasta"
                                        data-bs-dismiss="modal"
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
                                        data-recipe="chicken-salad"
                                        data-missing="mixed-greens,vinaigrette"
                                        data-bs-dismiss="modal"
                                    >
                                        Save ingredients
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger delete-recipe"
                                        data-recipe="chicken-salad"
                                        data-bs-dismiss="modal"
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
                                        data-recipe="cookies"
                                        data-missing="chocolate-chips,sugar"
                                        data-bs-dismiss="modal"
                                    >
                                        Save ingredients
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger delete-recipe"
                                        data-recipe="cookies"
                                        data-bs-dismiss="modal"
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
    return (
        <div className="page-recipes">
            <main id="main-content">
                <div className="container">
                    <h2>Recipes</h2>

                    <section aria-labelledby="recipe-api-title" className="placeholder-card">
                        <h3 id="recipe-api-title">
                            Discover new recipes (Database placeholder)
                        </h3>
                        <p className="muted">
                            This section will be show recipes stored by the DB. For now it
                            shows mock renderings of DB data.
                        </p>

                        <p
                            id="recipeApiStatus"
                            className="muted"
                            role="status"
                            aria-live="polite"
                        >
                            Not connected (placeholder).
                        </p>

                        <details>
                            <summary>Planned DB request/response (placeholder)</summary>
                            <pre className="code-block">{`GET /api/recipes?q=chicken&maxReadyTime=30

200 OK
{
  "results": [
    {"id": "recipe_123", "title": "Lemon Garlic Chicken", "readyInMinutes": 30 },
    {"id": "recipe_456", "title": "Veggie Stir Fry", "readyInMinutes": 20 }
  ]
}`}</pre>
                        </details>
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
                                        data-recipe="salmon-teriyaki"
                                        data-missing="ginger,soy-sauce"
                                        data-bs-dismiss="modal"
                                    >
                                        Save ingredients
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger delete-recipe"
                                        data-recipe="salmon-teriyaki"
                                        data-bs-dismiss="modal"
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
                                        data-recipe="veg-stir-fry"
                                        data-missing="ginger,soy-sauce"
                                        data-bs-dismiss="modal"
                                    >
                                        Save ingredients
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger delete-recipe"
                                        data-recipe="veg-stir-fry"
                                        data-bs-dismiss="modal"
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
                                        data-recipe="spicy-tacos"
                                        data-missing="tortillas,cilantro,lime,jalapenos"
                                        data-bs-dismiss="modal"
                                    >
                                        Save ingredients
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger delete-recipe"
                                        data-recipe="spicy-tacos"
                                        data-bs-dismiss="modal"
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