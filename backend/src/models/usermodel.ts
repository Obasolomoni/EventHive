
import mongoose, { Document, Schema } from "mongoose";

export type UserRole =
  | "attendee"
  | "organizer"
  | "vendor"
  | "admin";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: 8,
      select: false,
    },

    roles: {
      type: [
        {
          type: String,
          enum: ["attendee", "organizer", "vendor", "admin"],
        },
      ],
      default: ["attendee"],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Normalize email before saving.
userSchema.pre("validate", function () {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
});

export const User = mongoose.model<IUser>("User", userSchema);
