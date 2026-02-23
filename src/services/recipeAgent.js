/**
 * Recipe Agent - Simplified OpenRouter agent for PantryPal
 * 
 * This is a lightweight wrapper around OpenRouter SDK specifically
 * designed for React web apps (not CLI/Node.js servers).
 */

import { OpenRouter } from '@openrouter/sdk';
import { getActualPantryTool, searchRecipesTool, addToShoppingListTool } from './recipeTools';

const TOOLS = [getActualPantryTool, searchRecipesTool, addToShoppingListTool];

/**
 * Creates a recipe assistant agent
 * @param {Object} config - Configuration options
 * @param {string} config.apiKey - OpenRouter API key
 * @param {string} [config.model='openrouter/auto'] - Model to use
 * @param {Array} [config.tools=[]] - Tools the AI can use
 * @returns {Object} Agent instance with methods to interact with AI
 */
export function createRecipeAgent(config) {
  const {
    apiKey,
    model = 'openrouter/auto',
    tools = []
  } = config;

  // Initialize OpenRouter client
  const client = new OpenRouter({ apiKey });

  // Store conversation history
  const messages = [];

  // System instructions - tells the AI how to behave
  const instructions = `You are PantryPal, a helpful recipe assistant.

Your role:
- Help users find recipes based on their pantry items
- Suggest recipes that match their preferences (servings, time limit, dietary needs)
- Use tools to check their actual pantry inventory
- Add missing ingredients to their shopping list
- Be concise and friendly

When a user asks for recipe ideas, check if the user wants to use their pantry items (indicated in preferences, you don't need to ask them, that info should be available to you). If so, follow these steps:
1. First, check their pantry using the get_user_pantry tool
2. If user has specific preferences (servings, time limit, dietary needs), take those into account when suggesting recipes.
3. Suggest 2-3 recipes they can make, if possible, only with the ingredients they have. If not, suggest recipes that are close matches and clearly list any missing ingredients.;
4. Format responses clearly with recipe names, time to take, steps, and a list of missing items from pantry at the end of the response if applicable.
5. Upon suggestion always ask if they would like to save any of the recipes, if ingredients are missing, also ask if they would like to add them to shopping list using add_to_shopping_list to add them

Otherwise, if they just want general recipe ideas without using their pantry, suggest recipes based on their preferences without checking pantry first. Use the same formatting steps just skipping the pantry check.`;

  /**
   * Send a message and get a streaming response
   * @param {string} userMessage - The user's message
   * @param {Object} options - Additional options
   * @param {Function} options.onThinking - Called when AI starts thinking
   * @param {Function} options.onStream - Called with each text chunk (delta, fullText)
   * @param {Function} options.onToolCall - Called when AI uses a tool (name, args)
   * @param {Function} options.onComplete - Called when response is complete (fullText)
   * @param {Function} options.onError - Called on error
   * @returns {Promise<string>} Full response text
   */
  async function send(userMessage, options = {}) {
    const {
      onThinking = () => {},
      onStream = () => {},
      onToolCall = () => {},
      onComplete = () => {},
      onError = () => {}
    } = options;

    // Add user message to history
    messages.push({ role: 'user', content: userMessage });

    try {
      // Signal that we're thinking
      onThinking();

      // Call the model with streaming
      const result = client.callModel({
        model,
        instructions,
        input: messages,
        tools: tools.length > 0 ? tools : undefined,
      });

      let fullText = '';

      // Stream the response using items-based streaming
      for await (const item of result.getItemsStream()) {
        // Handle different item types
        switch (item.type) {
          case 'message': {
            // Extract text content from the message
            const textContent = item.content?.find(c => c.type === 'output_text');
            if (textContent && textContent.text) {
              const newText = textContent.text;
              if (newText !== fullText) {
                const delta = newText.slice(fullText.length);
                fullText = newText;
                onStream(delta, fullText);
              }
            }
            break;
          }

          case 'function_call': {
            // AI is calling a tool
            if (item.status === 'completed') {
              const args = item.arguments ? JSON.parse(item.arguments) : {};
              onToolCall(item.name, args);
            }
            break;
          }

          // We can handle more types later (reasoning, web_search, etc.)
        }
      }

      // If streaming didn't capture text, get it directly
      if (!fullText) {
        fullText = await result.getText();
      }

      // Add assistant response to history
      messages.push({ role: 'assistant', content: fullText });

      // Signal completion
      onComplete(fullText);

      return fullText;

    } catch (error) {
      onError(error);
      throw error;
    }
  }

  /**
   * Get the conversation history
   * @returns {Array} Array of messages
   */
  function getMessages() {
    return [...messages];
  }

  /**
   * Clear the conversation history
   */
  function clearHistory() {
    messages.length = 0;
  }

  /**
   * Add a tool to the agent at runtime
   * @param {Object} tool - Tool definition
   */
  function addTool(tool) {
    tools.push(tool);
  }

  // Return the agent interface
  return {
    send,
    getMessages,
    clearHistory,
    addTool
  };
}
