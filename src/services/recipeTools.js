import { tool } from "@openrouter/sdk";
import { z } from "zod";

const PANTRY_KEY = "user_pantry_data";
const PANTRY_CATEGORIES_KEY = "user_pantry_categories";
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
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

// Normalize ingredient names for matching (removes parenthetical content, extra spaces, case-insensitive)
function normalizeIngredientName(name) {
	if (!name) return '';
	return name
		.toLowerCase()
		.replace(/\s*\([^)]*\)/g, '') // Remove anything in parentheses
		.replace(/\s+/g, ' ') // Normalize multiple spaces to single space
		.trim();
}

// Define the get_user_pantry tool
export const getActualPantryTool = tool({
	name: "get_user_pantry",
	description: "Check the user's actual pantry inventory and available categories",
	inputSchema: z.object({}),
	execute: async () => {
		// Get pantry items
		const pantryData = localStorage.getItem(PANTRY_KEY);
		let flatItems = [];
		if (pantryData) {
			const parsedItems = JSON.parse(pantryData);
			flatItems = parsedItems.map((item) => {
				const qty = item.quantity ? ` (${item.quantity})` : "";
				return `${item.name}${qty}`;
			});
		}

		// Get categories
		const categoriesData = localStorage.getItem(PANTRY_CATEGORIES_KEY);
		let categories = [];
		if (categoriesData) {
			categories = JSON.parse(categoriesData);
		} else {
			// Default categories if none exist
			categories = ["protein", "dairy", "vegetables", "fruits", "grains", "staples", "beverages"];
		}

		console.log('Pantry items:', flatItems);
		console.log('Available categories:', categories);

		return {
			items: flatItems,
			categories: categories
		};
	},
});

