import aws from 'aws-sdk';
import crypto from 'crypto';
import multer from 'multer';
import multerS3 from 'multer-s3';
import passport from 'passport';

const isProductionEnv = process.env.NODE_ENV === 'production';
const s3 = isProductionEnv
  ? new aws.S3() // for production
  : new aws.S3({
      // for dev
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
const storage = (folderName) => {
  return multerS3({
    s3: s3,
    bucket: 'metube-2021.service.s3',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `${folderName}/${crypto.randomBytes(16).toString('hex')}`);
    },
  });
};
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
  res.locals.storageUrl = process.env.STORAGE_URL;
  const user = await getUserFromToken(req, res);
  res.locals.loggedIn = Boolean(user);
  res.locals.user = user || {};
  return next();
};

export const authOnly = async (req, res, next) => {
  if (res.locals.loggedIn && res.locals.user) {
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
  storage: storage('images'),
  limits: {
    fileSize: 1 * 1024 * 1024,
  },
});

export const videoUploader = multer({
  storage: storage('videos'),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const deleteStorageFile = (Key) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: 'metube-2021.service.s3',
        Key,
      },
      (error, data) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(data);
        }
      },
    );
  });
};
