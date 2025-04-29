const { Router } = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/auth.js');
const {
  getGenres,
  getGenreByID,
  createGenre,
} = require('../controllers/genres.js');

const genreRouter = Router();

genreRouter.get('/', isAuthenticated, isAdmin, getGenres);
genreRouter.get('/:id', isAuthenticated, isAdmin, getGenreByID);
genreRouter.post('/', isAuthenticated, isAdmin, createGenre);

module.exports = genreRouter;
