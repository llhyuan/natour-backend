import { collections, connectToDatabase } from './services/database.service';

const app = require('./app');

async function run(): Promise<void> {
  // Connecting to the database
  await connectToDatabase();

  const collection = collections.tour;
  if (!collection) {
    return console.log('No collection found in the database.');
  }
}
run().catch(console.dir);

// Connect to the database using mongoose
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
