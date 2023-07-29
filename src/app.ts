// Imports
import tourRouter from './routes/tourRouter';
import userRouter from './routes/userRouter';
import { TourRequest, AppError } from './models/customTypes';
import { Response, NextFunction } from 'express-serve-static-core';
import errorHandler from './controllers/errorController';

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

// Here to demonstrate that Middlewares can be used to manipulate request object,
// to pass down information for later use.
app.use((req: TourRequest, _res: Response, next: NextFunction) => {
  req.timeofRequest = new Date().toUTCString();
  next();
});

// Mounting API Routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handle all other undefined routes
app.all('*', (req: TourRequest, _res: Response, next: NextFunction) => {
  const err = new AppError(
    `Cannot find the requested url: ${req.originalUrl}`,
    404
  );

  next(err);
});

app.use(errorHandler);

export default app;
