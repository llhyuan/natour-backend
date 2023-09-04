import { TourRequest, AppError } from '../models/customTypes';
import Review from '../models/review';
import Tour from '../models/tour';
import { Response, NextFunction } from 'express-serve-static-core';
import catchAsync from '../utils/catchAsync';
import APIFeaturesGET from '../utils/apiFeaturesGET';
import mongoose from 'mongoose';
import Booking from '../models/Booking';
import { updateTourRatings } from './tourController';

async function _createReview(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  let createReview: object = {
    review: req.body.review,
    title: req.body.title,
    rating: req.body.rating,
    order: req.body.order,
  };
  // user can only post one review for the same order.
  const verifyBooking = await Booking.findOne({ order: req.body.order });
  if (!verifyBooking) {
    return next(new AppError('User can only review booked tour', 500));
  } else {
    createReview['tour'] = verifyBooking.tour;
    createReview['user'] = verifyBooking.user;
  }

  const existReview = await Review.findOneAndUpdate(
    {
      user: verifyBooking.user,
      tour: verifyBooking.tour,
      order: req.body.order,
    },
    createReview
  );
  if (existReview) {
    return next(
      new AppError(
        'Each user can only post one review for the same order.',
        500
      )
    );
  }

  const newReview = await Review.create(createReview);

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

async function _getReviewsByTour(
  req: TourRequest,
  res: Response,
  _next: NextFunction
) {
  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId, review: { $exists: true } };
  }

  req.query['sort'] = '-createdAt';

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

export const getReviewsByTour = catchAsync(_getReviewsByTour);

async function _getReviewsByUser(
  req: TourRequest,
  res: Response,
  _next: NextFunction
) {
  const userId = req.body.reqUserId;

  const reviews = await Review.find({ user: userId });

  res.status(200).json({
    status: 'success',
    data: {
      reviews: reviews,
    },
  });
}

export const getReviewsByUser = catchAsync(_getReviewsByUser);

async function _deleteReview(
  req: TourRequest,
  res: Response,
  next: NextFunction
) {
  const reviewId = req.params.id;

  const reviewTobeDeleted = await Review.findById(reviewId);

  if (!reviewTobeDeleted) {
    return next(
      new AppError('No review matching the provided review ID.', 404)
    );
  }

  if (String(reviewTobeDeleted.user) !== String(req.body.reqUserId)) {
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
  const reviewId = req.params.reviewId;

  const reviewToBeUpdated = await Review.findById(reviewId);

  if (!reviewToBeUpdated) {
    return next(
      new AppError('No review matching the provided review ID.', 404)
    );
  }

  if (String(reviewToBeUpdated.user) !== String(req.body.reqUserId)) {
    return next(new AppError('Users can only update their own reviews.', 500));
  }

  const allowedEntries = ['review', 'rating', 'title'];
  let filteredUpdateObj: { review?: string; rating?: number; title?: string } =
    {};
  for (const key of allowedEntries) {
    if (req.body[key]) {
      filteredUpdateObj[key] = req.body[key];
    }
  }

  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    filteredUpdateObj,
    {
      new: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview,
    },
  });
}

export const updatedReview = catchAsync(_updateReview);

export async function _calcAvgRating(tourId: mongoose.Types.ObjectId | string) {
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
