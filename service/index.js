const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const express = require("express");
const path = require("path");
const uuid = require("uuid");
const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

const authCookieName = "token";
const users = [];
const userSessions = new Map();

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

function setAuthUser(req, res, next) {
	const authToken = req.cookies[authCookieName];

	if (authToken) {
		const userId = userSessions.get(authToken);
		if (userId) {
			req.user = users.find((u) => u.id === userId);
		}
	}
	next();
}

app.use(setAuthUser);

function requireAuth(req, res, next) {
	if (!req.user) {
		return res.status(401).send({ message: "Unauthorized" });
	}
	next();
}

function setAuthCookie(res, token) {
	res.cookie(authCookieName, token, {
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "strict",
	});
}

app.post("/api/auth/register", async (req, res) => {
	const { email, username, password } = req.body;

	if (!email || !username || !password) {
		return res
			.status(400)
			.send({ message: "Email, username and password are required" });
	}

	if (users.find((u) => u.email === email)) {
		return res.status(400).send({ message: "Email already exists" });
	}

	if (users.find((u) => u.username === username)) {
		return res.status(400).send({ message: "Username already exists" });
	}

	const passwordHash = await bcrypt.hash(password, 10);

	const user = {
		id: uuid.v4(),
		email,
		username,
		passwordHash,
	};

	users.push(user);
	const authToken = uuid.v4();
	userSessions.set(authToken, user.id);

	setAuthCookie(res, authToken);
	res
		.status(201)
		.send({ id: user.id, email: user.email, username: user.username });
});

app.post("/api/auth/login", async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res
			.status(400)
			.send({ message: "Username and password are required" });
	}

	const user = users.find((u) => u.username === username);

	if (!user) {
		return res.status(401).send({ message: "Invalid username or password" });
	}

	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
	if (!isPasswordValid) {
		return res.status(401).send({ message: "Invalid username or password" });
	}

	const authToken = uuid.v4();
	userSessions.set(authToken, user.id);

	setAuthCookie(res, authToken);
	res
		.status(200)
		.send({ id: user.id, email: user.email, username: user.username });
});

app.delete("/api/auth/logout", (req, res) => {
    const authToken = req.cookies[authCookieName];

    if (authToken) {
        userSessions.delete(authToken);
    }
    res.clearCookie(authCookieName);
    res.status(200).send({ message: "Logged out successfully" });
});

app.get("/api/auth/session", (req, res) => {
	if (!req.user) {
		return res.send({ authenticated: false });
	}

	res.send({
		authenticated: true,
		user: {
			id: req.user.id,
			email: req.user.email,
			username: req.user.username,
		},
	});
});

app.get("/api/user/me", requireAuth, (req, res) => {
    res.send({
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
    });
});

/* -----------Pantry endpoints --------------*/

const defaultCategories = [
    "protein",
    "vegetables",
    "fruits",
    "grains",
    "dairy",
    "staples",
    "other"
]

const userPantryData = new Map(); //userId -> { items, categories }

function getOrCreatePantry(userId) {
    if (!userPantryData.has(userId)) {
        userPantryData.set(userId, {
             items: [],
             categories: [...defaultCategories]
     });
    }
    return userPantryData.get(userId);
}

app.get("/api/pantry", requireAuth, (req, res) => {
    const pantry = getOrCreatePantry(req.user.id);
    res.send(pantry);
});

app.put("/api/pantry", requireAuth, (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) {
        return res.status(400).send({ message: "Items must be an array" });
    }
    const pantry = getOrCreatePantry(req.user.id);
    pantry.items = items;
    res.send(pantry);
});

app.put("/api/pantry/categories", requireAuth, (req, res) => {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
        return res.status(400).send({ message: "Categories must be an array" });
    }
    const normalized = [...new Set(
        categories
		.map((c) => String(c).trim().toLowerCase())
        .filter(Boolean)
    )];

    const pantry = getOrCreatePantry(req.user.id);
    pantry.categories = normalized;
    res.send(pantry);
});

/* -----------Recipe endpoints --------------*/
const userRecipeData = new Map(); //userId -> [ recipes ]
const userShoppingListData = new Map(); //userId -> [ shopping list items ]
const userMealPlanData = new Map();

function getOrCreateUserData(store, userId, defaultValue) {
    if (!store.has(userId)) {
        store.set(userId, defaultValue);
    }
    return store.get(userId);
}

app.get("/api/recipes", requireAuth, (req, res) => {
    const recipes = getOrCreateUserData(userRecipeData, req.user.id, []);
    res.send(recipes);
});

