const {
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
} = require('../controllers/users.js');
const { Router } = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/auth.js');

const usersRouter = Router();

usersRouter.get('/', isAuthenticated, getUsers);
usersRouter.get('/:id', isAuthenticated, getUserById);
usersRouter.delete('/:id', isAdmin, deleteUser);
usersRouter.patch('/:id', isAdmin, updateUser);

module.exports = usersRouter;
