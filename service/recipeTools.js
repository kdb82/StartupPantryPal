import { tool } from "@openrouter/sdk";
import { z } from "zod";
import { apiRequest } from "../src/apiRequest";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_CATEGORIES = [
  "protein",
  "vegetables",
  "fruits",
  "grains",
  "dairy",
  "staples",
  "other",
];
const lastSearchResults = new Map();
const MAX_SEARCH_CACHE = 25;

function cacheSearchResult(recipe) {
  if (!recipe?.id) return;
  lastSearchResults.set(recipe.id, recipe);
  if (lastSearchResults.size > MAX_SEARCH_CACHE) {
    const oldestKey = lastSearchResults.keys().next().value;
    lastSearchResults.delete(oldestKey);
  }
}

function getCachedRecipe(recipeId) {
  return recipeId ? lastSearchResults.get(recipeId) : null;
}

function normalizeIngredientName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeRecipeId(recipeId) {
  if (!recipeId) return "";
  return recipeId.startsWith("recipe_") ? recipeId.substring(7) : recipeId;
}

function normalizeForPantryMatch(value) {
  if (!value) return "";

  const singularize = (token) => {
    if (token.endsWith("ies") && token.length > 4) return `${token.slice(0, -3)}y`;
    if (token.endsWith("ses") && token.length > 4) return token.slice(0, -2);
    if (token.endsWith("s") && token.length > 3 && !token.endsWith("ss")) {
      return token.slice(0, -1);
    }
    return token;
  };

  const text = value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .split(",")[0]
    .replace(/\b\d+(?:[./]\d+)?\b/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";

  const units = new Set([
    "cup", "tablespoon", "tbsp", "teaspoon", "tsp", "ounce", "oz", "pound", "lb", "lbs",
    "gram", "g", "kg", "clove", "slice", "piece", "can", "jar", "bunch", "sprig", "pinch",
  ]);

  const descriptors = new Set([
    "fresh", "frozen", "diced", "minced", "chopped", "sliced", "thin", "thick", "bite", "sized",
    "boneless", "skinless", "large", "small", "medium", "optional", "to", "taste",
  ]);

  const proteinAliases = {
    chily: "chili",
    breasts: "chicken",
    breast: "chicken",
    thighs: "chicken",
    thigh: "chicken",
    drumsticks: "chicken",
    drumstick: "chicken",
    tenderloins: "chicken",
    tenderloin: "chicken",
  };

  const tokens = text
    .split(" ")
    .map((token) => singularize(token))
    .map((token) => proteinAliases[token] || token)
    .filter((token) => token && !units.has(token) && !descriptors.has(token));

  return tokens.join(" ").trim();
}

const STRICT_QUALIFIER_EXCEPTIONS = {
  garlic: new Set(["powder", "salt", "paste"]),
  onion: new Set(["powder", "salt"]),
  chili: new Set(["powder", "flake", "flakes"]),
  milk: new Set(["almond", "coconut", "oat", "soy"]),
  flour: new Set(["almond", "coconut", "bread", "self", "rising", "wheat"]),
  sugar: new Set(["brown", "powdered", "confectioner"]),
  salt: new Set(["kosher", "sea", "pink", "iodized", "garlic", "onion"]),
};

function getStrictQualifiers(value, base) {
  const qualifiers = STRICT_QUALIFIER_EXCEPTIONS[base];
  if (!qualifiers || !value) return new Set();

  const tokens = value.split(" ").filter(Boolean);
  if (!tokens.includes(base)) return new Set();

  return new Set(tokens.filter((token) => token !== base && qualifiers.has(token)));
}

function ingredientsMatch(pantryValue, recipeValue) {
  const pantryNormalized = normalizeForPantryMatch(pantryValue);
  const recipeNormalized = normalizeForPantryMatch(recipeValue);

  if (!pantryNormalized || !recipeNormalized) return false;

  // Fast path for exact and substring matches (e.g., "soda" vs "soda pop").
  if (
    pantryNormalized === recipeNormalized ||
    pantryNormalized.includes(recipeNormalized) ||
    recipeNormalized.includes(pantryNormalized)
  ) {
    return true;
  }

  // Guard against false positives for ingredients where qualifiers matter.
  for (const base of Object.keys(STRICT_QUALIFIER_EXCEPTIONS)) {
    const pantryIsBase = pantryNormalized === base;
    const recipeIsBase = recipeNormalized === base;
    const pantryQualifiers = getStrictQualifiers(pantryNormalized, base);
    const recipeQualifiers = getStrictQualifiers(recipeNormalized, base);

    if (pantryIsBase && recipeQualifiers.size > 0) return false;
    if (recipeIsBase && pantryQualifiers.size > 0) return false;

    if (pantryQualifiers.size > 0 && recipeQualifiers.size > 0) {
      const sharedQualifier = [...pantryQualifiers].some((q) => recipeQualifiers.has(q));
      if (!sharedQualifier) return false;
    }
  }

  // Token subset check for multi-word variants.
  const pantryTokens = pantryNormalized.split(" ").filter(Boolean);
  const recipeTokens = recipeNormalized.split(" ").filter(Boolean);
  if (!pantryTokens.length || !recipeTokens.length) return false;

  const pantrySet = new Set(pantryTokens);
  const recipeSet = new Set(recipeTokens);
  const smaller = pantrySet.size <= recipeSet.size ? pantrySet : recipeSet;
  const larger = smaller === pantrySet ? recipeSet : pantrySet;

  for (const token of smaller) {
    if (!larger.has(token)) return false;
  }

  return true;
}

async function getPantryState() {
  const pantry = await apiRequest("/api/pantry", { method: "GET" });
  return {
    items: Array.isArray(pantry.items) ? pantry.items : [],
    categories: Array.isArray(pantry.categories)
      ? pantry.categories
      : [...DEFAULT_CATEGORIES],
  };
}

async function setPantryItems(items) {
  const pantry = await apiRequest("/api/pantry", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
  return {
    items: Array.isArray(pantry.items) ? pantry.items : [],
    categories: Array.isArray(pantry.categories)
      ? pantry.categories
      : [...DEFAULT_CATEGORIES],
  };
}

async function setPantryCategories(categories) {
  const pantry = await apiRequest("/api/pantry/categories", {
    method: "PUT",
    body: JSON.stringify({ categories }),
  });
  return {
    items: Array.isArray(pantry.items) ? pantry.items : [],
    categories: Array.isArray(pantry.categories)
      ? pantry.categories
      : [...DEFAULT_CATEGORIES],
  };
}

async function getShoppingItems() {
  const response = await apiRequest("/api/shopping-list", { method: "GET" });
  return Array.isArray(response.items) ? response.items : [];
}

async function setShoppingItems(items) {
  const response = await apiRequest("/api/shopping-list", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
  return Array.isArray(response.items) ? response.items : [];
}

async function getMealPlanState() {
  const response = await apiRequest("/api/meal-plan", { method: "GET" });
  return response.plan && typeof response.plan === "object" ? response.plan : {};
}

async function setMealPlanState(plan) {
  const response = await apiRequest("/api/meal-plan", {
    method: "PUT",
    body: JSON.stringify({ plan }),
  });
  return response.plan && typeof response.plan === "object" ? response.plan : {};
}

async function getRecipesState() {
  const recipes = await apiRequest("/api/recipes", { method: "GET" });
  return Array.isArray(recipes) ? recipes : [];
}

export const getActualPantryTool = tool({
  name: "get_user_pantry",
  description: "Check the user's actual pantry inventory and available categories",
  inputSchema: z.object({}),
  execute: async () => {
    const pantry = await getPantryState();
    const flatItems = pantry.items.map((item) => {
      const qty = item.quantity ? ` (${item.quantity})` : "";
      return `${item.name}${qty}`;
    });

    return {
      items: flatItems,
      categories: pantry.categories,
    };
  },
});

export const addIngredientToPantryTool = tool({
  name: "add_ingredient_to_pantry",
  description:
    "Add an ingredient to the user's pantry. Requires a category from the user's available categories.",
  inputSchema: z.object({
    ingredient: z.string().describe("Ingredient name"),
    quantity: z.number().optional().describe("Quantity to add"),
    category: z
      .string()
      .optional()
      .describe("Pantry category (must be one of the user's existing categories)"),
  }),
  execute: async ({ ingredient, quantity = 1, category } = {}) => {
    if (!ingredient) {
      return { success: false, message: "Missing ingredient name." };
    }

    const pantry = await getPantryState();
    const availableCategories = pantry.categories;

    if (!category) {
      return {
        success: false,
        needsCategorySelection: true,
        message: `Which category should "${ingredient}" be added to?`,
        availableCategories,
        ingredient,
        quantity,
      };
    }

    const normalizedCategory = category.trim().toLowerCase();
    if (!availableCategories.some((c) => c.toLowerCase() === normalizedCategory)) {
      return {
        success: false,
        message: `Category "${category}" does not exist. Available categories: ${availableCategories.join(", ")}. Please choose one of these or ask the user to create a new category first.`,
        availableCategories,
      };
    }

    const existing = pantry.items.find(
      (item) => normalizeIngredientName(item.name) === normalizeIngredientName(ingredient)
    );

    if (existing) {
      return {
        success: false,
        needsConfirmation: true,
        message: `"${ingredient}" is already in the pantry. Add a duplicate?`,
        existingItem: existing,
      };
    }

    const newItem = {
      id: Date.now() + Math.random(),
      name: ingredient.trim(),
      quantity: Math.max(1, quantity || 1),
      category: normalizedCategory,
      checked: false,
      addedAt: new Date().toISOString(),
      addedBy: "currentUser",
    };

    const updatedItems = [...pantry.items, newItem];
    await setPantryItems(updatedItems);

    return {
      success: true,
      item: newItem,
      message: `Added ${ingredient} to pantry`,
    };
  },
});

export const removeIngredientFromPantryTool = tool({
  name: "remove_ingredient_from_pantry",
  description: "Remove an ingredient from the user's pantry",
  inputSchema: z.object({
    ingredient: z.string().describe("Ingredient name"),
  }),
  execute: async ({ ingredient } = {}) => {
    if (!ingredient) {
      return { success: false, message: "Missing ingredient name." };
    }

    const pantry = await getPantryState();
    const exists = pantry.items.some(
      (item) => normalizeIngredientName(item.name) === normalizeIngredientName(ingredient)
    );

    if (!exists) {
      return {
        success: false,
        message: `"${ingredient}" is not in the pantry, so it cannot be removed.`,
      };
    }

    const updatedItems = pantry.items.filter(
      (item) => normalizeIngredientName(item.name) !== normalizeIngredientName(ingredient)
    );
    await setPantryItems(updatedItems);

    return {
      success: true,
      message: `Removed ${ingredient} from pantry`,
    };
  },
});

export const searchRecipesTool = tool({
  name: "search_recipes",
  description: "Find recipes that use some or all of the given ingredients",
  inputSchema: z.object({
    ingredients: z.array(z.string()).describe("List of available ingredients"),
    timeLimit: z.number().optional().describe("Max cooking time in minutes"),
    dietaryPreferences: z
      .string()
      .optional()
      .describe("Dietary preferences or restrictions"),
    servings: z.number().optional().describe("Number of servings needed"),
  }),
  execute: async ({ ingredients = [], timeLimit, servings, dietaryPreferences } = {}) => {
    const normalizedIngredients = Array.isArray(ingredients)
      ? ingredients.map((item) => normalizeForPantryMatch(item))
      : [];

    const hasIngredient = (name) => {
      if (!name) return false;
      return ingredients.some((pantryItem) => ingredientsMatch(pantryItem, name));
    };
    const buildMissingItems = (recipeIngredients) =>
      recipeIngredients.filter((item) => !hasIngredient(item));

    let prompt = `Generate 2-3 recipes that can be made with these ingredients: ${ingredients.join(
      ", "
    )}.\n\nRequirements:\n- Try to use as many of the provided ingredients as possible\n- Each recipe should be realistic and practical${
      timeLimit ? `\n- Cooking time should be ${timeLimit} minutes or less` : ""
    }${servings ? `\n- Should serve ${servings} people` : ""}${
      dietaryPreferences
        ? `\n- Must follow ${dietaryPreferences} dietary restrictions`
        : ""
    }\n\nReturn ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:\n{\n  "recipes": [\n    {\n      "id": "unique_lowercase_id",\n      "name": "Recipe Name",\n      "timeMinutes": 30,\n      "servings": 2,\n      "ingredients": ["ingredient1", "ingredient2", "etc"],\n      "steps": ["step 1", "step 2", "step 3"],\n      "cuisine": "cuisine type",\n      "difficulty": "easy/medium/hard"\n    }\n  ]\n}\n\nIMPORTANT: Return ONLY the JSON object, no other text.`;

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured");
      }

      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://startup.pantrypal.click",
          "X-Title": "PantryPal",
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful recipe generator. You always return valid JSON objects without markdown formatting.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;
      if (!aiResponse) {
        throw new Error("No response from AI");
      }

      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/```json?\n?/g, "")
          .replace(/```\n?$/g, "");
      }

      const parsedRecipes = JSON.parse(cleanedResponse);
      const processedRecipes = parsedRecipes.recipes.map((recipe, index) => {
        const recipeId = recipe.id || `generated_${Date.now()}_${index}`;
        const processedRecipe = {
          id: recipeId,
          name: recipe.name || "Unnamed Recipe",
          timeMinutes: recipe.timeMinutes || 30,
          servings: recipe.servings || servings || 2,
          ingredients: recipe.ingredients || [],
          steps: recipe.steps || [],
          cuisine: recipe.cuisine || "Various",
          difficulty: recipe.difficulty || "medium",
          missingItems: buildMissingItems(recipe.ingredients || []),
        };
        cacheSearchResult(processedRecipe);
        return processedRecipe;
      });

      return {
        recipes: processedRecipes,
        matchCount: processedRecipes.length,
        criteria: {
          ingredients,
          normalizedIngredients,
          timeLimit: timeLimit || null,
          servings: servings || null,
          dietaryPreferences: dietaryPreferences || null,
        },
      };
    } catch (error) {
      const fallbackRecipes = [
        {
          id: `fallback_${Date.now()}_1`,
          name: "Simple Stir Fry",
          timeMinutes: timeLimit || 25,
          servings: servings || 2,
          ingredients: ingredients.slice(0, 5),
          steps: [
            "Heat oil in a pan.",
            "Add ingredients and stir fry for 10-15 minutes.",
            "Season to taste and serve.",
          ],
          cuisine: "Various",
          difficulty: "easy",
          missingItems: [],
        },
      ];

      fallbackRecipes.forEach((recipe) => cacheSearchResult(recipe));

      return {
        recipes: fallbackRecipes,
        matchCount: 1,
        criteria: {
          ingredients,
          normalizedIngredients,
          timeLimit: timeLimit || null,
          servings: servings || null,
          dietaryPreferences: dietaryPreferences || null,
        },
        error: "AI generation failed, showing simplified fallback recipe",
      };
    }
  },
});

