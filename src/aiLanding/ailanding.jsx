import React from "react";

export function AILanding() {
    return (
        <div className="page-ai">
            <main className="ai-main">
                <div className="container">
                    <section aria-labelledby="ai-title">
                        <h2 id="ai-title">AI Recipe Assistant</h2>
                        <p className="muted">
                            Describe what you want to cook. PantryPal will suggest recipes and
                            add missing ingredients to your shopping list.
                        </p>

                        <section
                            className="response-container"
                            aria-label="AI response (placeholder)"
                        >
                            <p className="muted">
                                AI response (placeholder). Later this will call <b>third-party API</b>
                                and display the real model output.
                            </p>
                            <p>
                                <strong>Example prompt:</strong> “I have chicken, rice, and
                                broccoli. I want a 30-minute dinner.”
                            </p>
                            <p><strong>Example response:</strong></p>
                            <ul>
                                <li>
                                    <strong>Idea:</strong> Chicken &amp; Broccoli Stir Fry Bowl
                                </li>
                                <li>
                                    <strong>Steps:</strong> sauté chicken → add broccoli → sauce →
                                    serve over rice
                                </li>
                                <li>
                                    <strong>Missing items:</strong> soy sauce, ginger (added to
                                    Shopping List)
                                </li>
                            </ul>
                            <p id="aiStatus" className="muted" role="status" aria-live="polite">
                                Not connected (placeholder).
                            </p>
                            <pre id="aiOutput" className="code-block" aria-label="AI output text">
                                Waiting for a prompt…</pre
                            >
                        </section>

                        <form id="aiPromptForm" method="post" action="/api/ai">
                            <label for="prompt">Prompt</label>
                            <textarea
                                id="prompt"
                                name="prompt"
                                rows="6"
                                placeholder="Example: I want to make an Italian dinner with ingredients I have."
                                data-field="recipe-prompt"
                                required
                            ></textarea>

                            <details className="prefs" open>
                                <summary>Preferences</summary>

                                <div className="prefs-content">
                                    <label for="servings">Servings</label>
                                    <input
                                        id="servings"
                                        name="servings"
                                        type="number"
                                        min="1"
                                        max="12"
                                        value="2"
                                        data-field="recipe-servings"
                                    />
                                </div>

                                <div className="prefs-content">
                                    <label for="timeLimit">Time limit (minutes)</label>
                                    <input
                                        id="timeLimit"
                                        name="timeLimit"
                                        type="number"
                                        min="5"
                                        max="180"
                                        value="30"
                                        data-field="time-limit"
                                    />
                                </div>

                                <div className="prefs-content">
                                    <label for="diet">Diet</label>
                                    <select id="diet" name="diet">
                                        <option value="No preference">No preference</option>
                                        <option value="vegetarian">Vegetarian</option>
                                        <option value="vegan">Vegan</option>
                                        <option value="gluten-free">Gluten-free</option>
                                    </select>
                                </div>

                                <div className="prefs-content">
                                    <label>
                                        <input type="checkbox" name="usePantry" checked />
                                        Use my pantry items (DB placeholder)
                                    </label>
                                </div>
                            </details>

                            <div className="form-actions">
                                <button type="submit">Generate recipe ideas</button>
                                <button type="reset">Clear</button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}