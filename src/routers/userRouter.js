import csurf from 'csurf';
import express from 'express';
import {
  profile,
  getEdit,
  postEdit,
  deleteUser,
  getChangePassword,
  postChangePassword,
} from '../controllers/userController';
import { authOnly, avatarUploader } from '../middlewares';

const csrf = csurf({ cookie: true });
const userRouter = express.Router();

userRouter
  .route('/edit')
  .all(authOnly, csrf)
  .get(getEdit)
  .post(avatarUploader.single('avatar'), postEdit);
userRouter
  .route('/change-password')
  .all(authOnly, csrf)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get('/delete', deleteUser);
userRouter.get('/:id(\\d+)', profile);

export default userRouter;
