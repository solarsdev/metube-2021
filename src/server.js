import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import express from 'express';
import 'express-async-errors';
import flash from 'express-flash';
import session, { MemoryStore } from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { db } from './db';
import './passport';
import { csrfMiddleware, localMiddleware, setHeaderMiddleware } from './middlewares';

import apiRouter from './routers/apiRooter';
import authRouter from './routers/authRooter';
import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';

const app = express();
const isProductionEnv = process.env.NODE_ENV === 'production';
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': ["'self'", "'unsafe-eval'"],
      'img-src': ["'self'", 'lh3.googleusercontent.com', 'static.solarsdev.com'],
      'script-src-attr': ["'unsafe-inline'"],
    },
  },
};

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');
app.disable('etag');

app.use(morgan('dev'));
app.use(helmet(helmetOptions));
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: db ? MongoStore.create({ client: db.getClient() }) : new MemoryStore(),
  }),
);
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

app.use((err, req, res, next) => {
  res.status(500);
  res.json({ error: err.message });
});

export default app;
