import mongoose from 'mongoose';

require('dotenv').config();

const uri = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/metube-2021`;
const options = {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(uri, options);

const db = mongoose.connection;

const handleOpen = () => console.log('✅ Connected to DB');
const handleError = (error) => console.log('❌ DB Error', error);

db.once('open', handleOpen);
db.on('error', (error) => console.log('DB Error', error));