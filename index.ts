import connectToDatabase from './src/services/database.service';
import app from './src/app';
require('dotenv').config();

export default async function run(): Promise<void> {
  // Connecting to the database
  await connectToDatabase();
}

run().catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is now listening on port ${PORT}`);
});
