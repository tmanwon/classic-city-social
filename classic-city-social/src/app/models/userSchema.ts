import mongoose, { Schema, InferSchemaType } from 'mongoose';

const UserSchema = new Schema(
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
export type User = InferSchemaType<typeof UserSchema>;

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

export default UserModel;
