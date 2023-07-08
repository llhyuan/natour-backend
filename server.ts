import dotenv from 'dotenv';
import { FindCursor, MongoClient, ServerApiVersion } from 'mongodb';

const app = require('./app');
dotenv.config({ path: './config.env' });
const uri =
  'mongodb+srv://lhyuanliu21:0fRycJNHSk39BcBX@natour-cluster.eduhrdq.mongodb.net?retryWrites=true&w=majority';

// Connecting to the database with mongodb

async function run(): Promise<void> {
  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  // Declare data type
  interface Tour {
    name: String;
    rating: Number;
    price: Number;
  }
  await client.connect();

  const collection = client.db('Natour').collection('tours');

  const testTour: Tour = {
    name: 'The Forest Hiker',
    rating: 4.7,
    price: 123,
  };

  // Save the data to server
  try {
    const insertResult = await collection.insertOne(testTour);
    console.log(insertResult);
  } catch {
    console.error('something went wrong trying to insert.');
  }

  try {
    let cursor: FindCursor = collection.find({ rating: 4.7 });
    for await (const doc of cursor) {
      console.log(doc);
    }
    //   const result = await doc.toArray();
    //   if (result.length != 0) {
    //     console.log(result);
    //   } else {
    //     throw Error('No such item in the database.');
    //   }
  } catch (err) {
    console.error(err);
  }

  await client.close();
}

run().catch(console.dir);

// Connect to the database using mongoose
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
