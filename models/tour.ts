import { ObjectId } from 'mongodb';

// Declare document model
export default interface Tour {
  tour_id: number;
  name: string;
  rating: number;
  price: number;
  id?: ObjectId;
}
