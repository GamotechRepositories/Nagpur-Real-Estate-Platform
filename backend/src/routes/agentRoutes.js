const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/rbacMiddleware');
const { ROLES, PERMISSIONS } = require('../constants');

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
router.post('/admin', authenticate, requirePermission(PERMISSIONS.AGENTS_MANAGE, PERMISSIONS.LEADS_MANAGE), agentController.createAgentByAdmin);
router.put('/:id', authenticate, requirePermission(PERMISSIONS.AGENTS_MANAGE, PERMISSIONS.LEADS_MANAGE), agentController.updateAgentByAdmin);
router.patch('/:id', authenticate, requirePermission(PERMISSIONS.AGENTS_MANAGE, PERMISSIONS.LEADS_MANAGE), agentController.updateAgentByAdmin);
router.patch('/:id/verify', authenticate, requirePermission(PERMISSIONS.AGENTS_MANAGE, PERMISSIONS.LEADS_MANAGE), agentController.updateAgentStatusByAdmin);
router.delete('/:id', authenticate, requirePermission(PERMISSIONS.AGENTS_MANAGE, PERMISSIONS.LEADS_MANAGE), agentController.deleteAgentByAdmin);

module.exports = router;

