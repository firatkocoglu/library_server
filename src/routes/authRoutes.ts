import {Router} from 'express';
import {authController} from "../container";

const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/logout', authController.logout);

export {authRouter};
