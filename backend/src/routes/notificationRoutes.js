const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

router.use(authenticate);

// User notifications
router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.post('/read-all', notificationController.markAllAsRead);

// Admin Broadcasts
router.post(
  '/admin/broadcast',
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER),
  notificationController.broadcastNotification
);
router.get(
  '/admin/broadcasts',
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER),
  notificationController.getBroadcastHistory
);

module.exports = router;