export const addToShoppingListTool = tool({
  name: "add_to_shopping_list",
  description: "Add missing ingredients to the user's shopping list",
  inputSchema: z.object({
    items: z.array(z.string()).describe("List of ingredients to add to shopping list"),
    recipeName: z
      .string()
      .optional()
      .describe("Name of recipe these ingredients are for"),
  }),
  execute: async ({ items = [], recipeName = "Recipe" } = {}) => {
    const shoppingList = await getShoppingItems();

    const addedIngredients = [];
    const alreadyOnList = [];
    (items || []).forEach((ingredient) => {
      const exists = shoppingList.find(
        (item) =>
          normalizeIngredientName(item.name) === normalizeIngredientName(ingredient)
      );

      if (!exists) {
        shoppingList.push({
          id: `recipe_${Date.now()}_${Math.random()}`,
          name: ingredient,
          checked: false,
          neededFor: [recipeName],
        });
        addedIngredients.push(ingredient);
      } else {
        alreadyOnList.push(ingredient);
      }
    });

    await setShoppingItems(shoppingList);

    return {
      success: true,
      addedItems: addedIngredients,
      alreadyOnList,
      count: addedIngredients.length,
      message: `Added ${addedIngredients.length} items to shopping list`,
    };
  },
});

export const removeFromShoppingListTool = tool({
  name: "remove_from_shopping_list",
  description:
    "Remove specific ingredient items from the user's shopping list by name. You MUST provide the ingredient names to remove.",
  inputSchema: z.object({
    items: z
      .array(z.string())
      .describe("Array of ingredient names to remove (e.g., ['paprika', 'milk']). This is REQUIRED."),
  }),
  execute: async ({ items = [] } = {}) => {
    let shoppingList = await getShoppingItems();

    if (!items || items.length === 0) {
      return {
        success: false,
        message:
          "No ingredient names provided. You must specify which items to remove by name.",
        removedItems: [],
        count: 0,
      };
    }

    const removedItems = [];
    const ingredientSet = new Set(items.map(normalizeIngredientName));

    shoppingList = shoppingList.filter((item) => {
      const itemName = normalizeIngredientName(item.name);
      if (!ingredientSet.has(itemName)) {
        return true;
      }
      removedItems.push(item.name);
      return false;
    });

    await setShoppingItems(shoppingList);

    return {
      success: removedItems.length > 0,
      removedItems,
      count: removedItems.length,
      message:
        removedItems.length > 0
          ? `Successfully removed ${removedItems.length} item(s): ${removedItems.join(", ")}`
          : `No matching items found to remove. Looking for: ${items.join(", ")}`,
    };
  },
});

