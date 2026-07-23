import mongoose from "mongoose";

export interface ISubscriber {
  email: string;
  subscribedAt: Date;
  active: boolean;
}

const SubscriberSchema = new mongoose.Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Subscriber ||
  mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);
