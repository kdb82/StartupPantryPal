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
const MAX_TOOL_ROUNDS = 3;

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

Your role:
- Help users find recipes based on their pantry items
- Suggest recipes that match their preferences (servings, time limit, dietary needs)
- Use tools to check their actual pantry inventory
- Add missing ingredients to their shopping list
- Be concise and friendly
- Do not reveal internal software details to the user. If you are unable to do something just say you can't do it, don't mention tools or APIs.

When a user asks for recipe ideas, check if the user wants to use their pantry items (indicated in preferences, you don't need to ask them, that info should be available to you). If so, follow these steps:
1. First, check their pantry using the get_user_pantry tool
2. If user has specific preferences (servings, time limit, dietary needs), take those into account when suggesting recipes.
3. Suggest 2-3 recipes they can make, if possible, only with the ingredients they have. If not, suggest recipes that are close matches and clearly list any missing ingredients.
4. Format responses clearly with recipe names, time to take, steps, and a list of missing items from pantry at the end of the response if applicable.
5. Upon suggestion always ask if they would like to save any of the recipes, if ingredients are missing, also ask if they would like to add them to shopping list using add_to_shopping_list to add them
6. If you call save_recipe, always include full details (recipeId, recipeName, recipeTime, recipeDescription, recipeIngredients, recipeSteps). Do not call save_recipe with only an ID.

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

      const apiTools = tools.length > 0 ? buildApiTools(tools) : undefined;
      const toolMap = new Map(tools.map(t => [t.function.name, t.function.execute]));

      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME
      };

      let fullText = '';

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

        fullText = message.content || '';
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
