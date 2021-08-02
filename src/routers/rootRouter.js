import csurf from 'csurf';
import express from 'express';

import { getJoin, postJoin, getLogin, postLogin, logout } from '../controllers/userController';
import { home, search } from '../controllers/videoController';
import { authOnly, publicOnly } from '../middlewares';

const csrf = csurf({ cookie: true });
const rootRouter = express.Router();

rootRouter.get('/', home);
rootRouter.get('/search', search);
rootRouter.route('/join').all(publicOnly, csrf).get(getJoin).post(postJoin);
rootRouter.route('/login').all(publicOnly, csrf).get(getLogin).post(postLogin);
rootRouter.get('/logout', authOnly, logout);

export default rootRouter;
