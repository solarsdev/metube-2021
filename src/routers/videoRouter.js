import csurf from 'csurf';
import express from 'express';

import {
  watch,
  getEdit,
  postEdit,
  deleteVideo,
  getUpload,
  postUpload,
} from '../controllers/videoController';
import { authOnly, videoUploader } from '../middlewares';

const csrf = csurf({ cookie: true });
const videoRouter = express.Router();

videoRouter.get('/:id([a-z0-9]{24})', watch);
videoRouter.route('/:id([a-z0-9]{24})/edit').all(authOnly, csrf).get(getEdit).post(postEdit);
videoRouter.get('/:id([a-z0-9]{24})/delete', authOnly, deleteVideo);
videoRouter.route('/upload').all(authOnly, csrf).get(getUpload).post(postUpload);

export default videoRouter;
