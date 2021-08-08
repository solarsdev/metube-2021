import aws from 'aws-sdk';
import crypto from 'crypto';
import multer, { MulterError } from 'multer';
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
    s3,
    bucket: process.env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `${folderName}/${crypto.randomBytes(16).toString('hex')}`);
    },
  });
};

export const csrfMiddleware = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  res.status(403);
  res.send('Not Authorized. csrf error.');
};

/**
 * 토큰으로부터 유저 아이디를 분석하고, 유저를 반환하는 함수.
 * 토큰 페이로드로부터 아이디를 DB에서 검색한다.
 *
 * @param {Express.Request} req Express의 Request 객체
 * @param {Express.Response} res Express의 Response 객체
 * @returns 실패했을 경우에는 에러 (User not found), 성공했을 경우에는 유저 객체
 */
const getUserFromToken = (req, res) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, (error, user, info) => {
      if (error) {
        return reject(error);
      }

      if (!user) {
        return reject(new Error('User not found'));
      }

      return resolve(user);
    })(req, res);
  });
};

export const localMiddleware = async (req, res, next) => {
  res.locals.siteName = 'MeTube';
  res.locals.storageUrl = process.env.STORAGE_URL;

  try {
    const user = await getUserFromToken(req, res);
    res.locals.loggedIn = true;
    res.locals.user = user;
  } catch (error) {
    res.locals.loggedIn = false;
    res.locals.user = {};
  }

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
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
});

export const videoUploader = multer({
  storage: storage('videos'),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'video/mp4' ||
      file.mimetype == 'video/mpeg' ||
      file.mimetype == 'video/ogg' ||
      file.mimetype == 'video/quicktime' ||
      file.mimetype == 'video/webm'
    ) {
      cb(null, true);
    } else {
      cb(new MulterError('LIMIT_UNEXPECTED_FILE'), false);
    }
  },
});

export const deleteStorageFile = (Key) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: process.env.BUCKET_NAME,
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

export const deleteStorageFiles = (Objects) => {
  return new Promise((resolve, reject) => {
    s3.deleteObjects(
      {
        Bucket: process.env.BUCKET_NAME,
        Delete: {
          Objects,
          Quiet: true,
        },
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
