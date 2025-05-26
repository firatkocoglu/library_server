const pool = require('../db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../middleware/redis.js').redisClient;

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

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: user.is_admin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const logoutUser = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const isBlacklisted = await redisClient.get(token);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'User already logged out.' });
    }

    const decoded = jwt.decode(token, process.env.JWT_SECRET);

    const expiration = decoded.exp;
    const ttl = expiration - Math.floor(Date.now() / 1000);

    if (ttl > 0) {
      await redisClient.set(token, 'blacklisted', { EX: ttl });
    } else {
      return res.status(401).json({ error: 'Token already expired' });
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    });

    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error logging out user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
