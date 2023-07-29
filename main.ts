import connectToDatabase from './src/services/database.service';
import app from './src/app';
import { Server } from 'http';
require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

async function run(): Promise<void> {
  // Connecting to the database
  await connectToDatabase();
}

run().catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;

const server: Server = app.listen(PORT, () => {
  console.log(`Server is now listening on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log('Unhandled rejection. Shuting down the server.');
  server.close(() => {
    process.exit(1);
  });
});
