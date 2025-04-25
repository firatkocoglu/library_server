const express = require('express');
const { connectRedis } = require('./middleware/redis.js');

const app = express();
const morgan = require('morgan');
const cors = require('cors');

const pool = require('./db.js');

const usersRouter = require('./routes/userRoutes.js');
const authRouter = require('./routes/authRoutes.js');
const bookRouter = require('./routes/bookRoutes.js');

const port = 3000;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cors());
app.use(morgan('dev'));
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/books', bookRouter);

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

connectRedis().catch((err) => {
  console.log('Redis Client Error', err);
});
