import mongoose from 'mongoose';
import { _calcAvgRating } from '../controllers/reviewController';

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      maxLength: [40, 'The name could not be more than 40 characters.'],
    },
    review: {
      type: String,
      maxLength: [500, 'The name could not be more than 40 characters.'],
    },
    rating: {
      type: Number,
      default: 3,
      max: 5,
      min: 1,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    tour: {
      type: mongoose.Types.ObjectId,
      ref: 'Tour',
      require: [true, 'Please provide a tour id for this review.'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      require: [true, 'Please provide a user id for this review.'],
    },
    order: {
      type: String,
      require: [true, 'A review must be related to an order.'],
    },
    visible: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^findOneAnd/, async function (next) {
  const query = (this as any).clone();
  const reviewInQuestion = await query.findOne();
  (this as any).tourId = reviewInQuestion.tour;
  next();
});

reviewSchema.pre('find', function (next) {
  (this as any).populate({
    path: 'tour',
    select: 'name imageCover',
  });
  next();
});
reviewSchema.post('save', async function () {
  await _calcAvgRating((this as any).tour);
});

reviewSchema.post(/^findOneAnd/, async function () {
  const tourId = (this as any).tourId;
  if (tourId) {
    await _calcAvgRating(tourId);
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
