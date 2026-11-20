const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/rbacMiddleware');
const { ROLES, PERMISSIONS, PERMISSION_MODULES } = require('../constants');
const { sendSuccess } = require('../utils/response');

// All admin routes require staff authentication
router.use(authenticate);

// Overview Dashboard
router.get(
  '/dashboard',
  requirePermission(PERMISSIONS.DASHBOARD_VIEW),
  adminController.getDashboardStats
);

// Get Master List of System Permissions Modules
router.get(
  '/staff/permissions-list',
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  (req, res) => {
    return sendSuccess(res, 'Permissions list retrieved', {
      modules: PERMISSION_MODULES,
      permissions: PERMISSIONS,
    });
  }
);

// Staff Management (Super Admin or Users with STAFF_MANAGE permission)
router.get(
  '/staff',
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  adminController.getStaffMembers
);

router.post(
  '/staff',
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  adminController.createStaffMember
);

router.patch(
  '/staff/:id',
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  adminController.updateStaffMember
);

router.delete(
  '/staff/:id',
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  adminController.deleteStaffMember
);

// Moderation
router.get(
  '/moderation',
  requirePermission(PERMISSIONS.MODERATION_VIEW, PERMISSIONS.MODERATION_REVIEW),
  adminController.getModerationQueue
);

router.post(
  '/moderation/:id/approve',
  requirePermission(PERMISSIONS.MODERATION_REVIEW),
  adminController.approveProperty
);

router.post(
  '/moderation/:id/reject',
  requirePermission(PERMISSIONS.MODERATION_REVIEW),
  adminController.rejectProperty
);

// Listings management
router.get(
  '/listings',
  requirePermission(PERMISSIONS.LISTINGS_VIEW),
  adminController.getAllListings
);

router.patch(
  '/listings/:id/badges',
  requirePermission(PERMISSIONS.LISTINGS_EDIT),
  adminController.togglePropertyBadges
);

router.post(
  '/listings/:id/renew',
  requirePermission(PERMISSIONS.LISTINGS_EDIT),
  adminController.renewListing
);

router.patch(
  '/listings/:id/representatives',
  requirePermission(PERMISSIONS.LISTINGS_EDIT, PERMISSIONS.LISTINGS_ALLOCATE),
  adminController.updateAllocatedRepresentatives
);

// Get available representatives (agents & builders) for property allocation
router.get(
  '/representatives',
  requirePermission(
    PERMISSIONS.LISTINGS_EDIT,
    PERMISSIONS.LISTINGS_ALLOCATE,
    PERMISSIONS.AGENTS_VIEW,
    PERMISSIONS.BUILDERS_VIEW,
    PERMISSIONS.LISTINGS_VIEW
  ),
  adminController.getAvailableRepresentatives
);

// User Management (Granular or Super Admin)
router.get(
  '/users',
  requirePermission(PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE, PERMISSIONS.STAFF_MANAGE),
  adminController.getUsers
);

router.patch(
  '/users/:id/role',
  requirePermission(PERMISSIONS.USERS_MANAGE, PERMISSIONS.STAFF_MANAGE),
  adminController.updateUserRoleStatus
);

router.delete(
  '/users/:id',
  requirePermission(PERMISSIONS.USERS_MANAGE, PERMISSIONS.STAFF_MANAGE),
  adminController.deleteUser
);

// Platform Settings & Routing configuration
router.get(
  '/settings',
  requirePermission(PERMISSIONS.SETTINGS_MANAGE),
  adminController.getSettings
);

router.patch(
  '/settings',
  requirePermission(PERMISSIONS.SETTINGS_MANAGE),
  adminController.updateSettings
);

// Audit Logs
router.get(
  '/audit-logs',
  requirePermission(PERMISSIONS.AUDIT_LOGS_VIEW),
  adminController.getAuditLogs
);

module.exports = router;

