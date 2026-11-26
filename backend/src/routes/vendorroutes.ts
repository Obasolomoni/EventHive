
import { Router } from "express";

import {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deactivateVendor,
} from "../controllers/vendorcontroller.js";

import { protect } from "../middlewares/authmiddleware.js";

const router = Router();

// Public routes
router.get("/", getAllVendors);
router.get("/:id", getVendorById);

// Protected routes
router.post("/", protect, createVendor);
router.patch("/:id", protect, updateVendor);
router.patch("/:id/deactivate", protect, deactivateVendor);

export default router;
