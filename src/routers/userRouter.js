import csurf from 'csurf';
import express from 'express';
import { profile, getEdit, postEdit, deleteUser } from '../controllers/userController';
import { authOnly } from '../middlewares';

const csrf = csurf({ cookie: true });
const userRouter = express.Router();

userRouter.route('/edit').all(authOnly, csrf).get(getEdit).post(postEdit);
userRouter.get('/delete', deleteUser);
userRouter.get('/:id(\\d+)', profile);

export default userRouter;
