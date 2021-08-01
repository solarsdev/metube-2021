import fs from 'fs';
import mongoose from 'mongoose';

require('dotenv').config();

const env = process.argv[2];

let uri = `mongodb://${process.env.MONGO_USER_PROD}:${encodeURIComponent(
  process.env.MONGO_PASSWORD_PROD,
)}@${process.env.MONGO_HOST_PROD}:${process.env.MONGO_PORT_PROD}/${process.env.MONGO_DBNAME_PROD}`;

if (env === 'dev') {
  uri = `mongodb://${process.env.MONGO_USER_DEV}:${encodeURIComponent(
    process.env.MONGO_PASSWORD_DEV,
  )}@${process.env.MONGO_HOST_DEV}:${process.env.MONGO_PORT_DEV}/${process.env.MONGO_DBNAME_DEV}`;
}

let options = {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  retryWrites: false,
  ssl: true,
  sslValidate: env === 'dev' ? false : true, // for dev purpose
  sslCA: [fs.readFileSync(`${__dirname}/auth/rds-combined-ca-bundle.pem`)],
};

// if prod env, cluster connect add replica options
if (env !== 'dev') {
  options.replicaSet = 'rs0';
  options.readPreference = 'secondaryPreferred';
}

mongoose.connect(uri, options);

const db = mongoose.connection;

const handleOpen = () => console.log('✅ Connected to DB');
const handleError = (error) => console.log('❌ DB Error', error);

db.once('open', handleOpen);
db.on('error', handleError);
