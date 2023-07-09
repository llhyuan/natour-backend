import * as mongoDB from 'mongodb';
import * as dotenv from 'dotenv';

export async function connectToDatabase() {
  // Path can be left out if the config file is at the root level of the project.
  dotenv.config({ path: './config.env' });
  const uri: string = process.env.DB_CONN_STRING
    ? process.env.DB_CONN_STRING
    : '';

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(uri, {
    serverApi: {
      version: mongoDB.ServerApiVersion.v1,
      strict: true,
    },
  });

  await client.connect();

  const db: mongoDB.Db = client.db(process.env.DB_NAME);

  const collectionName = process.env.TOUR_COLLECTION_NAME
    ? process.env.TOUR_COLLECTION_NAME
    : '';
  const tourCollection: mongoDB.Collection = db.collection(collectionName);

  collections.tour = tourCollection;

  console.log(
    `Successfully connected to database ${db.databaseName} and collection ${collectionName}`
  );
}

export const collections: { tour?: mongoDB.Collection } = {};
