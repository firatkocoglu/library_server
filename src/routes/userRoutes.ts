import {Router} from 'express';
import {userController} from '../container'
import {isAuthenticated, isAdmin} from '../middleware/auth'

const userRouter = Router();

userRouter.get('/', isAuthenticated, isAdmin, userController.list)
userRouter.get('/:id', isAuthenticated, isAdmin, userController.retrieve)
userRouter.delete('/:id', isAuthenticated, isAdmin, userController.delete)
userRouter.patch('/:id', isAuthenticated, isAdmin, userController.update)

export {userRouter};
