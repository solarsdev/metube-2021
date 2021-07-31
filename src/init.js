import 'dotenv/config';
import './db';
import './models/Video';
import app from './server';

const PORT = 4000;
const HOST = '0.0.0.0';

const handleListening = () => console.log(`✅ Server listening on port http://${HOST}:${PORT} 🚀`);

const server = app.listen(PORT, HOST, handleListening);

process.on('SIGTERM', () => {
  // SigTerm recieved (ECS specific)
  // save if running job and using memory
  // call aws sdk StopTask (gracefully shutdown)
  // ToDo: save running jobs
  server.close(() => {
    debug('Nodejs backend closed');
  });
});
