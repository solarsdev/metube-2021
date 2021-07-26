import express from 'express';
import morgan from 'morgan';

const PORT = 4000;

const app = express();

app.use(morgan('dev'));

app.get('/', (req, res, next) => res.send('Hello, world!'));

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
