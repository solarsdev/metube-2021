import User from '../models/User';

export const getJoin = (req, res) => res.render('join', { pageTitle: 'Join' });
export const postJoin = async (req, res) => {
  const { username, email, password, password2, name, location } = req.body;
  if (password !== password2) {
    return res.render('join', {
      pageTitle: 'Join',
      errorMessage: 'Password confirmation does not match',
    });
  }
  const usernameEmailAlreadyExists = await User.exists({
    $or: [{ username }, { email }],
  });
  console.log(usernameEmailAlreadyExists);
  if (usernameEmailAlreadyExists) {
    return res.render('join', {
      pageTitle: 'Join',
      errorMessage: 'Username/Email is already taken',
    });
  }
  await User.create({
    username,
    email,
    password,
    name,
    location,
  });
  return res.redirect('/login');
};
export const login = (req, res) => res.send('login');
export const logout = (req, res) => res.send('logout');
export const profile = (req, res) => res.send('profile');
export const edit = (req, res) => res.send('edit user');
export const deleteUser = (req, res) => res.send('delete user');
