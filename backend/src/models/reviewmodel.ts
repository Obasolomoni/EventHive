
import mongoose, { Document, Schema } from "mongoose";

export type ReviewTargetType = "event" | "vendor";
export type ReviewStatus = "published" | "hidden";

export interface IReview extends Document {
  reviewer: mongoose.Types.ObjectId;
  targetType: ReviewTargetType;
  event?: mongoose.Types.ObjectId;
  vendor?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetType: {
      type: String,
      enum: ["event", "vendor"],
      required: true,
    },

    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },

    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number between 1 and 5.",
      },
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["published", "hidden"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from reviewing the same event more than once.
reviewSchema.index(
  { reviewer: 1, event: 1 },
  {
    unique: true,
    partialFilterExpression: {
      targetType: "event",
      event: { $type: "objectId" },
    },
  }
);

// Prevent a user from reviewing the same vendor more than once.
reviewSchema.index(
  { reviewer: 1, vendor: 1 },
  {
    unique: true,
    partialFilterExpression: {
      targetType: "vendor",
      vendor: { $type: "objectId" },
    },
  }
);

// Retrieve reviews for events and vendors.
reviewSchema.index({
  event: 1,
  status: 1,
  createdAt: -1,
});

reviewSchema.index({
  vendor: 1,
  status: 1,
  createdAt: -1,
});

export const Review = mongoose.model<IReview>(
  "Review",
  reviewSchema
);
