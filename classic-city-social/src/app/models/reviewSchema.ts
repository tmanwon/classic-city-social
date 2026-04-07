import { Schema, InferSchemaType } from 'mongoose';

export const ReviewSchema = new Schema(
  {
    userId:    { type: String, required: true },
    userName:  { type: String, required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, required: true },
    sentiment: { type: String, enum: ['positive', 'negative', 'neutral'] },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: true }
);

export type Review = InferSchemaType<typeof ReviewSchema>;
