import { verifyLoginStatus } from '../controllers/authController';
import {
  getBookings,
  getCheckoutSession,
  updatePaymentStatus,
  deleteBooking,
  updateInvoice,
  updateStartDate,
} from '../controllers/bookingController';

const express = require('express');
const bookingRouter = express.Router({ mergeParams: true });

bookingRouter.get(
  '/checkout-session/:tourId',
  verifyLoginStatus,
  getCheckoutSession
);
bookingRouter.route('/my-bookings').get(verifyLoginStatus, getBookings);

bookingRouter
  .route('/update-paymentStatus')
  .patch(verifyLoginStatus, updatePaymentStatus);

bookingRouter.route('/update-invoice').patch(verifyLoginStatus, updateInvoice);

bookingRouter
  .route('/update-startDate')
  .patch(verifyLoginStatus, updateStartDate);

bookingRouter
  .route('/delete/:bookingId')
  .delete(verifyLoginStatus, deleteBooking);

export default bookingRouter;
