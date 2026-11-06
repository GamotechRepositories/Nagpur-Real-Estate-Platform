const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');
const { validateBody, enquiryCreateSchema } = require('../validators');

// Public enquiry submission
router.post('/', validateBody(enquiryCreateSchema), enquiryController.createEnquiry);

// Current user/owner/agent enquiries
router.get('/me', authenticate, enquiryController.getMyEnquiries);

// Admin & CRM Manager Lead Management
router.get(
  '/admin/leads',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER, ROLES.AGENT),
  enquiryController.getAdminLeads
);

router.get(
  '/admin/leads/kanban',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER, ROLES.AGENT),
  enquiryController.getLeadsKanban
);

router.get(
  '/admin/leads/export',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER),
  enquiryController.exportLeadsCsv
);

router.get(
  '/admin/leads/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER, ROLES.AGENT),
  enquiryController.getLeadById
);

router.patch(
  '/admin/leads/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER, ROLES.AGENT),
  enquiryController.updateLead
);

router.post(
  '/admin/leads/:id/activity',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER, ROLES.AGENT),
  enquiryController.addLeadActivity
);

router.post(
  '/admin/leads/:id/assign',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER),
  enquiryController.reassignLead
);

module.exports = router;