export const addIngredientToPantryTool = tool({
	name: "add_ingredient_to_pantry",
	description: "Add an ingredient to the user's pantry. Requires a category from the user's available categories.",
	inputSchema: z.object({
		ingredient: z.string().describe("Ingredient name"),
		quantity: z.number().optional().describe("Quantity to add"),
		category: z.string().optional().describe("Pantry category (must be one of the user's existing categories)"),
	}),
	execute: async ({ ingredient, quantity = 1, category } = {}) => {
		if (!ingredient) {
			return { success: false, message: "Missing ingredient name." };
		}
		
		// Get available categories
		const categoriesData = localStorage.getItem(PANTRY_CATEGORIES_KEY);
		const availableCategories = categoriesData 
			? JSON.parse(categoriesData) 
			: ["protein", "dairy", "vegetables", "fruits", "grains", "staples", "beverages"];
		
		if (!category) {
			return {
				success: false,
				needsCategorySelection: true,
				message: `Which category should "${ingredient}" be added to?`,
				availableCategories: availableCategories,
				ingredient: ingredient,
				quantity: quantity
			};
		}
		
		// Validate category exists
		if (!availableCategories.includes(category)) {
			return {
				success: false,
				message: `Category "${category}" does not exist. Available categories: ${availableCategories.join(', ')}. Please choose one of these or ask the user to create a new category first.`,
				availableCategories: availableCategories
			};
		}
		
		const pantryData = localStorage.getItem(PANTRY_KEY);
		const pantryItems = pantryData ? JSON.parse(pantryData) : [];
		const existing = pantryItems.find(
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
			category,
			checked: false,
			addedAt: new Date().toISOString(),
			addedBy: "currentUser",
		};

		pantryItems.push(newItem);
		localStorage.setItem(PANTRY_KEY, JSON.stringify(pantryItems));
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
		const pantryData = localStorage.getItem(PANTRY_KEY);
		const pantryItems = pantryData ? JSON.parse(pantryData) : [];
		const exists = pantryItems.some(
			(item) => normalizeIngredientName(item.name) === normalizeIngredientName(ingredient)
		);

		if (!exists) {
			return {
				success: false,
				message: `"${ingredient}" is not in the pantry, so it cannot be removed.`,
			};
		}

		const updatedItems = pantryItems.filter(
			(item) => normalizeIngredientName(item.name) !== normalizeIngredientName(ingredient)
		);
		localStorage.setItem(PANTRY_KEY, JSON.stringify(updatedItems));
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
		// Normalize ingredients for matching
		const normalizeIngredient = (item) =>
			item
				.replace(/\s*\(\s*\d+\s*\)\s*$/, "")
				.trim()
				.toLowerCase();
		const normalizedIngredients = Array.isArray(ingredients)
			? ingredients.map(normalizeIngredient)
			: [];
		const hasIngredient = (name) =>
			normalizedIngredients.includes(normalizeIngredient(name));

		const buildMissingItems = (recipeIngredients) =>
			recipeIngredients.filter((item) => !hasIngredient(item));

		// Build the prompt for AI recipe generation
		let prompt = `Generate 2-3 recipes that can be made with these ingredients: ${ingredients.join(', ')}.

Requirements:
- Try to use as many of the provided ingredients as possible
- Each recipe should be realistic and practical${timeLimit ? `\n- Cooking time should be ${timeLimit} minutes or less` : ''}${servings ? `\n- Should serve ${servings} people` : ''}${dietaryPreferences ? `\n- Must follow ${dietaryPreferences} dietary restrictions` : ''}

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "recipes": [
    {
      "id": "unique_lowercase_id",
      "name": "Recipe Name",
      "timeMinutes": 30,
      "servings": 2,
      "ingredients": ["ingredient1", "ingredient2", "etc"],
      "steps": ["step 1", "step 2", "step 3"],
      "cuisine": "cuisine type",
      "difficulty": "easy/medium/hard"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no other text.`;

		try {
			// Get API key
			const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
			if (!apiKey) {
				console.error('VITE_OPENROUTER_API_KEY is not defined!');
				throw new Error('API key not configured');
			}

			// Call OpenRouter API
			const response = await fetch(OPENROUTER_URL, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
					'HTTP-Referer': 'https://startup.pantrypal.click',
					'X-Title': 'PantryPal'
				},
				body: JSON.stringify({
					model: 'openrouter/auto',
					messages: [
						{
							role: 'system',
							content: 'You are a helpful recipe generator. You always return valid JSON objects without markdown formatting.'
						},
						{
							role: 'user',
							content: prompt
						}
					],
					temperature: 0.8,
					max_tokens: 2000
				})
			});

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const data = await response.json();
			const aiResponse = data.choices?.[0]?.message?.content;

			if (!aiResponse) {
				throw new Error('No response from AI');
			}

			// Parse the AI response - remove any markdown code blocks if present
			let cleanedResponse = aiResponse.trim();
			if (cleanedResponse.startsWith('```')) {
				cleanedResponse = cleanedResponse.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
			}

			const parsedRecipes = JSON.parse(cleanedResponse);

			// Process recipes and add missing items
			const processedRecipes = parsedRecipes.recipes.map((recipe, index) => {
				const recipeId = recipe.id || `generated_${Date.now()}_${index}`;
				const processedRecipe = {
					id: recipeId,
					name: recipe.name || 'Unnamed Recipe',
					timeMinutes: recipe.timeMinutes || 30,
					servings: recipe.servings || servings || 2,
					ingredients: recipe.ingredients || [],
					steps: recipe.steps || [],
					cuisine: recipe.cuisine || 'Various',
					difficulty: recipe.difficulty || 'medium',
					missingItems: buildMissingItems(recipe.ingredients || [])
				};
				
				// Cache the recipe
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
			console.error('Error generating recipes:', error);
			
			// Fallback to simple dummy recipes if AI generation fails
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
						"Season to taste and serve."
					],
					cuisine: "Various",
					difficulty: "easy",
					missingItems: []
				}
			];

			fallbackRecipes.forEach(recipe => cacheSearchResult(recipe));

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
				error: "AI generation failed, showing simplified fallback recipe"
			};
		}
	},
});

