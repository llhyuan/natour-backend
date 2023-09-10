import connectToDatabase from './src/services/database.service';
import app from './src/app';
//import { Server } from 'http';
import { createServer } from 'https';
import fs from 'fs';

require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! Shutting down...');
  console.log(err);
  httpsServer.close(() => {
    process.exit(1);
  });
});

async function run(): Promise<void> {
  // Connecting to the database
  await connectToDatabase();
  httpsServer.listen(PORT, () => {
    console.log(`Secure server started on port ${PORT}`);
  });
}

run().catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;

const options = {
  key: fs.readFileSync(`${__dirname}/src/cert/key.pem`),
  cert: fs.readFileSync(`${__dirname}/src/cert/cert.pem`),
};

const httpsServer = createServer(options, app);

// httpsServer.listen(PORT, () => {
//   console.log(`Secure server started on port ${PORT}`);
// });

// const server: Server = app.listen(PORT, () => {
//   console.log(`Server is now listening on port ${PORT}`);
// });

process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log('Unhandled rejection. Shuting down the server.');
  httpsServer.close(() => {
    process.exit(1);
  });
});
