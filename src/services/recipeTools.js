import { tool } from "@openrouter/sdk";
import { z } from "zod";

const PANTRY_KEY = "user_pantry_data";

// Define the get_user_pantry tool
export const getActualPantryTool = tool({
	name: "get_user_pantry",
	description: "Check the user's actual pantry inventory",
	inputSchema: z.object({
		userId: z.string().optional().describe("The unique identifier of the user"),
	}),
	execute: async ({ userId }) => {
		// For now, we will just return the pantry data from localStorage
		const pantryData = localStorage.getItem(PANTRY_KEY);
		if (pantryData) {
			const parsedItems = JSON.parse(pantryData);
			const flatItems = parsedItems.map((item) => {
				const qty = item.quantity ? ` (${item.quantity})` : "";
				return `${item.name}${qty}`;
			});
			return {
				userId: userId || "anonymous",
				items: flatItems,
			};
		}
		return {
			userId: userId || "anonymous",
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
