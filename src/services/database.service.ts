import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

export default async function connectToDatabase() {
  // Path can be left out if the config file is at the root level of the project.
  dotenv.config({ path: './config.env' });
  const uri: string = process.env.DB_CONN_STRING
    ? process.env.DB_CONN_STRING
    : '';

  console.log(uri);
  await mongoose.connect(uri);
  console.log('connected to the database.');
}
