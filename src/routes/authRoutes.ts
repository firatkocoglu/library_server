import {Router} from 'express';
import {AuthService} from "../services/authServices";
import {AuthController} from "../controllers/auth";
import pool from "../db";

const authRouter = Router();
const authService = new AuthService(pool);
const authController = new AuthController(authService);

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/logout', authController.logout);


export {authRouter};
