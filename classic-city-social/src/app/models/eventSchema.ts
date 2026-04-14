import mongoose, { Schema, Model } from 'mongoose';

export type EventType = {
  title: string;
  tmid: string | null;
  description: string;
  date: string;
  time: string;
  location: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  category: string;
  imageUrl: string;
  venue: string;
  price: string;
  attendees: string[];
  reviews: string[];
  createdBy: string;
  url: string | null;
  source: string;
  aiSummary?: string | null;
  aiSummaryUpdatedAt?: string | null;
};

export type EventResponse = {
  _id: string;
  title: string;
  tmid: string | null;
  description: string;
  date: string;
  time: string;
  location: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  category: string;
  imageUrl: string;
  venue: string;
  price: string;
  attendees: string[];
  reviews: string[];
  createdBy: string;
  url: string | null;
  source: string;
  aiSummary?: string | null;
  aiSummaryUpdatedAt?: string | null;
};

export type EventDoc = mongoose.HydratedDocument<EventType>;

const EventSchema = new Schema<EventType>(
  {
    title: { type: String, required: true },
    tmid: { type: String, default: null },
    description: { type: String, default: null },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    venue: { type: String, default: '' },
    price: { type: String, default: '' },
    attendees: { type: [String], default: [] },
    reviews: { type: [String], default: [] }, // review _id values
    createdBy: { type: String, default: '' },
    url: { type: String, default: null },
    source: {
      type: String,
      enum: ['ClassicCitySocial', 'eventbrite', 'ticketmaster', 'athens_data'],
      required: true,
    },
    aiSummary: { type: String, default: null },
    aiSummaryUpdatedAt: { type: String, default: null },
  },
  { timestamps: true }
);

export const Event: Model<EventType> =
  (mongoose.models.Event as Model<EventType>) ||
  mongoose.model<EventType>('Event', EventSchema);

export default Event;