
import type { RequestHandler } from "express";
import mongoose from "mongoose";

import { Event } from "../models/eventmodel.js";
import { EventStaff } from "../models/eventstaffmodel.js";

const validPermissions = [
  "check_in_attendees",
  "view_attendees",
  "manage_attendees",
] as const;

export type EventStaffPermission =
  (typeof validPermissions)[number];

export const requireEventStaffPermission = (
  permission: EventStaffPermission
): RequestHandler => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const eventId = String(req.params.eventId ?? "");

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        res.status(400).json({
          success: false,
          message: "Invalid event ID.",
        });
        return;
      }

      // Confirm that the event exists.
      const event = await Event.findById(eventId);

      if (!event) {
        res.status(404).json({
          success: false,
          message: "Event not found.",
        });
        return;
      }

      // The event organizer has full access to their event.
      if (event.organizer.toString() === userId) {
        next();
        return;
      }

      // Find the user's active event staff assignment.
      const staff = await EventStaff.findOne({
        event: eventId,
        user: userId,
        isActive: true,
      });

      if (!staff) {
        res.status(403).json({
          success: false,
          message: "You are not assigned to this event.",
        });
        return;
      }

      // Check whether the staff member has the required permission.
      if (!staff.permission.includes(permission)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action.",
          requiredPermission: permission,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Event staff permission error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to verify event staff permissions.",
      });
    }
  };
};
