
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Ticket } from "../models/ticketmodel.js";
import { Event } from "../models/eventmodel.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

// Retrieve all tickets belonging to the logged-in attendee
export const getMyTickets = async (
  req: AuthenticatedRequest,
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

    const tickets = await Ticket.find({
      attendee: userId
    })
      .populate("event")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalTickets: tickets.length,
      tickets
    });
  } catch (error) {
    console.error("Get tickets error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve tickets"
    });
  }
};

// Retrieve one ticket belonging to the logged-in attendee
export const getTicketById = async (
  req: AuthenticatedRequest,
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
        message: "Invalid ticket ID"
      });
      return;
    }

    const ticket = await Ticket.findOne({
      _id: id,
      attendee: userId
    }).populate("event");

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error("Get ticket error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve ticket"
    });
  }
};

// Verify a ticket before allowing entry to an event
export const verifyTicket = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { ticketCode } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    if (
      typeof ticketCode !== "string" ||
      !/^[a-f0-9-]{36}$/i.test(ticketCode)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid ticket code"
      });
      return;
    }

    const ticket = await Ticket.findOne({
      ticketCode
    })
      .populate("attendee", "fullName email")
      .populate("event");

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
      return;
    }

    const event = await Event.findOne({
      _id: ticket.event,
      organizer: userId
    });

    if (!event) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to verify tickets for this event"
      });
      return;
    }

    if (ticket.status === "cancelled") {
      res.status(400).json({
        success: false,
        valid: false,
        message: "This ticket has been cancelled"
      });
      return;
    }

    if (ticket.status === "used") {
      res.status(409).json({
        success: false,
        valid: false,
        message: "This ticket has already been used"
      });
      return;
    }

    res.status(200).json({
      success: true,
      valid: ticket.status === "valid",
      message: "Ticket is valid",
      ticket
    });
    
  } catch (error) {
    console.error("Ticket verification error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify ticket"
    });
  }
};

// Check in an attendee using their ticket code
export const checkInTicket = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { ticketCode } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    if (
      typeof ticketCode !== "string" ||
      !/^[a-f0-9-]{36}$/i.test(ticketCode)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid ticket code"
      });
      return;
    }

    const ticket = await Ticket.findOne({
      ticketCode
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
      return;
    }

    // Only the organizer of the event can check in attendees.
    const event = await Event.findOne({
      _id: ticket.event,
      organizer: userId
    });

    if (!event) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to check in attendees for this event"
      });
      return;
    }

    // Atomically change active to used.
    // This prevents two simultaneous check-ins from succeeding.
    const checkedInTicket = await Ticket.findOneAndUpdate(
      {
        _id: ticket._id,
        status: "valid"
      },
      {
        $set: {
          status: "used",
          checkedInAt: new Date()
        }
      },
      {
        new: true
      }
    )
      .populate("attendee", "fullName email")
      .populate("event");

    if (!checkedInTicket) {
      res.status(409).json({
        success: false,
        message: "Ticket has already been used or is no longer active"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Attendee checked in successfully",
      ticket: checkedInTicket
    });
  } catch (error) {
    console.error("Ticket check-in error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to check in attendee"
    });
  }
};
