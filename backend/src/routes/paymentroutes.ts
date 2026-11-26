
import { Router } from "express";

import {
  initializePayment,
  verifyPayment,
  getMyPayments,
} from "../controllers/paymentcontroller.js";

import { protect } from "../middlewares/authmiddleware.js";

const router = Router();

// Initialize payment for a booking
router.post("/initialize", protect, initializePayment);

// Verify a Paystack transaction
router.get("/verify/:reference", protect, verifyPayment);

// Retrieve the logged-in user's payment history
router.get("/my-payments", protect, getMyPayments);

export default router;
