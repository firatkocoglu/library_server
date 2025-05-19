const pool = require('../db.js');

const getBooks = async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT books.id, title, author, year, genre, image_url, available FROM books INNER JOIN genres ON books.genre_id = genres.id  ORDER BY books.id ASC'
    );
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
      'SELECT books.id, title, author, year, genre, image_url, available FROM books INNER JOIN genres ON books.genre_id = genres.id WHERE books.id= $1',
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
  const { books } = req.body;

  const client = await pool.connect();

  let query = '';
  let values = [];

  if (books && Array.isArray(books) && books.length > 0) {
    query = `WITH inserted AS (INSERT INTO books (title, author, year, genre_id, available, image_url) VALUES ${books
      .map(
        (_, index) =>
          `($${index * 6 + 1}, $${index * 6 + 2}, $${index * 6 + 3}, $${
            index * 6 + 4
          }, $${index * 6 + 5}, $${index * 6 + 6})`
      )
      .join(
        ', '
      )} RETURNING *) SELECT inserted.id, inserted.title, inserted.author, inserted.year, inserted.available, inserted.image_url, genres.genre from inserted INNER JOIN genres ON inserted.genre_id = genres.id`;

    values = books.flatMap((book) => [
      book.title,
      book.author,
      book.year,
      book.genre_id,
      book.available,
      book.image_url,
    ]);
  } else {
    const { title, author, year, genre_id, image_url, available } = req.body;
    if (!title || !author || !year || !genre_id || !available) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    query =
      'WITH inserted AS (INSERT INTO books (title, author, year, genre_id, available, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *) SELECT inserted.id, inserted.title, inserted.author, inserted.year, inserted.available, inserted.image_url,  genres.genre from inserted INNER JOIN genres ON inserted.genre_id = genres.id';
    values = [title, author, year, genre_id, available, image_url];
  }

  try {
    const result = await client.query(query, values);
    const { rows } = result;
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Error adding book' });
    } else {
      return res.status(201).json(rows);
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Internal Server Error adding book' });
  } finally {
    client.release();
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
