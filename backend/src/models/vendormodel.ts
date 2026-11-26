
import mongoose, { Document, Schema } from "mongoose";

export type VendorCategory =
  | "dj"
  | "caterer"
  | "musician"
  | "photographer"
  | "decorator"
  | "event_planner"
  | "mc"
  | "event_center"
  | "other";

export interface IVendor extends Document {
  owner: mongoose.Types.ObjectId;
  businessName: string;
  description: string;
  category: VendorCategory;
  location: string;
  phone: string;
  email: string;
  services: string[];
  priceFrom: number;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    businessName: {
      type: String,
      required: [true, "Business name is required."],
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    description: {
      type: String,
      required: [true, "Business description is required."],
      trim: true,
      maxlength: 3000,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "dj",
        "caterer",
        "musician",
        "photographer",
        "decorator",
        "event_planner",
        "mc",
        "event_center",
        "other",
      ],
    },

    location: {
      type: String,
      required: [true, "Business location is required."],
      trim: true,
      maxlength: 250,
    },

    phone: {
      type: String,
      required: [true, "Business phone number is required."],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Business email is required."],
      lowercase: true,
      trim: true,
    },

    services: {
      type: [String],
      default: [],
    },

    priceFrom: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    images: {
      type: [String],
      default: [],
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

// Retrieve active vendors by category.
vendorSchema.index({
  category: 1,
  isActive: 1,
});

// Retrieve vendors by location.
vendorSchema.index({
  location: 1,
  isActive: 1,
});

export const Vendor = mongoose.model<IVendor>(
  "Vendor",
  vendorSchema
);
