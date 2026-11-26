
import mongoose, { Document, Schema } from "mongoose";

export type EventStaffRole = "checkin_staff" | "event_manager";

export type EventStaffPermission =
  | "check_in_attendees"
  | "view_attendees"
  | "manage_attendees"
  | "manage_event_staff";

export interface IEventStaff extends Document {
  event: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  role: EventStaffRole;
  permissions: EventStaffPermission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventStaffSchema = new Schema<IEventStaff>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["checkin_staff", "event_manager"],
      required: true,
      default: "checkin_staff",
    },
    permissions: {
      type: [
        {
          type: String,
          enum: [
            "view_attendees",
            "check_in_attendees",
            "manage_attendees",
            "manage_event_staff",
          ],
        },
      ],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// A user can only have one staff assignment per event.
eventStaffSchema.index(
  { event: 1, user: 1 },
  { unique: true }
);

eventStaffSchema.index({ user: 1, isActive: 1 });
eventStaffSchema.index({ event: 1, isActive: 1 });

export const EventStaff = mongoose.model<IEventStaff>(
  "EventStaff",
  eventStaffSchema
);
