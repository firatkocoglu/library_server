import pool from "./db";

import {AuthService} from "./services/authServices";
import {AuthController} from "./controllers/auth";

import {GenreService} from "./services/genreServices";
import {GenreController} from "./controllers/genres";


// Config auth logic
const authService = new AuthService(pool);
const authController = new AuthController(authService);

// Config genre logic
const genreService = new GenreService(pool);
const genreController = new GenreController(genreService);

export {authController, genreController};