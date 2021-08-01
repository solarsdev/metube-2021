import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User';

export const getJoin = (req, res) =>
  res.render('join', { pageTitle: 'Join', csrfToken: req.csrfToken() });

export const postJoin = async (req, res) => {
  const { email, password, password2, name, location } = req.body;
  if (password !== password2) {
    return res.status(400).render('join', {
      pageTitle: 'Join',
      errorMessage: 'Password confirmation does not match',
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
        });
      }

      if (!user) {
        return res.status(401).render('login', {
          pageTitle: 'Login',
          errorMessage: info.message,
        });
      }

      const token = jwt.sign(
        {
          email: user.email,
        },
        process.env.JWT_SECRET,
      );
      res.cookie('jwt', token, { signed: true });
      return res.redirect('/');
    })(req, res);
  } catch (error) {
    console.log(error);
    return res.status(401).render('login', {
      pageTitle: 'Login',
      errorMessage: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('jwt');
  return res.redirect('/');
};

export const profile = (req, res) => res.send('profile');
export const edit = (req, res) => res.send('edit user');
export const deleteUser = (req, res) => res.send('delete user');
