import passport from 'passport';

const getUserFromToken = (req, res) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, (error, user, info) => {
      if (error || !user) {
        return resolve(null);
      }

      return resolve(user);
    })(req, res);
  });
};

export const localMiddleware = async (req, res, next) => {
  res.locals.siteName = 'MeTube';
  const user = await getUserFromToken(req, res);
  res.locals.loggedIn = Boolean(user);
  res.locals.user = user || {};
  return next();
};

export const authOnly = async (req, res, next) => {
  const user = await getUserFromToken(req, res);
  if (user) {
    return next();
  }
  return res.redirect('/login');
};

export const publicOnly = async (req, res, next) => {
  const user = await getUserFromToken(req, res);
  if (!user) {
    return next();
  }
  return res.redirect('/');
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
