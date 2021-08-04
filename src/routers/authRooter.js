import express from 'express';
import {
  getGoogleLogin,
  getGoogleLoginCallback,
  getLineLogin,
  getLineLoginCallback,
  getGithubLogin,
  getGithubLoginCallback,
} from '../controllers/userController';

const authRooter = express.Router();

authRooter.get('/google', getGoogleLogin);
authRooter.get('/google/callback', getGoogleLoginCallback);
authRooter.get('/line', getLineLogin);
authRooter.get('/line/callback', getLineLoginCallback);
authRooter.get('/github', getGithubLogin);
authRooter.get('/github/callback', getGithubLoginCallback);

export default authRooter;
