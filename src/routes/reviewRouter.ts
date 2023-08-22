import {
  restrictUserRoleTo,
  verifyLoginStatus,
} from '../controllers/authController';
import {
  createReview,
  deleteReview,
  getAllReviews,
  updatedReview,
} from '../controllers/reviewController';

const express = require('express');
const reviewRouter = express.Router({ mergeParams: true });

reviewRouter
  .route('/new-review')
  .post(verifyLoginStatus, restrictUserRoleTo('user'), createReview);
reviewRouter
  .route('/')
  .get(getAllReviews)
  .delete(verifyLoginStatus, restrictUserRoleTo('admin'), deleteReview);

reviewRouter
  .route('/:id')
  .delete(verifyLoginStatus, restrictUserRoleTo('user'), deleteReview)
  .patch(verifyLoginStatus, restrictUserRoleTo('user'), updatedReview);

export default reviewRouter;
