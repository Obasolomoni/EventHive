import mongoose, { Document, Schema } from "mongoose";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled";

export interface IBooking extends Document {
  event: mongoose.Types.ObjectId;
  attendee: mongoose.Types.ObjectId;
  quantity: number;
  totalAmount: number;
  status: BookingStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    attendee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      validate: {
        validator: Number.isInteger,
        message: "Booking quantity must be a whole number.",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Booking amount cannot be negative."],
      validate: {
        validator: Number.isFinite,
        message: "Booking amount must be a valid number.",
      },
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({
  attendee: 1,
  createdAt: -1,
});

bookingSchema.index({
  event: 1,
  status: 1,
});

bookingSchema.index({
  status: 1,
  expiresAt: 1,
});

export const Booking = mongoose.model<IBooking>(
  "Booking",
  bookingSchema
);