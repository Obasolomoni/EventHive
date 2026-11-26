
import mongoose, { Document, Schema } from "mongoose";

export type OrganizationType =
  | "church"
  | "school"
  | "company"
  | "community"
  | "other";

export type OrganizationMemberRole =
  | "admin"
  | "manager"
  | "event_manager"
  | "checkin_staff";

export type OrganizationPermission =
  | "manage_organization"
  | "manage_members"
  | "manage_events"
  | "manage_bookings"
  | "check_in_attendees";

export interface IOrganizationMember {
  user: mongoose.Types.ObjectId;
  role: OrganizationMemberRole;
  permissions: OrganizationPermission[];
  joinedAt: Date;
}

export interface IOrganization extends Document {
  name: string;
  description?: string;
  organizationType: OrganizationType;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  owner: mongoose.Types.ObjectId;
  members: IOrganizationMember[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const organizationMemberSchema = new Schema<IOrganizationMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "event_manager", "checkin_staff"],
      required: true,
      default: "checkin_staff",
    },
    permissions: {
      type: [
        {
          type: String,
          enum: [
            "manage_organization",
            "manage_members",
            "manage_events",
            "manage_bookings",
            "check_in_attendees",
          ],
        },
      ],
      default: [],
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, "Organization name is required."],
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    organizationType: {
      type: String,
      enum: ["church", "school", "company", "community", "other"],
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: {
      type: [organizationMemberSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent the same user from being added more than once.
organizationSchema.path("members").validate(
  function (members: IOrganizationMember[]) {
    const memberIds = members.map((member) => member.user.toString());
    return memberIds.length === new Set(memberIds).size;
  },
  "A user cannot be added to the same organization more than once."
);

organizationSchema.index({ owner: 1, createdAt: -1 });
organizationSchema.index({ "members.user": 1 });
organizationSchema.index({ organizationType: 1, isActive: 1 });

export const Organization = mongoose.model<IOrganization>(
  "Organization",
  organizationSchema
);