export const getShoppingListTool = tool({
  name: "get_shopping_list",
  description: "Retrieve the user's current shopping list",
  inputSchema: z.object({}),
  execute: async () => {
    const shoppingList = await getShoppingItems();
    return {
      success: true,
      count: shoppingList.length,
      items: shoppingList,
    };
  },
});

export const saveRecipeTool = tool({
  name: "save_recipe",
  description: "Save a recipe to the user's collection",
  inputSchema: z.object({
    recipeId: z.string().describe("Unique identifier for the recipe"),
    recipeName: z.string().describe("Name of the recipe to save"),
    recipeTime: z.number().optional().describe("Cooking time in minutes"),
    recipeDescription: z
      .string()
      .optional()
      .describe("Description of the recipe to save"),
    recipeIngredients: z
      .array(z.string())
      .describe("List of ingredients in the recipe"),
    recipeSteps: z.array(z.string()).describe("List of steps to prepare the recipe"),
  }),
  execute: async ({
    recipeName,
    recipeId,
    recipeTime,
    recipeDescription,
    recipeIngredients = [],
    recipeSteps = [],
  } = {}) => {
    const resolvedCache = getCachedRecipe(recipeId);
    const resolvedName = recipeName || resolvedCache?.name || "Saved Recipe";
    const resolvedTime = recipeTime ?? resolvedCache?.timeMinutes ?? null;
    const resolvedDescription = recipeDescription ?? resolvedCache?.description ?? null;
    const resolvedIngredients =
      Array.isArray(recipeIngredients) && recipeIngredients.length > 0
        ? recipeIngredients
        : resolvedCache?.ingredients || [];
    const resolvedSteps =
      Array.isArray(recipeSteps) && recipeSteps.length > 0
        ? recipeSteps
        : resolvedCache?.steps || [];

    if (!recipeId) {
      return {
        success: false,
        message: "Missing recipeId for save_recipe.",
      };
    }

    const normalizedRecipeId = normalizeRecipeId(recipeId);

    const pantry = await getPantryState();

    const missingIngredients = Array.isArray(resolvedIngredients)
      ? resolvedIngredients.filter(
          (ingredient) => !pantry.items.some((item) => ingredientsMatch(item.name, ingredient))
        )
      : [];

    await apiRequest("/api/recipes", {
      method: "POST",
      body: JSON.stringify({
        recipeId: normalizedRecipeId,
        recipeName: resolvedName,
        recipeTime: resolvedTime,
        recipeDescription: resolvedDescription,
        recipeIngredients: resolvedIngredients,
        recipeSteps: resolvedSteps,
      }),
    });

    return {
      success: true,
      recipeId: normalizedRecipeId,
      missingIngredients,
      message: `Recipe "${resolvedName}" saved successfully`,
    };
  },
});

