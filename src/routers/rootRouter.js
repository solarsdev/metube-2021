import csurf from 'csurf';
import express from 'express';

import { getJoin, postJoin, getLogin, postLogin, logout } from '../controllers/userController';
import { home, search } from '../controllers/videoController';

const csrfProtection = csurf({ cookie: true });
const rootRouter = express.Router();

rootRouter.get('/', home);
rootRouter.get('/search', search);
rootRouter.route('/join').get(csrfProtection, getJoin).post(csrfProtection, postJoin);
rootRouter.route('/login').get(csrfProtection, getLogin).post(csrfProtection, postLogin);
rootRouter.get('/logout', logout);

export default rootRouter;
