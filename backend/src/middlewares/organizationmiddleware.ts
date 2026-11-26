
import type { RequestHandler } from "express";
import mongoose from "mongoose";

import { Organization } from "../models/organizationmodel.js";
import type { OrganizationPermission } from "../models/organizationmodel.js";

export const requireOrganizationPermission = (
  permission: OrganizationPermission
): RequestHandler => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const organizationId = String(req.params.organizationId ?? "");

      // Check authentication.
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      // Validate organization ID.
      if (!mongoose.Types.ObjectId.isValid(organizationId)) {
        res.status(400).json({
          success: false,
          message: "Invalid organization ID.",
        });
        return;
      }

      // Find the organization.
      const organization = await Organization.findById(organizationId);

      if (!organization) {
        res.status(404).json({
          success: false,
          message: "Organization not found.",
        });
        return;
      }

      // Check whether the organization is active.
      if (!organization.isActive) {
        res.status(403).json({
          success: false,
          message: "This organization is currently inactive.",
        });
        return;
      }

      // The organization owner has full access.
      if (organization.owner.toString() === userId) {
        next();
        return;
      }

      // Find the user's membership.
      const member = organization.members.find(
        (item) => item.user.toString() === userId
      );

      if (!member) {
        res.status(403).json({
          success: false,
          message: "You are not a member of this organization.",
        });
        return;
      }

      // Check the member's assigned permissions.
      if (!member.permissions.includes(permission)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action.",
          requiredPermission: permission,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Organization permission error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to verify organization permissions.",
      });
    }
  };
};
