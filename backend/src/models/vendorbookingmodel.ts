
import mongoose, { Document, Schema } from "mongoose";

export type VendorBookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export interface IVendorBooking extends Document {
  vendor: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  event?: mongoose.Types.ObjectId;
  serviceDescription: string;
  eventDate: Date;
  eventLocation: string;
  requestedBudget?: number;
  quotedAmount?: number;
  customerMessage?: string;
  vendorMessage?: string;
  status: VendorBookingStatus;
  respondedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const vendorBookingSchema = new Schema<IVendorBooking>(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },

    serviceDescription: {
      type: String,
      required: [true, "Service description is required."],
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    eventDate: {
      type: Date,
      required: [true, "Event date is required."],
    },

    eventLocation: {
      type: String,
      required: [true, "Event location is required."],
      trim: true,
      maxlength: 250,
    },

    requestedBudget: {
      type: Number,
      min: 0,
      default: null,
    },

    quotedAmount: {
      type: Number,
      min: 0,
      default: null,
    },

    customerMessage: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    vendorMessage: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },

    respondedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Retrieve a customer's vendor booking history.
vendorBookingSchema.index({
  customer: 1,
  createdAt: -1,
});

// Retrieve bookings received by a vendor.
vendorBookingSchema.index({
  vendor: 1,
  status: 1,
});

// Retrieve vendor bookings associated with an event.
vendorBookingSchema.index({
  event: 1,
});

export const VendorBooking = mongoose.model<IVendorBooking>(
  "VendorBooking",
  vendorBookingSchema
);
