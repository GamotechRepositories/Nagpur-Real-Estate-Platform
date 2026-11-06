const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

// Public
router.get('/', projectController.getProjects);
router.get('/:slug', projectController.getProjectBySlug);

// Admin
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CONTENT_EDITOR), projectController.createOrUpdateProject);

module.exports = router;
