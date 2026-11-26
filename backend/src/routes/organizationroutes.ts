
import { Router } from "express";

import {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
  addOrganizationMember,
  updateOrganizationMemberRole,
  removeOrganizationMember,
} from "../controllers/organizationcontroller.js";

import { protect } from "../middlewares/authmiddleware.js";
import {
  requireOrganizationPermission,
} from "../middlewares/organizationmiddleware.js";

const router = Router();

// Organization routes
router.post("/", protect, createOrganization);

router.get("/my-organizations", protect, getMyOrganizations);

router.get(
  "/:organizationId",
  protect,
  getOrganizationById
);

router.patch(
  "/:organizationId",
  protect,
  requireOrganizationPermission("manage_organization"),
  updateOrganization
);

// Organization member management
router.post(
  "/:organizationId/members",
  protect,
  requireOrganizationPermission("manage_members"),
  addOrganizationMember
);

router.patch(
  "/:organizationId/members/:memberId",
  protect,
  requireOrganizationPermission("manage_members"),
  updateOrganizationMemberRole
);

router.delete(
  "/:organizationId/members/:memberId",
  protect,
  requireOrganizationPermission("manage_members"),
  removeOrganizationMember
);

export default router;
