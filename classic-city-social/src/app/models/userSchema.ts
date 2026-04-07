import mongoose, { Schema, Model } from 'mongoose';

export type UserType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  friends?: string[];
  imageUrl?: string;
  myEvents?: string[];
  eventsAttending?: string[];
};

export type UserDoc = mongoose.HydratedDocument<UserType>;

const UserSchema = new Schema<UserType>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    friends: { type: [String], default: [] },
    imageUrl: { type: String },
    myEvents: { type: [String], default: [] },
    eventsAttending: { type: [String], default: [] },
  },
  { timestamps: true }
);

// TypeScript type is inferred directly from the schema — no duplication
export const User: Model<UserType> =
  (mongoose.models.User as Model<UserType>) ||
  mongoose.model<UserType>("User", UserSchema);

export default User;
