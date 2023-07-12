import * as Express from 'express';

export interface TourRequest extends Express.Request {
  timeofRequest: string;
}