export const addToShoppingListTool = tool({
	name: "add_to_shopping_list",
	description: "Add missing ingredients to the user's shopping list",
	inputSchema: z.object({
		items: z
			.array(z.string())
			.describe("List of ingredients to add to shopping list"),
		recipeName: z
			.string()
			.optional()
			.describe("Name of recipe these ingredients are for"),
	}),
	execute: async ({ items = [], recipeName = "Recipe" } = {}) => {
		const SHOPPING_LIST_KEY = "shopping_list_items";
		
		// Get existing shopping list
		let shoppingList = [];
		const storedList = localStorage.getItem(SHOPPING_LIST_KEY);
		if (storedList) {
			try {
				shoppingList = JSON.parse(storedList);
			} catch (error) {
				console.error("Error parsing shopping list:", error);
			}
		}

		// Add new ingredients (avoid duplicates)
		const addedIngredients = [];
		const alreadyOnList = [];
		(items || []).forEach(ingredient => {
			const exists = shoppingList.find(
				item => normalizeIngredientName(item.name) === normalizeIngredientName(ingredient)
			);
			
			if (!exists) {
				shoppingList.push({
					id: `recipe_${Date.now()}_${Math.random()}`,
					name: ingredient,
					checked: false,
					neededFor: [recipeName]
				});
				addedIngredients.push(ingredient);
			} else {
				alreadyOnList.push(ingredient);
			}
		});

		// Save to localStorage
		localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(shoppingList));

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
	description: "Remove specific ingredient items from the user's shopping list by name. You MUST provide the ingredient names to remove.",
	inputSchema: z.object({
		items: z
			.array(z.string())
			.describe("Array of ingredient names to remove (e.g., ['paprika', 'milk']). This is REQUIRED."),
	}),
	execute: async ({ items = [] } = {}) => {
		const SHOPPING_LIST_KEY = "shopping_list_items";
		const storedList = localStorage.getItem(SHOPPING_LIST_KEY);
		let shoppingList = [];
		if (storedList) {
			try {
				shoppingList = JSON.parse(storedList);
			} catch (error) {
				console.error("Error parsing shopping list:", error);
				return {
					success: false,
					message: "Failed to parse shopping list",
					removedItems: [],
					count: 0
				};
			}
		}

		if (!items || items.length === 0) {
			return {
				success: false,
				message: "No ingredient names provided. You must specify which items to remove by name.",
				removedItems: [],
				count: 0
			};
		}

		console.log('Removing from shopping list:', items);
		console.log('Current shopping list:', shoppingList.map(i => i.name));

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

		console.log('Items removed:', removedItems);
		console.log('Shopping list after removal:', shoppingList.map(i => i.name));

		localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(shoppingList));

		return {
			success: removedItems.length > 0,
			removedItems,
			count: removedItems.length,
			message: removedItems.length > 0 
				? `Successfully removed ${removedItems.length} item(s): ${removedItems.join(', ')}`
				: `No matching items found to remove. Looking for: ${itemsToRemove.join(', ')}`
		};
	},
});

