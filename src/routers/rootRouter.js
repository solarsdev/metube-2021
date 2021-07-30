import express from 'express';

import { login, getJoin, postJoin } from '../controllers/userController';
import { home, search } from '../controllers/videoController';

const rootRouter = express.Router();

rootRouter.get('/', home);
rootRouter.get('/search', search);
rootRouter.route('/join').get(getJoin).post(postJoin);
rootRouter.get('/login', login);

export default rootRouter;
