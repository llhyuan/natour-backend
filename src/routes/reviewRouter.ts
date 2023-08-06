import {
  restrictUserRoleTo,
  verifyLoginStatus,
} from '../controllers/authController';
import {
  createReview,
  deleteReview,
  getAllReviews,
} from '../controllers/reviewController';

const express = require('express');
const reviewRouter = express.Router({ mergeParams: true });

reviewRouter
  .route('/new-review')
  .post(verifyLoginStatus, restrictUserRoleTo('user'), createReview);
reviewRouter
  .route('/')
  .get(verifyLoginStatus, restrictUserRoleTo('admin', 'user'), getAllReviews)
  .delete(verifyLoginStatus, restrictUserRoleTo('admin'), deleteReview);

reviewRouter
  .route('/:id')
  .delete(verifyLoginStatus, restrictUserRoleTo('user'), deleteReview);

export default reviewRouter;
