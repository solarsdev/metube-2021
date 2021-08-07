import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { deleteStorageFile } from '../middlewares';
import User from '../models/User';

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
  passport.authenticate('google', (error, profile) => {
    socialLoginCallback(error, 'google', profile, res);
  })(req, res);
};

export const getLineLoginCallback = (req, res) => {
  passport.authenticate('line', async (error, profile) => {
    socialLoginCallback(error, 'line', profile, res);
  })(req, res);
};

export const getGithubLoginCallback = (req, res) => {
  passport.authenticate('github', async (error, profile) => {
    socialLoginCallback(error, 'github', profile, res);
  })(req, res);
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

export const getChangePassword = (req, res) =>
  res.render('users/change-password', { pageTitle: 'Change password', csrfToken: req.csrfToken() });

export const postChangePassword = async (req, res) => {
  try {
    const { body: { oldPassword, newPassword, newPassword2 } = {} } = req;
    const user = res.locals.user;
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isValidPassword) {
      return res.status(400).render('users/change-password', {
        pageTitle: 'Change password',
        errorMessage: 'Current password is invalid',
        csrfToken: req.csrfToken(),
      });
    }

    if (newPassword !== newPassword2) {
      return res.status(400).render('users/change-password', {
        pageTitle: 'Change password',
        errorMessage: 'New password confirmation does not match',
        csrfToken: req.csrfToken(),
      });
    }

    user.password = newPassword;
    await user.save();
    return res.redirect('/logout');
  } catch (error) {
    console.log(error);
    return res.redirect('/');
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
