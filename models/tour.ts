import { ObjectId } from 'mongodb';

// Declare document model
export default interface Tour {
  name: String;
  rating: Number;
  price: Number;
  id?: ObjectId;
}
