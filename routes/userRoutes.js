const { getUsers } = require('../controllers/users.js');
const { Router } = require('express');
const { isAuthenticated } = require('../middleware/auth.js');

const usersRouter = Router();

usersRouter.get('/', isAuthenticated, getUsers);

module.exports = usersRouter;
