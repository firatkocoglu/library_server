import {Router} from 'express';
import {genreController} from "../container";
import {isAuthenticated, isAdmin} from '../middleware/auth';

const genreRouter = Router();

genreRouter.get('/', isAuthenticated, genreController.list);
genreRouter.get('/:id', isAuthenticated, genreController.retrieve);
genreRouter.post('/', isAuthenticated, isAdmin, genreController.create);
genreRouter.patch('/:id', isAuthenticated, isAdmin, genreController.update);
genreRouter.delete('/:id', isAuthenticated, isAdmin, genreController.delete);

export {
    genreRouter
}
