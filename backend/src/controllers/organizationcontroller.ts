
import type { Request, Response } from "express";
import mongoose from "mongoose";

import { Organization } from "../models/organizationmodel.js";
import { User } from "../models/usermodel.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roles?: string[];
  };
}

type OrganizationRole =
  | "admin"
  | "manager"
  | "event_manager"
  | "checkin_staff";

type OrganizationPermission =
  | "manage_organization"
  | "manage_members"
  | "manage_events"
  | "manage_bookings"
  | "check_in_attendees";

const validOrganizationRoles: OrganizationRole[] = [
  "admin",
  "manager",
  "event_manager",
  "checkin_staff",
];

// Permissions are assigned by the backend, not supplied by the client.
const rolePermissions: Record<
  OrganizationRole,
  OrganizationPermission[]
> = {
  admin: [
    "manage_organization",
    "manage_members",
    "manage_events",
    "manage_bookings",
    "check_in_attendees",
  ],
  manager: [
    "manage_organization",
    "manage_members",
    "manage_events",
    "manage_bookings",
    "check_in_attendees",
  ],
  event_manager: [
    "manage_events",
    "manage_bookings",
  ],
  checkin_staff: [
    "check_in_attendees",
  ],
};

// Ensures an Express route parameter is a single string.
const getSingleRouteParam = (
  value: string | string[] | undefined
): string | null => {
  return typeof value === "string" && value.length > 0
    ? value
    : null;
};

// Checks whether a supplied value is a valid organization role.
const isOrganizationRole = (
  value: unknown
): value is OrganizationRole => {
  return (
    typeof value === "string" &&
    validOrganizationRoles.some((validRole) => validRole === value)
  );
};

/**
 * CHECK ORGANIZATION ACCESS
 *
 * Returns the organization only if it exists.
 * Also checks whether the user owns it or has the required permission.
 */
const getOrganizationAccess = async (
  organizationId: string,
  userId: string,
  permission?: OrganizationPermission
) => {
  const organization = await Organization.findById(organizationId);

  if (!organization) {
    return {
      organization: null,
      allowed: false,
      isOwner: false,
    };
  }

  const isOwner = String(organization.owner) === userId;

  if (isOwner) {
    return {
      organization,
      allowed: true,
      isOwner: true,
    };
  }

  const member = organization.members.find(
    (entry) => String(entry.user) === userId
  );

  if (!member) {
    return {
      organization,
      allowed: false,
      isOwner: false,
    };
  }

  const allowed = permission
    ? member.permissions.includes(permission)
    : true;

  return {
    organization,
    allowed,
    isOwner: false,
  };
};

/**
 * CREATE ORGANIZATION
 *
 * The authenticated user automatically becomes its owner.
 */
export const createOrganization = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const {
      name,
      description,
      organizationType,
      email,
      phone,
      website,
      location,
    } = req.body;

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 120
    ) {
      res.status(400).json({
        success: false,
        message: "Organization name must be between 2 and 120 characters.",
      });
      return;
    }

    if (
      typeof organizationType !== "string" ||
      !["church", "school", "company", "community", "other"].includes(
        organizationType
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid organization type.",
      });
      return;
    }

    if (
      description !== undefined &&
      (typeof description !== "string" ||
        description.trim().length > 2000)
    ) {
      res.status(400).json({
        success: false,
        message: "Description cannot exceed 2000 characters.",
      });
      return;
    }

    if (
      email !== undefined &&
      (typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid organization email.",
      });
      return;
    }

    if (
      phone !== undefined &&
      (typeof phone !== "string" || phone.trim().length > 30)
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid phone number.",
      });
      return;
    }

    if (
      website !== undefined &&
      (typeof website !== "string" || website.trim().length > 300)
    ) {
      res.status(400).json({
        success: false,
        message: "Website address cannot exceed 300 characters.",
      });
      return;
    }

    if (
      location !== undefined &&
      (typeof location !== "string" || location.trim().length > 300)
    ) {
      res.status(400).json({
        success: false,
        message: "Location cannot exceed 300 characters.",
      });
      return;
    }

    const userExists = await User.exists({
      _id: userId,
      isActive: true,
    });

    if (!userExists) {
      res.status(401).json({
        success: false,
        message: "Your account is unavailable.",
      });
      return;
    }

    const organization = await Organization.create({
      name: name.trim(),
      description: description?.trim() ?? "",
      organizationType,
      email: email?.trim().toLowerCase(),
      phone: phone?.trim(),
      website: website?.trim(),
      location: location?.trim(),
      owner: userId,
      members: [],
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Organization created successfully.",
      organization,
    });
  } catch (error) {
    console.error("Create organization error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create organization.",
    });
  }
};

/**
 * GET MY ORGANIZATIONS
 *
 * Returns organizations owned by or joined by the authenticated user.
 */
