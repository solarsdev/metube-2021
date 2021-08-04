import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';
import './passport';
import { csrfMiddleware, localMiddleware, setHeaderMiddleware } from './middlewares';

import authRouter from './routers/authRooter';
import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';

const app = express();
const csrf = csurf({ cookie: true });
const isProductionEnv = process.env.NODE_ENV === 'production';

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');
app.disable('etag');

app.use(morgan('dev'));
app.use(session({ secret: 'session key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(csrf);
app.use(csrfMiddleware);
app.use(setHeaderMiddleware);
app.use(localMiddleware);
app.use('/static', express.static(isProductionEnv ? `${__dirname}/assets` : 'dist/assets'));
app.use('/', rootRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/videos', videoRouter);

export default app;
