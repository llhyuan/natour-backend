import connectToDatabase from './src/services/database.service';
import { createServer } from 'http';
import app from './src/index';
// import { createServer } from 'https';
// import fs from 'fs';

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
  // httpsServer.listen(PORT, () => {
  //   console.log(`Secure server started on port ${PORT}`);
  // });
  server.listen(PORT, () => {
    console.log(`Server is now listening on port ${PORT}`);
  });
}

const PORT = process.env.PORT || 3000;
const server = createServer(app);
run().catch((err) => console.log(err));

// const options = {
//   key: fs.readFileSync(`${__dirname}/src/cert/key.pem`),
//   cert: fs.readFileSync(`${__dirname}/src/cert/cert.pem`),
// };

//const httpsServer = createServer(options, app);

process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log('Unhandled rejection. Shuting down the server.');
  server.close(() => {
    process.exit(1);
  });
});
