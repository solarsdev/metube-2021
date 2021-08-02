import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import express from 'express';
import morgan from 'morgan';
import passport from 'passport';
import './passport';
import { csrfMiddleware, localMiddleware, setHeaderMiddleware } from './middlewares';

import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';

const csrf = csurf({ cookie: true });
const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.disable('etag');

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(csrf);
app.use(csrfMiddleware);
app.use(setHeaderMiddleware);
app.use(localMiddleware);
app.use(passport.initialize());
app.use('/', rootRouter);
app.use('/users', userRouter);
app.use('/videos', videoRouter);

export default app;
