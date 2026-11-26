import { Request, Response } from "express";
import mongoose from "mongoose";

import { VendorBooking } from "../models/vendorbookingmodel.js";
import { Vendor } from "../models/vendormodel.js";
import { Event } from "../models/eventmodel.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roles?: string[];
  };
}

type VendorBookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

const isValidAmount = (amount: unknown): amount is number => {
  return (
    typeof amount === "number" &&
    Number.isFinite(amount) &&
    amount > 0
  );
};

const isValidFutureDate = (value: unknown): value is string => {
  if (typeof value !== "string") return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
};

/**
 * CREATE VENDOR BOOKING
 *
 * A customer sends a service request to a vendor.
 * The vendor must accept the request and provide a quote
 * before the booking becomes accepted.
 */
export const createVendorBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const {
      vendorId,
      eventId,
      serviceDescription,
      eventDate,
      eventLocation,
      requestedBudget,
      customerMessage,
    } = req.body;

    if (!mongoose.isValidObjectId(vendorId)) {
      res.status(400).json({
        success: false,
        message: "A valid vendor ID is required.",
      });
      return;
    }

    if (customerId === vendorId) {
      res.status(400).json({
        success: false,
        message: "You cannot book yourself as a vendor.",
      });
      return;
    }

    if (
      typeof serviceDescription !== "string" ||
      serviceDescription.trim().length < 10 ||
      serviceDescription.trim().length > 2000
    ) {
      res.status(400).json({
        success: false,
        message: "Service description must be between 10 and 2000 characters.",
      });
      return;
    }

    if (!isValidFutureDate(eventDate)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid future event date.",
      });
      return;
    }

    if (
      typeof eventLocation !== "string" ||
      eventLocation.trim().length < 3 ||
      eventLocation.trim().length > 300
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid event location.",
      });
      return;
    }

    if (
      customerMessage !== undefined &&
      (typeof customerMessage !== "string" ||
        customerMessage.trim().length > 1000)
    ) {
      res.status(400).json({
        success: false,
        message: "Customer message cannot exceed 1000 characters.",
      });
      return;
    }

    if (
      requestedBudget !== undefined &&
      requestedBudget !== null &&
      !isValidAmount(requestedBudget)
    ) {
      res.status(400).json({
        success: false,
        message: "Requested budget must be a positive amount.",
      });
      return;
    }

    const vendor = await Vendor.findOne({
      _id: vendorId,
      isActive: true,
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: "Vendor not found or unavailable.",
      });
      return;
    }

    // A vendor cannot send a booking request to their own profile.
    if (vendor.owner.toString() === customerId) {
      res.status(400).json({
        success: false,
        message: "You cannot book your own vendor service.",
      });
      return;
    }

    // If this request is connected to an EventHive event,
    // only that event's organizer can book a vendor for it.
    let linkedEventId: string | undefined;

    if (eventId !== undefined && eventId !== null && eventId !== "") {
      if (!mongoose.isValidObjectId(eventId)) {
        res.status(400).json({
          success: false,
          message: "Invalid event ID.",
        });
        return;
      }

      const event = await Event.findById(eventId).select("organizer");

      if (!event) {
        res.status(404).json({
          success: false,
          message: "Event not found.",
        });
        return;
      }

      if (event.organizer.toString() !== customerId) {
        res.status(403).json({
          success: false,
          message: "Only the event organizer can book vendors for this event.",
        });
        return;
      }

      linkedEventId = eventId;
    }

    const booking = await VendorBooking.create({
      vendor: vendor._id,
      customer: customerId,
      ...(linkedEventId ? { event: linkedEventId } : {}),
      serviceDescription: serviceDescription.trim(),
      eventDate: new Date(eventDate),
      eventLocation: eventLocation.trim(),
      ...(requestedBudget !== undefined && requestedBudget !== null
        ? { requestedBudget }
        : {}),
      ...(customerMessage
        ? { customerMessage: customerMessage.trim() }
        : {}),
      status: "pending",
    });

    await booking.populate([
      { path: "vendor", select: "businessName category location" },
      { path: "customer", select: "fullName email" },
      { path: "event", select: "eventName eventDate" },
    ]);

    res.status(201).json({
      success: true,
      message: "Vendor booking request submitted successfully.",
      booking,
    });
  } catch (error) {
    console.error("Create vendor booking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create vendor booking.",
    });
  }
};

/**
 * GET MY VENDOR BOOKINGS
 *
 * Customers can retrieve the vendor bookings they created.
 */
export const getMyVendorBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const pageValue = Number(req.query.page);
    const limitValue = Number(req.query.limit);

    const page =
      Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;

    const limit =
      Number.isInteger(limitValue) && limitValue > 0
        ? Math.min(limitValue, 50)
        : 10;

    const skip = (page - 1) * limit;

    const filter = { customer: customerId };

    const [bookings, totalBookings] = await Promise.all([
      VendorBooking.find(filter)
        .populate("vendor", "businessName category location phone email")
        .populate("event", "eventName eventDate")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      VendorBooking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        totalBookings,
        totalPages: Math.ceil(totalBookings / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get customer vendor bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve your vendor bookings.",
    });
  }
};

