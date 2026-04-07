import mongoose, { Schema, Model } from 'mongoose';
import { ReviewSchema } from './reviewSchema';

export type EventType = {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: string;
  imageUrl: string;
  venue: string;
  price: string;
  capacity: number;
  attendees: string[];
  reviews: string[];
  createdBy: string;
  url: string;
  source: string;
};

export type EventDoc = mongoose.HydratedDocument<EventType>;

const EventSchema = new Schema<EventType>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    venue: { type: String },
    price: { type: String },
    capacity: { type: Number },
    attendees: { type: [String], default: [] },
    reviews: { type: [String], default: [] },
    createdBy: { type: String },
    url: { type: String },
    source: { type: String, enum: ['ClassicCitySocial', 'eventbrite', 'ticketmaster', 'athens_data'], required: true },
  },
  { timestamps: true }
);

export const Event: Model<EventType> =
  (mongoose.models.Event as Model<EventType>) ||
  mongoose.model<EventType>("Event", EventSchema);

export default Event;
