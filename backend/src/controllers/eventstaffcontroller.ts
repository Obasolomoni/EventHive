
import type { Request, Response } from "express";
import mongoose from "mongoose";

import { Event } from "../models/eventmodel.js";
import { User } from "../models/usermodel.js";
import { EventStaff } from "../models/eventstaffmodel.js";

import type { EventStaffPermission } from "../models/eventstaffmodel.js";

const validPermissions: EventStaffPermission[] = [
  "check_in_attendees",
  "view_attendees",
  "manage_attendees",
  "manage_event_staff",
];

const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

const isValidPermissions = (
  permissions: unknown
): permissions is EventStaffPermission[] => {
  return (
    Array.isArray(permissions) &&
    permissions.every(
      (permission: unknown) =>
        validPermissions.includes(permission as EventStaffPermission)
    ) &&
    new Set(permissions).size === permissions.length
  );
};

// Confirm that the user can manage staff for this event.
const getManageableEvent = async (
  eventId: string,
  userId: string
) => {
  if (!isValidObjectId(eventId)) {
    return null;
  }

  const event = await Event.findById(eventId);

  if (!event) {
    return null;
  }

  // Event organizer has full access.
  if (event.organizer.toString() === userId) {
    return event;
  }

  // Other staff must have the staff-management permission.
  const staffAccess = await EventStaff.exists({
    event: eventId,
    user: userId,
    isActive: true,
    permissions: "manage_event_staff",
  });

  return staffAccess ? event : null;
};

// ADD STAFF TO AN EVENT
export const addEventStaff = async (
  req: Request,
  res: Response
) => {
  try {
    const organizerId = req.user?.id;
    const eventId = String(req.params.eventId ?? "");
    const { userId, permissions } = req.body;

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      !isValidObjectId(eventId) ||
      typeof userId !== "string" ||
      !isValidObjectId(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid event or user ID.",
      });
    }

    const event = await getManageableEvent(eventId, organizerId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not authorized to manage its staff.",
      });
    }

    if (
      !isValidPermissions(permissions) ||
      permissions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one valid staff permission.",
        allowedPermissions: validPermissions,
      });
    }

    const staffUser = await User.findOne({
      _id: userId,
      isActive: true,
    });

    if (!staffUser) {
      return res.status(404).json({
        success: false,
        message: "The selected user does not exist or is inactive.",
      });
    }

    if (staffUser._id.toString() === organizerId) {
      return res.status(400).json({
        success: false,
        message: "You cannot add yourself as event staff.",
      });
    }

    const existingStaff = await EventStaff.findOne({
      event: eventId,
      user: userId,
    });

    if (existingStaff?.isActive) {
      return res.status(409).json({
        success: false,
        message: "This user is already assigned to the event.",
      });
    }

    let staff;

    if (existingStaff) {
      existingStaff.permissions = permissions;
      existingStaff.isActive = true;
      existingStaff.assignedBy =
        new mongoose.Types.ObjectId(organizerId);

      staff = await existingStaff.save();
    } else {
      staff = await EventStaff.create({
        event: eventId,
        user: userId,
        permissions,
        assignedBy: organizerId,
      });
    }

    await staff.populate("user", "fullName email");

    return res.status(201).json({
      success: true,
      message: "Event staff added successfully.",
      staff,
    });
  } catch (error) {
    console.error("Add event staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add event staff.",
    });
  }
};

// GET ALL STAFF ASSIGNED TO AN EVENT
export const getEventStaff = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const eventId = String(req.params.eventId ?? "");

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const event = await getManageableEvent(eventId, userId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not authorized to view its staff.",
      });
    }

    const staff = await EventStaff.find({
      event: eventId,
      isActive: true,
    })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    console.error("Get event staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve event staff.",
    });
  }
};

// GET EVENTS ASSIGNED TO THE LOGGED-IN STAFF MEMBER
export const getMyStaffAssignments = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const assignments = await EventStaff.find({
      user: userId,
      isActive: true,
    })
      .populate("event")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get staff assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your event assignments.",
    });
  }
};

// UPDATE A STAFF MEMBER'S PERMISSIONS
export const updateEventStaffPermissions = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const eventId = String(req.params.eventId ?? "");
    const staffId = String(req.params.staffId ?? "");
    const { permissions } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      !isValidObjectId(eventId) ||
      !isValidObjectId(staffId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid event or staff ID.",
      });
    }

    const event = await getManageableEvent(eventId, userId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not authorized to manage its staff.",
      });
    }

    // An empty array is allowed to revoke all permissions.
    if (!isValidPermissions(permissions)) {
      return res.status(400).json({
        success: false,
        message: "Provide valid staff permissions.",
        allowedPermissions: validPermissions,
      });
    }

    const staff = await EventStaff.findOne({
      _id: staffId,
      event: eventId,
      isActive: true,
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Active event staff member not found.",
      });
    }

    staff.permissions = permissions;

    await staff.save();
    await staff.populate("user", "fullName email");

    return res.status(200).json({
      success: true,
      message: "Staff permissions updated successfully.",
      staff,
    });
  } catch (error) {
    console.error("Update event staff permissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update staff permissions.",
    });
  }
};

// REMOVE STAFF FROM AN EVENT
export const removeEventStaff = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const eventId = String(req.params.eventId ?? "");
    const staffId = String(req.params.staffId ?? "");

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      !isValidObjectId(eventId) ||
      !isValidObjectId(staffId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid event or staff ID.",
      });
    }

    const event = await getManageableEvent(eventId, userId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not authorized to manage its staff.",
      });
    }

    const staff = await EventStaff.findOne({
      _id: staffId,
      event: eventId,
      isActive: true,
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Active event staff member not found.",
      });
    }

    staff.isActive = false;
    await staff.save();

    return res.status(200).json({
      success: true,
      message: "Staff member removed from this event successfully.",
    });
  } catch (error) {
    console.error("Remove event staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove event staff.",
    });
  }
};
