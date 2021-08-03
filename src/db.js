import fs from 'fs';
import mongoose from 'mongoose';

const isProductionEnv = process.env.NODE_ENV === 'production';

const uri = `mongodb://${process.env.MONGO_USER}:${encodeURIComponent(
  process.env.MONGO_PASSWORD,
)}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DBNAME}`;

let options = {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  retryWrites: false,
  ssl: true,
  sslValidate: !isProductionEnv ? false : true, // for dev purpose
  sslCA: [fs.readFileSync(`${__dirname}/auth/rds-combined-ca-bundle.pem`)],
};

// if prod env, cluster connect with replica options
if (isProductionEnv) {
  options.replicaSet = 'rs0';
  options.readPreference = 'secondaryPreferred';
}

mongoose.connect(uri, options);

const db = mongoose.connection;

const handleOpen = () => console.log('✅ Connected to DB');
const handleError = (error) => console.log('❌ DB Error', error);

db.once('open', handleOpen);
db.on('error', handleError);