export const getShoppingListTool = tool({
	name: "get_shopping_list",
	description: "Retrieve the user's current shopping list",
	inputSchema: z.object({}),
	execute: async () => {
		const SHOPPING_LIST_KEY = "shopping_list_items";
		const storedList = localStorage.getItem(SHOPPING_LIST_KEY);
		let shoppingList = [];
		if (storedList) {
			try {
				shoppingList = JSON.parse(storedList);
			} catch (error) {
				console.error("Error parsing shopping list:", error);
			}
		}

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
		recipeDescription: z.string().optional().describe("Description of the recipe to save"),
		recipeIngredients: z.array(z.string()).describe("List of ingredients in the recipe"),
		recipeSteps: z.array(z.string()).describe("List of steps to prepare the recipe"),
	}),
	execute: async ({
		recipeName,
		recipeId,
		recipeTime,
		recipeDescription,
		recipeIngredients = [],
		recipeSteps = []
	} = {}) => {
		const resolvedCache = getCachedRecipe(recipeId);
		const resolvedName = recipeName || resolvedCache?.name || "Saved Recipe";
		const resolvedTime = recipeTime ?? resolvedCache?.timeMinutes ?? null;
		const resolvedDescription = recipeDescription ?? resolvedCache?.description ?? null;
		const resolvedIngredients = Array.isArray(recipeIngredients) && recipeIngredients.length > 0
			? recipeIngredients
			: (resolvedCache?.ingredients || []);
		const resolvedSteps = Array.isArray(recipeSteps) && recipeSteps.length > 0
			? recipeSteps
			: (resolvedCache?.steps || []);

		if (!recipeId) {
			return {
				success: false,
				message: "Missing recipeId for save_recipe.",
			};
		}
		
		// Normalize recipe ID - remove 'recipe_' prefix if it exists to avoid double-prefixing
		const normalizedRecipeId = recipeId.startsWith('recipe_') 
			? recipeId.substring(7) 
			: recipeId;
		
		console.log("Saving recipe:", normalizedRecipeId, resolvedName);
		
		// Get user's pantry and calculate missing ingredients
		const normalizeIngredient = (item) =>
			item
				.replace(/\s*\(\s*\d+\s*\)\s*$/, "")
				.trim()
				.toLowerCase();
		
		// Get pantry items
		const pantryData = localStorage.getItem("user_pantry_data");
		let pantryItems = [];
		if (pantryData) {
			const parsedItems = JSON.parse(pantryData);
			pantryItems = parsedItems.map(item => normalizeIngredient(item.name));
		}
		
		// Calculate missing ingredients
		const missingIngredients = Array.isArray(resolvedIngredients)
			? resolvedIngredients.filter(
				ingredient => !pantryItems.includes(normalizeIngredient(ingredient))
			)
			: [];
		
		const recipe = {
			recipeId: normalizedRecipeId,
			name: resolvedName,
			time: resolvedTime,
			description: resolvedDescription,
			ingredients: resolvedIngredients,
			missingIngredients: missingIngredients,
			steps: resolvedSteps,
		}
		localStorage.setItem(`recipe_${normalizedRecipeId}`, JSON.stringify(recipe));
		return {
			success: true,
			recipeId: normalizedRecipeId,
			message: `Recipe "${resolvedName}" saved successfully`,
		};
	},
});


export const getRecipesTool = tool({
    name: "get_user_recipes",
    description: "Retrieve all of the user's saved recipes",
    inputSchema: z.object({}),
    execute: async () => {
        const recipes = [];
        // Loop through all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Check if this key is a recipe (starts with "recipe_")
            if (key && key.startsWith("recipe_")) {
                const recipeData = localStorage.getItem(key);
                if (recipeData) {
                    recipes.push(JSON.parse(recipeData));
                }
            }
        }
        return {
            success: true,
            count: recipes.length,
            recipes: recipes,
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
        
        // Get current categories
        const categoriesData = localStorage.getItem(PANTRY_CATEGORIES_KEY);
        const categories = categoriesData 
            ? JSON.parse(categoriesData) 
            : ["protein", "dairy", "vegetables", "fruits", "grains", "staples", "beverages"];
        
        // Check if category already exists
        if (categories.some(cat => cat.toLowerCase() === categoryName)) {
            return {
                success: false,
                message: `Category "${category}" already exists.`,
                currentCategories: categories,
            };
        }
        
        // Add the new category
        categories.push(categoryName);
        localStorage.setItem(PANTRY_CATEGORIES_KEY, JSON.stringify(categories));
        
        return {
            success: true,
            message: `Category "${categoryName}" has been added.`,
            currentCategories: categories,
        };
    },
});

