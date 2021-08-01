import cookieParser from 'cookie-parser';
import express from 'express';
import morgan from 'morgan';
import passport from 'passport';
import './passport';
import { localMiddleware } from './middlewares';

import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';

const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.disable('etag');

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(localMiddleware);
app.use(passport.initialize());
app.use('/', rootRouter);
app.use('/users', userRouter);
app.use('/videos', videoRouter);

export default app;
