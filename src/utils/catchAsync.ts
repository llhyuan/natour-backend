import { TourRequest, AsyncHandler } from '../models/customTypes';
import { Response, NextFunction } from 'express-serve-static-core';
// This is following the recommendation on express.js
// to use promise, instead of try-catch for error handling.
//
// catchAsync is just a wrapper to handle the rejected promise
// returned by the real errorhandler,
// using the catch block to pass the error to next()
// And express will take over and handle the error
export default function catchAsync(fn: AsyncHandler) {
  return (req: TourRequest, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
