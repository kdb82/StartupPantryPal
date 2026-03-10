const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const express = require("express");
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

/* Pantry endpoints */
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

app.listen(port, () => {
	console.log(`Startup service running on port ${port}`);
});
