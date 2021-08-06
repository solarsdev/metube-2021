import express from 'express';
import { postTranscodeUpdate } from '../controllers/videoController';

const apiRouter = express.Router();

apiRouter.post('/tanscode/update/:jobId', postTranscodeUpdate);

export default apiRouter;
