const express = require('express');
const router = express.Router();
const toolsController = require('../controllers/toolsController');
const { validateBody, loanRequestCreateSchema } = require('../validators');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

// Financial calculators
router.post('/emi-calculate', toolsController.calculateEmi);
router.post('/area-convert', toolsController.convertArea);
router.post('/loan-request', validateBody(loanRequestCreateSchema), toolsController.submitLoanRequest);

// Admin Loan Requests Management
router.get(
  '/admin/loan-requests',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER, ROLES.MODERATOR),
  toolsController.getAdminLoanRequests
);
router.patch(
  '/admin/loan-requests/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER),
  toolsController.updateLoanRequestStatus
);

module.exports = router;

