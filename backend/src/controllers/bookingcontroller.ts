import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Booking } from "../models/bookingmodel.js";
import { Event } from "../models/eventmodel.js";
import { Payment } from "../models/paymentmodel.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

class BookingError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "BookingError";
  }
}

// Create a booking
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const { eventId, quantity } = req.body;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (!mongoose.isValidObjectId(eventId)) {
    res.status(400).json({
      success: false,
      message: "A valid event ID is required",
    });
    return;
  }

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 10
  ) {
    res.status(400).json({
      success: false,
      message: "Booking quantity must be between 1 and 10",
    });
    return;
  }

  const session = await mongoose.startSession();

  try {
    let bookingId: mongoose.Types.ObjectId | undefined;

    // Give every booking 15 minutes to complete payment.
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await session.withTransaction(async () => {
      const event = await Event.findById(eventId).session(session);

      if (!event) {
        throw new BookingError("Event not found", 404);
      }

      if (event.status !== "published") {
        throw new BookingError(
          "This event is not available for booking",
          400
        );
      }

      if (event.organizer.toString() === userId) {
        throw new BookingError(
          "You cannot book your own event",
          403
        );
      }

      // Reserve seats only if enough capacity remains.
      const capacityUpdate = await Event.updateOne(
        {
          _id: eventId,
          status: "published",
          $expr: {
            $lte: [
              {
                $add: [
                  { $ifNull: ["$bookedCount", 0] },
                  quantity,
                ],
              },
              "$eventCapacity",
            ],
          },
        },
        {
          $inc: {
            bookedCount: quantity,
          },
        },
        { session }
      );

      if (capacityUpdate.modifiedCount !== 1) {
        throw new BookingError(
          "Not enough available seats for this booking",
          409
        );
      }

      const totalAmount = event.eventPrice * quantity;

      const [booking] = await Booking.create(
        [
          {
            event: event._id,
            attendee: userId,
            quantity,
            totalAmount,
            status: "pending",
            expiresAt,
          },
        ],
        { session }
      );

      bookingId = booking._id;
    });

    if (!bookingId) {
      throw new Error("Booking transaction did not complete");
    }

    const booking = await Booking.findById(bookingId)
      .populate("event")
      .populate("attendee", "fullName email");

    res.status(201).json({
      success: true,
      message: "Booking created successfully. Payment is pending.",
      booking,
    });
  } catch (error) {
    if (error instanceof BookingError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Create booking error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create booking",
    });
  } finally {
    await session.endSession();
  }
};

// Get bookings belonging to the logged-in attendee
export const getMyBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const bookings = await Booking.find({
      attendee: userId,
    })
      .populate("event")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get attendee bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve your bookings",
    });
  }
};

// Get all bookings for an event owned by the logged-in organizer
export const getEventBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!mongoose.isValidObjectId(eventId)) {
      res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
      return;
    }

    const event = await Event.findOne({
      _id: eventId,
      organizer: userId,
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found or you are not its organizer",
      });
      return;
    }

    const bookings = await Booking.find({
      event: eventId,
    })
      .populate("attendee", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      event: {
        id: event._id,
        eventName: event.eventName,
      },
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get event bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve event bookings",
    });
  }
};

// Get one booking belonging to the logged-in attendee
export const getBookingById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
      return;
    }

    const booking = await Booking.findOne({
      _id: id,
      attendee: userId,
    }).populate("event");

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve booking",
    });
  }
};

// Cancel a pending booking
export const cancelBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid booking ID",
    });
    return;
  }

  const session = await mongoose.startSession();

  try {
    let cancelled = false;

    await session.withTransaction(async () => {
      const booking = await Booking.findOne({
        _id: id,
        attendee: userId,
      }).session(session);

      if (!booking) {
        throw new BookingError("Booking not found", 404);
      }

      if (booking.status !== "pending") {
        throw new BookingError(
          "Only pending bookings can be cancelled through this endpoint",
          400
        );
      }

      // Do not release seats while a payment is still pending.
      const pendingPayment = await Payment.findOne({
        booking: booking._id,
        status: "pending",
      }).session(session);

      if (pendingPayment) {
        throw new BookingError(
          "This booking has a pending payment. Payment reconciliation is required before cancellation.",
          409
        );
      }

      const event = await Event.findOneAndUpdate(
        {
          _id: booking.event,
          bookedCount: { $gte: booking.quantity },
        },
        {
          $inc: {
            bookedCount: -booking.quantity,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!event) {
        throw new BookingError(
          "Unable to release the reserved event capacity",
          409
        );
      }

      booking.status = "cancelled";
      await booking.save({ session });

      cancelled = true;
    });

    if (!cancelled) {
      throw new Error("Booking cancellation did not complete");
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    if (error instanceof BookingError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Cancel booking error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to cancel booking",
    });
  } finally {
    await session.endSession();
  }
};