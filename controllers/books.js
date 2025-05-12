const pool = require('../db.js');

const getBooks = async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT books.id, title, author, year, genre, image_url FROM books INNER JOIN genres ON books.genre_id = genres.id  ORDER BY books.id ASC'
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
      'SELECT books.id, title, author, year, genre, image_url FROM books INNER JOIN genres ON books.genre_id = genres.id WHERE books.id= $1',
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
  if (books) {
    if (!Array.isArray(books)) {
      return res.status(400).json({ message: 'Books should be an array' });
    }

    try {
      const query = `WITH inserted AS (INSERT INTO books (title, author, year, genre_id, image_url) VALUES ${books
        .map(
          (_, index) =>
            `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${
              index * 5 + 4
            }, $${index * 5 + 5})`
        )
        .join(
          ', '
        )} RETURNING *) SELECT inserted.id, inserted.title, inserted.author, inserted.year, inserted.image_url, genres.genre from inserted INNER JOIN genres ON inserted.genre_id = genres.id`;

      const values = books.flatMap((book) => [
        book.title,
        book.author,
        book.year,
        book.genre_id,
        book.image_url,
      ]);
      const client = await pool.connect();
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
    }
  } else {
    const { title, author, year, genre_id, image_url } = req.body;
    if (!title || !author || !year || !genre_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
      const client = await pool.connect();
      const result = await client.query(
        'WITH inserted AS (INSERT INTO books (title, author, year, genre_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *) SELECT inserted.id, inserted.title, inserted.author, inserted.year, inserted.image_url, genres.genre from inserted INNER JOIN genres ON inserted.genre_id = genres.id',
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
      return res.status(500).json({ message: 'Internal Server Error' });
    }
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
