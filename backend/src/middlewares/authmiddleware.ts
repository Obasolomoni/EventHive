
import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { User } from "../models/usermodel.js";

// Extend Express Request to include authenticated user information.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: string[];
      };
    }
  }
}

export const protect: RequestHandler = async (req, res, next) => {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        success: false,
        message: "Authentication service is not configured.",
      });
      return;
    }

    // Get the authorization header.
    const authorization = req.headers.authorization;

    if (!authorization) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
      return;
    }

    // Extract the Bearer token.
    const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);

    if (!tokenMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
      return;
    }

    const token = tokenMatch[1];

    // Verify the JWT.
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string"
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
      return;
    }

    // Store the validated user ID.
    const userId = decoded.sub;

    // Validate the user ID.
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
      return;
    }

    // Retrieve the user's current information from MongoDB.
    const user = await User.findById(userId).select(
      "_id roles isActive"
    );

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
      return;
    }

    // Prevent disabled accounts from accessing protected routes.
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "Your account has been disabled.",
      });
      return;
    }

    // Use current database roles instead of outdated JWT roles.
    const roles = Array.isArray(user.roles)
      ? user.roles.map((role) => String(role))
      : [];

    // Attach authenticated user information to the request.
    req.user = {
      id: user._id.toString(),
      roles,
    };

    // Continue to the controller.
    next();

  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError
    ) {
      res.status(401).json({
        success: false,
        message: "Your session is invalid or has expired. Please log in again.",
      });
      return;
    }

    console.error("Authentication middleware error:", error);

    res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};
