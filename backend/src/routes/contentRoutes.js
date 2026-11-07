const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

// Public CMS
router.get('/', contentController.getContentPages);
router.get('/:slug', contentController.getContentBySlug);

// Admin CMS
router.get(
  '/admin/all',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CONTENT_EDITOR),
  contentController.getAdminContentPages
);

router.post(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CONTENT_EDITOR),
  contentController.upsertContent
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.CONTENT_EDITOR),
  contentController.deleteContent
);

module.exports = router;

