import { Request, Response } from "express";
import mongoose from "mongoose";

import { Review } from "../models/reviewmodel.js";
import { Event } from "../models/eventmodel.js";
import { Vendor } from "../models/vendormodel.js";
import { Ticket } from "../models/ticketmodel.js";
import { VendorBooking } from "../models/vendorbookingmodel.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roles?: string[];
  };
}

type ReviewTarget = "event" | "vendor";

const isValidRating = (rating: unknown): rating is number => {
  return (
    typeof rating === "number" &&
    Number.isInteger(rating) &&
    rating >= 1 &&
    rating <= 5
  );
};

const getPagination = (req: Request) => {
  const pageValue = Number(req.query.page);
  const limitValue = Number(req.query.limit);

  const page =
    Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;

  const limit =
    Number.isInteger(limitValue) && limitValue > 0
      ? Math.min(limitValue, 50)
      : 10;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

/**
 * CREATE REVIEW
 *
 * Event reviews require a used ticket.
 * Vendor reviews require a completed vendor booking.
 */
export const createReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const { targetType, eventId, vendorId, rating, comment } = req.body;

    if (targetType !== "event" && targetType !== "vendor") {
      res.status(400).json({
        success: false,
        message: "Review target must be either event or vendor.",
      });
      return;
    }

    if (!isValidRating(rating)) {
      res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5.",
      });
      return;
    }

    if (
      typeof comment !== "string" ||
      comment.trim().length < 3 ||
      comment.trim().length > 1000
    ) {
      res.status(400).json({
        success: false,
        message: "Comment must be between 3 and 1000 characters.",
      });
      return;
    }

    let reviewTarget: Record<string, unknown>;

    if (targetType === "event") {
      if (!mongoose.isValidObjectId(eventId)) {
        res.status(400).json({
          success: false,
          message: "A valid event ID is required.",
        });
        return;
      }

      const eventExists = await Event.exists({ _id: eventId });

      if (!eventExists) {
        res.status(404).json({
          success: false,
          message: "Event not found.",
        });
        return;
      }

      // A used ticket proves the attendee checked in.
      const attendedEvent = await Ticket.exists({
        event: eventId,
        attendee: reviewerId,
        status: "used",
      });

      if (!attendedEvent) {
        res.status(403).json({
          success: false,
          message: "You must attend an event before reviewing it.",
        });
        return;
      }

      reviewTarget = { event: eventId };
    } else {
      if (!mongoose.isValidObjectId(vendorId)) {
        res.status(400).json({
          success: false,
          message: "A valid vendor ID is required.",
        });
        return;
      }

      const vendorExists = await Vendor.exists({
        _id: vendorId,
        isActive: true,
      });

      if (!vendorExists) {
        res.status(404).json({
          success: false,
          message: "Vendor not found or is unavailable.",
        });
        return;
      }

      // A completed booking proves the customer received the service.
      const completedBooking = await VendorBooking.exists({
        vendor: vendorId,
        customer: reviewerId,
        status: "completed",
      });

      if (!completedBooking) {
        res.status(403).json({
          success: false,
          message:
            "You must complete a booking with this vendor before reviewing.",
        });
        return;
      }

      reviewTarget = { vendor: vendorId };
    }

    const existingReview = await Review.findOne({
      reviewer: reviewerId,
      ...reviewTarget,
    });

    if (existingReview) {
      res.status(409).json({
        success: false,
        message: "You have already reviewed this.",
      });
      return;
    }

    const review = await Review.create({
      reviewer: reviewerId,
      targetType,
      ...reviewTarget,
      rating,
      comment: comment.trim(),
      status: "published",
    });

    await review.populate("reviewer", "fullName");

    res.status(201).json({
      success: true,
      message: "Review created successfully.",
      review,
    });
  } catch (error) {
    // Handles duplicate-review attempts caught by a unique database index.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "You have already reviewed this.",
      });
      return;
    }

    console.error("Create review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create review.",
    });
  }
};

/**
 * GET REVIEWS FOR AN EVENT
 */
export const getEventReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
      return;
    }

    const eventExists = await Event.exists({ _id: eventId });

    if (!eventExists) {
      res.status(404).json({
        success: false,
        message: "Event not found.",
      });
      return;
    }

    const { page, limit, skip } = getPagination(req);

    const filter = {
      event: eventId,
      targetType: "event",
      status: "published",
    };

    const [reviews, totalReviews] = await Promise.all([
      Review.find(filter)
        .populate("reviewer", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
      reviews,
    });
  } catch (error) {
    console.error("Get event reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve event reviews.",
    });
  }
};

/**
 * GET REVIEWS FOR A VENDOR
 */
export const getVendorReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { vendorId } = req.params;

    if (!mongoose.isValidObjectId(vendorId)) {
      res.status(400).json({
        success: false,
        message: "Invalid vendor ID.",
      });
      return;
    }

    const vendorExists = await Vendor.exists({ _id: vendorId });

    if (!vendorExists) {
      res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
      return;
    }

    const { page, limit, skip } = getPagination(req);

    const filter = {
      vendor: vendorId,
      targetType: "vendor",
      status: "published",
    };

    const [reviews, totalReviews] = await Promise.all([
      Review.find(filter)
        .populate("reviewer", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
      reviews,
    });
  } catch (error) {
    console.error("Get vendor reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve vendor reviews.",
    });
  }
};

/**
 * UPDATE YOUR OWN REVIEW
 */
export const updateReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const reviewerId = req.user?.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!reviewerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!mongoose.isValidObjectId(reviewId)) {
      res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
      return;
    }

    if (rating === undefined && comment === undefined) {
      res.status(400).json({
        success: false,
        message: "Provide a rating or comment to update.",
      });
      return;
    }

    const updates: { rating?: number; comment?: string } = {};

    if (rating !== undefined) {
      if (!isValidRating(rating)) {
        res.status(400).json({
          success: false,
          message: "Rating must be a whole number between 1 and 5.",
        });
        return;
      }

      updates.rating = rating;
    }

    if (comment !== undefined) {
      if (
        typeof comment !== "string" ||
        comment.trim().length < 3 ||
        comment.trim().length > 1000
      ) {
        res.status(400).json({
          success: false,
          message: "Comment must be between 3 and 1000 characters.",
        });
        return;
      }

      updates.comment = comment.trim();
    }

    const review = await Review.findOneAndUpdate(
      {
        _id: reviewId,
        reviewer: reviewerId,
      },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("reviewer", "fullName");

    if (!review) {
      res.status(404).json({
        success: false,
        message: "Review not found or you are not its author.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update review.",
    });
  }
};

/**
 * DELETE A REVIEW
 *
 * The author or an administrator can delete a review.
 */
export const deleteReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const { reviewId } = req.params;

    if (!mongoose.isValidObjectId(reviewId)) {
      res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
      return;
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      res.status(404).json({
        success: false,
        message: "Review not found.",
      });
      return;
    }

    const isAuthor = review.reviewer.toString() === userId;
    const isAdmin = req.user?.roles?.includes("admin") ?? false;

    if (!isAuthor && !isAdmin) {
      res.status(403).json({
        success: false,
        message: "You are not allowed to delete this review.",
      });
      return;
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete review.",
    });
  }
};