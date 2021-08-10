import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { deleteStorageFile } from '../middlewares';
import User from '../models/User';

/**
 * 전달된 유저 객체를 이용해서 로그인 토큰을 만들고, 쿠키에 저장한다.
 *
 * @param {any} user 로그인 토큰을 만들 유저
 * @param {Express.Response} res Express의 Response 객체
 */
const createLoginCookie = (user, res) => {
  const token = jwt.sign(
    {
      _id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '14d',
      issuer: process.env.JWT_ISSUER,
    },
  );

  res.cookie(process.env.COOKIE_EID, token, {
    httpOnly: true,
    maxAge: 3600000 * 24 * 14,
    secure: true,
    signed: true,
  });
};

export const getJoin = (req, res) =>
  res.render('join', { pageTitle: 'Join', csrfToken: req.csrfToken() });

export const postJoin = async (req, res) => {
  try {
    const { body: { email, name, password, passwordConfirm, agree } = {} } = req;

    if (!email || !name || !password) {
      req.flash('error', '必須項目を入れてください。');
      return res.redirect('/join');
    }

    if (password !== passwordConfirm) {
      req.flash('error', 'パスワードが一致しません。');
      return res.redirect('/join');
    }

    if (agree !== 'on') {
      req.flash('error', '利用規約に同意してください。');
      return res.redirect('/join');
    }

    let user = await User.exists({ email });

    if (user) {
      req.flash('error', 'このメールアドレスは既に使われています。');
      return res.redirect('/join');
    }

    user = await User.create({
      email,
      name,
      password,
    });

    createLoginCookie(user, res);
    return res.redirect('/');
  } catch (error) {
    console.log(error);
    req.flash('error', 'サーバーにエラーが発生しました。管理者にお問合せください。');
    return res.redirect('/join');
  }
};

export const getLogin = (req, res) =>
  res.render('login', { pageTitle: 'Login', csrfToken: req.csrfToken() });

export const postLogin = (req, res) => {
  try {
    passport.authenticate('local', (error, user, info) => {
      if (error) {
        req.flash('error', error);
        return res.redirect('/login');
      }

      createLoginCookie(user, res);
      return res.redirect('/');
    })(req, res);
  } catch (error) {
    console.log(error);
    req.flash('error', 'サーバーにエラーが発生しました。管理者にお問合せください。');
    return res.redirect('/login');
  }
};

export const getGoogleLogin = passport.authenticate('google', { scope: ['email', 'profile'] });
export const getLineLogin = passport.authenticate('line', {
  scope: ['profile', 'openid', 'email'],
});
export const getGithubLogin = passport.authenticate('github');

/**
 * 소셜 사이트에 로그인된 사용자의 결과값을 받아온다.
 * 결과값을 받아온 뒤에는 DB에 저장한다.
 * DB 저장에 성공하면 뷰를 홈페이지로 이동시킨다.
 *
 * @param {string} error 소셜 사이트에서 요청 뒤 받아오는 에러값
 * @param {string} site 소셜 사이트명 ( google, line, github 등 )
 * @param {any} profile 각 소셜 사이트에서 받아오는 프로필 결과값
 * @param {Express.Response} res Express의 Response 객체
 * @returns 에러 발생시에는 다시 로그인페이지, 로그인 성공시에는 홈페이지로 이동
 */
