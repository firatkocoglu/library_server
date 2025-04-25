const pool = require('../db.js');

const getBooks = async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM books ORDER BY id ASC');
    client.release();
    const { rows } = result;
    if (rows.length > 0) {
      res.json(rows);
    } else {
      res.status(404).json({ message: 'No books found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving books' });
  }
};

const getBookByID = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM books WHERE id= $1', [id]);
    client.release();
    const { rows } = result;
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'No book found with given id' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving book' });
  }
};

module.exports = { getBooks };
