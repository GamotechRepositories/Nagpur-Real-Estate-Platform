const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

// Public
router.get('/', projectController.getProjects);
router.get('/:slug', projectController.getProjectBySlug);
router.get('/:id/properties', projectController.getProjectProperties);

// Admin & Content Editors
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CONTENT_EDITOR, ROLES.CRM_MANAGER), projectController.createOrUpdateProject);
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CONTENT_EDITOR, ROLES.CRM_MANAGER), projectController.createOrUpdateProject);
router.patch('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CONTENT_EDITOR, ROLES.CRM_MANAGER), projectController.createOrUpdateProject);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CONTENT_EDITOR, ROLES.CRM_MANAGER), projectController.deleteProject);

module.exports = router;

