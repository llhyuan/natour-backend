import { Request, Response, NextFunction } from 'express-serve-static-core';
import catchAsync from '../utils/catchAsync';
import Tour from '../models/tour';
import User from '../models/user';
import Booking from '../models/Booking';
import Stripe from 'stripe';
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_API_KEY ?? '', {
  apiVersion: '2023-08-16',
});

async function _getCheckoutSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tourId = req.params.tourId;
  const customerId = req.body.reqUserId;
  const orderId = String(Date.now());

  // Fetch the tour in question
  const tour = await Tour.findById(tourId);
  const user = await User.findById(customerId);

  // Create a checkout session
  if (tour && user) {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price_data: {
            currency: 'dkk',
            product_data: {
              name: tour.name + 'Tour',
              description: tour.summary,
              images: [tour.imageCover + ''],
            },
            unit_amount_decimal: String((tour.price ?? 0) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_HOST}/tours/?success=true`,
      cancel_url: `${process.env.FRONTEND_HOST}/tours/${tourId}?canceled=true`,
      metadata: {
        order: orderId,
        jwt: req.cookies.jwt,
      },
    });

    if (session.url) {
      await Booking.create({
        tour: tour.id,
        user: user.id,
        order: orderId,
        paymentStatus: 'pending',
        url: session.url,
      });
      return res.status(200).json({ status: 'success', url: session.url });
    }
  }
  return res.status(200).json({
    status: 'fail',
    message: 'Something went wrong. try again later.',
  });
}

export const getCheckoutSession = catchAsync(_getCheckoutSession);

async function _getBookings(req: Request, res: Response) {
  const bookings = await Booking.find({ user: req.body.reqUserId });
  return res.status(200).json({ status: 'success', bookings: bookings });
}

export const getBookings = catchAsync(_getBookings);

async function _updateBooking(req: Request, res: Response) {
  const booking = await Booking.findOneAndUpdate(
    { order: req.body.order },
    { paymentStatus: req.body.payment_status },
    { new: true }
  );

  return res.status(200).json({
    status: 'success',
    data: booking,
  });
}

export const updateBooking = catchAsync(_updateBooking);

async function _deleteBooking(req: Request, res: Response) {
  const { bookingId } = req.params;

  const booking = await Booking.findOneAndDelete({ order: bookingId });

  return res.status(200).json({
    status: 'success',
    data: {
      message: 'The booking has already been deleted.',
    },
  });
}

export const deleteBooking = catchAsync(_deleteBooking);
