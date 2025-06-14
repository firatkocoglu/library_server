import {Router} from 'express';
import {authRouter} from "./authRoutes";

const apiRouter = Router();

apiRouter.use('/auth', authRouter);

export {apiRouter};