import * as Express from 'express';
import { Response, NextFunction } from 'express-serve-static-core';

export interface TourRequest extends Express.Request {
  timeofRequest: string;
}

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export interface AsyncHandler {
  (req: TourRequest, res: Response, next: NextFunction): Promise<any>;
}
