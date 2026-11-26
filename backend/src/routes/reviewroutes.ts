
import { Router } from "express";

import {
  createReview,
  getEventReviews,
  getVendorReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewcontroller.js";

import { protect } from "../middlewares/authmiddleware.js";

const router = Router();

// Public routes
router.get("/event/:eventId", getEventReviews);
router.get("/vendor/:vendorId", getVendorReviews);

// Protected routes
router.post("/", protect, createReview);
router.patch("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);

export default router;
