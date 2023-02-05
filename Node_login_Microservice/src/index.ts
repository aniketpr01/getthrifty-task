require('dotenv').config();
import express from "express";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import bodyParser from 'body-parser';
import axios from "axios";
import os from 'os';
const app = express();
const router = express.Router();
app.use(bodyParser.json());

// use the router as middleware
app.use(router);

// get call for hostname
router.get('/', (req, res) => {
  return res.status(200).json({ message: 'It works', hostname: os.hostname() });
});


// Connection configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysqlcontainer',
  user: process.env.DB_USER || 'aniket',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'userdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port:3306
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 8);

  try {
    // Get connection from the pool
    const connection = await pool.getConnection();
    // Insert the user into the database
    const [results] = await connection.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Get connection from the pool
    const connection = await pool.getConnection();
    // Fetch the user from the database
    const [results] = await connection.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    if (!(results instanceof Array) || !results.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = results[0] as { id: number; username: string; password: string };

    // Compare the passwords
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Create and assign a JWT
    const token = jwt.sign({ id: user.id }, 'thisissecret');
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error });
  }
});


async function getPhotos(userId: number) {
  try {
      const response = await axios.get(`http://localhost:5000/photos/${userId}`);
      return response.data.photos;
  } catch (error) {
      console.error(error);
      return [];
  }
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
