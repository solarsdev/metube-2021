import passport from 'passport';

export const localMiddleware = (req, res, next) => {
  res.locals.siteName = 'MeTube';
  passport.authenticate('jwt', { session: false }, (error, user, info) => {
    if (user) {
      res.locals.loggedIn = true;
      res.locals.user = user;
    }
    next();
  })(req, res);
};
