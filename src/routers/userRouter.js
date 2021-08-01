import express from 'express';
import { profile, edit, deleteUser } from '../controllers/userController';

const userRouter = express.Router();

userRouter.get('/edit', edit);
userRouter.get('/delete', deleteUser);
userRouter.get('/:id(\\d+)', profile);

export default userRouter;
