import cookieParser from 'cookie-parser';
import express from 'express';
import flash from 'express-flash';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';
import './passport';
import { csrfMiddleware, localMiddleware, setHeaderMiddleware } from './middlewares';

import apiRouter from './routers/apiRooter';
import authRouter from './routers/authRooter';
import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';

const app = express();
const isProductionEnv = process.env.NODE_ENV === 'production';

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');
app.disable('etag');

app.use(morgan('dev'));
app.use(session({ secret: process.env.SESSION_KEY, resave: false, saveUninitialized: false }));
app.use(flash());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(csrfMiddleware);
app.use(setHeaderMiddleware);
app.use(localMiddleware);
app.use('/static', express.static(isProductionEnv ? `${__dirname}/assets` : 'dist/assets'));
app.use('/api', apiRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/videos', videoRouter);
app.use('/', rootRouter);

export default app;
