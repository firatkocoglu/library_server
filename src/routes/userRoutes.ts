const {
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
} = require('../controllers/users.ts');
const { Router } = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/auth.ts');

const userRouter = Router();

userRouter.get('/', isAuthenticated, getUsers);
userRouter.get('/:id', isAuthenticated, getUserById);
userRouter.delete('/:id', isAdmin, deleteUser);
userRouter.patch('/:id', isAdmin, updateUser);

module.exports = userRouter;
