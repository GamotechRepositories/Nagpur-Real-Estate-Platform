const express = require('express');
const router = express.Router();
const localityController = require('../controllers/localityController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

// Public
router.get('/', localityController.getLocalities);
router.get('/:slug', localityController.getLocalityBySlug);

// Admin
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.CONTENT_EDITOR), localityController.upsertLocality);

module.exports = router;

