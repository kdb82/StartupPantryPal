import { tool } from "@openrouter/sdk";
import { z } from "zod";

const PANTRY_KEY = "user_pantry_data";

// Define the get_user_pantry tool
export const getActualPantryTool = tool({
	name: "get_user_pantry",
	description: "Check the user's actual pantry inventory",
	inputSchema: z.object({}),
	execute: async () => {
		// For now, we will just return the pantry data from localStorage
		const pantryData = localStorage.getItem(PANTRY_KEY);
		if (pantryData) {
			const parsedItems = JSON.parse(pantryData);
			const flatItems = parsedItems.map((item) => {
				const qty = item.quantity ? ` (${item.quantity})` : "";
				return `${item.name}${qty}`;
			});
            console.log(flatItems);
			return {
				items: flatItems,
			};
		}
		return {
			items: [],
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
	execute: async ({ ingredients, timeLimit, servings, dietaryPreferences }) => {
		// For demonstration, we will return some dummy recipes
		const normalizeIngredient = (item) =>
			item
				.replace(/\s*\(\s*\d+\s*\)\s*$/, "")
				.trim()
				.toLowerCase();
		const normalizedIngredients = ingredients.map(normalizeIngredient);
		const hasIngredient = (name) =>
			normalizedIngredients.includes(normalizeIngredient(name));

		const buildMissingItems = (recipeIngredients) =>
			recipeIngredients.filter((item) => !hasIngredient(item));

		return {
			recipes: [
				{
					id: "recipe_pasta_001",
					name: "Garlic Chicken Pasta",
					timeMinutes: 30,
					servings: 2,
					ingredients: ["chicken", "pasta", "garlic", "olive oil", "parmesan"],
					steps: [
						"Boil pasta until al dente.",
						"Saute chicken with garlic in olive oil.",
						"Toss pasta with chicken and parmesan.",
					],
					cuisine: "Italian",
					difficulty: "easy",
					missingItems: buildMissingItems([
						"chicken",
						"pasta",
						"garlic",
						"olive oil",
						"parmesan",
					]),
				},
				{
					id: "recipe_stirfry_002",
					name: "Chicken Veggie Stir Fry",
					timeMinutes: 25,
					servings: 2,
					ingredients: ["chicken", "broccoli", "soy sauce", "garlic", "rice"],
					steps: [
						"Cook rice according to package.",
						"Stir fry chicken and broccoli with garlic.",
						"Add soy sauce and serve over rice.",
					],
					cuisine: "Asian",
					difficulty: "easy",
					missingItems: buildMissingItems([
						"chicken",
						"broccoli",
						"soy sauce",
						"garlic",
						"rice",
					]),
				},
			],
			matchCount: 2,
			criteria: {
				ingredients,
				normalizedIngredients,
				timeLimit: timeLimit || null,
				servings: servings || null,
				dietaryPreferences: dietaryPreferences || null,
			},
		};
	},
});

export const addToShoppingListTool = tool({
	name: "add_to_shopping_list",
	description: "Add missing ingredients to the user's shopping list",
	inputSchema: z.object({
		ingredients: z
			.array(z.string())
			.describe("List of ingredients to add to shopping list"),
	}),
	execute: async ({ ingredients }) => {
		// For demonstration, we will just log the ingredients
		console.log("Adding to shopping list:", ingredients);
		return {
			success: true,
			addedItems: ingredients,
			count: ingredients.length,
			message: `Added ${ingredients.length} items to shopping list`,
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
	execute: async ({recipeName, recipeId, recipeTime, recipeDescription, recipeIngredients, recipeSteps}) => {
		console.log("Saving recipe:", recipeId, recipeName);
		
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
		const missingIngredients = recipeIngredients.filter(
			ingredient => !pantryItems.includes(normalizeIngredient(ingredient))
		);
		
		const recipe = {
			recipeId,
			name: recipeName,
			time: recipeTime || null,
			description: recipeDescription || null,
			ingredients: recipeIngredients,
			missingIngredients: missingIngredients,
			steps: recipeSteps,
		}
		localStorage.setItem(`recipe_${recipeId}`, JSON.stringify(recipe));
		return {
			success: true,
			recipeId: recipeId,
			message: `Recipe "${recipeName}" saved successfully`,
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