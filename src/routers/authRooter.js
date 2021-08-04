import express from 'express';
import {
  getGoogleLogin,
  getGoogleLoginCallback,
  getLineLogin,
  getLineLoginCallback,
} from '../controllers/userController';

const authRooter = express.Router();

authRooter.get('/google', getGoogleLogin);
authRooter.get('/google/callback', getGoogleLoginCallback);
authRooter.get('/line', getLineLogin);
authRooter.get('/line/callback', getLineLoginCallback);

export default authRooter;
