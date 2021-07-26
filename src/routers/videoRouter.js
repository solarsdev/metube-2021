import express from 'express';

import { upload, watch, edit, deleteVideo } from '../controllers/videoController';

const videoRouter = express.Router();

videoRouter.get('/upload', upload);
videoRouter.get('/:id/delete', deleteVideo);
videoRouter.get('/:id/edit', edit);
videoRouter.get('/:id', watch);

export default videoRouter;
