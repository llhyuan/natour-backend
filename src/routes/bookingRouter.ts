import { verifyLoginStatus } from '../controllers/authController';
import {
  getBookings,
  getCheckoutSession,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController';

const express = require('express');
const bookingRouter = express.Router({ mergeParams: true });

bookingRouter.get(
  '/checkout-session/:tourId',
  verifyLoginStatus,
  getCheckoutSession
);
bookingRouter
  .route('/my-bookings')
  .get(verifyLoginStatus, getBookings)
  .post(verifyLoginStatus, updateBooking);

bookingRouter
  .route('/delete/:bookingId')
  .delete(verifyLoginStatus, deleteBooking);

export default bookingRouter;
