import { Request, Response, NextFunction } from 'express-serve-static-core';
import User from '../models/user';
import catchAsync from '../utils/catchAsync';

async function _signup(req: Request, res: Response, next: NextFunction) {
  const newUser = await User.create(req.body);

  res.status(200).json({
    status: 'success',
    data: newUser,
  });
}

export const signup = catchAsync(_signup);
