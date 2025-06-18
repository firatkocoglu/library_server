import {Router} from 'express';
import {authRouter} from "./authRoutes";
import {genreRouter} from "./genreRoutes";
import {userRouter} from "./userRoutes";

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/genres', genreRouter)
apiRouter.use('/users', userRouter)

export {apiRouter};