import { verifyLoginStatus } from '../controllers/authController';
import {
  getBookings,
  getCheckoutSession,
} from '../controllers/bookingController';

const express = require('express');
const bookingRouter = express.Router({ mergeParams: true });

bookingRouter.get(
  '/checkout-session/:tourId',
  verifyLoginStatus,
  getCheckoutSession
);
bookingRouter.get('/my-bookings', verifyLoginStatus, getBookings);

export default bookingRouter;
