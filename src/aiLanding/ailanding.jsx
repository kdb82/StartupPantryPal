import React from "react";
import "../global.css";
import "./aiLanding.css";
import { createRecipeAgent } from "../services/recipeAgent";
import { getActualPantryTool, searchRecipesTool, addToShoppingListTool } from "../services/recipeTools";
import { useMemo } from "react";

export function AILanding() {
    const agent = useMemo(() => {
        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        return createRecipeAgent({
            apiKey,
            model: "openrouter/auto",
            tools: [getActualPantryTool, searchRecipesTool, addToShoppingListTool],
        });
    }, []);

    const [prompt, setPrompt] = React.useState("");
    const [AIStatus, setAIStatus] = React.useState("idle");
    const [AIOutput, setAIOutput] = React.useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const servings = formData.get("servings");
        const timeLimit = formData.get("timeLimit");
        const diet = formData.get("diet");
        const usePantry = formData.get("usePantry") === "on";

        const preferenceNote = [
            `Servings: ${servings || "unspecified"}`,
            `Time limit: ${timeLimit || "unspecified"} minutes`,
            `Diet: ${diet || "no preference"}`,
            `Use pantry items: ${usePantry ? "yes" : "no"}`
        ].join("\n");

        const fullPrompt = `${prompt}\n\nPreferences:\n${preferenceNote}`;

        setPrompt("");
        setAIOutput("Processing your request...");
        try {
            await agent.send(fullPrompt, {
                onThinking: () => setAIStatus("thinking"),
                onStream: (delta, fullText) => setAIOutput(fullText),
                onToolCall: (name, args) => {
                    console.log(`Tool called: ${name} with args`, args);
                },
                onComplete: (fullText) => {
                    setAIStatus("complete");
                    setAIOutput(fullText);
                    setTimeout(() => setAIStatus("idle"), 1500);
                },
                onError: (error) => {
                    setAIStatus("error");
                    setAIOutput(`Error: ${error.message}`);
                    setTimeout(() => setAIStatus("idle"), 2000);
                },
            });
        } catch (error) {
            setAIStatus("error");
            console.error("Error sending message to agent:", error);
            setAIOutput(`Error: ${error.message}`);
        }
    }

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
                                {AIStatus === "thinking"
                                    ? "Thinking..."
                                    : AIStatus === "complete"
                                        ? "Done"
                                        : AIStatus === "error"
                                            ? "Error"
                                            : "Idle"}
                            </p>
                            <pre id="aiOutput" className="code-block" aria-label="AI output text">
                                {AIOutput || "Waiting for a prompt..."}
                            </pre>
                        </section>

                        <form id="aiPromptForm" onSubmit={handleSubmit} className="ai-form">
                            <label htmlFor="prompt">Prompt</label>
                            <textarea
                                id="prompt"
                                name="prompt"
                                rows="6"
                                placeholder="Example: I want to make an Italian dinner with ingredients I have."
                                data-field="recipe-prompt"
                                required
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={AIStatus === "thinking"}
                            ></textarea>

                            <details className="prefs" open>
                                <summary>Preferences</summary>

                                <div className="prefs-content">
                                    <label htmlFor="servings">Servings</label>
                                    <input
                                        id="servings"
                                        name="servings"
                                        type="number"
                                        min="1"
                                        max="12"
                                        defaultValue="2"
                                        data-field="recipe-servings"
                                        disabled={AIStatus === "thinking"}
                                    />
                                </div>

                                <div className="prefs-content">
                                    <label htmlFor="timeLimit">Time limit (minutes)</label>
                                    <input
                                        id="timeLimit"
                                        name="timeLimit"
                                        type="number"
                                        min="5"
                                        max="180"
                                        defaultValue="30"
                                        data-field="time-limit"
                                        disabled={AIStatus === "thinking"}
                                    />
                                </div>

                                <div className="prefs-content">
                                    <label htmlFor="diet">Diet</label>
                                    <select id="diet" name="diet" disabled={AIStatus === "thinking"}>
                                        <option value="No preference">No preference</option>
                                        <option value="vegetarian">Vegetarian</option>
                                        <option value="vegan">Vegan</option>
                                        <option value="gluten-free">Gluten-free</option>
                                    </select>
                                </div>

                                <div className="prefs-content">
                                    <label>
                                        <input
                                            type="checkbox"
                                            className="checkbox-text"
                                            name="usePantry"
                                            defaultChecked
                                            disabled={AIStatus === "thinking"}
                                        />
                                        Use my pantry items (DB placeholder)
                                    </label>
                                </div>
                            </details>

                            <div className="form-actions">
                                <button type="submit" disabled={AIStatus === "thinking"}>
                                    Generate recipe ideas
                                </button>
                                <button type="reset" disabled={AIStatus === "thinking"}>
                                    Clear
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}