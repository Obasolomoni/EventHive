
import mongoose, { Document, Schema } from "mongoose";

export type PaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "refunded";

export type PaymentProvider = "paystack";

export interface IPayment extends Document {
  booking: mongoose.Types.ObjectId;
  attendee: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  reference: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  authorizationUrl?: string;
  accessCode?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    attendee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1, "Payment amount must be greater than zero."],
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "NGN",
      enum: ["NGN"],
    },

    reference: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },

    provider: {
      type: String,
      enum: ["paystack"],
      default: "paystack",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },

    authorizationUrl: {
      type: String,
      default: null,
    },

    accessCode: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Retrieve an attendee's payment history.
paymentSchema.index({
  attendee: 1,
  createdAt: -1,
});

// Retrieve payments associated with a booking.
paymentSchema.index({
  booking: 1,
  status: 1,
});

export const Payment = mongoose.model<IPayment>(
  "Payment",
  paymentSchema
);
