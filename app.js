require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const morgan = require('morgan');
const { Pool } = require('pg');
const port = 3000;

app.use(morgan('dev'));

app.get('/', async (req, res) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const client = await pool.connect();
  const result = await client.query(
    'SELECT name, author, year, genre FROM books INNER JOIN genres ON books.genre_id = genres.id'
  );
  client.release();
  const { rows } = result;
  if (rows) {
    res.json(rows);
  } else {
    res.send('No books found');
  }
});

app.listen(port, () => {
  console.log(
    `Connected to Neon Database. Server is running on port ${port}. Visit http://localhost:${port}.`
  );
});
