
import { Router } from "express";

import {
  getMyTickets,
  getTicketById,
  verifyTicket,
  checkInTicket,
} from "../controllers/ticketcontroller.js";

import { protect } from "../middlewares/authmiddleware.js";

const router = Router();

// Retrieve all tickets belonging to the logged-in attendee
router.get("/my-tickets", protect, getMyTickets);

// Verify a ticket before event entry
router.get("/verify/:ticketCode", protect, verifyTicket);

// Check in an attendee
router.patch("/check-in/:ticketCode", protect, checkInTicket);

// Retrieve one ticket
router.get("/:id", protect, getTicketById);

export default router;
