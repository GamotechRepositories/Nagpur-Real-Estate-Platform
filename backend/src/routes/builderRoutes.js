const express = require('express');
const router = express.Router();
const builderController = require('../controllers/builderController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/rbacMiddleware');
const { ROLES, PERMISSIONS } = require('../constants');

// Public & Admin builders listing
router.get('/', builderController.getBuilders);

// Builder Self-Management in Partner Portal
router.get('/me/stats', authenticate, authorize(ROLES.BUILDER), builderController.getMyBuilderStats);
router.get('/me/projects', authenticate, authorize(ROLES.BUILDER), builderController.getMyProjects);
router.get('/me/projects/:id', authenticate, authorize(ROLES.BUILDER), builderController.getMyProjectById);
router.post('/me/projects', authenticate, authorize(ROLES.BUILDER), builderController.createMyProject);
router.patch('/me/projects/:id', authenticate, authorize(ROLES.BUILDER), builderController.updateMyProject);
router.get('/me/properties', authenticate, authorize(ROLES.BUILDER), builderController.getMyProperties);
router.post('/me/properties', authenticate, authorize(ROLES.BUILDER), builderController.createMyPropertyUnit);

// Builder Details by ID / Slug
router.get('/:id', builderController.getBuilderById);

// Admin Builder Management
router.post('/admin', authenticate, requirePermission(PERMISSIONS.BUILDERS_MANAGE, PERMISSIONS.PROJECTS_MANAGE), builderController.createBuilderByAdmin);
router.put('/:id', authenticate, requirePermission(PERMISSIONS.BUILDERS_MANAGE, PERMISSIONS.PROJECTS_MANAGE), builderController.updateBuilderByAdmin);
router.patch('/:id', authenticate, requirePermission(PERMISSIONS.BUILDERS_MANAGE, PERMISSIONS.PROJECTS_MANAGE), builderController.updateBuilderByAdmin);
router.delete('/:id', authenticate, requirePermission(PERMISSIONS.BUILDERS_MANAGE, PERMISSIONS.PROJECTS_MANAGE), builderController.deleteBuilderByAdmin);

module.exports = router;
