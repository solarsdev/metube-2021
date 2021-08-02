import jwt from 'jsonwebtoken';
import passport from 'passport';
import { getUserFromToken } from '../middlewares';
import User from '../models/User';

export const getJoin = (req, res) =>
  res.render('join', { pageTitle: 'Join', csrfToken: req.csrfToken() });

export const postJoin = async (req, res) => {
  const { email, password, password2, name, location } = req.body;
  if (password !== password2) {
    return res.status(400).render('join', {
      pageTitle: 'Join',
      errorMessage: 'Password confirmation does not match',
      csrfToken: req.csrfToken(),
    });
  }
  try {
    await User.create({
      email,
      password,
      name,
      location,
    });
    return res.redirect('/login');
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
      );
      res.cookie(process.env.COOKIE_EID, token, {
        httpOnly: true,
        maxAge: 1200000,
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

export const logout = async (req, res) => {
  res.clearCookie(process.env.COOKIE_EID);
  return res.redirect('/');
};

export const getEdit = (req, res) =>
  res.render('editProfile', { pageTitle: 'Edit profile', csrfToken: req.csrfToken() });
export const postEdit = async (req, res) => {
  const {
    body: { email, name, location },
  } = req;
  const user = await getUserFromToken(req, res);

  if (!user) {
    return res.redirect('/');
  }

  if (email !== user.email) {
    const alreadyTaken = await User.exists({ email });
    if (alreadyTaken) {
      return res.status(400).render('editProfile', {
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
  });

  return res.redirect('/users/edit');
};
export const profile = (req, res) => res.send('profile');
export const deleteUser = (req, res) => res.send('delete user');
