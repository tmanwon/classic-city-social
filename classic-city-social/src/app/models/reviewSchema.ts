import mongoose, { Schema, Model } from 'mongoose';

export type ReviewType = {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  sentiment: string;
  createdAt: string;
};

export type ReviewDoc = mongoose.HydratedDocument<ReviewType>;

export const ReviewSchema = new Schema<ReviewType>(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    sentiment: { type: String, enum: ['positive', 'negative', 'neutral'] },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: true }
);

export const Review: Model<ReviewType> =
  (mongoose.models.Review as Model<ReviewType>) ||
  mongoose.model<ReviewType>("Review", ReviewSchema);

export default Review;
