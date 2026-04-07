import mongoose, { Schema, InferSchemaType } from 'mongoose';
import { ReviewSchema } from './reviewSchema';

const EventSchema = new Schema(
  {
    id: { type: String, required: true },
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
    reviews: { type: [ReviewSchema], default: [] },
    createdBy: { type: String },
    url: { type: String },
    source: { type: String, enum: ['ClassicCitySocial', 'eventbrite', 'ticketmaster', 'athens_data'], required: true },
  },
  { timestamps: true }
);

export type Event = InferSchemaType<typeof EventSchema>;

const EventModel = mongoose.models.Event || mongoose.model('Event', EventSchema);

export default EventModel;
