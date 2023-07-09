// Imports
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRouter');
//const userRouter = require('./routes/userRouter');

// Create a express server
const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static('./public'));

app.use((req, res, next) => {
  console.log('Hello from the middleware.');
  next();
});

app.use((req, res, next) => {
  req.timeofRequest = new Date().toUTCString();
  next();
});

// Mounting API Routers
app.use('/api/v1/tours', tourRouter);
//app.use('/api/v1/users', userRouter);

module.exports = app;
