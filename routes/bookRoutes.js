const {
  getBooks,
  getBookByID,
  addBook,
  updateBook,
  deleteBook,
} = require('../controllers/books.js');
const { Router } = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/auth.js');

const bookRouter = Router();

bookRouter.get('/', getBooks);
bookRouter.get('/:id', getBookByID);
bookRouter.post('/', isAuthenticated, isAdmin, addBook);
bookRouter.patch('/:id', isAuthenticated, isAdmin, updateBook);
bookRouter.delete('/:id', isAuthenticated, isAdmin, deleteBook);

module.exports = bookRouter;
