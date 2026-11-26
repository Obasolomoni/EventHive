import { Request, Response } from "express";
import mongoose from "mongoose";

import { Notification } from "../models/notificationmodel.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roles?: string[];
  };
}

// These are the notification categories EventHive will support.
export type NotificationType =
  | "event_update"
  | "booking_created"
  | "payment_success"
  | "payment_failed"
  | "ticket_issued"
  | "system";

interface CreateNotificationInput {
  user: string | mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * INTERNAL NOTIFICATION CREATOR
 *
 * Other controllers will call this function when an event
 * happens that should notify a user.
 *
 * This is not an HTTP endpoint. Users cannot call it directly.
 */
export const createUserNotification = async (
  input: CreateNotificationInput
) => {
  const notification = await Notification.create({
    user: input.user,
    type: input.type,
    title: input.title.trim(),
    message: input.message.trim(),
    data: input.data ?? {},
    isRead: false,
    readAt: null,
  });

  return notification;
};

/**
 * GET MY NOTIFICATIONS
 *
 * Returns the authenticated user's notifications,
 * newest first, together with the unread count.
 */
export const getMyNotifications = async (
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

    const pageValue = Number(req.query.page);
    const limitValue = Number(req.query.limit);

    const page =
      Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;

    const limit =
      Number.isInteger(limitValue) && limitValue > 0
        ? Math.min(limitValue, 50)
        : 20;

    const skip = (page - 1) * limit;

    const filter = { user: userId };

    const [notifications, totalNotifications, unreadCount] =
      await Promise.all([
        Notification.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),

        Notification.countDocuments(filter),

        Notification.countDocuments({
          user: userId,
          isRead: false,
        }),
      ]);

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        totalNotifications,
        totalPages: Math.ceil(totalNotifications / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications.",
    });
  }
};

/**
 * MARK ONE NOTIFICATION AS READ
 *
 * A user can only update a notification that belongs to them.
 */
export const markNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!mongoose.isValidObjectId(notificationId)) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        user: userId,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
};

/**
 * MARK ALL NOTIFICATIONS AS READ
 */
export const markAllNotificationsAsRead = async (
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

    const result = await Notification.updateMany(
      {
        user: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
};

/**
 * DELETE ONE NOTIFICATION
 *
 * Users can only delete their own notifications.
 */
export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!mongoose.isValidObjectId(notificationId)) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
      return;
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
};

/**
 * DELETE ALL MY NOTIFICATIONS
 */
export const deleteAllNotifications = async (
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

    const result = await Notification.deleteMany({
      user: userId,
    });

    res.status(200).json({
      success: true,
      message: "All notifications deleted successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete all notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete notifications.",
    });
  }
};