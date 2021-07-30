import express from 'express';

import {
  watch,
  getEdit,
  postEdit,
  deleteVideo,
  getUpload,
  postUpload,
} from '../controllers/videoController';

const videoRouter = express.Router();

videoRouter.get('/:id([a-z0-9]{24})', watch);
videoRouter.route('/:id([a-z0-9]{24})/edit').get(getEdit).post(postEdit);
videoRouter.get('/:id([a-z0-9]{24})/delete', deleteVideo);
videoRouter.route('/upload').get(getUpload).post(postUpload);

export default videoRouter;
