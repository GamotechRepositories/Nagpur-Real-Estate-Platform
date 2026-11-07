const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

// Public
router.get('/', agentController.getAgents);
router.get('/:id', agentController.getAgentById);

// Agent profile self-management
router.patch('/me/profile', authenticate, authorize(ROLES.AGENT), agentController.updateMyAgentProfile);

// Admin Agent Management
router.post('/admin', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER), agentController.createAgentByAdmin);
router.patch('/:id/verify', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER), agentController.updateAgentStatusByAdmin);

module.exports = router;

