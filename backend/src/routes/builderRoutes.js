const express = require('express');
const router = express.Router();
const builderController = require('../controllers/builderController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

// Public & Admin builders listing
router.get('/', builderController.getBuilders);

// Builder Self-Management in Partner Portal
router.get('/me/stats', authenticate, authorize(ROLES.BUILDER), builderController.getMyBuilderStats);
router.get('/me/projects', authenticate, authorize(ROLES.BUILDER), builderController.getMyProjects);
router.post('/me/projects', authenticate, authorize(ROLES.BUILDER), builderController.createMyProject);
router.get('/me/properties', authenticate, authorize(ROLES.BUILDER), builderController.getMyProperties);
router.post('/me/properties', authenticate, authorize(ROLES.BUILDER), builderController.createMyPropertyUnit);

// Builder Details by ID / Slug
router.get('/:id', builderController.getBuilderById);

// Admin Builder Management
router.post('/admin', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER, ROLES.CONTENT_EDITOR), builderController.createBuilderByAdmin);
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER, ROLES.CONTENT_EDITOR), builderController.updateBuilderByAdmin);
router.patch('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER, ROLES.CONTENT_EDITOR), builderController.updateBuilderByAdmin);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER, ROLES.CONTENT_EDITOR), builderController.deleteBuilderByAdmin);

module.exports = router;