export const getMyOrganizations = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const organizations = await Organization.find({
      isActive: true,
      $or: [
        { owner: userId },
        { "members.user": userId },
      ],
    })
      .populate("owner", "fullName email")
      .populate("members.user", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: organizations.length,
      organizations,
    });
  } catch (error) {
    console.error("Get my organizations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve organizations.",
    });
  }
};

/**
 * GET ORGANIZATION DETAILS
 *
 * Only the owner or an organization member can view its details.
 */
export const getOrganizationById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = getSingleRouteParam(
      req.params.organizationId
    );

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (
      !organizationId ||
      !mongoose.isValidObjectId(organizationId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid organization ID.",
      });
      return;
    }

    const { organization, allowed } = await getOrganizationAccess(
      organizationId,
      userId
    );

    if (!organization) {
      res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
      return;
    }

    if (!allowed) {
      res.status(403).json({
        success: false,
        message: "You do not have access to this organization.",
      });
      return;
    }

    await organization.populate([
      { path: "owner", select: "fullName email" },
      { path: "members.user", select: "fullName email" },
    ]);

    res.status(200).json({
      success: true,
      organization,
    });
  } catch (error) {
    console.error("Get organization error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve organization.",
    });
  }
};

/**
 * UPDATE ORGANIZATION
 *
 * Requires the manage_organization permission.
 */
export const updateOrganization = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = getSingleRouteParam(
      req.params.organizationId
    );

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (
      !organizationId ||
      !mongoose.isValidObjectId(organizationId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid organization ID.",
      });
      return;
    }

    const { organization, allowed } = await getOrganizationAccess(
      organizationId,
      userId,
      "manage_organization"
    );

    if (!organization) {
      res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
      return;
    }

    if (!allowed) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to update this organization.",
      });
      return;
    }

    const allowedFields = [
      "name",
      "description",
      "organizationType",
      "email",
      "phone",
      "website",
      "location",
    ] as const;

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string") {
          res.status(400).json({
            success: false,
            message: `${field} must be a string.`,
          });
          return;
        }

        updates[field] = req.body[field].trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "Provide at least one organization field to update.",
      });
      return;
    }

    if (
      updates.name !== undefined &&
      (String(updates.name).length < 2 ||
        String(updates.name).length > 120)
    ) {
      res.status(400).json({
        success: false,
        message: "Organization name must be between 2 and 120 characters.",
      });
      return;
    }

    if (
      updates.description !== undefined &&
      String(updates.description).length > 2000
    ) {
      res.status(400).json({
        success: false,
        message: "Description cannot exceed 2000 characters.",
      });
      return;
    }

    if (
      updates.organizationType !== undefined &&
      !["church", "school", "company", "community", "other"].includes(
        String(updates.organizationType)
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid organization type.",
      });
      return;
    }

    if (updates.email !== undefined) {
      if (
        updates.email !== "" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(updates.email))
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid organization email.",
        });
        return;
      }

      updates.email = String(updates.email).toLowerCase();
    }

    if (
      updates.phone !== undefined &&
      String(updates.phone).length > 30
    ) {
      res.status(400).json({
        success: false,
        message: "Phone number cannot exceed 30 characters.",
      });
      return;
    }

    if (
      updates.website !== undefined &&
      String(updates.website).length > 300
    ) {
      res.status(400).json({
        success: false,
        message: "Website cannot exceed 300 characters.",
      });
      return;
    }

    if (
      updates.location !== undefined &&
      String(updates.location).length > 300
    ) {
      res.status(400).json({
        success: false,
        message: "Location cannot exceed 300 characters.",
      });
      return;
    }

    const updatedOrganization = await Organization.findByIdAndUpdate(
      organizationId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Organization updated successfully.",
      organization: updatedOrganization,
    });
  } catch (error) {
    console.error("Update organization error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update organization.",
    });
  }
};

/**
 * ADD ORGANIZATION MEMBER
 *
 * An authorized owner or manager adds an existing EventHive user by email.
 * Permissions are determined by the role selected.
 */
