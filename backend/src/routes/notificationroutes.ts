
import { Router } from "express";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationcontroller.js";

import { protect } from "../middlewares/authmiddleware.js";

const router = Router();

// All notification routes require authentication
router.get("/", protect, getMyNotifications);

router.patch("/read-all", protect, markAllNotificationsAsRead);
router.patch("/:notificationId/read", protect, markNotificationAsRead);

router.delete("/delete-all", protect, deleteAllNotifications);
router.delete("/:notificationId", protect, deleteNotification);

export default router;
