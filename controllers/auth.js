const pool = require('../db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const registerUser = async (req, res) => {
  const { email, password, name, surname } = req.body;

  try {
    if (!email || !password || !name || !surname) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const client = await pool.connect();

    const existingUser = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await client.query(
      'INSERT INTO users (email, password, name, surname) VALUES ($1, $2, $3, $4) RETURNING email, name, surname',
      [email, hashedPassword, name, surname]
    );

    return res
      .status(201)
      .json({ message: 'User registered successfully', user: newUser.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Error registering user' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
