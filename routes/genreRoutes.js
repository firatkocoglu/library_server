const { Router } = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/auth.js');
const {
  getGenres,
  getGenreByID,
  createGenre,
  updateGenre,
  deleteGenre,
} = require('../controllers/genres.js');

const genreRouter = Router();

genreRouter.get('/', isAuthenticated, getGenres);
genreRouter.get('/:id', isAuthenticated, getGenreByID);
genreRouter.post('/', isAuthenticated, isAdmin, createGenre);
genreRouter.patch('/:id', isAuthenticated, isAdmin, updateGenre);
genreRouter.delete('/:id', isAuthenticated, isAdmin, deleteGenre);

module.exports = genreRouter;
