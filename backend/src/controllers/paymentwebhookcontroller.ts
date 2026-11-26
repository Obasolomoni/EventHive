
import type { Request, Response } from "express";
import crypto from "node:crypto";
import mongoose from "mongoose";

import { Payment } from "../models/paymentmodel.js";
import { Booking } from "../models/bookingmodel.js";
import { Ticket } from "../models/ticketmodel.js";
import { Event } from "../models/eventmodel.js";
import { Notification } from "../models/notificationmodel.js";

interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
  };
}

interface PaystackVerificationResponse {
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

const verifyWebhookSignature = (
  rawBody: Buffer,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  if (!/^[a-f0-9]{128}$/i.test(signature)) {
    return false;
  }

  const received = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
};

const verifyTransactionWithPaystack = async (
  reference: string
): Promise<PaystackVerificationResponse> => {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    throw new Error("Paystack secret key is not configured.");
  }

  const response = await fetch(
    `${PAYSTACK_API_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!response.ok) {
    throw new Error("Unable to verify transaction with Paystack.");
  }

  return response.json() as Promise<PaystackVerificationResponse>;
};

export const handlePaystackWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    res.status(500).json({
      success: false,
      message: "Payment service is not configured.",
    });
    return;
  }

  const signature = req.headers["x-paystack-signature"];

  if (
    typeof signature !== "string" ||
    !Buffer.isBuffer(req.body)
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid webhook request.",
    });
    return;
  }

  if (!verifyWebhookSignature(req.body, signature, secret)) {
    res.status(401).json({
      success: false,
      message: "Invalid webhook signature.",
    });
    return;
  }

  let webhookEvent: PaystackWebhookEvent;

  try {
    webhookEvent = JSON.parse(
      req.body.toString("utf8")
    ) as PaystackWebhookEvent;
  } catch {
    res.status(400).json({
      success: false,
      message: "Invalid webhook payload.",
    });
    return;
  }

  if (webhookEvent.event !== "charge.success") {
    res.status(200).json({
      success: true,
      message: "Webhook event acknowledged.",
    });
    return;
  }

  const reference = webhookEvent.data?.reference;

  if (!reference) {
    res.status(400).json({
      success: false,
      message: "Payment reference is missing.",
    });
    return;
  }

  try {
    // Never trust the webhook payload alone.
    // Verify the transaction directly with Paystack.
    const verification =
      await verifyTransactionWithPaystack(reference);

    const transaction = verification.data;

    if (
      !verification.status ||
      !transaction ||
      transaction.status !== "success" ||
      transaction.reference !== reference
    ) {
      res.status(200).json({
        success: true,
        message: "Transaction has not been confirmed.",
      });
      return;
    }

    const payment = await Payment.findOne({ reference });

    if (!payment) {
      console.error("Payment record not found:", reference);

      res.status(200).json({
        success: true,
        message: "Payment record not found. Event acknowledged.",
      });
      return;
    }

    // Our database stores naira.
    // Paystack reports transaction amounts in kobo.
    const expectedAmount = Math.round(payment.amount * 100);

    if (
      !Number.isSafeInteger(expectedAmount) ||
      Number(transaction.amount) !== expectedAmount ||
      transaction.currency !== payment.currency
    ) {
      console.error("Paystack payment amount or currency mismatch:", {
        reference,
        expectedAmount,
        receivedAmount: transaction.amount,
        expectedCurrency: payment.currency,
        receivedCurrency: transaction.currency,
      });

      res.status(200).json({
        success: true,
        message: "Transaction requires manual reconciliation.",
      });
      return;
    }

    if (payment.status === "success") {
      res.status(200).json({
        success: true,
        message: "Payment already processed.",
      });
      return;
    }

    if (payment.status !== "pending") {
      res.status(200).json({
        success: true,
        message: "Payment is not pending. Event acknowledged.",
      });
      return;
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Only process a payment that is still pending.
        const currentPayment = await Payment.findOne({
          _id: payment._id,
          status: "pending",
        }).session(session);

        if (!currentPayment) {
          return;
        }

        const booking = await Booking.findById(
          currentPayment.booking
        ).session(session);

        if (!booking) {
          throw new Error("Associated booking was not found.");
        }

        if (
          booking.status !== "pending" &&
          booking.status !== "confirmed"
        ) {
          throw new Error("Booking cannot be confirmed.");
        }

        if (
          !Number.isInteger(booking.quantity) ||
          booking.quantity < 1
        ) {
          throw new Error("Invalid booking quantity.");
        }

        const event = await Event.findById(
          booking.event
        ).session(session);

        if (!event) {
          throw new Error("Associated event was not found.");
        }

        // Confirm payment.
        currentPayment.status = "success";
        currentPayment.paidAt = transaction.paid_at
          ? new Date(transaction.paid_at)
          : new Date();

        await currentPayment.save({ session });

        // Confirm booking.
        booking.status = "confirmed";
        await booking.save({ session });

        // Check existing tickets before generating any.
        const existingTickets = await Ticket.find({
          booking: booking._id,
        }).session(session);

        if (existingTickets.length > booking.quantity) {
          throw new Error(
            "Existing ticket count exceeds booking quantity."
          );
        }

        // Find which ticket numbers are already present.
        const existingNumbers = new Set(
          existingTickets.map((ticket) => ticket.ticketNumber)
        );

        const missingTickets = [];

        for (let number = 1; number <= booking.quantity; number++) {
          if (!existingNumbers.has(number)) {
            missingTickets.push({
              booking: booking._id,
              event: booking.event,
              attendee: booking.attendee,
              ticketCode: crypto.randomUUID(),
              ticketNumber: number,
              status: "valid" as const,
            });
          }
        }

        // Generate any missing tickets.
        if (missingTickets.length > 0) {
          await Ticket.create(missingTickets, { session });
        }

        // This notification is created only when the pending
        // payment transitions to successful payment.
        await Notification.create(
          [
            {
              user: booking.attendee,
              type: "payment_success",
              title: "Payment successful",
              message: `Your payment for ${event.eventName} was successful.`,
              data: {
                eventId: event._id,
                bookingId: booking._id,
              },
              isRead: false,
            },
          ],
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully.",
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);

    res.status(500).json({
      success: false,
      message: "Webhook processing failed. Paystack can retry.",
    });
  }
};
