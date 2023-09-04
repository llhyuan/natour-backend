//import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

// Declare document model
// export default interface Tour {
//   tour_id: number;
//   name: string;
//   rating: number;
//   price: number;
//   id?: ObjectId;
// }

const tourSchema = new mongoose.Schema(
  {
    //id: { type: String, required: true, unique: true },
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'The name could not be more than 40 characters.'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour mush have a duration'],
      default: 1,
      max: [365, 'The duration is unrealisticlly long'],
      min: [1, 'The duration can not be 0'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
      max: [50, 'The maximun group size is 15'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty must be provided'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can only be "easy", "medium" or "difficult"',
      },
    },
    ratingsAverage: {
      type: Number,
      required: false,
      default: null,
      min: [1, 'Rating should be above or equal to 0'],
      max: [5, 'The highest rating is 5'],
      set: (val: number): number => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      required: false,
      default: 0,
      min: [0, 'The quantity can be negtive'],
    },
    startDates: { type: Array<string>, required: false, default: [] },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: [1, 'Discount should be a decimal between 0 and 1'],
    },
    summary: {
      type: String,
      trim: true,
      maxLength: [1000, 'The summary should be within 100  characters.'],
    },
    description: {
      type: String,
      required: [true, 'Give your tour a description'],
      trim: true,
      maxLength: [2000, 'The description should be within 500 characters'],
    },
    imageCover: {
      type: String,
      required: [true, 'A cover image would help attract more customers'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    // To embed documents,
    // simply embed child doc schema into a parent field as follows:
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    guides: [
      {
        type: mongoose.Types.ObjectId,
        // ref is to specify which model to use to populate guides
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('duration(week)').get(function () {
  return Math.ceil(this.duration / 7);
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.pre(/^find/, function (next) {
  (this as any).populate({
    path: 'guides',
    select: 'name email',
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

// document middleware
// pre middleware runs between .create() and .save()

export default Tour;
