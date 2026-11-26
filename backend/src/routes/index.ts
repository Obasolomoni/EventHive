
import { Router } from "express";

import authRoutes from "./authroutes.js";
import userRoutes from "./userroutes.js";
import eventRoutes from "./eventroutes.js";
import bookingRoutes from "./bookingroutes.js";
import paymentRoutes from "./paymentroutes.js";
import ticketRoutes from "./ticketroutes.js";
import vendorRoutes from "./vendorroutes.js";
import vendorBookingRoutes from "./vendorbookingroutes.js";
import reviewRoutes from "./reviewroutes.js";
import notificationRoutes from "./notificationroutes.js";
import organizationRoutes from "./organizationroutes.js";
import eventStaffRoutes from "./eventstaffroutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/events", eventRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/tickets", ticketRoutes);
router.use("/vendors", vendorRoutes);
router.use("/vendor-bookings", vendorBookingRoutes);
router.use("/reviews", reviewRoutes);
router.use("/notifications", notificationRoutes);
router.use("/organizations", organizationRoutes);
router.use("/event-staff", eventStaffRoutes);

export default router;