export const getRecipesTool = tool({
  name: "get_user_recipes",
  description: "Retrieve all of the user's saved recipes",
  inputSchema: z.object({}),
  execute: async () => {
    const recipes = await getRecipesState();
    return {
      success: true,
      count: recipes.length,
      recipes,
    };
  },
});

export const addCategoryToPantryTool = tool({
  name: "add_category_to_pantry",
  description: "Add a new category to the pantry",
  inputSchema: z.object({
    category: z.string().describe("Name of the new category to add"),
  }),
  execute: async ({ category } = {}) => {
    if (!category || !category.trim()) {
      return { success: false, message: "Category name is required." };
    }

    const categoryName = category.trim().toLowerCase();
    const pantry = await getPantryState();
    const categories = pantry.categories;

    if (categories.some((cat) => cat.toLowerCase() === categoryName)) {
      return {
        success: false,
        message: `Category "${category}" already exists.`,
        currentCategories: categories,
      };
    }

    const updatedCategories = [...categories, categoryName];
    const updated = await setPantryCategories(updatedCategories);

    return {
      success: true,
      message: `Category "${categoryName}" has been added.`,
      currentCategories: updated.categories,
    };
  },
});

export const removeCategoryFromPantryTool = tool({
  name: "remove_category_from_pantry",
  description:
    "Remove a category from the pantry. If the category has items, user confirmation is required.",
  inputSchema: z.object({
    category: z.string().describe("Name of the category to remove"),
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true if user has confirmed removal of category with items"),
  }),
  execute: async ({ category, confirmed = false } = {}) => {
    if (!category || !category.trim()) {
      return { success: false, message: "Category name is required." };
    }

    const categoryName = category.trim().toLowerCase();
    const pantry = await getPantryState();
    const categories = pantry.categories;

    if (!categories.some((cat) => cat.toLowerCase() === categoryName)) {
      return {
        success: false,
        message: `Category "${category}" does not exist.`,
        currentCategories: categories,
      };
    }

    const itemsInCategory = pantry.items.filter(
      (item) => item.category && item.category.toLowerCase() === categoryName
    );

    if (itemsInCategory.length > 0 && !confirmed) {
      return {
        success: false,
        needsConfirmation: true,
        message: `Category "${category}" contains ${itemsInCategory.length} item(s). Are you sure you want to remove this category? All items in it will also be removed.`,
        itemCount: itemsInCategory.length,
        items: itemsInCategory.map((item) => item.name),
      };
    }

    const updatedCategories = categories.filter((cat) => cat.toLowerCase() !== categoryName);
    const updatedItems = pantry.items.filter(
      (item) => !item.category || item.category.toLowerCase() !== categoryName
    );

    await setPantryCategories(updatedCategories);
    await setPantryItems(updatedItems);

    if (itemsInCategory.length > 0) {
      return {
        success: true,
        message: `Category "${category}" and ${itemsInCategory.length} item(s) have been removed.`,
        currentCategories: updatedCategories,
        removedItemsCount: itemsInCategory.length,
      };
    }

    return {
      success: true,
      message: `Category "${category}" has been removed.`,
      currentCategories: updatedCategories,
    };
  },
});

