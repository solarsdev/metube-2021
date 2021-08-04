import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import express from 'express';
import morgan from 'morgan';
import passport from 'passport';
import path from 'path';
import './passport';
import { csrfMiddleware, localMiddleware, setHeaderMiddleware } from './middlewares';

import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';

const app = express();
const csrf = csurf({ cookie: true });

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');
app.disable('etag');

app.use(morgan('dev'));
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(csrf);
app.use(csrfMiddleware);
app.use(setHeaderMiddleware);
app.use(localMiddleware);
app.use('/static', express.static(`${__dirname}/assets`));
app.use('/', rootRouter);
app.use('/users', userRouter);
app.use('/videos', videoRouter);

export default app;
