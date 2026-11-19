const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

// Public
router.get('/', agentController.getAgents);
router.get('/:id', agentController.getAgentById);

// Agent profile & workspace self-management
router.get('/me/stats', authenticate, authorize(ROLES.AGENT), agentController.getMyAgentStats);
router.get('/me/properties', authenticate, authorize(ROLES.AGENT), agentController.getMyProperties);
router.get('/me/leads', authenticate, authorize(ROLES.AGENT), agentController.getMyLeads);
router.patch('/me/leads/:id/status', authenticate, authorize(ROLES.AGENT), agentController.updateLeadStatusByAgent);
router.patch('/me/profile', authenticate, authorize(ROLES.AGENT), agentController.updateMyAgentProfile);

// Admin Agent Management
router.post('/admin', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER), agentController.createAgentByAdmin);
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER), agentController.updateAgentByAdmin);
router.patch('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER), agentController.updateAgentByAdmin);
router.patch('/:id/verify', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER), agentController.updateAgentStatusByAdmin);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER), agentController.deleteAgentByAdmin);

module.exports = router;

