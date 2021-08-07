import express from 'express';
import { postTranscodeUpdate } from '../controllers/videoController';

const apiRouter = express.Router();

apiRouter.post('/transcode/update', postTranscodeUpdate);

export default apiRouter;
