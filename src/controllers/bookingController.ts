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
            unit_amount_decimal: String(tour.price),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_HOST}?success=true`,
      cancel_url: `${process.env.FRONTEND_HOST}?canceled=true`,
    });

    if (session.url) {
      await Booking.create({
        tour: tour.id,
        user: user.id,
        paymentStatus: 'processing',
      });
      return res.status(200).json({ status: 'success', url: session.url });
    }
  }
  res.status(200).json({
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
