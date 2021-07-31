import { getSessionStore } from './db';
import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import { localMiddleware, sessionMiddleware } from './middlewares';

import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';

const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(express.urlencoded());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 3600000 * 24 * 14 },
    resave: false,
    saveUninitialized: false,
    store: getSessionStore(),
  }),
);
app.use(localMiddleware);
app.use('/', rootRouter);
app.use('/users', userRouter);
app.use('/videos', videoRouter);

export default app;
