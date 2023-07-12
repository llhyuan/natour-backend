import { TourRequest, AppError } from '../models/customTypes';
import { Response, NextFunction } from 'express-serve-static-core';

export default function ErrorHandle(
  err: AppError,
  _req: TourRequest,
  res: Response,
  _next: NextFunction
) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
}
