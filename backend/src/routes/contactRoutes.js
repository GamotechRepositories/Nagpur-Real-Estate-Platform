const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

// Public contact submission
router.post('/', contactController.createContactInquiry);

// Admin & CRM Manager Contact Management
router.get(
  '/admin',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER, ROLES.AGENT),
  contactController.getAdminContactInquiries
);

router.patch(
  '/admin/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER),
  contactController.updateContactInquiry
);

router.delete(
  '/admin/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER),
  contactController.deleteContactInquiry
);

module.exports = router;
