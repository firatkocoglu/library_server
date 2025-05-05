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
    const result = await client.query(
      'SELECT * FROM books INNER JOIN genres ON books.genres_id=genres.id WHERE id= $1',
      [id]
    );
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

const addBook = async (req, res) => {
  const { title, author, genre_id, year, image_url } = req.body;
  if (!title || !author || !genre_id || !year) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO books (title, author, year, genre_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, author, year, genre_id, image_url]
    );
    client.release();
    const { rows } = result;
    if (rows.length > 0) {
      res.status(201).json(rows[0]);
    } else {
      res.status(400).json({ message: 'Error adding book' });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Internal Server Error adding book' });
  }
};

const updateBook = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  const keys = Object.keys(fields);
  const values = Object.values(fields);

  if (keys.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  const query = `UPDATE books SET ${setClause} WHERE id = $${
    values.length + 1
  } RETURNING *`;

  values.push(id);

  try {
    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();
    const { rows } = result;
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'No book found with given id' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating book' });
  }
};

const deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query('DELETE FROM books WHERE id = $1', [id]);
    client.release();
    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Book deleted successfully' });
    } else {
      res.status(404).json({ message: 'No book found with given id' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting book' });
  }
};

module.exports = { getBooks, getBookByID, updateBook, deleteBook, addBook };
