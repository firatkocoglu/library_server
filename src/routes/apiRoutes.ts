import {Router} from 'express';
import {authRouter} from "./authRoutes";
import {genreRouter} from "./genreRoutes";

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/genres', genreRouter)

export {apiRouter};