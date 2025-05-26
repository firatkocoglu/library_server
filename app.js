const express = require('express');
const { connectRedis } = require('./middleware/redis.js');

const app = express();
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const usersRouter = require('./routes/userRoutes.js');
const authRouter = require('./routes/authRoutes.js');
const bookRouter = require('./routes/bookRoutes.js');
const genreRouter = require('./routes/genreRoutes.js');
const loanRouter = require('./routes/loanRoutes.js');

const port = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use(helmet());

app.use(morgan('dev'));
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/books', bookRouter);
app.use('/genres', genreRouter);
app.use('/loans', loanRouter);

app.get('/', async (req, res) => {
  return res.status(200).json({
    message: 'Welcome to the Library Management System API',
    status: 'success',
  });
});

app.listen(port, () => {
  console.log(
    `Connected to Neon Database. Server is running on port ${port}. Visit http://localhost:${port}.`
  );
});

connectRedis().catch((err) => {
  console.log('Redis Client Error', err);
});
