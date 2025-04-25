const { getBooks } = require('../controllers/books.js');
const { Router } = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/auth.js');

const bookRouter = Router();

bookRouter.get('/', getBooks);

module.exports = bookRouter;
