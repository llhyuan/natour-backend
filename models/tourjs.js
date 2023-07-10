//import { ObjectId } from 'mongodb';
const mongoose = require('mongoose');

// Declare document model
// export default interface Tour {
//   tour_id: number;
//   name: string;
//   rating: number;
//   price: number;
//   id?: ObjectId;
// }

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
  },
  duration: { type: Number, required: [true, 'A tour mush have a duration'] },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: { type: String, required: [true, 'Difficulty must be provided'] },
  ratingsAverage: { type: Number, required: false, default: null },
  price: { type: Number, required: [true, 'A tour must have a price'] },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Give your tour a description'],
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A cover image would help attract more customers'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
