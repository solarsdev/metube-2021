import express from 'express';
import { logout, profile, edit, deleteUser } from '../controllers/userController';

const userRouter = express.Router();

userRouter.get('/logout', logout);
userRouter.get('/edit', edit);
userRouter.get('/delete', deleteUser);
userRouter.get('/:id', profile);

export default userRouter;
