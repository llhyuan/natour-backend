import * as Express from 'express';
import { Response, NextFunction } from 'express-serve-static-core';
import { Error } from 'mongoose';

export interface TourRequest extends Express.Request {
  timeofRequest: string;
}

export interface UserRequest extends TourRequest {}

export class AppError extends Error {
  statusCode: number;
  status: string;
  isDefined: boolean;
  path?: string;
  value?: string;
  code?: number;
  keyValue?: Object;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isDefined = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export interface AsyncHandler {
  (req: TourRequest, res: Response, next: NextFunction): Promise<any>;
}
