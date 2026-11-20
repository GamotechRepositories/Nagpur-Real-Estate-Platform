const express = require('express');
const router = express.Router();
const localityController = require('../controllers/localityController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/rbacMiddleware');
const { ROLES, PERMISSIONS } = require('../constants');

// Public
router.get('/', localityController.getLocalities);
router.get('/:slug', localityController.getLocalityBySlug);

// Admin
router.post('/', authenticate, requirePermission(PERMISSIONS.LOCALITIES_MANAGE, PERMISSIONS.CONTENT_MANAGE), localityController.upsertLocality);
router.delete('/:id', authenticate, requirePermission(PERMISSIONS.LOCALITIES_MANAGE, PERMISSIONS.CONTENT_MANAGE), localityController.deleteLocality);

module.exports = router;

