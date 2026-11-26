
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Event } from "../models/eventmodel.js";

// Allowed event fields
const eventFields = [
  "eventName",
  "eventDate",
  "eventTime",
  "eventLocation",
  "eventDescription",
  "eventPrice",
  "eventCapacity",
  "eventCategory",
  "eventImage"
] as const;

// Validate event data before saving
const validateEventData = (data: Record<string, unknown>) => {
  const errors: string[] = [];

  if (
    typeof data.eventName !== "string" ||
    data.eventName.trim().length < 3 ||
    data.eventName.trim().length > 150
  ) {
    errors.push("Event name must be between 3 and 150 characters");
  }

  if (
    typeof data.eventDate !== "string" ||
    Number.isNaN(Date.parse(data.eventDate))
  ) {
    errors.push("A valid event date is required");
  }

  if (
    typeof data.eventTime !== "string" ||
    !data.eventTime.trim()
  ) {
    errors.push("Event time is required");
  }

  if (
    typeof data.eventLocation !== "string" ||
    data.eventLocation.trim().length < 3
  ) {
    errors.push("A valid event location is required");
  }

  if (
    typeof data.eventDescription !== "string" ||
    data.eventDescription.trim().length < 10
  ) {
    errors.push("Event description must contain at least 10 characters");
  }

  const price = Number(data.eventPrice);

  if (!Number.isFinite(price) || price < 0) {
    errors.push("Event price must be a valid non-negative number");
  }

  const capacity = Number(data.eventCapacity);

  if (
    !Number.isInteger(capacity) ||
    capacity < 1
  ) {
    errors.push("Event capacity must be a positive whole number");
  }

  if (
    typeof data.eventCategory !== "string" ||
    !data.eventCategory.trim()
  ) {
    errors.push("Event category is required");
  }

  if (
    data.eventImage !== undefined &&
    typeof data.eventImage !== "string"
  ) {
    errors.push("Event image must be a valid string");
  }

  return errors;
};

// Create a new event
export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const errors = validateEventData(req.body);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Invalid event information",
        errors
      });
      return;
    }

    const event = await Event.create({
      eventName: req.body.eventName.trim(),
      eventDate: new Date(req.body.eventDate),
      eventTime: req.body.eventTime.trim(),
      eventLocation: req.body.eventLocation.trim(),
      eventDescription: req.body.eventDescription.trim(),
      eventPrice: Number(req.body.eventPrice),
      eventCapacity: Number(req.body.eventCapacity),
      eventCategory: req.body.eventCategory.trim(),
      eventImage: req.body.eventImage,
      organizer: userId
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event
    });
  } catch (error) {
    console.error("Create event error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create event"
    });
  }
};

// Retrieve all events with pagination and optional search
export const getAllEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(req.query.limit) || 10)
    );

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const search = req.query.search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { eventName: { $regex: search, $options: "i" } },
        { eventLocation: { $regex: search, $options: "i" } },
        { eventCategory: { $regex: search, $options: "i" } }
      ];
    }

    const [events, totalEvents] = await Promise.all([
      Event.find(filter)
        .sort({ eventDate: 1 })
        .skip(skip)
        .limit(limit)
        .populate("organizer", "fullName"),

      Event.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      totalEvents,
      currentPage: page,
      totalPages: Math.ceil(totalEvents / limit),
      events
    });
  } catch (error) {
    console.error("Get events error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve events"
    });
  }
};

// Retrieve one event by its ID
export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid event ID"
      });
      return;
    }

    const event = await Event.findById(id).populate(
      "organizer",
      "fullName"
    );

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error("Get event error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve event"
    });
  }
};

// Update an event created by the logged-in user
export const updateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid event ID"
      });
      return;
    }

    const updates: Record<string, unknown> = {};

    for (const field of eventFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid event fields were provided"
      });
      return;
    }

    const existingEvent = await Event.findOne({
      _id: id,
      organizer: userId
    });

    if (!existingEvent) {
      res.status(404).json({
        success: false,
        message: "Event not found or you are not its organizer"
      });
      return;
    }

    const updatedData = {
      eventName: updates.eventName ?? existingEvent.eventName,
      eventDate: updates.eventDate ?? existingEvent.eventDate,
      eventTime: updates.eventTime ?? existingEvent.eventTime,
      eventLocation: updates.eventLocation ?? existingEvent.eventLocation,
      eventDescription:
        updates.eventDescription ?? existingEvent.eventDescription,
      eventPrice: updates.eventPrice ?? existingEvent.eventPrice,
      eventCapacity: updates.eventCapacity ?? existingEvent.eventCapacity,
      eventCategory: updates.eventCategory ?? existingEvent.eventCategory,
      eventImage: updates.eventImage ?? existingEvent.eventImage
    };

    const errors = validateEventData({
      ...updatedData,
      eventDate:
        updatedData.eventDate instanceof Date
          ? updatedData.eventDate.toISOString()
          : updatedData.eventDate
    });

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Invalid event information",
        errors
      });
      return;
    }

    if (updates.eventDate !== undefined) {
      updates.eventDate = new Date(String(updates.eventDate));
    }

    if (updates.eventPrice !== undefined) {
      updates.eventPrice = Number(updates.eventPrice);
    }

    if (updates.eventCapacity !== undefined) {
      updates.eventCapacity = Number(updates.eventCapacity);
    }

    for (const field of [
      "eventName",
      "eventTime",
      "eventLocation",
      "eventDescription",
      "eventCategory"
    ] as const) {
      if (typeof updates[field] === "string") {
        updates[field] = updates[field].trim();
      }
    }

    const event = await Event.findOneAndUpdate(
      {
        _id: id,
        organizer: userId
      },
      {
        $set: updates
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event
    });
  } catch (error) {
    console.error("Update event error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update event"
    });
  }
};

// Delete an event created by the logged-in user
export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid event ID"
      });
      return;
    }

    const event = await Event.findOneAndDelete({
      _id: id,
      organizer: userId
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found or you are not its organizer"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    console.error("Delete event error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete event"
    });
  }
};
