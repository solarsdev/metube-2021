import { cognitoSignUp, cognitoLogin } from '../cognito';

export const getJoin = (req, res) => res.render('join', { pageTitle: 'Join' });

export const postJoin = async (req, res) => {
  const { email, password, password2, name, location } = req.body;
  if (password !== password2) {
    return res.status(400).render('join', {
      pageTitle: 'Join',
      errorMessage: 'Password confirmation does not match',
    });
  }
  try {
    await cognitoSignUp(email, password, name, location);
    res.redirect('/login');
  } catch (error) {
    return res.status(400).render('join', {
      pageTitle: 'Join',
      errorMessage: error.message,
    });
  }
};

export const getLogin = (req, res) => res.render('login', { pageTitle: 'Login' });

export const postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await cognitoLogin(email, password);
    console.log(user);
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect('/');
  } catch (error) {
    return res.status(401).render('login', {
      pageTitle: 'Login',
      errorMessage: error.message,
    });
  }
};
export const logout = (req, res) => res.send('logout');
export const profile = (req, res) => res.send('profile');
export const edit = (req, res) => res.send('edit user');
export const deleteUser = (req, res) => res.send('delete user');
