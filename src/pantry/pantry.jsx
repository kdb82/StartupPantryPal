import React from "react";

export function Pantry() {
    return (
        <div className="page-pantry">
            <main id="main-content">
                <div className="container">
                    <h2>My Pantry</h2>

                    <section aria-labelledby="ws-title" className="placeholder-card">
                        <h3 id="ws-title">Live updates (WebSocket placeholder)</h3>
                        <p className="muted">
                            Planned: use WebSockets for real-time pantry updates (multi-device
                            sync, friend collaboration, and notifications).
                        </p>
                        <p className="muted">
                            Endpoint placeholder:
                            <code id="wsUrlText">wss://your-domain/ws</code>
                        </p>
                        <p id="wsStatus" className="muted" role="status" aria-live="polite">
                            Not connected (placeholder).
                        </p>

                        <div className="inline-form">
                            <button id="wsConnectBtn" type="button">Connect</button>
                            <button id="wsDisconnectBtn" type="button" disabled>
                                Disconnect
                            </button>
                        </div>

                        <div className="inline-form">
                            <label htmlFor="wsMessage">Send message</label>
                            <input
                                id="wsMessage"
                                type="text"
                                placeholder='Example: {"type":"pantry:add","item":"apples"}'
                            />
                            <button id="wsSendBtn" type="button" disabled>Send</button>
                        </div>

                        <ul id="wsLog" className="api-results" aria-label="WebSocket message log">
                            <li>
                                <strong>Mock:</strong> Connected users: 2
                                <span className="muted"> (placeholder message)</span>
                            </li>
                            <li>
                                <strong>Mock:</strong> Pantry updated: added “milk”
                                <span className="muted"> (placeholder message)</span>
                            </li>
                        </ul>
                    </section>

                    {/* Proteins Section */}
                    <section className="pantry-category">
                        <details open>
                            <summary>Proteins</summary>
                            <div className="category-content">
                                <ul className="item-list">
                                    <li>
                                        <label>
                                            <input type="checkbox" name="protein" value="chicken" />
                                            Chicken
                                        </label>
                                        <button type="button" className="remove-item" data-value="chicken">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="protein" value="beef" />
                                            Beef
                                        </label>
                                        <button type="button" className="remove-item" data-value="beef">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="protein" value="salmon" />
                                            Salmon
                                        </label>
                                        <button type="button" className="remove-item" data-value="salmon">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="protein" value="eggs" />
                                            Eggs
                                        </label>
                                        <button type="button" className="remove-item" data-value="eggs">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="protein" value="tofu" />
                                            Tofu
                                        </label>
                                        <button type="button" className="remove-item" data-value="tofu">
                                            Remove
                                        </button>
                                    </li>
                                </ul>
                                <div className="add-item">
                                    <label htmlFor="proteinInput">Add item:</label>
                                    <input
                                        type="text"
                                        id="proteinInput"
                                        placeholder="Enter protein..."
                                        data-category="protein"
                                    />
                                    <button type="button" className ="add-button">Add</button>
                                </div>
                            </div>
                        </details>
                    </section>

                    {/* Dairy & Eggs Section */}
                    <section className="pantry-category">
                        <details open>
                            <summary>Dairy &amp; Eggs</summary>
                            <div className="category-content">
                                <ul className="item-list">
                                    <li>
                                        <label>
                                            <input type="checkbox" name="dairy" value="milk" />
                                            Milk
                                        </label>
                                        <button type="button" className="remove-item" data-value="milk">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="dairy" value="cheese" />
                                            Cheese
                                        </label>
                                        <button type="button" className="remove-item" data-value="cheese">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="dairy" value="yogurt" />
                                            Yogurt
                                        </label>
                                        <button type="button" className="remove-item" data-value="yogurt">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="dairy" value="butter" />
                                            Butter
                                        </label>
                                        <button type="button" className="remove-item" data-value="butter">
                                            Remove
                                        </button>
                                    </li>
                                </ul>
                                <div className="add-item">
                                    <label htmlFor="dairyInput">Add item:</label>
                                    <input
                                        type="text"
                                        id="dairyInput"
                                        placeholder="Enter dairy product..."
                                        data-category="dairy"
                                    />
                                    <button type="button" className="add-button">Add</button>
                                </div>
                            </div>
                        </details>
                    </section>

                    {/* Vegetables Section */}
                    <section className="pantry-category">
                        <details open>
                            <summary>Vegetables</summary>
                            <div className="category-content">
                                <ul className="item-list">
                                    <li>
                                        <label>
                                            <input type="checkbox" name="vegetables" value="broccoli" />
                                            Broccoli
                                        </label>
                                        <button type="button" className="remove-item" data-value="broccoli">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="vegetables" value="carrots" />
                                            Carrots
                                        </label>
                                        <button type="button" className="remove-item" data-value="carrots">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="vegetables" value="spinach" />
                                            Spinach
                                        </label>
                                        <button type="button" className="remove-item" data-value="spinach">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="vegetables" value="tomatoes" />
                                            Tomatoes
                                        </label>
                                        <button type="button" className="remove-item" data-value="tomatoes">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="vegetables" value="peppers" />
                                            Peppers
                                        </label>
                                        <button type="button" className="remove-item" data-value="peppers">
                                            Remove
                                        </button>
                                    </li>
                                </ul>
                                <div className="add-item">
                                    <label htmlFor="vegetableInput">Add item:</label>
                                    <input
                                        type="text"
                                        id="vegetableInput"
                                        placeholder="Enter vegetable..."
                                        data-category="vegetables"
                                    />
                                    <button type="button" className="add-button">Add</button>
                                </div>
                            </div>
                        </details>
                    </section>

                    {/* Fruits Section */}
                    <section className="pantry-category">
                        <details>
                            <summary>Fruits</summary>
                            <div className="category-content">
                                <ul className="item-list">
                                    <li>
                                        <label>
                                            <input type="checkbox" name="fruits" value="apples" />
                                            Apples
                                        </label>
                                        <button type="button" className="remove-item" data-value="apples">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="fruits" value="bananas" />
                                            Bananas
                                        </label>
                                        <button type="button" className="remove-item" data-value="bananas">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="fruits" value="berries" />
                                            Berries
                                        </label>
                                        <button type="button" className="remove-item" data-value="berries">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="fruits" value="oranges" />
                                            Oranges
                                        </label>
                                        <button type="button" className="remove-item" data-value="oranges">
                                            Remove
                                        </button>
                                    </li>
                                </ul>
                                <div className="add-item">
                                    <label htmlFor="fruitInput">Add item:</label>
                                    <input
                                        type="text"
                                        id="fruitInput"
                                        placeholder="Enter fruit..."
                                        data-category="fruits"
                                    />
                                    <button type="button" className="add-button">Add</button>
                                </div>
                            </div>
                        </details>
                    </section>

                    {/* Grains & Carbs Section */}
                    <section className="pantry-category">
                        <details>
                            <summary>Grains &amp; Carbs</summary>
                            <div className="category-content">
                                <ul className="item-list">
                                    <li>
                                        <label>
                                            <input type="checkbox" name="grains" value="rice" />
                                            Rice
                                        </label>
                                        <button type="button" className="remove-item" data-value="rice">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="grains" value="pasta" />
                                            Pasta
                                        </label>
                                        <button type="button" className="remove-item" data-value="pasta">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="grains" value="bread" />
                                            Bread
                                        </label>
                                        <button type="button" className="remove-item" data-value="bread">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="grains" value="oats" />
                                            Oats
                                        </label>
                                        <button type="button" className="remove-item" data-value="oats">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="grains" value="potatoes" />
                                            Potatoes
                                        </label>
                                        <button type="button" className="remove-item" data-value="potatoes">
                                            Remove
                                        </button>
                                    </li>
                                </ul>
                                <div className="add-item">
                                    <label htmlFor="grainInput">Add item:</label>
                                    <input
                                        type="text"
                                        id="grainInput"
                                        placeholder="Enter grain..."
                                        data-category="grains"
                                    />
                                    <button type="button" className="add-button">Add</button>
                                </div>
                            </div>
                        </details>
                    </section>

                    {/* Pantry Staples Section */}
                    <section className="pantry-category">
                        <details>
                            <summary>Pantry Staples</summary>
                            <div className="category-content">
                                <ul className="item-list">
                                    <li>
                                        <label>
                                            <input type="checkbox" name="staples" value="oil" />
                                            Oil
                                        </label>
                                        <button type="button" className="remove-item" data-value="oil">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="staples" value="salt" />
                                            Salt
                                        </label>
                                        <button type="button" className="remove-item" data-value="salt">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="staples" value="spices" />
                                            Spices
                                        </label>
                                        <button type="button" className="remove-item" data-value="spices">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="staples" value="vinegar" />
                                            Vinegar
                                        </label>
                                        <button type="button" className="remove-item" data-value="vinegar">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="staples" value="flour" />
                                            Flour
                                        </label>
                                        <button type="button" className="remove-item" data-value="flour">
                                            Remove
                                        </button>
                                    </li>
                                </ul>
                                <div className="add-item">
                                    <label htmlFor="stapleInput">Add item:</label>
                                    <input
                                        type="text"
                                        id="stapleInput"
                                        placeholder="Enter staple..."
                                        data-category="staples"
                                    />
                                    <button type="button" className="add-button">Add</button>
                                </div>
                            </div>
                        </details>
                    </section>

                    {/* Beverages Section */}
                    <section className="pantry-category">
                        <details>
                            <summary>Beverages</summary>
                            <div className="category-content">
                                <ul className="item-list">
                                    <li>
                                        <label>
                                            <input type="checkbox" name="beverages" value="water" />
                                            Water
                                        </label>
                                        <button type="button" className="remove-item" data-value="water">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="beverages" value="juice" />
                                            Juice
                                        </label>
                                        <button type="button" className="remove-item" data-value="juice">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="beverages" value="coffee" />
                                            Coffee
                                        </label>
                                        <button type="button" className="remove-item" data-value="coffee">
                                            Remove
                                        </button>
                                    </li>
                                    <li>
                                        <label>
                                            <input type="checkbox" name="beverages" value="tea" />
                                            Tea
                                        </label>
                                        <button type="button" className="remove-item" data-value="tea">
                                            Remove
                                        </button>
                                    </li>
                                </ul>
                                <div className="add-item">
                                    <label htmlFor="beverageInput">Add item:</label>
                                    <input
                                        type="text"
                                        id="beverageInput"
                                        placeholder="Enter beverage..."
                                        data-category="beverages"
                                    />
                                    <button type="button" className="add-button">Add</button>
                                </div>
                            </div>
                        </details>
                    </section>
                </div>
            </main>
        </div>
    );
}