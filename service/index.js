const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

const authCookieName = 'token';

app.use(express.json());
app.use(cookieParser());

app.use(express.static('public'));