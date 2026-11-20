const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/rbacMiddleware');
const { ROLES, PERMISSIONS } = require('../constants');

// Public
router.get('/', projectController.getProjects);
router.get('/:slug', projectController.getProjectBySlug);
router.get('/:id/properties', projectController.getProjectProperties);

// Admin & Content Editors
router.post('/', authenticate, requirePermission(PERMISSIONS.PROJECTS_MANAGE, PERMISSIONS.CONTENT_MANAGE), projectController.createOrUpdateProject);
router.put('/:id', authenticate, requirePermission(PERMISSIONS.PROJECTS_MANAGE, PERMISSIONS.CONTENT_MANAGE), projectController.createOrUpdateProject);
router.patch('/:id', authenticate, requirePermission(PERMISSIONS.PROJECTS_MANAGE, PERMISSIONS.CONTENT_MANAGE), projectController.createOrUpdateProject);
router.delete('/:id', authenticate, requirePermission(PERMISSIONS.PROJECTS_DELETE, PERMISSIONS.PROJECTS_MANAGE), projectController.deleteProject);

module.exports = router;

