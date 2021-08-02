import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import passport from 'passport';

const isProductionEnv = process.env.NODE_ENV === 'production';
const s3 = isProductionEnv
  ? new aws.S3()
  : new aws.S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
const s3Images = multerS3({
  s3: s3,
  bucket: 'metube-2021.service.s3/images',
  acl: 'public-read',
});
const s3Videos = multerS3({
  s3: s3,
  bucket: 'metube-2021.service.s3/videos',
  acl: 'public-read',
});

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

export const csrfMiddleware = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  res.status(403);
  res.send('Not Authorized. csrf error.');
};

export const localMiddleware = async (req, res, next) => {
  res.locals.siteName = 'MeTube';
  const user = await getUserFromToken(req, res);
  res.locals.loggedIn = Boolean(user);
  res.locals.user = user || {};
  return next();
};

export const authOnly = async (req, res, next) => {
  if (res.locals.loggedIn) {
    return next();
  }
  return res.redirect('/login');
};

export const publicOnly = async (req, res, next) => {
  if (!res.locals.loggedIn) {
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

export const avatarUploader = multer({
  storage: s3Images,
});
