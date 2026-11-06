const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

// All admin routes require staff authentication
router.use(authenticate);

// Overview Dashboard
router.get(
  '/dashboard',
  authorize(ROLES.SUPER_ADMIN, ROLES.MODERATOR, ROLES.CRM_MANAGER, ROLES.CONTENT_EDITOR),
  adminController.getDashboardStats
);

// Moderation
router.get(
  '/moderation',
  authorize(ROLES.SUPER_ADMIN, ROLES.MODERATOR),
  adminController.getModerationQueue
);

router.post(
  '/moderation/:id/approve',
  authorize(ROLES.SUPER_ADMIN, ROLES.MODERATOR),
  adminController.approveProperty
);

router.post(
  '/moderation/:id/reject',
  authorize(ROLES.SUPER_ADMIN, ROLES.MODERATOR),
  adminController.rejectProperty
);

// Listings management
router.get(
  '/listings',
  authorize(ROLES.SUPER_ADMIN, ROLES.MODERATOR, ROLES.CRM_MANAGER),
  adminController.getAllListings
);

router.patch(
  '/listings/:id/badges',
  authorize(ROLES.SUPER_ADMIN, ROLES.MODERATOR),
  adminController.togglePropertyBadges
);

router.post(
  '/listings/:id/renew',
  authorize(ROLES.SUPER_ADMIN, ROLES.MODERATOR),
  adminController.renewListing
);

// User Management (Super Admin only)
router.get(
  '/users',
  authorize(ROLES.SUPER_ADMIN),
  adminController.getUsers
);

router.patch(
  '/users/:id/role',
  authorize(ROLES.SUPER_ADMIN),
  adminController.updateUserRoleStatus
);

// Platform Settings & Routing configuration (Super Admin only)
router.get(
  '/settings',
  authorize(ROLES.SUPER_ADMIN),
  adminController.getSettings
);

router.patch(
  '/settings',
  authorize(ROLES.SUPER_ADMIN),
  adminController.updateSettings
);

// Audit Logs (Super Admin only)
router.get(
  '/audit-logs',
  authorize(ROLES.SUPER_ADMIN),
  adminController.getAuditLogs
);

module.exports = router;

