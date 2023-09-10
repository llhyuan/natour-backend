import { Request, Response, NextFunction } from 'express-serve-static-core';
import catchAsync from '../utils/catchAsync';
import Tour from '../models/tour';
import User from '../models/user';
import Booking from '../models/Booking';
import Review from '../models/review';
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
      customer_email: user.email,
      invoice_creation: {
        enabled: true,
        invoice_data: {
          metadata: {
            order: orderId,
            jwt: req.cookies.jwt,
          },
        },
      },
      mode: 'payment',
      success_url: `${process.env.FRONTEND_HOST}/tours/?success=true`,
      cancel_url: `${process.env.FRONTEND_HOST}/tours/${tourId}?canceled=true`,
      metadata: {
        order: orderId,
        jwt: req.cookies.jwt,
      },
    });

    if (session.url) {
      const review = await Review.create({
        tour: tour.id,
        user: user.id,
        order: orderId,
        visible: false,
      });
      await Booking.create({
        tour: tour.id,
        user: user.id,
        review: review._id,
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

async function _updatePaymentStatus(req: Request, res: Response) {
  const booking = await Booking.findOneAndUpdate(
    { order: req.body.order },
    { paymentStatus: req.body.paymentStatus },
    { new: true }
  );
  if (booking) {
    return res.status(200).json({
      status: 'success',
      data: booking,
    });
  } else {
    return res.status(200).json({
      status: 'fail',
      message:
        'Something went wrong when updating the payment status. Try again later.',
    });
  }
}

export const updatePaymentStatus = catchAsync(_updatePaymentStatus);

async function _updateStartDate(req: Request, res: Response) {
  const booking = await Booking.findOneAndUpdate(
    { order: req.body.order },
    { startDate: req.body.startDate },
    { new: true }
  );

  if (booking) {
    return res.status(200).json({
      status: 'success',
      data: booking,
    });
  } else {
    return res.status(200).json({
      status: 'fail',
      message:
        'Something went wrong when updating the start date. Try again later.',
    });
  }
}

export const updateStartDate = catchAsync(_updateStartDate);

async function _deleteBooking(req: Request, res: Response) {
  const { bookingId } = req.params;

  const booking = await Booking.findOneAndDelete({ order: bookingId });
  if (booking && booking.review) {
    await Review.findOneAndDelete({ _id: booking.review });
  }

  return res.status(200).json({
    status: 'success',
    message: 'The booking has already been deleted.',
  });
}

export const deleteBooking = catchAsync(_deleteBooking);

async function _updateInvoice(req: Request, res: Response) {
  const user = await User.findOne({ email: req.body.email });
  if (user?.email === req.body.email) {
    await Booking.findOneAndUpdate(
      { user: req.body.reqUserId, order: req.body.order },
      { invoice: req.body.invoice },
      { new: true }
    );
    return res.status(200).json({
      status: 'success',
      message: 'Invoice updated.',
    });
  }
  return res.status(200).json({
    status: 'fail',
    message: 'User not found.',
  });
}
export const updateInvoice = catchAsync(_updateInvoice);
