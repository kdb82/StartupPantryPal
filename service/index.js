const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const { set } = require('zod');
const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

const authCookieName = 'token';
const users = [];
const userSessions = new Map();
const currentUser = {
    userName: '',
    passwordHash: '',
    token: ''
}

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

function setAuthUser(req, res, next) {
    const authToken = req.cookies[authCookieName];

    if (authToken) {
        const userId = userSessions.get(authToken);
        if (userId) {
            req.user = users.find(u => u.id === userId);
        }
    }
    next();
}

function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    next();
}

function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

app.postI('/api/auth/register', async(req, res) => {
    const { email, userName, password } = req.body;

    if(!email || !userName || !password) {
        return res.status(400).send({ message: 'Email, username and password are required' });
    }

    if (users.find(u => u.email === email)) {
        return res.status(400).send({ message: 'Email already exists' });
    }

    if (users.find(u => u.userName === userName)) {
        return res.status(400).send({ message: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
        id: uuid.v4(),
        email,
        userName,
        passwordHash
    };

    users.push(user);
    const authToken = uuid.v4();
    userSessions.set(authToken, user.id);

    setAuthCookie(res, authToken);

app.post('/api/auth/login', async(req, res) => {
    const { userName, password } = req.body;

    if (!user) {
        return res.status(401).send({ message: 'Invalid username or password' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
        return res.status(401).send({ message: 'Invalid username or password' });
    }

    setAuthCookie(res, user);
    res.status(200).send({ message: 'Login successful' });
});




app.listen(port, () => {
    console.log(`Startup service running on port ${port}`);
});