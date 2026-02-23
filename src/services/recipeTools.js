import { tool } from '@openrouter/sdk';
import { z } from 'zod';
import { useAuth } from '../global_components/AuthContext';

const PANTRY_KEY = "user_pantry_data";

// Define the get_user_pantry tool
export const getActualPantryTool = tool({
    name: 'get_user_pantry',
    description: 'Check the user\'s actual pantry inventory',
    parameters: z.object({
        userId: z.string().optional().describe('The unique identifier of the user')
    }),
    execute: async ({ userId }) => {
        // will need to change to get pantry data by userID
        const { currentUser } = useAuth();
        if (!currentUser) {
            throw new Error("User not authenticated");
        }
        // For now, we will just return the pantry data from localStorage
        const pantryData = localStorage.getItem(PANTRY_KEY);
        if (pantryData) {
            return JSON.parse(pantryData);
        }
        return null;
    }
})