export const removeCategoryFromPantryTool = tool({
    name: "remove_category_from_pantry",
    description: "Remove a category from the pantry. If the category has items, user confirmation is required.",
    inputSchema: z.object({
        category: z.string().describe("Name of the category to remove"),
        confirmed: z.boolean().optional().describe("Set to true if user has confirmed removal of category with items"),
    }),
    execute: async ({ category, confirmed = false } = {}) => {
        if (!category || !category.trim()) {
            return { success: false, message: "Category name is required." };
        }
        
        const categoryName = category.trim().toLowerCase();
        
        // Get current categories
        const categoriesData = localStorage.getItem(PANTRY_CATEGORIES_KEY);
        const categories = categoriesData 
            ? JSON.parse(categoriesData) 
            : ["protein", "dairy", "vegetables", "fruits", "grains", "staples", "beverages"];
        
        // Check if category exists
        if (!categories.some(cat => cat.toLowerCase() === categoryName)) {
            return {
                success: false,
                message: `Category "${category}" does not exist.`,
                currentCategories: categories,
            };
        }
        
        // Get pantry items
        const pantryData = localStorage.getItem(PANTRY_KEY);
        const pantryItems = pantryData ? JSON.parse(pantryData) : [];
        
        // Check if category has items
        const itemsInCategory = pantryItems.filter(
            item => item.category && item.category.toLowerCase() === categoryName
        );
        
        if (itemsInCategory.length > 0 && !confirmed) {
            return {
                success: false,
                needsConfirmation: true,
                message: `Category "${category}" contains ${itemsInCategory.length} item(s). Are you sure you want to remove this category? All items in it will also be removed.`,
                itemCount: itemsInCategory.length,
                items: itemsInCategory.map(item => item.name),
            };
        }
        
        // Remove category
        const updatedCategories = categories.filter(cat => cat.toLowerCase() !== categoryName);
        localStorage.setItem(PANTRY_CATEGORIES_KEY, JSON.stringify(updatedCategories));
        
        // Remove all items in this category
        if (itemsInCategory.length > 0) {
            const updatedItems = pantryItems.filter(
                item => !item.category || item.category.toLowerCase() !== categoryName
            );
            localStorage.setItem(PANTRY_KEY, JSON.stringify(updatedItems));
            
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
        recipeId: z.string().describe("ID of the recipe to add (e.g., 'recipe_pasta_001' or 'pasta_001')"),
        dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).describe("Day of the week to add the recipe to"),
        weekStartDate: z.string().optional().describe("ISO date string for the start of the week (Monday). If not provided, uses current week.")
    }),
    execute: async ({ recipeId, dayOfWeek, weekStartDate } = {}) => {
        if (!recipeId || !dayOfWeek) {
            return { success: false, message: "Recipe ID and day of week are required." };
        }
        
        // Normalize recipe ID (add 'recipe_' prefix if missing)
        const normalizedRecipeId = recipeId.startsWith('recipe_') ? recipeId : `recipe_${recipeId}`;
        
        // Check if recipe exists
        const recipeData = localStorage.getItem(normalizedRecipeId);
        if (!recipeData) {
            return {
                success: false,
                message: `Recipe with ID "${recipeId}" not found. Make sure the recipe is saved first.`
            };
        }
        
        let recipe;
        try {
            recipe = JSON.parse(recipeData);
        } catch (error) {
            return {
                success: false,
                message: `Error reading recipe data for "${recipeId}".`
            };
        }
        
        const recipeName = recipe.name || recipe.recipeName || "Unnamed Recipe";
        
        // Calculate week start date (Monday)
        const startOfWeek = (date) => {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(d.setDate(diff));
        };
        
        const weekStart = weekStartDate ? new Date(weekStartDate) : startOfWeek(new Date());
        const weekStartISO = weekStart.toISOString().split('T')[0];
        
        // Load meal plan
        const MEAL_PLAN_KEY = "meal_plan_data";
        const mealPlanData = localStorage.getItem(MEAL_PLAN_KEY);
        const mealPlan = mealPlanData ? JSON.parse(mealPlanData) : {};
        
        // Create key for this day
        const dayKey = `${weekStartISO}_${dayOfWeek.toLowerCase()}`;
        
        // Initialize array if needed
        if (!mealPlan[dayKey]) {
            mealPlan[dayKey] = [];
        }
        
        // Check if recipe already exists for this day
        if (mealPlan[dayKey].some(r => r.id === normalizedRecipeId)) {
            return {
                success: false,
                message: `"${recipeName}" is already scheduled for ${dayOfWeek} of the week starting ${weekStartISO}.`
            };
        }
        
        // Add recipe
        mealPlan[dayKey].push({
            id: normalizedRecipeId,
            name: recipeName
        });
        
        // Save meal plan
        localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(mealPlan));
        
        return {
            success: true,
            message: `"${recipeName}" has been added to ${dayOfWeek} (week of ${weekStartISO}).`,
            dayKey: dayKey,
            recipeName: recipeName
        };
    },
});

