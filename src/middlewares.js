export const localMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.user = req.session.user;
  res.locals.siteName = 'MeTube';
  next();
};

export const sessionMiddleware = (req, res, next) => {
  req.session._garbage = Date();
  req.session.touch();
  next();
};
