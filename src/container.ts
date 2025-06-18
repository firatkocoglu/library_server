import pool from "./db";

import {AuthService} from "./services/authServices";
import {AuthController} from "./controllers/auth";

import {GenreService} from "./services/genreServices";
import {GenreController} from "./controllers/genres";

import {UserService} from "./services/userServices";
import {UserController} from "./controllers/users";


// Config auth logic
const authService = new AuthService(pool);
const authController = new AuthController(authService);

// Config genre logic
const genreService = new GenreService(pool);
const genreController = new GenreController(genreService);

// Config user logic
const userService = new UserService(pool);
const userController = new UserController(userService);

export {authController, genreController, userController};