import React from "react";
import "../global.css";
import "./aiLanding.css";
import { createRecipeAgent } from "../services/recipeAgent";
import { getActualPantryTool, searchRecipesTool, addToShoppingListTool, saveRecipeTool } from "../services/recipeTools";
import { useEffect } from "react";

// Create agent once at module level (survives navigation)
let agentInstance = null;

function getOrCreateAgent() {
    if (!agentInstance) {
        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        agentInstance = createRecipeAgent({
            apiKey,
            model: "openrouter/auto",
            tools: [getActualPantryTool, searchRecipesTool, addToShoppingListTool, saveRecipeTool],
        });
    }
    return agentInstance;
}

function ThinkingIndicator() {
    const [dots, setDots] = React.useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev => prev === "..." ? "." : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);
    return <span>Thinking{dots}</span>;
}

export function AILanding() {
    const agent = getOrCreateAgent();
    const [prompt, setPrompt] = React.useState("");
    const [AIStatus, setAIStatus] = React.useState("idle");
    const [AIOutput, setAIOutput] = React.useState("");
    const [conversations, setConversations] = React.useState([]);
    const [streamingResponse, setStreamingResponse] = React.useState("");
    const promptFormRef = React.useRef(null);
    const responseContainerRef = React.useRef(null);
    const lastMessageRef = React.useRef(null);
    const aiStatusRef = React.useRef(null);

    // Load last response on mount
    useEffect(() => {
        const messages = agent.getMessages();
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === "assistant") {
                setAIOutput(lastMessage.content);
            }
        }
    }, [agent]);

    // Auto-scroll when conversations or streaming response changes
    const scrollToBottom = React.useCallback(() => {
        const lastConv = conversations[conversations.length - 1];
        const isWaitingForResponse = lastConv && !lastConv.response && !streamingResponse;
        
        if (isWaitingForResponse && responseContainerRef.current) {
            responseContainerRef.current.scrollTop = responseContainerRef.current.scrollHeight;
        } else if (streamingResponse && lastMessageRef.current && responseContainerRef.current) {
            // Use setTimeout to ensure DOM is updated before scrolling
            setTimeout(() => {
                if (lastMessageRef.current) {
                    const messageTop = lastMessageRef.current.offsetTop;
                    responseContainerRef.current.scrollTop = messageTop;
                }
            }, 0);
        }
    }, [conversations, streamingResponse]);

    useEffect(() => {
        scrollToBottom();
    }, [conversations, streamingResponse, scrollToBottom]);

    const handlePromptWheel = (event) => {
        const form = promptFormRef.current;
        if (!form) return;
        form.scrollTop += event.deltaY;
        event.preventDefault();
    };

    const handleClearChat = () => {
        setConversations([]);
        setStreamingResponse("");
        setAIOutput("");
    };

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
        const userPromptText = prompt;

        const newConvId = Date.now();
        setConversations(current => [...current, {
            id: newConvId,
            prompt: userPromptText,
            response: null
        }]);

        setPrompt("");
        setStreamingResponse("");
        setAIOutput("Processing your request...");
        try {
            await agent.send(fullPrompt, {
                onThinking: () => setAIStatus("thinking"),
                onStream: (delta, fullText) => {
                    setAIOutput(fullText);
                    setStreamingResponse(fullText);
                },
                onToolCall: (name, args) => {
                    console.log(`Tool called: ${name} with args`, args);
                },
                onComplete: (fullText) => {
                    setAIStatus("complete");
                    setAIOutput(fullText);

                    setConversations(current =>
                        current.map(conv =>
                            conv.id === newConvId
                                ? { ...conv, response: fullText }
                                : conv
                        )
                    );
                    setStreamingResponse("");

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

                        <section className="response-container" aria-label="AI response" ref={responseContainerRef}>
                            <div className="ai-conversation-history">
                                {conversations.length === 0 && !streamingResponse ? (
                                    <p className="muted">No conversations yet. Send a prompt to get started!</p>
                                ) : (
                                    <>
                                        {conversations.map((conv, index) => {
                                            const isLast = index === conversations.length - 1 && !streamingResponse;
                                            return (
                                                <div key={conv.id} className="conversation-pair" ref={isLast ? lastMessageRef : null}>
                                                    <div className="user-message">
                                                        <p>{conv.prompt}</p>
                                                    </div>
                                                    {conv.response && (
                                                        <div className="ai-message">
                                                            <pre>{conv.response}</pre>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {streamingResponse && (
                                            <div className="ai-message streaming" ref={lastMessageRef}>
                                                <pre>{streamingResponse}</pre>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <p id="aiStatus" className="muted" role="status" aria-live="polite" ref={aiStatusRef}>
                                {AIStatus === "thinking"
                                    ? <ThinkingIndicator />
                                    : AIStatus === "complete"
                                        ? "Done"
                                        : AIStatus === "error"
                                            ? "Error"
                                            : "Idle"}
                            </p>
                        </section>

                        <form ref={promptFormRef} id="aiPromptForm" onSubmit={handleSubmit} className="ai-form">
                            <label htmlFor="prompt">Prompt</label>
                            <textarea
                                id="prompt"
                                name="prompt"
                                rows="2"
                                placeholder="Example: I want to make an Italian dinner with ingredients I have."
                                data-field="recipe-prompt"
                                required
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onWheel={handlePromptWheel}
                                disabled={AIStatus === "thinking"}
                            ></textarea>

                            <details className="prefs" closed="true">
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
                                <button type="reset" disabled={AIStatus === "thinking"} onClick={handleClearChat}>
                                    Clear Chat
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}