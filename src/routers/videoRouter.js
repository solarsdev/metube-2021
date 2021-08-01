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

const csrfProtection = csurf({ cookie: true });
const videoRouter = express.Router();

videoRouter.get('/:id([a-z0-9]{24})', watch);
videoRouter
  .route('/:id([a-z0-9]{24})/edit')
  .get(csrfProtection, getEdit)
  .post(csrfProtection, postEdit);
videoRouter.get('/:id([a-z0-9]{24})/delete', deleteVideo);
videoRouter.route('/upload').get(csrfProtection, getUpload).post(csrfProtection, postUpload);

export default videoRouter;
