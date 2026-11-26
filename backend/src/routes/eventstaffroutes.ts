
import { Router } from "express";

import {
  addEventStaff,
  getEventStaff,
  getMyStaffAssignments,
  updateEventStaffPermissions,
  removeEventStaff,
} from "../controllers/eventstaffcontroller.js";

import { protect } from "../middlewares/authmiddleware.js";

import {
  requireEventStaffPermission,
} from "../middlewares/eventstaffmiddleware.js";

const router = Router();

// Get events assigned to the logged-in staff member
router.get("/my-assignments", protect, getMyStaffAssignments);

// Add staff to an event
router.post(
  "/:eventId",
  protect,
  addEventStaff
);

// Get all staff assigned to an event
router.get(
  "/:eventId",
  protect,
  requireEventStaffPermission("manage_attendees"),
  getEventStaff
);

// Update a staff member's permissions
router.patch(
  "/:eventId/:staffId/permissions",
  protect,
  requireEventStaffPermission("manage_attendees"),
  updateEventStaffPermissions
);

// Remove staff from an event
router.delete(
  "/:eventId/:staffId",
  protect,
  requireEventStaffPermission("manage_attendees"),
  removeEventStaff
);

export default router;