app.post("/api/recipes", requireAuth, (req, res) => {
	const {
		recipeId,
		recipeName,
		recipeTime,
		recipeDescription,
		recipeIngredients,
		recipeSteps,
	} = req.body || {};

	if (!recipeId || !recipeName) {
		return res.status(400).send({ message: "recipeId and recipeName are required" });
	}

	const recipes = getOrCreateUserData(userRecipeData, req.user.id, []);
	const normalizedId = String(recipeId);
	const existingIndex = recipes.findIndex((r) => String(r.recipeId) === normalizedId);

	const recipe = {
		recipeId: normalizedId,
		name: String(recipeName),
		time: recipeTime ?? null,
		description: recipeDescription ?? "",
		ingredients: Array.isArray(recipeIngredients) ? recipeIngredients : [],
		steps: Array.isArray(recipeSteps) ? recipeSteps : [],
		savedAt: new Date().toISOString(),
	};

	if (existingIndex >= 0) {
		recipes[existingIndex] = { ...recipes[existingIndex], ...recipe };
	} else {
		recipes.push(recipe);
	}

	res.status(201).send({ recipe });
});

app.delete("/api/recipes/:id", requireAuth, (req, res) => {
	const { id } = req.params;
	const recipes = getOrCreateUserData(userRecipeData, req.user.id, []);
	const originalLength = recipes.length;
	const filtered = recipes.filter((r) => String(r.recipeId) !== String(id));

	userRecipeData.set(req.user.id, filtered);

	if (filtered.length === originalLength) {
		return res.status(404).send({ message: "Recipe not found" });
	}

	res.send({ message: "Recipe deleted" });
});

app.get("/api/shopping-list", requireAuth, (req, res) => {
	const items = getOrCreateUserData(userShoppingListData, req.user.id, []);
	res.send({ items });
});

app.put("/api/shopping-list", requireAuth, (req, res) => {
	const { items } = req.body || {};
	if (!Array.isArray(items)) {
		return res.status(400).send({ message: "items must be an array" });
	}

	userShoppingListData.set(req.user.id, items);
	res.send({ items });
});

app.get("/api/meal-plan", requireAuth, (req, res) => {
	const plan = getOrCreateUserData(userMealPlanData, req.user.id, {});
	res.send({ plan });
});

app.put("/api/meal-plan", requireAuth, (req, res) => {
	const { plan } = req.body || {};
	if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
		return res.status(400).send({ message: "plan must be an object" });
	}

	userMealPlanData.set(req.user.id, plan);
	res.send({ plan });
});

const friendActivity = [
	{
		id: "activity_1",
		message: 'Sarah saved "Garlic Pasta" to their recipes',
		timestamp: "10:24:00 AM",
	},
	{
		id: "activity_2",
		message: 'Mike saved "Chicken Salad" to their recipes',
		timestamp: "11:10:00 AM",
	},
	{
		id: "activity_3",
		message: 'Emma saved "Salmon Teriyaki" to their recipes',
		timestamp: "1:42:00 PM",
	},
];

const friendRecipes = [
	{
		recipeId: "friend_1",
		name: "Garlic Pasta",
		description: "Creamy garlic pasta with fresh herbs",
		ingredients: ["garlic", "pasta", "olive oil", "parmesan", "basil"],
		steps: [
			"Boil the pasta until al dente.",
			"Saute garlic in olive oil until fragrant.",
			"Toss pasta with the garlic oil, parmesan, and basil.",
		],
		sharedBy: "Sarah",
		time: 25,
	},
	{
		recipeId: "friend_2",
		name: "Chicken Salad",
		description: "Fresh greens with grilled chicken and a light vinaigrette",
		ingredients: ["chicken breast", "mixed greens", "tomatoes", "cucumber", "vinaigrette"],
		steps: [
			"Season and grill the chicken breast.",
			"Chop the vegetables and add them to a bowl.",
			"Slice the chicken and serve over the greens with vinaigrette.",
		],
		sharedBy: "Mike",
		time: 30,
	},
	{
		recipeId: "friend_3",
		name: "Salmon Teriyaki",
		description: "Glazed salmon with teriyaki sauce and rice",
		ingredients: ["salmon", "teriyaki sauce", "rice", "broccoli", "sesame seeds"],
		steps: [
			"Cook the rice according to package directions.",
			"Bake or pan-sear the salmon and brush with teriyaki sauce.",
			"Steam the broccoli and plate with the salmon and rice.",
		],
		sharedBy: "Emma",
		time: 35,
	},
];

app.get("/api/friends/activity", requireAuth, (req, res) => {
	res.send({ items: friendActivity });
});

app.get("/api/friends/recipes", requireAuth, (req, res) => {
	res.send({ items: friendRecipes });
});

// SPA fallback for client-side routes (e.g. /recipes, /pantry)
app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => {
	return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
	console.log(`Startup service running on port ${port}`);
});
