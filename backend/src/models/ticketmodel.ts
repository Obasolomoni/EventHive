
import mongoose, { Document, Schema } from "mongoose";
import { randomUUID } from "node:crypto";

export type TicketStatus = "valid" | "used" | "cancelled";

export interface ITicket extends Document {
  booking: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  attendee: mongoose.Types.ObjectId;
  ticketCode: string;
  ticketNumber: number;
  status: TicketStatus;
  checkedInAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
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
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      default: () => randomUUID(),
      immutable: true,
    },
    ticketNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["valid", "used", "cancelled"],
      default: "valid",
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Each booking can contain multiple tickets,
// but ticket numbers must be unique within that booking.
ticketSchema.index(
  { booking: 1, ticketNumber: 1 },
  { unique: true }
);

ticketSchema.index({ attendee: 1, createdAt: -1 });
ticketSchema.index({ event: 1, status: 1 });

export const Ticket = mongoose.model<ITicket>(
  "Ticket",
  ticketSchema
);
