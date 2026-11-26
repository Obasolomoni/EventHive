
import { Router } from "express";

import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventcontroller.js";

import { protect } from "../middlewares/authmiddleware.js";

const router = Router();

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Protected routes
router.post("/", protect, createEvent);
router.patch("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

export default router;
