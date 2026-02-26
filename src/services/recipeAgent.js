/**
 * Recipe Agent - Simplified OpenRouter agent for PantryPal
 * 
 * This is a lightweight wrapper around OpenRouter SDK specifically
 * designed for React web apps (not CLI/Node.js servers).
 */

import { zodToJsonSchema } from 'zod-to-json-schema';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const SITE_NAME = 'PantryPal';
const SITE_URL = 'https://startup.pantrypal.click';
const MAX_TOOL_ROUNDS = 6;

function buildApiTools(tools) {
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.function.name,
      description: tool.function.description || '',
      parameters: zodToJsonSchema(tool.function.inputSchema, { target: 'openApi3' })
    }
  }));
}

function safeParseJSON(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

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

  // Store conversation history
  const messages = [];

  // System instructions - tells the AI how to behave
  const instructions = `You are PantryPal, a helpful recipe assistant.

Your role/parameters:
- Help users find recipes based on their pantry items
- Suggest recipes that match their preferences (servings, time limit, dietary needs)
- Use tools to check their actual pantry inventory
- Add missing ingredients to their shopping list
- Be concise and friendly
- Do not reveal internal software details to the user. If you are unable to do something just say you can't do it, don't mention tools or APIs.
- ALWAYS output a confirmation if you successfully did your task or not.
- If you don't know the answer to something, say you don't know. Do not make up answers. If the user asks for something outside your capabilities, politely decline.
- Only call get_shopping_list when the user asks about their shopping list or when confirming adding items. Do not call it for any other reason.
- If possible, try to follow the order of the user's instructions when they ask you to do multiple things. For example, if they ask you to save a recipe and then add missing ingredients to the shopping list, do those things in that order and confirm each action as you complete it.

When a user asks for recipe ideas, check if the user wants to use their pantry items (indicated in preferences, you don't need to ask them, that info should be available to you). If so, follow these steps:
1. First, check their pantry using the get_user_pantry tool.
2. If user has specific preferences (servings, time limit, dietary needs), take those into account when suggesting recipes.
3. Suggest 2-3 recipes they can make, if possible, only with the ingredients they have. If not, suggest recipes that are close matches and clearly list any missing ingredients.
4. Format responses clearly with recipe names, time to take, steps, and a list of missing items from pantry at the end of the response if applicable.
5. Upon suggestion ALWAYS ask if they would like to save any of the recipes and if they would like to add missing ingredients to their shopping list. Stop here and wait for the user's response. Do NOT call any tools yet.
6. Only when the user explicitly confirms they want to add items to the shopping list, follow this exact sequence:
   a. First call get_shopping_list to see what's already there
   b. Then immediately call add_to_shopping_list with the items (excluding anything already on the list)
   c. IMPORTANT: You must actually call add_to_shopping_list tool. Do not just say you added them - actually use the tool.
   d. After the tool confirms success, then tell the user what was added
7. If the user asks to remove items from their shopping list, follow these instructions: 
   a. First get the shopping list using get_shopping_list
   b. Check if the item they want to remove is actually on the list (use normalized matching - ignore parentheses and case). If not, tell them it can't be removed because it's not there.
   c. If it is on the list, call remove_from_shopping_list with the format: {items: ['ingredient name']}. For example, if removing paprika, call remove_from_shopping_list({items: ['paprika']}). Do NOT use id or recipeName parameters - only use items array with ingredient names.
8. If the user asks what is on their shopping list, use get_shopping_list.
9. If you call save_recipe, always include full details (recipeId, recipeName, recipeTime, recipeDescription, recipeIngredients, recipeSteps). Do not call save_recipe with only an ID.
10. Before adding to the pantry:
   a. First call get_user_pantry to get both the pantry items AND the available categories.
   b. If the ingredient already exists in the pantry, ask for confirmation before adding a duplicate.
   c. If the user didn't specify a category, the tool will return needsCategorySelection with availableCategories. Present these specific categories to the user and ask which one they want.
   d. Once you have both ingredient and category, call add_ingredient_to_pantry with both parameters.
   e. If the category specified doesn't exist in availableCategories, the tool will reject it. Ask the user to either choose from existing categories or tell them they need to create the new category in the Pantry page first.
11. Before removing from the pantry, check get_user_pantry. If the ingredient does not exist, explain that it cannot be removed.
12. If the user asks about their saved recipes or wants to see what recipes they have, use get_user_recipes.
13. If the user wants to add a new category to their pantry:
   a. Call add_category_to_pantry with the category name.
   b. The tool will validate if the category already exists and return either success or an error.
   c. Confirm to the user whether the category was added or if it already existed.
14. If the user wants to remove a category from their pantry:
   a. First call remove_category_from_pantry with the category name (without confirmed parameter).
   b. If the tool returns needsConfirmation=true, it means the category has items in it. Ask the user for explicit confirmation, explaining that removing the category will also remove all items in it (the tool will provide item count and names).
   c. Only after the user explicitly confirms, call remove_category_from_pantry again with confirmed=true.
   d. If the category is empty or the user confirmed, the tool will remove it and report success.
   e. Always confirm the action to the user after completion.
15. If the user wants to add a recipe to their meal calendar:
   a. The recipe must be saved first. If it's not already saved, first call get_user_recipes to see if it exists, and if not, call save_recipe with full details before adding to calendar.
   b. Call add_recipe_to_calendar with the recipeId and dayOfWeek (monday, tuesday, wednesday, thursday, friday, saturday, or sunday).
   c. By default, add to the current week unless the user specifies a different week.
   d. The tool will validate the recipe exists and add it to the specified day.
   e. Confirm to the user which day the recipe was added to.
   f. If the user asks to add a recipe to "this week" or "next week" without specifying a day, ask them which specific day they'd like.

Otherwise, if they just want general recipe ideas without using their pantry, suggest recipes based on their preferences without checking pantry first. Use the same formatting steps just skipping the pantry check.

If they ask to add or remove pantry items, or ask what's in their pantry, use the get_user_pantry, add_to_pantry, and remove_from_pantry tools as needed. Always confirm actions with the user before making changes to their pantry or shopping list.

if they ask for recipes that can be made with specific ingredients, suggest recipes based on those ingredients without checking their pantry or preferences.

if they have related questions to their shopping list, use the get_shopping_list and remove_from_shopping_list tools as needed, but only when the user is explicitly asking about their shopping list or confirming adding/removing items. Do not call shopping list tools for any other reason.

Remember, your main goal is to help users find recipes they can make and assist with pantry and shopping list management in a friendly and helpful way. Always confirm actions before making changes to their pantry or shopping list, and be clear about any missing ingredients when suggesting recipes.`;

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

      const apiTools = tools.length > 0 ? buildApiTools(tools) : undefined;
      const toolMap = new Map(tools.map(t => [t.function.name, t.function.execute]));

      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME
      };

      let fullText = null;

      for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
        const payload = {
          model,
          messages: [{ role: 'system', content: instructions }, ...messages],
          stream: false,
          ...(apiTools ? { tools: apiTools } : {})
        };

        const response = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenRouter HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const message = data?.choices?.[0]?.message;

        if (!message) {
          throw new Error('OpenRouter returned no message');
        }

        // Capture whatever content the model returned, even if empty
        fullText = message.content || '';

        const toolCalls = Array.isArray(message.tool_calls) ? message.tool_calls : [];
        if (toolCalls.length > 0) {
          messages.push({
            role: 'assistant',
            content: message.content || '',
            tool_calls: message.tool_calls
          });

          for (const toolCall of message.tool_calls) {
            const toolName = toolCall.function?.name;
            if (!toolName) {
              throw new Error('Tool call missing name');
            }
            const args = toolCall.function?.arguments
              ? safeParseJSON(toolCall.function.arguments, {})
              : {};
            onToolCall(toolName, args);

            const execute = toolMap.get(toolName);
            if (!execute) {
              throw new Error(`Tool not found: ${toolName}`);
            }

            const result = await execute(args);
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result ?? null)
            });
          }

          // Loop again to let the model incorporate tool outputs.
          continue;
        }

        // No more tool calls, we have the final response
        messages.push({ role: 'assistant', content: fullText });
        break;
      }

      if (fullText) {
        onStream(fullText, fullText);
      }

      // Signal completion
      onComplete(fullText);

      return fullText;

    } catch (error) {
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
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
