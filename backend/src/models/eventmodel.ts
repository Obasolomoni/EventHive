
import mongoose, { Document, Schema } from "mongoose";

export type EventStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "completed";

export interface IEvent extends Document {
  eventName: string;
  eventDate: Date;
  eventTime: string;
  eventLocation: string;
  eventDescription: string;
  eventPrice: number;
  eventCapacity: number;
  eventCategory: string;
  eventImage?: string;
  organizer: mongoose.Types.ObjectId;
  status: EventStatus;
  bookedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    eventName: {
      type: String,
      required: [true, "Event name is required."],
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    eventDate: {
      type: Date,
      required: [true, "Event date is required."],
    },

    eventTime: {
      type: String,
      required: [true, "Event time is required."],
      trim: true,
    },

    eventLocation: {
      type: String,
      required: [true, "Event location is required."],
      trim: true,
      maxlength: 250,
    },

    eventDescription: {
      type: String,
      required: [true, "Event description is required."],
      trim: true,
      maxlength: 5000,
    },

    eventPrice: {
      type: Number,
      required: true,
      min: [0, "Event price cannot be negative."],
    },

    eventCapacity: {
      type: Number,
      required: true,
      min: [1, "Event capacity must be at least 1."],
      validate: {
        validator: Number.isInteger,
        message: "Event capacity must be a whole number.",
      },
    },

    eventCategory: {
      type: String,
      required: [true, "Event category is required."],
      trim: true,
    },

    eventImage: {
      type: String,
      trim: true,
    },

    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },

    bookedCount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Booked count must be a whole number.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Helps retrieve published events by date.
eventSchema.index({ status: 1, eventDate: 1 });

// Helps retrieve an organizer's events.
eventSchema.index({ organizer: 1, createdAt: -1 });

export const Event = mongoose.model<IEvent>(
  "Event",
  eventSchema
);
