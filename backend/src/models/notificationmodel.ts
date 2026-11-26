
import mongoose, { Document, Schema } from "mongoose";

export type NotificationType =
  | "event_update"
  | "booking_created"
  | "payment_success"
  | "payment_failed"
  | "ticket_issued"
  | "vendor_booking"
  | "system";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "event_update",
        "booking_created",
        "payment_success",
        "payment_failed",
        "ticket_issued",
        "vendor_booking",
        "system",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    data: {
      type: Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Retrieve a user's notifications, newest first.
notificationSchema.index({
  user: 1,
  createdAt: -1,
});

// Quickly retrieve unread notifications.
notificationSchema.index({
  user: 1,
  isRead: 1,
});

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
