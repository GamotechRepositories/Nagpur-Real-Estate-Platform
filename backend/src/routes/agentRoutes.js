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

module.exports = router;