export const addRecipeToCalendarTool = tool({
  name: "add_recipe_to_calendar",
  description: "Add a recipe to the meal calendar for a specific day of the week",
  inputSchema: z.object({
    recipeId: z
      .string()
      .describe("ID of the recipe to add (e.g., 'recipe_pasta_001' or 'pasta_001')"),
    dayOfWeek: z
      .enum([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ])
      .describe("Day of the week to add the recipe to"),
    weekStartDate: z
      .string()
      .optional()
      .describe("ISO date string for the start of the week (Monday). If not provided, uses current week."),
  }),
  execute: async ({ recipeId, dayOfWeek, weekStartDate } = {}) => {
    if (!recipeId || !dayOfWeek) {
      return { success: false, message: "Recipe ID and day of week are required." };
    }

    const normalizedRecipeId = normalizeRecipeId(recipeId);
    const recipes = await getRecipesState();
    const recipe = recipes.find((r) => String(r.recipeId) === normalizedRecipeId);

    if (!recipe) {
      return {
        success: false,
        message: `Recipe with ID "${recipeId}" not found. Make sure the recipe is saved first.`,
      };
    }

    const recipeName = recipe.name || "Unnamed Recipe";

    const startWeek = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    };

    const weekStart = weekStartDate ? new Date(weekStartDate) : startWeek(new Date());
    const weekStartISO = weekStart.toISOString().split("T")[0];

    const mealPlan = await getMealPlanState();
    const dayKey = `${weekStartISO}_${dayOfWeek.toLowerCase()}`;

    if (!mealPlan[dayKey]) {
      mealPlan[dayKey] = [];
    }

    if (mealPlan[dayKey].some((r) => String(r.id) === normalizedRecipeId)) {
      return {
        success: false,
        message: `"${recipeName}" is already scheduled for ${dayOfWeek} of the week starting ${weekStartISO}.`,
      };
    }

    mealPlan[dayKey].push({
      id: normalizedRecipeId,
      name: recipeName,
    });

    await setMealPlanState(mealPlan);

    return {
      success: true,
      message: `"${recipeName}" has been added to ${dayOfWeek} (week of ${weekStartISO}).`,
      dayKey,
      recipeName,
    };
  },
});

