const pool = require('../db.js');

const getUsers = async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users ORDER BY id ASC');
    client.release();
    const { rows } = result;
    if (rows) {
      res.json(rows);
    } else {
      res.send('No users found');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  getUsers,
};