const socialLoginCallback = async (error, site, profile, res) => {
  if (error) {
    req.flash('error', error);
    return res.redirect('/login');
  }

  try {
    let email, name, avatarUrl, sub;

    if (site === 'google') {
      ({ email, name, picture: avatarUrl, sub } = profile);
    } else if (site === 'line') {
      ({ email, name, picture: avatarUrl, sub } = profile);
    } else if (site === 'github') {
      ({ email, login: name, avatar_url: avatarUrl, id: sub } = profile);
    }

    let user = await User.findOne({ socialIds: { $elemMatch: { site, sub } } }, '_id');

    if (user) {
      createLoginCookie(user, res);
      return res.redirect('/');
    }

    user = await User.findOne({ email });

    if (user) {
      user.socialIds.push({ site, sub });
      await user.save();
      createLoginCookie(user, res);
      return res.redirect('/');
    }

    user = await User.create({
      email,
      name,
      avatar: {
        avatarUrl,
      },
      socialIds: [
        {
          site,
          sub,
        },
      ],
    });

    createLoginCookie(user, res);
    return res.redirect('/');
  } catch (error) {
    console.log(error);
    req.flash('error', 'サーバーにエラーが発生しました。管理者にお問合せください。');
    return res.redirect('/login');
  }
};

export const getGoogleLoginCallback = (req, res) => {
  passport.authenticate('google', (error, site, profile) =>
    socialLoginCallback(error, site, profile, res),
  )(req, res);
};

export const getLineLoginCallback = (req, res) => {
  passport.authenticate('line', (error, site, profile) =>
    socialLoginCallback(error, site, profile, res),
  )(req, res);
};

export const getGithubLoginCallback = (req, res) => {
  passport.authenticate('github', (error, site, profile) =>
    socialLoginCallback(error, site, profile, res),
  )(req, res);
};

export const logout = (req, res) => {
  res.clearCookie(process.env.COOKIE_EID);
  return res.redirect('/');
};

export const getEdit = (req, res) =>
  res.render('users/edit', { pageTitle: 'Edit profile', csrfToken: req.csrfToken() });

export const postEdit = async (req, res) => {
  try {
    const { body: { name } = {} } = req;

    if (!name) {
      req.flash('error', '必須項目を入れてください。');
      return res.redirect('/join');
    }

    const user = res.locals.user;
    await User.findByIdAndUpdate(user._id, { name });
    return res.redirect('/users/edit');
  } catch (error) {
    console.log(error);
    req.flash('error', 'サーバーにエラーが発生しました。管理者にお問合せください。');
    return res.redirect('/users/edit');
  }
};

export const postChangePassword = async (req, res) => {
  try {
    const { body: { oldPassword, newPassword, newPasswordConfirm } = {} } = req;
    const user = res.locals.user;

    if (user.password) {
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);

      if (!isValidPassword) {
        req.flash('error', '現在のパスワードが正しくありません。');
        return res.redirect('/users/edit');
      }
    }

    if (newPassword !== newPasswordConfirm) {
      req.flash('error', '新しいパスワードが一致しません。');
      return res.redirect('/users/edit');
    }

    user.password = newPassword;
    await user.save();
    return res.redirect('/users/edit');
  } catch (error) {
    console.log(error);
    req.flash('error', 'サーバーにエラーが発生しました。管理者にお問合せください。');
    return res.redirect('/users/edit');
  }
};

export const putAvatar = async (req, res) => {
  try {
    const { file } = req;
    const user = res.locals.user;
    const avatarKey = file ? file.key : null;

    if (avatarKey) {
      await Promise.all([
        User.findByIdAndUpdate(user._id, {
          avatar: {
            avatarKey,
            avatarUrl: `${res.locals.storageUrl}/${avatarKey}`,
          },
        }),
        user.avatar.avatarKey ? deleteStorageFile(user.avatar.avatarKey) : Promise.resolve(),
      ]);
    }

    return res.redirect('/users/edit');
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    const user = res.locals.user;
    await Promise.all([
      User.findByIdAndUpdate(user._id, {
        $unset: { avatar: true },
      }),
      user.avatar.avatarKey ? deleteStorageFile(user.avatar.avatarKey) : Promise.resolve(),
    ]);
    return res.redirect('/users/edit');
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
};

export const profile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate('videos');
    if (!user) {
      return res.render('404', { pageTitle: '404' });
    }
    return res.render('users/profile', { pageTitle: user.name, user });
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
};

export const deleteUser = (req, res) => res.send('delete user');
