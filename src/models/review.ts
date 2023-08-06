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

reviewSchema.post('save', async function () {
  await _calcAvgRating((this as any).tour);
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
