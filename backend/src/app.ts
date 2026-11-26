
import express from "express";
import cors from "cors";

import routes from "./routes/index.js";
import paymentWebhookRoutes from "./routes/paymentwebhookroutes.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Paystack webhook must receive the raw request body.
// This must come before express.json().
app.use(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  paymentWebhookRoutes
);

// Parse JSON requests
app.use(express.json());

// Central API routes
app.use("/api", routes);

// Health check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "EventHive API is running!",
  });
});

// Handle unknown routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Global error handler
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Server error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
);

export default app;
