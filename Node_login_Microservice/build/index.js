"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const promise_1 = __importDefault(require("mysql2/promise"));
const body_parser_1 = __importDefault(require("body-parser"));
const axios_1 = __importDefault(require("axios"));
const os_1 = __importDefault(require("os"));
const app = (0, express_1.default)();
const router = express_1.default.Router();
app.use(body_parser_1.default.json());
// use the router as middleware
app.use(router);
// get call for hostname
router.get('/', (req, res) => {
    return res.status(200).json({ message: 'It works', hostname: os_1.default.hostname() });
});
// Connection configuration
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'mysqlcontainer',
    user: process.env.DB_USER || 'aniket',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'userdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    port: 3306
});
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // Hash the password
    const hashedPassword = yield bcrypt_1.default.hash(password, 8);
    try {
        // Get connection from the pool
        const connection = yield pool.getConnection();
        // Insert the user into the database
        const [results] = yield connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).json({ message: 'User created successfully' });
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        // Get connection from the pool
        const connection = yield pool.getConnection();
        // Fetch the user from the database
        const [results] = yield connection.query('SELECT * FROM users WHERE username = ?', [username]);
        if (!(results instanceof Array) || !results.length) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = results[0];
        // Compare the passwords
        const valid = yield bcrypt_1.default.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        // Create and assign a JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id }, 'thisissecret');
        res.status(200).json({ message: 'Login successful', token });
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
function getPhotos(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`http://localhost:5000/photos/${userId}`);
            return response.data.photos;
        }
        catch (error) {
            console.error(error);
            return [];
        }
    });
}
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