export const addOrganizationMember = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const organizationId = getSingleRouteParam(
      req.params.organizationId
    );

    const { email } = req.body;
    const role: unknown = req.body.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (
      !organizationId ||
      !mongoose.isValidObjectId(organizationId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid organization ID.",
      });
      return;
    }

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      res.status(400).json({
        success: false,
        message: "A valid member email is required.",
      });
      return;
    }

    if (!isOrganizationRole(role)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid organization member role.",
      });
      return;
    }

    const { organization, allowed, isOwner } =
      await getOrganizationAccess(
        organizationId,
        userId,
        "manage_members"
      );

    if (!organization) {
      res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
      return;
    }

    if (!allowed) {
      res.status(403).json({
        success: false,
        message: "You cannot manage this organization's members.",
      });
      return;
    }

    // Only the organization owner can assign the admin role.
    if (role === "admin" && !isOwner) {
      res.status(403).json({
        success: false,
        message: "Only the organization owner can assign the admin role.",
      });
      return;
    }

    const memberUser = await User.findOne({
      email: email.trim().toLowerCase(),
      isActive: true,
    }).select("_id fullName email");

    if (!memberUser) {
      res.status(404).json({
        success: false,
        message: "No active EventHive user found with that email.",
      });
      return;
    }

    if (String(memberUser._id) === String(organization.owner)) {
      res.status(400).json({
        success: false,
        message: "The organization owner cannot be added as a member.",
      });
      return;
    }

    const alreadyMember = organization.members.some(
      (member) => String(member.user) === String(memberUser._id)
    );

    if (alreadyMember) {
      res.status(409).json({
        success: false,
        message: "This user is already an organization member.",
      });
      return;
    }

    organization.members.push({
      user: memberUser._id,
      role,
      permissions: rolePermissions[role],
      joinedAt: new Date(),
    });

    await organization.save();

    await organization.populate(
      "members.user",
      "fullName email"
    );

    res.status(201).json({
      success: true,
      message: "Organization member added successfully.",
      organization,
    });
  } catch (error) {
    console.error("Add organization member error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add organization member.",
    });
  }
};

/**
 * UPDATE ORGANIZATION MEMBER ROLE
 *
 * The owner can assign any supported role.
 * A manager can manage ordinary roles but cannot assign admin.
 */
export const updateOrganizationMemberRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const organizationId = getSingleRouteParam(
      req.params.organizationId
    );

    const memberId = getSingleRouteParam(
      req.params.memberId
    );

    const role: unknown = req.body.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (
      !organizationId ||
      !memberId ||
      !mongoose.isValidObjectId(organizationId) ||
      !mongoose.isValidObjectId(memberId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid organization or member ID.",
      });
      return;
    }

    if (!isOrganizationRole(role)) {
      res.status(400).json({
        success: false,
        message: "Invalid organization member role.",
      });
      return;
    }

    const { organization, allowed, isOwner } =
      await getOrganizationAccess(
        organizationId,
        userId,
        "manage_members"
      );

    if (!organization) {
      res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
      return;
    }

    if (!allowed) {
      res.status(403).json({
        success: false,
        message: "You cannot manage this organization's members.",
      });
      return;
    }

    if (role === "admin" && !isOwner) {
      res.status(403).json({
        success: false,
        message: "Only the organization owner can assign the admin role.",
      });
      return;
    }

    const targetMember = organization.members.find(
      (member) => String(member.user) === memberId
    );

    if (!targetMember) {
      res.status(404).json({
        success: false,
        message: "Organization member not found.",
      });
      return;
    }

    // A manager cannot change another administrator's role.
    if (targetMember.role === "admin" && !isOwner) {
      res.status(403).json({
        success: false,
        message: "Only the owner can change an administrator's role.",
      });
      return;
    }

    targetMember.role = role;
    targetMember.permissions = rolePermissions[role];

    await organization.save();

    res.status(200).json({
      success: true,
      message: "Member role updated successfully.",
      member: targetMember,
    });
  } catch (error) {
    console.error("Update organization member role error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update member role.",
    });
  }
};

/**
 * REMOVE ORGANIZATION MEMBER
 *
 * The owner or an authorized manager can remove a member.
 * Managers cannot remove administrators.
 */
export const removeOrganizationMember = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const organizationId = getSingleRouteParam(
      req.params.organizationId
    );

    const memberId = getSingleRouteParam(
      req.params.memberId
    );

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (
      !organizationId ||
      !memberId ||
      !mongoose.isValidObjectId(organizationId) ||
      !mongoose.isValidObjectId(memberId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid organization or member ID.",
      });
      return;
    }

    const { organization, allowed, isOwner } =
      await getOrganizationAccess(
        organizationId,
        userId,
        "manage_members"
      );

    if (!organization) {
      res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
      return;
    }

    if (!allowed) {
      res.status(403).json({
        success: false,
        message: "You cannot manage this organization's members.",
      });
      return;
    }

    if (String(organization.owner) === memberId) {
      res.status(400).json({
        success: false,
        message: "The organization owner cannot be removed as a member.",
      });
      return;
    }

    const targetMember = organization.members.find(
      (member) => String(member.user) === memberId
    );

    if (!targetMember) {
      res.status(404).json({
        success: false,
        message: "Organization member not found.",
      });
      return;
    }

    if (targetMember.role === "admin" && !isOwner) {
      res.status(403).json({
        success: false,
        message: "Only the owner can remove an administrator.",
      });
      return;
    }

    organization.members = organization.members.filter(
      (member) => String(member.user) !== memberId
    );

    await organization.save();

    res.status(200).json({
      success: true,
      message: "Organization member removed successfully.",
    });
  } catch (error) {
    console.error("Remove organization member error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove organization member.",
    });
  }
};
