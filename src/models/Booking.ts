import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
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
    enum: ['processing', 'success', 'rejected'],
    require: [true, 'A booking must have a status'],
  },
});

bookingSchema.pre(/^find/, function (next) {
  (this as any).populate({
    path: 'tour',
    select:
      'name summary price duration imageCover difficulty startLocation startDates',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
