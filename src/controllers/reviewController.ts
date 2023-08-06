import { TourRequest, AppError } from '../models/customTypes';
import Review from '../models/review';
import Tour from '../models/tour';
import { Response, NextFunction } from 'express-serve-static-core';
import catchAsync from '../utils/catchAsync';
import APIFeaturesGET from '../utils/apiFeaturesGET';
import mongoose from 'mongoose';

async function _createReview(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  // One user can only post one review for the same tour.
  const existReview = await Review.findOne({ user: req.body.reqUserId });
  if (existReview) {
    return next(
      new AppError('Each user can only post one review for the same tour.', 500)
    );
  }

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

async function _deleteReview(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  const reviewId = req.params.id;
  console.log(reviewId);

  const reviewToBeUpdated = await Review.findById(reviewId);
  console.log(reviewToBeUpdated);

  if (!reviewToBeUpdated) {
    return next(
      new AppError('No review matching the provided review ID.', 404)
    );
  }

  if (String(reviewToBeUpdated.user) !== String(req.body.reqUserId)) {
    return next(new AppError('Users can only delete their own reviews.', 500));
  }

  await Review.findByIdAndDelete(reviewId);

  res.status(200).json({
    status: 'success',
    data: null,
  });
}
export const deleteReview = catchAsync(_deleteReview);

async function _updateReview(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  const reviewId = req.params.id;
  console.log(reviewId);

  const reviewToBeUpdated = await Review.findById(reviewId);
  console.log(reviewToBeUpdated);

  if (!reviewToBeUpdated) {
    return next(
      new AppError('No review matching the provided review ID.', 404)
    );
  }

  if (String(reviewToBeUpdated.user) !== String(req.body.reqUserId)) {
    return next(new AppError('Users can only update their own reviews.', 500));
  }

  const updatedReview = await Review.findByIdAndUpdate(reviewId, req.body, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview,
    },
  });
}

export const updatedReview = catchAsync(_updateReview);

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

  if (result.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: result[0]['numRatings'],
      ratingsAverage: result[0]['avgRating'],
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
}
