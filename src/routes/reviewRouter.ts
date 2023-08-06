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

reviewRouter.use(verifyLoginStatus);

reviewRouter
  .route('/new-review')
  .post(restrictUserRoleTo('user'), createReview);
reviewRouter
  .route('/')
  .get(restrictUserRoleTo('admin', 'user'), getAllReviews)
  .delete(restrictUserRoleTo('admin'), deleteReview);

reviewRouter
  .route('/:id')
  .delete(restrictUserRoleTo('user'), deleteReview)
  .patch(restrictUserRoleTo('user'), updatedReview);

export default reviewRouter;
