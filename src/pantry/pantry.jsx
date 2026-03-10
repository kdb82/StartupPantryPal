import React from "react";
import "../global.css";
import "./pantry.css";
import { useEffect } from "react";
import { useAuth } from "../global_components/AuthContext";
import { apiRequest } from "../apiRequest";

export function Pantry() {
    const [items, setItems] = React.useState([]);
    const [categories, setCategories] = React.useState([]);
    const [itemInputs, setItemInputs] = React.useState({});
    const [newCategoryInput, setNewCategoryInput] = React.useState("");
    const { currentUser } = useAuth();

    async function getPantry() {
        const pantry = await apiRequest("/api/pantry", { method: "GET" });

        return {
            items: Array.isArray(pantry.items) ? pantry.items : [],
            categories: Array.isArray(pantry.categories) ? pantry.categories : [],
        };
    }

    async function saveCategories(newCategories) {
        const pantry = await apiRequest("/api/pantry/categories", {
            method: "PUT",
            body: JSON.stringify({ categories: newCategories }),
        });

        setCategories(Array.isArray(pantry.categories) ? pantry.categories : []);
        setItems(Array.isArray(pantry.items) ? pantry.items : []);
    }

    const loadPantry = async () => {
        const pantry = await getPantry();

        const migratedItems = pantry.items.map((item) =>
            item.id ? item : { ...item, id: Date.now() + Math.random() }
        );

        setItems(migratedItems);
        setCategories(pantry.categories);
    };

    const savePantry = async (newItems) => {
        const pantry = await apiRequest("/api/pantry", {
            method: "PUT",
            body: JSON.stringify({ items: newItems }),
        });

        setItems(Array.isArray(pantry.items) ? pantry.items : []);
        setCategories(Array.isArray(pantry.categories) ? pantry.categories : []);
    };

    const addItem = async (category) => {
        const input = itemInputs[category] || "";
        
        if (!input.trim()) return;

        const newItem = {
            id: Date.now() + Math.random(),
            name: input.trim(),
            quantity: 1,
            category: category,
            checked: false,
            addedAt: new Date().toISOString(),
            addedBy: currentUser ? currentUser.username : "Unknown"
        };

        const updated = [...items, newItem];
        await savePantry(updated);
        setItemInputs({ ...itemInputs, [category]: "" });
    };

    const addCategory = async () => {
        if (!newCategoryInput.trim()) return;
        const categoryId = newCategoryInput.trim().toLowerCase().replace(/\s+/g, '-');
        if (categories.includes(categoryId)) {
            alert("Category already exists");
            return;
        }
        await saveCategories([...categories, categoryId]);
        setNewCategoryInput("");
    };

    const deleteCategory = async (categoryId) => {
        if (!window.confirm(`Delete "${categoryId}" category and all its items?`)) return;
        await saveCategories(categories.filter(c => c !== categoryId));
        const updatedItems = items.filter(item => item.category !== categoryId);
        await savePantry(updatedItems);
    };

    const handleItemInputChange = (category, value) => {
        setItemInputs({ ...itemInputs, [category]: value });
    };

    const formatCategoryName = (category) => {
        return category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    useEffect(() => {
        const init = async () => {
            try {
                await loadPantry();
            } catch (err) {
                console.error("Failed to load pantry:", err);
            }
        };

        init();
    }, []);

    const removeItem = async (itemId) => {
        const updatedItems = items.filter((item) => item.id !== itemId);
        await savePantry(updatedItems);
    };

    const updateQuantity = async (itemId, change) => {
        const updatedItems = items.map((item) => {
            if (item.id === itemId) {
                const newQuantity = Math.max(1, item.quantity + change);
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
        await savePantry(updatedItems);
    };

    return (
        <div className="page-pantry">
            <main id="main-content">
                <div className="container">
                    <h2>My Pantry</h2>
                    <p className="pantry-description">Track the ingredients you have at home. This helps us find recipes you can make with what you already own.</p>

                    {/* <section aria-labelledby="ws-title" className="placeholder-card">
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
                    </section> */}

                    {/* Category Management */}
                    <section className="pantry-category" style={{ background: 'var(--color-body-bg)' }}>
                        <details>
                            <summary style={{ background: '#efe4ce' }}>Manage Categories</summary>
                            <div className="category-content">
                                <div className="add-item">
                                    <label htmlFor="newCategoryInput">Add new category:</label>
                                    <input
                                        type="text"
                                        id="newCategoryInput"
                                        placeholder="Enter category name..."
                                        value={newCategoryInput}
                                        onChange={(e) => setNewCategoryInput(e.target.value)}
                                    />
                                    <button type="button" className="add-button" onClick={addCategory}>
                                        Add Category
                                    </button>
                                </div>
                            </div>
                        </details>
                    </section>

                    {/* Dynamic Category Sections */}
                    {categories.map((category) => (
                        <section key={category} className="pantry-category">
                            <details open>
                                <summary>{formatCategoryName(category)}</summary>
                                <div className="category-content" style={{ position: 'relative' }}>
                                    <button
                                        type="button"
                                        className="remove-item"
                                        onClick={() => deleteCategory(category)}
                                        style={{
                                            position: 'absolute',
                                            top: '-2rem',
                                            right: '1rem',
                                            zIndex: 1
                                        }}
                                    >
                                        Delete Category
                                    </button>
                                    <ul className="item-list">
                                        {items
                                            .filter((item) => item.category === category)
                                            .map((item) => (
                                                <li key={item.id}>
                                                    <label>
                                                        <input type="checkbox" />
                                                        {item.name} (quantity: {item.quantity})
                                                    </label>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <button
                                                            type="button"
                                                            className="quantity-btn"
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                        >
                                                            -
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="quantity-btn"
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="remove-item"
                                                            onClick={() => removeItem(item.id)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                    </ul>
                                    <div className="add-item">
                                        <label htmlFor={`${category}Input`}>Add item:</label>
                                        <input
                                            type="text"
                                            id={`${category}Input`}
                                            placeholder={`Enter ${category}...`}
                                            value={itemInputs[category] || ''}
                                            onChange={(e) => handleItemInputChange(category, e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="add-button"
                                            onClick={() => addItem(category)}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </details>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}