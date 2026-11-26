
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/usermodel.js";

// This type represents a request from a logged-in user.

export const getMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const user = await User.findById(userId).select(
      "-password"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve user profile"
    });
  }
};

// Update the currently authenticated user's profile
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { fullName } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    if (
      typeof fullName !== "string" ||
      fullName.trim().length < 2 ||
      fullName.trim().length > 100
    ) {
      res.status(400).json({
        success: false,
        message: "Full name must be between 2 and 100 characters"
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          fullName: fullName.trim()
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update profile"
    });
  }
};

// Change the currently authenticated user's password
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      res.status(400).json({
        success: false,
        message: "New password must be between 8 and 128 characters"
      });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({
        success: false,
        message: "New password must be different from the current password"
      });
      return;
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 12);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to change password"
    });
  }
};
