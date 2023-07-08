import * as mongoDB from 'mongodb';
import * as dotenv from 'dotenv';

export function connectToDatabase() {
  dotenv.config({ path: './config.env' });
}

export const collections: { tour?: mongoDB.Collection } = {};
