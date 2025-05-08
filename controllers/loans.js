const pool = require('../db.js');

const getLoans = async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT loans.id, users.name, users.surname, users.email, loans.loan_date, loans.return_date, books.title, books.author, books.year FROM loans INNER JOIN users ON loans.user_id = users.id INNER JOIN books ON loans.book_id = books.id'
    );
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
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT loans.id, users.name, users.surname, users.email, loans.loan_date, loans.return_date, books.title, books.author, books.year FROM loans INNER JOIN users ON loans.user_id = users.id INNER JOIN books ON loans.book_id = books.id WHERE loans.id = $1',
      [id]
    );
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
  const user_id = req.user.id;
  let loan_date = req.body.loan_date;
  const now = new Date();
  const turkeyOffSet = 3 * 60;
  if (!loan_date) {
    loan_date = new Date(now + turkeyOffSet * 60 * 1000);
  }
  const { book_id, return_date } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'WITH inserted AS (INSERT INTO loans (user_id, book_id, loan_date, return_date) VALUES ($1,$2,$3,$4) RETURNING *) SELECT inserted.id, inserted.loan_date, inserted.return_date, users.name, users.surname, users.email, books.title from inserted INNER JOIN users ON inserted.user_id = users.id INNER JOIN books ON inserted.book_id = books.id',
      [user_id, book_id, loan_date, return_date]
    );
    client.release();
    const { rows } = result;
    if (rows.length > 0) { 
      res.status(201).json(rows[0]);
    } else {
      res.status(400).json({ message: 'Loan creation failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateLoan = async (req, res) => {
  const { id } = req.params;

  const fields = req.body;

  const key = Object.keys(fields);
  const values = Object.values(fields);

  if (key.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  const setClause = key
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  const query = `UPDATE loans SET ${setClause} WHERE id = $${
    values.length + 1
  }`;

  return 'Fro';
};

module.exports = {
  getLoans,
  getLoanByID,
  createLoan,
  updateLoan,
};
