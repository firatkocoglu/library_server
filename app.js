const express = require('express');

const app = express();
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const pool = require('./db.js');

const usersRouter = require('./routes/userRoutes.js');

const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/users', usersRouter);

app.get('/', async (req, res) => {
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