export const removeRecipeFromCalendarTool = tool({
    name: "remove_recipe_from_calendar",
    description: "Remove a recipe from a specific day on the meal calendar",
    inputSchema: z.object({
        recipeId: z.string().describe("ID of the recipe to remove (e.g., 'recipe_pasta_001' or 'pasta_001')"),
        dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).describe("Day of the week to remove the recipe from"),
        weekStartDate: z.string().optional().describe("ISO date string for the start of the week (Monday). If not provided, uses current week.")
    }),
    execute: async ({ recipeId, dayOfWeek, weekStartDate } = {}) => {
        if (!recipeId || !dayOfWeek) {
            return { success: false, message: "Recipe ID and day of week are required." };
        }
        
        // Normalize recipe ID (add 'recipe_' prefix if missing)
        const normalizedRecipeId = recipeId.startsWith('recipe_') ? recipeId : `recipe_${recipeId}`;
        
        // Calculate week start date (Monday)
        const startOfWeek = (date) => {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(d.setDate(diff));
        };
        
        const weekStart = weekStartDate ? new Date(weekStartDate) : startOfWeek(new Date());
        const weekStartISO = weekStart.toISOString().split('T')[0];
        
        // Load meal plan
        const MEAL_PLAN_KEY = "meal_plan_data";
        const mealPlanData = localStorage.getItem(MEAL_PLAN_KEY);
        const mealPlan = mealPlanData ? JSON.parse(mealPlanData) : {};
        
        // Create key for this day
        const dayKey = `${weekStartISO}_${dayOfWeek.toLowerCase()}`;
        
        // Check if day has any recipes
        if (!mealPlan[dayKey] || mealPlan[dayKey].length === 0) {
            return {
                success: false,
                message: `No recipes scheduled for ${dayOfWeek} (week of ${weekStartISO}).`
            };
        }
        
        // Find the recipe to get its name for confirmation message
        const recipeToRemove = mealPlan[dayKey].find(r => r.id === normalizedRecipeId);
        if (!recipeToRemove) {
            return {
                success: false,
                message: `Recipe with ID "${recipeId}" is not scheduled for ${dayOfWeek} of that week.`
            };
        }
        
        const recipeName = recipeToRemove.name || "Unnamed Recipe";
        
        // Remove the recipe
        mealPlan[dayKey] = mealPlan[dayKey].filter(r => r.id !== normalizedRecipeId);
        
        // Clean up empty day entries
        if (mealPlan[dayKey].length === 0) {
            delete mealPlan[dayKey];
        }
        
        // Save meal plan
        localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(mealPlan));
        
        return {
            success: true,
            message: `"${recipeName}" has been removed from ${dayOfWeek} (week of ${weekStartISO}).`,
            dayKey: dayKey,
            recipeName: recipeName
        };
    },
});