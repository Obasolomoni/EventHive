
import { Router } from "express";

import {
  createVendorBooking,
  getMyVendorBookings,
  getVendorBookings,
  respondToVendorBooking,
  cancelVendorBooking,
  completeVendorBooking,
} from "../controllers/vendorbookingcontroller.js";

import { protect } from "../middlewares/authmiddleware.js";

const router = Router();

// Customer routes
router.post("/", protect, createVendorBooking);
router.get("/my-bookings", protect, getMyVendorBookings);
router.patch("/:bookingId/cancel", protect, cancelVendorBooking);

// Vendor routes
router.get("/vendor/:vendorId", protect, getVendorBookings);
router.patch("/:bookingId/respond", protect, respondToVendorBooking);
router.patch("/:bookingId/complete", protect, completeVendorBooking);

export default router;
