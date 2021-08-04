import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { deleteStorageFile } from '../middlewares';
import User from '../models/User';

export const getJoin = (req, res) =>
  res.render('join', { pageTitle: 'Join', csrfToken: req.csrfToken() });

export const postJoin = async (req, res) => {
  try {
    const { email, password, password2, name, location } = req.body;
    if (password !== password2) {
      return res.status(400).render('join', {
        pageTitle: 'Join',
        errorMessage: 'Password confirmation does not match',
        csrfToken: req.csrfToken(),
      });
    }

    const user = await User.create({
      email,
      password,
      name,
      location,
    });

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
  passport.authenticate('google', (error, user, profile) => {
    if (error) {
      return res.status(401).render('login', {
        pageTitle: 'Login',
        errorMessage: error,
      });
    }

    console.log(profile);
    res.end();
  })(req, res);
};

export const getLineLogin = passport.authenticate('line', {
  scope: ['profile', 'openid', 'email'],
});

export const getLineLoginCallback = (req, res) => {
  passport.authenticate('line', (error, user, profile) => {
    // line needs to be check profile.email (if user dont permit to send, maybe null)
    if (error) {
      return res.status(401).render('login', {
        pageTitle: 'Login',
        errorMessage: error,
      });
    }

    console.log(profile);
    res.end();
  })(req, res);
};

export const getGithubLogin = passport.authenticate('github');

export const getGithubLoginCallback = (req, res) => {
  passport.authenticate('github', (error, user, profile) => {
    if (error) {
      return res.status(401).render('login', {
        pageTitle: 'Login',
        errorMessage: error,
      });
    }

    console.log(profile);
    res.end();
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
    const {
      body: { email, name, location },
      file,
    } = req;
    const user = res.locals.user;
    const avatarPath = file && 'key' in file ? file.key : user.avatarPath;

    if (email !== user.email) {
      const emailAlreadyTaken = await User.exists({ email });
      if (emailAlreadyTaken) {
        return res.status(400).render('users/edit', {
          pageTitle: 'Edit profile',
          errorMessage: 'Email is already taken',
          csrfToken: req.csrfToken(),
        });
      }
    }

    await User.findByIdAndUpdate(user._id, {
      email,
      name,
      location,
      avatarPath,
    });

    if (avatarPath !== user.avatarPath && user.avatarPath) {
      await deleteStorageFile(user.avatarPath);
    }

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

export const deleteAvatar = async (req, res) => {
  try {
    const user = res.locals.user;
    await Promise.all([
      User.findByIdAndUpdate(user._id, {
        $unset: { avatarPath: true },
      }),
      deleteStorageFile(user.avatarPath),
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
