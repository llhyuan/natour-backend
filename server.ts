import connectToDatabase from './services/database.service';
import app from './app';

async function run(): Promise<void> {
  // Connecting to the database
  await connectToDatabase();
}
run().catch(console.dir);

// Connect to the database using mongoose
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
