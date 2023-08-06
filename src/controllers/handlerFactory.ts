import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { AppError } from '../models/customTypes';

export function deleteByIdHandlerFactory(model: mongoose.Model<any>) {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await model.findByIdAndDelete({ _id: req.params.id });

    if (!doc) {
      return next(new AppError('No document matches the provided id.', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
}
