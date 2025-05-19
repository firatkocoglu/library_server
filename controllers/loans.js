const pool = require('../db.js');

const getLoans = async (req, res) => {
  const { id, isAdmin } = req.user;

  try {
    let query =
      'SELECT loans.id, users.name, users.surname, users.email, loans.loan_date, loans.return_date, books.title, books.author, books.year FROM loans INNER JOIN users ON loans.user_id = users.id INNER JOIN books ON loans.book_id = books.id';
    const values = [];
    if (!isAdmin) {
      values.push(id);
      query += ' WHERE loans.user_id = $1';
    }
    const client = await pool.connect();
    const result = await client.query(query, values);

    client.release();
    const { rows } = result;
    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({ message: 'No loans found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLoanByID = async (req, res) => {
  const { id: loanID } = req.params;
  const { id: userID, isAdmin } = req.user;

  let query =
    'SELECT loans.id, users.name, users.surname, users.email, loans.loan_date, loans.return_date, books.title, books.author, books.year FROM loans INNER JOIN users ON loans.user_id = users.id INNER JOIN books ON loans.book_id = books.id WHERE loans.id = $1';

  const values = [loanID];
  if (!isAdmin) {
    query += ' AND loans.user_id = $2';
    values.push(userID);
  }
  try {
    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();
    const { rows } = result;
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Loan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createLoan = async (req, res) => {
  const client = await pool.connect();

  const user_id = req.user.id;
  let loan_date = req.body.loan_date;
  const now = new Date();
  const turkeyOffSet = 3 * 60;
  if (!loan_date) {
    loan_date = new Date(now + turkeyOffSet * 60 * 1000);
  }
  const { book_id, return_date } = req.body;

  try {
    await client.query('BEGIN');

    const isBookAvailable = await client.query(
      'SELECT * FROM books WHERE id = $1 AND available > 0',
      [book_id]
    );

    if (
      isBookAvailable.rows.length === 0 ||
      isBookAvailable.rows[0].available <= 0
    ) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ message: 'Book is not available' });
    }

    const result = await client.query(
      'WITH inserted AS (INSERT INTO loans (user_id, book_id, loan_date, return_date) VALUES ($1,$2,$3,$4) RETURNING *) SELECT inserted.id, inserted.loan_date, inserted.return_date, users.name, users.surname, users.email, books.title from inserted INNER JOIN users ON inserted.user_id = users.id INNER JOIN books ON inserted.book_id = books.id',
      [user_id, book_id, loan_date, return_date]
    );

    const { rows } = result;
    if (rows.length > 0) {
      res.status(201).json(rows[0]);
    } else {
      res.status(400).json({ message: 'Loan creation failed' });
    }

    await client.query(
      'UPDATE books SET available = available - 1 WHERE id = $1',
      [book_id]
    );
    await client.query('COMMIT');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const updateLoan = async (req, res) => {
  const { id: bookID } = req.params;

  const { id: userID, isAdmin } = req.user;

  const fields = req.body;

  const key = Object.keys(fields);
  const values = Object.values(fields);

  if (key.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  const setClause = key
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  let query = `WITH updated AS (UPDATE loans SET ${setClause} WHERE id = $${
    values.length + 1
  }`;

  let querySecondPart =
    ' RETURNING *) SELECT updated.id, updated.loan_date, updated.return_date, users.name, users.surname, users.email, books.title from updated INNER JOIN users ON updated.user_id = users.id INNER JOIN books ON updated.book_id = books.id';

  values.push(bookID);
  if (!isAdmin) {
    query += ' AND user_id = $' + (values.length + 1);
    values.push(userID);
  }

  try {
    const client = await pool.connect();
    const result = await client.query(query + querySecondPart, values);
    client.release();
    const { rows } = result;
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Loan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteLoan = async (req, res) => {
  const { id: bookID } = req.params;
  const { id: userID, isAdmin } = req.user;

  let query = 'DELETE FROM loans WHERE id = $1';
  const values = [bookID];

  if (!isAdmin) {
    query += ' AND user_id = $2';
    values.push(userID);
  }
  try {
    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();
    const { rows } = result;
    if (rows.length > 0) {
      res.status(200).json({ message: 'Loan deleted successfully' });
    } else {
      res.status(404).json({ message: 'Loan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getLoans,
  getLoanByID,
  createLoan,
  updateLoan,
  deleteLoan,
};
