import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  order: {
    type: String,
    require: [true, 'An order mush have an unique identifier.'],
  },
  tour: {
    type: mongoose.Types.ObjectId,
    ref: 'Tour',
    require: [true, 'Booking must be associated with a tour.'],
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    require: [true, 'Booking should belong to a user'],
  },
  price: {
    type: Number,
    require: [true, 'A price is required.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'rejected'],
    require: [true, 'A booking must have a status'],
  },
  url: {
    type: String,
  },
  invoice: {
    type: String,
  },
  startDate: {
    type: String,
  },
  review: {
    type: mongoose.Types.ObjectId,
    ref: 'Review',
  },
});

bookingSchema.pre(/^find/, function (next) {
  (this as any)
    .populate({
      path: 'tour',
      select:
        'name summary price duration imageCover difficulty startLocation startDates',
    })
    .populate({
      path: 'review',
      select: 'rating',
    });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
