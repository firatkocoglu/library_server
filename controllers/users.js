const pool = require('../db.js');

const getUsers = async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT email, name, surname FROM users ORDER BY id ASC'
    );
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

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT email, name, surname FROM users WHERE id = $1',
      [id]
    );
    const { rows } = result;
    if (rows) {
      res.json(rows);
    } else {
      res.send('No user found');
    }
    client.release();
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Internal Server Error');
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );
    const { rows } = result;
    if (rows.length > 0) {
      res.json({ message: 'User deleted successfully', user: rows[0] });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Internal Server Error');
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  const keys = Object.keys(fields);
  const values = Object.values(fields);

  console.log(keys, values);

  if (keys.length == 0) {
    return res.status(400).send('No fields to update');
  }

  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  values.push(id);

  const query = `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING email, name, surname`;

  try {
    const client = await pool.connect();
    const result = await client.query(query, values);
    const { rows } = result;
    if (rows.length > 0) {
      res.json({ message: 'User updated successfully', user: rows[0] });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
};
