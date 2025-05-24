const express = require('express');
const { connectRedis } = require('./middleware/redis.js');

const app = express();
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const pool = require('./db.js');

const usersRouter = require('./routes/userRoutes.js');
const authRouter = require('./routes/authRoutes.js');
const bookRouter = require('./routes/bookRoutes.js');
const genreRouter = require('./routes/genreRoutes.js');
const loanRouter = require('./routes/loanRoutes.js');

const port = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/books', bookRouter);
app.use('/genres', genreRouter);
app.use('/loans', loanRouter);

app.get('/', async (req, res) => {
  const client = await pool.connect();
  const result = await client.query(
    'SELECT title, author, year, genre FROM books INNER JOIN genres ON books.genre_id = genres.id'
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
