
import { Router } from "express";

import {
  createBooking,
  getMyBookings,
  getEventBookings,
  getBookingById,
  cancelBooking,
} from "../controllers/bookingcontroller.js";

import { protect } from "../middlewares/authmiddleware.js";

const router = Router();

// Create a booking
router.post("/", protect, createBooking);

// Get bookings belonging to the logged-in attendee
router.get("/my-bookings", protect, getMyBookings);

// Get bookings for an organizer's event
router.get("/event/:eventId", protect, getEventBookings);

// Get one booking
router.get("/:id", protect, getBookingById);

// Cancel a pending booking
router.patch("/:id/cancel", protect, cancelBooking);

export default router;
