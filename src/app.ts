// Imports
import tourRouter from './routes/tourRouter';
import { TourRequest } from './models/customTypes';
import { Response, NextFunction } from 'express';
//const userRouter = require('./routes/userRouter');

const morgan = require('morgan');
const express = require('express');
// Create a express server
const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static('./public'));

app.use((_req: TourRequest, _res: Response, next: NextFunction) => {
  console.log('Hello from the middleware.');
  next();
});

app.use((req: TourRequest, _res: Response, next: NextFunction) => {
  req.timeofRequest = new Date().toUTCString();
  next();
});

// Mounting API Routers
app.use('/api/v1/tours', tourRouter);
//app.use('/api/v1/users', userRouter);

// Handle all other undefined routes
app.all('*', (req: TourRequest, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find the requested url: ${req.originalUrl}`,
  });
});

export default app;
