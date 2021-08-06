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
    const { email, name, password, passwordConfirm, agree } = req.body;
    if (!name) {
      return res.status(400).render('join', {
        pageTitle: 'Join',
        errorMessage: 'Please enter your name',
        csrfToken: req.csrfToken(),
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).render('join', {
        pageTitle: 'Join',
        errorMessage: 'Password confirmation does not match',
        csrfToken: req.csrfToken(),
      });
    }

    if (agree !== 'on') {
      return res.status(400).render('join', {
        pageTitle: 'Join',
        errorMessage: 'Please check agreement',
        csrfToken: req.csrfToken(),
      });
    }

    let user = await User.exists({ email });

    if (user) {
      return res.status(400).render('join', {
        pageTitle: 'Join',
        errorMessage: 'Email is already taken',
        csrfToken: req.csrfToken(),
      });
    }

    user = await User.create({
      email,
      name,
      password,
      socialOnly: false,
    });

    createLoginCookie(user, res);
    return res.redirect('/');
  } catch (error) {
    console.log(error);
    return res.status(400).render('join', {
      pageTitle: 'Join',
      errorMessage: error._message,
      csrfToken: req.csrfToken(),
    });
  }
};

export const getLogin = (req, res) =>
  res.render('login', { pageTitle: 'Login', csrfToken: req.csrfToken() });

export const postLogin = (req, res) => {
  try {
    passport.authenticate('local', (error, user, info) => {
      if (error) {
        return res.status(401).render('login', {
          pageTitle: 'Login',
          errorMessage: error,
          csrfToken: req.csrfToken(),
        });
      }

      if (!user) {
        return res.status(401).render('login', {
          pageTitle: 'Login',
          errorMessage: info.message,
          csrfToken: req.csrfToken(),
        });
      }

      createLoginCookie(user, res);
      return res.redirect('/');
    })(req, res);
  } catch (error) {
    console.log(error);
    return res.status(401).render('login', {
      pageTitle: 'Login',
      errorMessage: error.message,
      csrfToken: req.csrfToken(),
    });
  }
};

export const getGoogleLogin = passport.authenticate('google', { scope: ['email', 'profile'] });

export const getGoogleLoginCallback = (req, res) => {
  try {
    passport.authenticate('google', async (error, profile) => {
      if (error) {
        return res.status(401).render('login', {
          pageTitle: 'Login',
          errorMessage: error,
          csrfToken: req.csrfToken(),
        });
      }

      const { email, name, picture: avatarUrl, sub: googleId } = profile;
      let user = await User.findOne({ googleId }).select('_id');

      if (user) {
        createLoginCookie(user, res);
        return res.redirect('/');
      }

      user = await User.findOne({ email });
      // 이메일은 있는데 구글연동이 안되어있음 (자동연동)
      if (user) {
        user.googleId = googleId;
        await user.save();
        createLoginCookie(user, res);
        return res.redirect('/');
      }

      // 구글연동도 안되어 있고 이메일도 없음 (신규)
      user = await User.create({
        email,
        name,
        avatar: {
          avatarType: 'external',
          avatarUrl,
        },
        googleId,
      });

      createLoginCookie(user, res);
      return res.redirect('/');
    })(req, res);
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
};

export const getLineLogin = passport.authenticate('line', {
  scope: ['profile', 'openid', 'email'],
});

export const getLineLoginCallback = (req, res) => {
  try {
    passport.authenticate('line', async (error, profile) => {
      if (error) {
        return res.status(401).render('login', {
          pageTitle: 'Login',
          errorMessage: error,
          csrfToken: req.csrfToken(),
        });
      }

      // line needs to be check profile.email (if user dont permit to send, maybe null)
      if (!profile.hasOwnProperty('email')) {
        return res.status(401).render('login', {
          pageTitle: 'Login',
          errorMessage: 'Please permit to send email from line',
          csrfToken: req.csrfToken(),
        });
      }

      const { email, name, picture: avatarUrl, sub: lineId } = profile;
      let user = await User.findOne({ lineId });

      if (user) {
        createLoginCookie(user, res);
        return res.redirect('/');
      }

      user = await User.findOne({ email });
      // 이메일은 있는데 라인연동이 안되어있음 (자동연동)
      if (user) {
        user.lineId = lineId;
        await user.save();
        createLoginCookie(user, res);
        return res.redirect('/');
      }

      // 라인연동도 안되어 있고 이메일도 없음 (신규)
      user = await User.create({
        email,
        name,
        avatar: {
          avatarType: 'external',
          avatarUrl,
        },
        lineId,
      });

      createLoginCookie(user, res);
      return res.redirect('/');
    })(req, res);
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
};

export const getGithubLogin = passport.authenticate('github');

export const getGithubLoginCallback = (req, res) => {
  try {
    passport.authenticate('github', async (error, profile) => {
      if (error) {
        return res.status(401).render('login', {
          pageTitle: 'Login',
          errorMessage: error,
        });
      }

      const { email, login: name, avatar_url: avatarUrl, id: githubId } = profile;
      let user = await User.findOne({ githubId });

      if (user) {
        createLoginCookie(user, res);
        return res.redirect('/');
      }

      user = await User.findOne({ email });
      // 이메일은 있는데 깃허브연동이 안되어있음 (자동연동)
      if (user) {
        user.githubId = githubId;
        await user.save();
        createLoginCookie(user, res);
        return res.redirect('/');
      }

      // 깃허브연동도 안되어 있고 이메일도 없음 (신규)
      user = await User.create({
        email,
        name,
        avatar: {
          avatarType: 'external',
          avatarUrl,
        },
        githubId,
      });

      createLoginCookie(user, res);
      return res.redirect('/');
    })(req, res);
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
};

export const logout = (req, res) => {
  res.clearCookie(process.env.COOKIE_EID);
  return res.redirect('/');
};

export const getEdit = (req, res) =>
  res.render('users/edit', { pageTitle: 'Edit profile', csrfToken: req.csrfToken() });

export const postEdit = async (req, res) => {
  try {
    const {
      body: { name },
    } = req;
    const user = res.locals.user;
    await User.findByIdAndUpdate(user._id, { name });
    return res.redirect('/users/edit');
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
};

export const getChangePassword = (req, res) =>
  res.render('users/change-password', { pageTitle: 'Change password', csrfToken: req.csrfToken() });

export const postChangePassword = async (req, res) => {
  try {
    const {
      body: { oldPassword, newPassword, newPassword2 },
    } = req;
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
    const avatarUrl = file ? file.key : null;

    if (avatarUrl) {
      await Promise.all([
        User.findByIdAndUpdate(user._id, {
          avatar: {
            avatarType: 'internal',
            avatarUrl,
          },
        }),
        avatarUrl && user.avatar.avatarType === 'internal'
          ? deleteStorageFile(user.avatar.avatarUrl)
          : Promise.resolve(),
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
        avatar: {
          avatarType: 'none',
          avatarUrl: null,
        },
      }),
      user.avatar.avatarType === 'internal'
        ? deleteStorageFile(user.avatar.avatarUrl)
        : Promise.resolve(),
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
