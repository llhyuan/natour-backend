// Imports
import tourRouter from './routes/tourRouter';
import userRouter from './routes/userRouter';
import bookingRouter from './routes/bookingRouter';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { TourRequest, AppError } from './models/customTypes';
import { Response, NextFunction } from 'express-serve-static-core';
import errorHandler from './controllers/errorController';
import reviewRouter from './routes/reviewRouter';
import cors, { CorsOptions } from 'cors';
require('dotenv').config();

const morgan = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
// Create a express server
const app = express();

app.use(
  cors({
    origin: /http:\/\/localhost:3000\/*/,
    credentials: true,
  })
);

// Set security HTTP hdeaders
app.use(helmet());

// parsing the cookie in the request
app.use(cookieParser());

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data into req.body
app.use(express.json({ limit: '10kb' }));

// Sanitize user data
// against: NoSQL query injection
app.use(mongoSanitize({ allowDots: true }));

// against: XXS
const { xss } = require('express-xss-sanitizer');
app.use(xss());

app.use(express.static('./public'));

// Here to demonstrate that Middlewares can be used to manipulate request object,
// to pass down information for later use.
app.use((req: TourRequest, _res: Response, next: NextFunction) => {
  req.timeofRequest = new Date().toUTCString();
  next();
});

// Middleware to limit the number of api requests from the same IP.
const limit = parseInt(process.env.REQUEST_LIMIT ?? '300');
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: limit, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many request from this IP address. Try again in an 15 minutes.',
});
app.use('/api', apiRateLimit);

// Mounting API Routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

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
