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
    id: { type: String, required: true, unique: true },
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
      max: [15, 'The maximun group size is 15'],
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
      maxLength: [100, 'The summary should be within 100  characters.'],
    },
    description: {
      type: String,
      required: [true, 'Give your tour a description'],
      trim: true,
      maxLength: [500, 'The description should be within 500 characters'],
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('duration(week)').get(function () {
  return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

// document middleware
// pre middleware runs between .create() and .save()

export default Tour;
