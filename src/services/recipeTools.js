import { tool } from "@openrouter/sdk";
import { z } from "zod";
import { useAuth } from "../global_components/AuthContext";

const PANTRY_KEY = "user_pantry_data";

// Define the get_user_pantry tool
export const getActualPantryTool = tool({
	name: "get_user_pantry",
	description: "Check the user's actual pantry inventory",
	parameters: z.object({
		userId: z.string().optional().describe("The unique identifier of the user"),
	}),
	execute: async () => {
		// will need to change to get pantry data by userID
		const { currentUser } = useAuth();
		if (!currentUser) {
			throw new Error("User not authenticated");
		}
		//getpantrydata(currentUser.id) --- IGNORE ---
		// For now, we will just return the pantry data from localStorage
		const pantryData = localStorage.getItem(PANTRY_KEY);
		if (pantryData) {
			return JSON.parse(pantryData);
		}
		return null;
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
	execute: async ({ ingredients, timeLimit }) => {
		// For demonstration, we will return some dummy recipes
		return {
			recipes: ["Pasta", "Stir Fry"],
			matchCount: 2,
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
		return { success: true };
	},
});
