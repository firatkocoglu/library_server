import {Router} from 'express';
import {genreController} from "../container";
import {isAuthenticated, isAdmin} from '../middleware/auth';

const genreRouter = Router();

genreRouter.get('/', isAuthenticated, genreController.list);
genreRouter.get('/:id', isAuthenticated, genreController.retrieve);

export {
    genreRouter
}
