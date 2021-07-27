import express from 'express';
import morgan from 'morgan';

import globalRouter from './routers/globalRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';

const PORT = 4000;
const HOST = '0.0.0.0';

const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use('/', globalRouter);
app.use('/users', userRouter);
app.use('/videos', videoRouter);

const handleListening = () => console.log(`✅ Server listening on port http://${HOST}:${PORT} 🚀`);

app.listen(PORT, HOST, handleListening);
