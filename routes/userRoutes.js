const { getUsers } = require('../controllers/users.js');
const { Router } = require('express');

const usersRouter = Router();

usersRouter.get('/', getUsers);

module.exports = usersRouter;
