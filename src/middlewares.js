import passport from 'passport';

export const localMiddleware = (req, res, next) => {
  res.locals.siteName = 'MeTube';
  passport.authenticate('jwt', { session: false }, (error, user, info) => {
    if (user) {
      res.locals.loggedIn = true;
      res.locals.user = user;
    }
    return next();
  })(req, res);
};

export const setHeaderMiddleware = (req, res, next) => {
  const {
    signedCookies: { EID },
  } = req;

  if (EID) {
    req.headers.authorization = `bearer ${EID}`;
  }

  return next();
};
