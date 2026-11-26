
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Vendor } from "../models/vendormodel.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const vendorCategories = [
  "DJ",
  "Caterer",
  "Musician",
  "Photographer",
  "Videographer",
  "Decorator",
  "Event Planner",
  "Event Centre",
  "Sound and Lighting",
  "Other"
] as const;

// Validate vendor profile information
const validateVendorData = (data: Record<string, unknown>) => {
  const errors: string[] = [];

  if (
    typeof data.businessName !== "string" ||
    data.businessName.trim().length < 2 ||
    data.businessName.trim().length > 120
  ) {
    errors.push("Business name must be between 2 and 120 characters");
  }

  if (
    typeof data.description !== "string" ||
    data.description.trim().length < 20 ||
    data.description.trim().length > 2000
  ) {
    errors.push("Description must be between 20 and 2000 characters");
  }

  if (
    typeof data.category !== "string" ||
    !vendorCategories.includes(
      data.category as typeof vendorCategories[number]
    )
  ) {
    errors.push("Please select a valid vendor category");
  }

  if (
    typeof data.location !== "string" ||
    data.location.trim().length < 3
  ) {
    errors.push("A valid business location is required");
  }

  if (
    typeof data.phone !== "string" ||
    !/^\+?[0-9\s()-]{7,20}$/.test(data.phone.trim())
  ) {
    errors.push("Please provide a valid contact phone number");
  }

  if (
    data.email !== undefined &&
    (
      typeof data.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
    )
  ) {
    errors.push("Please provide a valid contact email");
  }

  if (
    !Array.isArray(data.services) ||
    data.services.length === 0 ||
    !data.services.every(
      (service) =>
        typeof service === "string" &&
        service.trim().length > 0
    )
  ) {
    errors.push("Provide at least one valid service");
  }

  if (data.priceFrom !== undefined) {
    const price = Number(data.priceFrom);

    if (!Number.isFinite(price) || price < 0) {
      errors.push("Starting price must be a valid non-negative number");
    }
  }

  if (
    data.images !== undefined &&
    (
      !Array.isArray(data.images) ||
      !data.images.every((image) => typeof image === "string")
    )
  ) {
    errors.push("Images must be an array of valid image URLs");
  }

  return errors;
};

// Create a vendor profile
export const createVendor = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const errors = validateVendorData(req.body);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Invalid vendor information",
        errors
      });
      return;
    }

    const existingVendor = await Vendor.findOne({
      owner: userId
    });

    if (existingVendor) {
      res.status(409).json({
        success: false,
        message: "You already have a vendor profile"
      });
      return;
    }

    const vendor = await Vendor.create({
      businessName: req.body.businessName.trim(),
      description: req.body.description.trim(),
      category: req.body.category,
      location: req.body.location.trim(),
      phone: req.body.phone.trim(),
      email: req.body.email?.trim().toLowerCase(),
      services: req.body.services.map(
        (service: string) => service.trim()
      ),
      priceFrom: Number(req.body.priceFrom ?? 0),
      images: req.body.images ?? [],
      owner: userId,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: "Vendor profile created successfully",
      vendor
    });
  } catch (error) {
    console.error("Create vendor error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create vendor profile"
    });
  }
};

// Retrieve active vendors with pagination and filters
export const getAllVendors = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(req.query.limit) || 10)
    );

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      isActive: true
    };

    if (typeof req.query.category === "string") {
      filter.category = req.query.category;
    }

    if (typeof req.query.location === "string") {
      filter.location = {
        $regex: req.query.location.trim().replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        ),
        $options: "i"
      };
    }

    if (
      typeof req.query.search === "string" &&
      req.query.search.trim()
    ) {
      const search = req.query.search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { services: { $regex: search, $options: "i" } }
      ];
    }

    const [vendors, totalVendors] = await Promise.all([
      Vendor.find(filter)
        .select("-owner")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Vendor.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      totalVendors,
      currentPage: page,
      totalPages: Math.ceil(totalVendors / limit),
      vendors
    });
  } catch (error) {
    console.error("Get vendors error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve vendors"
    });
  }
};

// Retrieve one active vendor
export const getVendorById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid vendor ID"
      });
      return;
    }

    const vendor = await Vendor.findOne({
      _id: id,
      isActive: true
    }).select("-owner");

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      vendor
    });
  } catch (error) {
    console.error("Get vendor error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve vendor"
    });
  }
};

// Update the logged-in user's vendor profile
export const updateVendor = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid vendor ID"
      });
      return;
    }

    const vendor = await Vendor.findOne({
      _id: id,
      owner: userId
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: "Vendor profile not found or you do not own it"
      });
      return;
    }

    const allowedFields = [
      "businessName",
      "description",
      "category",
      "location",
      "phone",
      "email",
      "services",
      "priceFrom",
      "images"
    ] as const;

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid update fields provided"
      });
      return;
    }

    const updatedData = {
      businessName: updates.businessName ?? vendor.businessName,
      description: updates.description ?? vendor.description,
      category: updates.category ?? vendor.category,
      location: updates.location ?? vendor.location,
      phone: updates.phone ?? vendor.phone,
      email: updates.email ?? vendor.email,
      services: updates.services ?? vendor.services,
      priceFrom: updates.priceFrom ?? vendor.priceFrom,
      images: updates.images ?? vendor.images
    };

    const errors = validateVendorData(updatedData);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Invalid vendor information",
        errors
      });
      return;
    }

    if (typeof updates.businessName === "string") {
      updates.businessName = updates.businessName.trim();
    }

    if (typeof updates.description === "string") {
      updates.description = updates.description.trim();
    }

    if (typeof updates.location === "string") {
      updates.location = updates.location.trim();
    }

    if (typeof updates.phone === "string") {
      updates.phone = updates.phone.trim();
    }

    if (typeof updates.email === "string") {
      updates.email = updates.email.trim().toLowerCase();
    }

    if (Array.isArray(updates.services)) {
      updates.services = updates.services.map(
        (service: string) => service.trim()
      );
    }

    if (updates.priceFrom !== undefined) {
      updates.priceFrom = Number(updates.priceFrom);
    }

    const updatedVendor = await Vendor.findOneAndUpdate(
      {
        _id: id,
        owner: userId
      },
      {
        $set: updates
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-owner");

    res.status(200).json({
      success: true,
      message: "Vendor profile updated successfully",
      vendor: updatedVendor
    });
  } catch (error) {
    console.error("Update vendor error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update vendor profile"
    });
  }
};

// Deactivate the logged-in user's vendor profile
export const deactivateVendor = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid vendor ID"
      });
      return;
    }

    const vendor = await Vendor.findOneAndUpdate(
      {
        _id: id,
        owner: userId,
        isActive: true
      },
      {
        $set: {
          isActive: false
        }
      },
      {
        new: true
      }
    ).select("-owner");

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: "Active vendor profile not found or you do not own it"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Vendor profile deactivated successfully"
    });
  } catch (error) {
    console.error("Deactivate vendor error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to deactivate vendor profile"
    });
  }
};