export const removeRecipeFromCalendarTool = tool({
  name: "remove_recipe_from_calendar",
  description: "Remove a recipe from a specific day on the meal calendar",
  inputSchema: z.object({
    recipeId: z
      .string()
      .describe("ID of the recipe to remove (e.g., 'recipe_pasta_001' or 'pasta_001')"),
    dayOfWeek: z
      .enum([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ])
      .describe("Day of the week to remove the recipe from"),
    weekStartDate: z
      .string()
      .optional()
      .describe("ISO date string for the start of the week (Monday). If not provided, uses current week."),
  }),
  execute: async ({ recipeId, dayOfWeek, weekStartDate } = {}) => {
    if (!recipeId || !dayOfWeek) {
      return { success: false, message: "Recipe ID and day of week are required." };
    }

    const normalizedRecipeId = normalizeRecipeId(recipeId);

    const startWeek = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    };

    const weekStart = weekStartDate ? new Date(weekStartDate) : startWeek(new Date());
    const weekStartISO = weekStart.toISOString().split("T")[0];

    const mealPlan = await getMealPlanState();
    const dayKey = `${weekStartISO}_${dayOfWeek.toLowerCase()}`;

    if (!mealPlan[dayKey] || mealPlan[dayKey].length === 0) {
      return {
        success: false,
        message: `No recipes scheduled for ${dayOfWeek} (week of ${weekStartISO}).`,
      };
    }

    const recipeToRemove = mealPlan[dayKey].find(
      (r) => String(r.id) === normalizedRecipeId
    );
    if (!recipeToRemove) {
      return {
        success: false,
        message: `Recipe with ID "${recipeId}" is not scheduled for ${dayOfWeek} of that week.`,
      };
    }

    const recipeName = recipeToRemove.name || "Unnamed Recipe";
    mealPlan[dayKey] = mealPlan[dayKey].filter(
      (r) => String(r.id) !== normalizedRecipeId
    );

    if (mealPlan[dayKey].length === 0) {
      delete mealPlan[dayKey];
    }

    await setMealPlanState(mealPlan);

    return {
      success: true,
      message: `"${recipeName}" has been removed from ${dayOfWeek} (week of ${weekStartISO}).`,
      dayKey,
      recipeName,
    };
  },
});
