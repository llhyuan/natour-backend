import { TourRequest, AppError } from '../models/customTypes';
import Review from '../models/review';
import { Response, NextFunction } from 'express-serve-static-core';
import catchAsync from '../utils/catchAsync';
import { deleteByIdHandlerFactory } from './handlerFactory';
import APIFeaturesGET from '../utils/apiFeaturesGET';
import mongoose from 'mongoose';

async function _createReview(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  // Only logged in user can post reviews
  // At thie point, the user's id will have been verified by middleware
  // and stored in req.body.reqUserId
  req.body.user = req.body.reqUserId;
  req.body.tour = req.body.tour;
  const newReview = await Review.create(req.body);

  if (!newReview) {
    next(new AppError('Cannot create review. Try again later.', 500));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
}

export const createReview = catchAsync(_createReview);

async function _getAllReviews(
  req: TourRequest,
  res: Response,
  _next: NextFunction
) {
  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }
  console.log(filter);
  console.log(req.query);

  const reviewQuery = new APIFeaturesGET(Review.find(filter), req.query);

  reviewQuery.find().filter().sort().paginization();

  const reviews = await reviewQuery.query;

  res.status(200).json({
    status: 'success',
    data: {
      reviews: reviews,
    },
  });
}

export const getAllReviews = catchAsync(_getAllReviews);

export const deleteReview = deleteByIdHandlerFactory(Review);

export async function _calcAvgRating(tourId: mongoose.Types.ObjectId) {
  const result = await Review.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: '$tour',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(result);
}
