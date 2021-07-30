import bcrypt from 'bcrypt';
import User from '../models/User';

export const getJoin = (req, res) => res.render('join', { pageTitle: 'Join' });
export const postJoin = async (req, res) => {
  const { username, email, password, password2, name, location } = req.body;
  if (password !== password2) {
    return res.status(400).render('join', {
      pageTitle: 'Join',
      errorMessage: 'Password confirmation does not match',
    });
  }
  const usernameEmailAlreadyExists = await User.exists({
    $or: [{ username }, { email }],
  });
  console.log(usernameEmailAlreadyExists);
  if (usernameEmailAlreadyExists) {
    return res.status(400).render('join', {
      pageTitle: 'Join',
      errorMessage: 'Username/Email is already taken',
    });
  }
  try {
    await User.create({
      username,
      email,
      password,
      name,
      location,
    });
    return res.redirect('/login');
  } catch (error) {
    return res.status(400).render('join', {
      pageTitle: 'Join',
      errorMessage: error._message,
    });
  }
};
export const getLogin = (req, res) => res.render('login', { pageTitle: 'Login' });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = 'Login';
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).render('login', {
      pageTitle,
      errorMessage: 'Username does not exists or Password is wrong',
    });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).render('login', {
      pageTitle,
      errorMessage: 'Username does not exists or Password is wrong',
    });
  }
  return res.redirect('/');
};
export const logout = (req, res) => res.send('logout');
export const profile = (req, res) => res.send('profile');
export const edit = (req, res) => res.send('edit user');
export const deleteUser = (req, res) => res.send('delete user');
