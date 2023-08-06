import mongoose from 'mongoose';
import { _calcAvgRating } from '../controllers/reviewController';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'A review cannot be empty.'],
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post('save', async function () {
  await _calcAvgRating((this as any).tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  const query = (this as any).clone();
  const reviewInQuestion = await query.findOne();
  (this as any).tourId = reviewInQuestion.tour;
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  const tourId = (this as any).tourId;
  if (tourId) {
    await _calcAvgRating(tourId);
  }
});

// reviewSchema.pre(/^find/, function (next) {
//   (this as any)
//     .populate({
//       path: 'tour',
//       select: 'name',
//     })
//     .populate({
//       path: 'user',
//       select: 'name photo',
//     });
//   next();
// });
//
const Review = mongoose.model('Review', reviewSchema);

export default Review;