/**
 * GET BOOKINGS FOR A VENDOR
 *
 * Only the owner of the vendor profile can view its booking requests.
 */
export const getVendorBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    const { vendorId } = req.params;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!mongoose.isValidObjectId(vendorId)) {
      res.status(400).json({
        success: false,
        message: "Invalid vendor ID.",
      });
      return;
    }

    const vendor = await Vendor.findOne({
      _id: vendorId,
      owner: ownerId,
    }).select("_id");

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: "Vendor profile not found or access denied.",
      });
      return;
    }

    const pageValue = Number(req.query.page);
    const limitValue = Number(req.query.limit);

    const page =
      Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;

    const limit =
      Number.isInteger(limitValue) && limitValue > 0
        ? Math.min(limitValue, 50)
        : 10;

    const skip = (page - 1) * limit;

    const filter = { vendor: vendor._id };

    const [bookings, totalBookings] = await Promise.all([
      VendorBooking.find(filter)
        .populate("customer", "fullName email")
        .populate("event", "eventName eventDate")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      VendorBooking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        totalBookings,
        totalPages: Math.ceil(totalBookings / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get vendor bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve vendor bookings.",
    });
  }
};

/**
 * RESPOND TO A BOOKING REQUEST
 *
 * The vendor can accept or reject a pending request.
 * Accepting requires a positive quoted amount.
 */
export const respondToVendorBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    const { bookingId } = req.params;
    const { decision, quotedAmount, vendorMessage } = req.body;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!mongoose.isValidObjectId(bookingId)) {
      res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
      return;
    }

    if (decision !== "accept" && decision !== "reject") {
      res.status(400).json({
        success: false,
        message: "Decision must be either accept or reject.",
      });
      return;
    }

    if (
      vendorMessage !== undefined &&
      (typeof vendorMessage !== "string" ||
        vendorMessage.trim().length > 1000)
    ) {
      res.status(400).json({
        success: false,
        message: "Vendor message cannot exceed 1000 characters.",
      });
      return;
    }

    if (decision === "accept" && !isValidAmount(quotedAmount)) {
      res.status(400).json({
        success: false,
        message: "A positive quoted amount is required to accept a booking.",
      });
      return;
    }

    const booking = await VendorBooking.findById(bookingId);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
      return;
    }

    const vendor = await Vendor.findOne({
      _id: booking.vendor,
      owner: ownerId,
    }).select("_id");

    if (!vendor) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to respond to this booking.",
      });
      return;
    }

    const newStatus: VendorBookingStatus =
      decision === "accept" ? "accepted" : "rejected";

    const updates: Record<string, unknown> = {
      status: newStatus,
      respondedAt: new Date(),
    };

    if (decision === "accept") {
      updates.quotedAmount = quotedAmount;
    }

    if (vendorMessage !== undefined) {
      updates.vendorMessage = vendorMessage.trim();
    }

    // The status condition prevents two simultaneous responses
    // from changing the same pending request.
    const updatedBooking = await VendorBooking.findOneAndUpdate(
      {
        _id: bookingId,
        vendor: vendor._id,
        status: "pending",
      },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate([
      { path: "customer", select: "fullName email" },
      { path: "vendor", select: "businessName category" },
    ]);

    if (!updatedBooking) {
      res.status(409).json({
        success: false,
        message: "This booking has already been responded to.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message:
        decision === "accept"
          ? "Vendor booking accepted successfully."
          : "Vendor booking rejected successfully.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Respond to vendor booking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to respond to vendor booking.",
    });
  }
};

/**
 * CANCEL VENDOR BOOKING
 *
 * Only the customer who created the request can cancel it.
 * Cancellation is allowed while the booking is pending.
 */
export const cancelVendorBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const { bookingId } = req.params;

    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!mongoose.isValidObjectId(bookingId)) {
      res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
      return;
    }

    const booking = await VendorBooking.findOneAndUpdate(
      {
        _id: bookingId,
        customer: customerId,
        status: "pending",
      },
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!booking) {
      res.status(404).json({
        success: false,
        message:
          "Pending booking not found. Accepted or completed bookings cannot be cancelled through this endpoint.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Vendor booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    console.error("Cancel vendor booking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel vendor booking.",
    });
  }
};

/**
 * MARK BOOKING AS COMPLETED
 *
 * Only the vendor who owns the profile can complete an accepted booking.
 */
export const completeVendorBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    const { bookingId } = req.params;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!mongoose.isValidObjectId(bookingId)) {
      res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
      return;
    }

    const booking = await VendorBooking.findById(bookingId);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
      return;
    }

    const vendor = await Vendor.findOne({
      _id: booking.vendor,
      owner: ownerId,
    }).select("_id");

    if (!vendor) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to complete this booking.",
      });
      return;
    }

    const completedBooking = await VendorBooking.findOneAndUpdate(
      {
        _id: bookingId,
        vendor: vendor._id,
        status: "accepted",
      },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!completedBooking) {
      res.status(409).json({
        success: false,
        message: "Only accepted bookings can be marked as completed.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Vendor booking marked as completed.",
      booking: completedBooking,
    });
  } catch (error) {
    console.error("Complete vendor booking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to complete vendor booking.",
    });
  }
};