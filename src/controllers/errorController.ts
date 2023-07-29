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

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else {
    if (err.name === 'CastError') {
      err = handleCaseError(err);
    }
    if (err.code === 11000) {
      err = handleDuplicateKey(err);
    }
    if (err.name === 'ValidationError') {
      err = handleValidationError(err);
    }
    if (err.name === 'JsonWebTokenError') {
      err = handleInvalidTokenError();
    }
    sendProdError(err, res);
  }
}

function sendDevError(err: AppError, res: Response) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stackTrace: err.stack,
  });
}

function sendProdError(err: AppError, res: Response) {
  if (err.isDefined) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'Undefined error',
      message: 'This error has not been properly handled.',
    });
  }
}

function handleCaseError(err: AppError) {
  const msg = `Invalid input for ${err.path}:${err.value}`;
  return new AppError(msg, 400);
}

function handleDuplicateKey(err: AppError) {
  const duplicatePairs: Array<string> = [];
  for (const [key, val] of Object.entries(err.keyValue || {})) {
    duplicatePairs.push(`${key} : ${val}`);
  }
  const msg = `Field value has to be unique. Duplicated field(s): ${duplicatePairs.join(
    ', '
  )}`;
  return new AppError(msg, 400);
}

function handleValidationError(err: AppError) {
  return new AppError(err.message, 400);
}

function handleInvalidTokenError() {
  return new AppError(
    'Login credentials not verified. Please login again to gain access.',
    401
  );
}
