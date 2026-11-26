
import { Router } from "express";

import {
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/usercontroller.js";

import { protect } from "../middlewares/authmiddleware.js";

const router = Router();

// Get the logged-in user's profile
router.get("/me", protect, getMe);

// Update the logged-in user's profile
router.patch("/profile", protect, updateProfile);

// Change the logged-in user's password
router.patch("/change-password", protect, changePassword);

export default router;
