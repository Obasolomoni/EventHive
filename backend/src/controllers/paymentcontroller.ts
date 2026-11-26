import type { Request, Response } from "express";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

import { User } from "../models/usermodel.js";
import { Booking } from "../models/bookingmodel.js";
import { Payment } from "../models/paymentmodel.js";
import { Ticket } from "../models/ticketmodel.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string | null;
  };
}

const PAYSTACK_API_URL = "https://api.paystack.co";

// Initialize payment for an existing booking
export const initializePayment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { bookingId } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!mongoose.isValidObjectId(bookingId)) {
      res.status(400).json({
        success: false,
        message: "A valid booking ID is required",
      });
      return;
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      attendee: userId,
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found",
      });
      return;
    }

    if (booking.status !== "pending") {
      res.status(400).json({
        success: false,
        message: "This booking is not awaiting payment",
      });
      return;
    }

    const user = await User.findById(userId).select("email");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Booking amounts are stored in naira.
    // Paystack expects the amount in kobo.
    const amountInKobo = Math.round(booking.totalAmount * 100);

    if (
      !Number.isSafeInteger(amountInKobo) ||
      amountInKobo <= 0
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
      return;
    }

    if (
      !Number.isInteger(booking.quantity) ||
      booking.quantity < 1
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid booking quantity",
      });
      return;
    }

    const existingPayment = await Payment.findOne({
      booking: booking._id,
      status: "pending",
    });

    if (existingPayment) {
      res.status(409).json({
        success: false,
        message: "A payment is already pending for this booking",
      });
      return;
    }

    const reference = `EH-${randomUUID()}`;

    const payment = await Payment.create({
      booking: booking._id,
      attendee: userId,
      amount: booking.totalAmount,
      currency: "NGN",
      reference,
      provider: "paystack",
      status: "pending",
    });

    try {
      const response = await fetch(
        `${PAYSTACK_API_URL}/transaction/initialize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            amount: amountInKobo,
            currency: "NGN",
            reference,
            metadata: {
              bookingId: booking._id.toString(),
              paymentId: payment._id.toString(),
            },
          }),
        }
      );

      const result =
        (await response.json()) as PaystackInitializeResponse;

      if (
        !response.ok ||
        !result.status ||
        !result.data?.authorization_url ||
        !result.data.access_code ||
        result.data.reference !== reference
      ) {
        throw new Error(
          result.message || "Paystack payment initialization failed"
        );
      }

      payment.authorizationUrl = result.data.authorization_url;
      payment.accessCode = result.data.access_code;

      await payment.save();

      res.status(200).json({
        success: true,
        message: "Payment initialized successfully",
        payment: {
          reference: result.data.reference,
          authorizationUrl: result.data.authorization_url,
          accessCode: result.data.access_code,
          amount: payment.amount,
          currency: payment.currency,
        },
      });
    } catch (error) {
      payment.status = "failed";
      await payment.save();

      throw error;
    }
  } catch (error) {
    console.error("Initialize payment error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to initialize payment",
    });
  }
};

// Verify payment directly with Paystack
export const verifyPayment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { reference } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      typeof reference !== "string" ||
      !/^EH-[a-f0-9-]{36}$/i.test(reference)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid payment reference",
      });
      return;
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }

    const payment = await Payment.findOne({
      reference,
      attendee: userId,
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
      return;
    }

    // Return existing tickets if this payment was already processed.
    if (payment.status === "success") {
      const existingTickets = await Ticket.find({
        booking: payment.booking,
      });

      res.status(200).json({
        success: true,
        message: "Payment has already been verified",
        tickets: existingTickets,
      });
      return;
    }

    if (payment.status !== "pending") {
      res.status(400).json({
        success: false,
        message: "This payment cannot be verified",
      });
      return;
    }

    const response = await fetch(
      `${PAYSTACK_API_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const result =
      (await response.json()) as PaystackVerifyResponse;

    if (!response.ok || !result.status || !result.data) {
      res.status(502).json({
        success: false,
        message: "Unable to verify payment with Paystack",
      });
      return;
    }

    const transaction = result.data;

    // Confirm the transaction matches our internal payment record.
    const expectedAmount = Math.round(payment.amount * 100);

    if (
      transaction.reference !== payment.reference ||
      transaction.amount !== expectedAmount ||
      transaction.currency !== payment.currency
    ) {
      res.status(400).json({
        success: false,
        message: "Payment details do not match our records",
      });
      return;
    }

    if (transaction.status !== "success") {
      if (
        transaction.status === "failed" ||
        transaction.status === "abandoned"
      ) {
        payment.status = "failed";
        await payment.save();
      }

      res.status(400).json({
        success: false,
        message: "Payment has not been completed",
        paymentStatus: transaction.status,
      });
      return;
    }

    // Confirm payment, confirm booking and generate all tickets atomically.
    const session = await mongoose.startSession();

    let issuedTickets: InstanceType<typeof Ticket>[] = [];

    try {
      await session.withTransaction(async () => {
        // Check whether another request already processed this payment.
        const currentPayment = await Payment.findById(payment._id)
          .session(session);

        if (!currentPayment) {
          throw new Error("Payment record no longer exists");
        }

        if (currentPayment.status === "success") {
          issuedTickets = await Ticket.find({
            booking: currentPayment.booking,
          }).session(session);

          return;
        }

        if (currentPayment.status !== "pending") {
          throw new Error("Payment is no longer pending");
        }

        const confirmedPayment = await Payment.findOneAndUpdate(
          {
            _id: payment._id,
            status: "pending",
          },
          {
            $set: {
              status: "success",
              paidAt: transaction.paid_at
                ? new Date(transaction.paid_at)
                : new Date(),
            },
          },
          {
            new: true,
            session,
          }
        );

        if (!confirmedPayment) {
          throw new Error("Unable to confirm payment");
        }

        const confirmedBooking = await Booking.findOneAndUpdate(
          {
            _id: payment.booking,
            attendee: userId,
            status: "pending",
          },
          {
            $set: {
              status: "confirmed",
            },
          },
          {
            new: true,
            session,
          }
        );

        if (!confirmedBooking) {
          throw new Error(
            "Unable to confirm the associated booking"
          );
        }

        if (
          !Number.isInteger(confirmedBooking.quantity) ||
          confirmedBooking.quantity < 1
        ) {
          throw new Error("Invalid booking quantity");
        }

        // Create one unique ticket for every ticket purchased.
        const ticketDocuments = Array.from(
          { length: confirmedBooking.quantity },
          (_, index) => ({
            booking: confirmedBooking._id,
            event: confirmedBooking.event,
            attendee: userId,
            ticketCode: randomUUID(),
            ticketNumber: index + 1,
            status: "valid" as const,
          })
        );

        issuedTickets = await Ticket.create(ticketDocuments, {
          session,
        });
      });

      if (issuedTickets.length === 0) {
        throw new Error(
          "Payment was confirmed, but no tickets were found"
        );
      }

      res.status(200).json({
        success: true,
        message: "Payment verified and tickets generated successfully",
        totalTickets: issuedTickets.length,
        tickets: issuedTickets,
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Verify payment error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
};

// Retrieve payment history for the logged-in attendee
export const getMyPayments = async (
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

    const payments = await Payment.find({
      attendee: userId,
    })
      .select("-accessCode -authorizationUrl")
      .populate("booking")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalPayments: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve payment history",
    });
  }
};
