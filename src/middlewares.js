import passport from 'passport';

export const localMiddleware = (req, res, next) => {
  res.locals.siteName = 'MeTube';

  const jwt = req.signedCookies.jwt;
  if (!jwt) {
    return next();
  }

  passport.authenticate('jwt', { session: false }, (error, user, info) => {
    if (user) {
      res.locals.loggedIn = true;
      res.locals.user = user;
    }
    return next();
  })(req, res);
};
