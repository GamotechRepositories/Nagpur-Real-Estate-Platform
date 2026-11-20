const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { validateBody, propertyCreateSchema } = require('../validators');

// Public listing searches
router.get('/', optionalAuth, propertyController.getProperties);
router.get('/details/:slug', optionalAuth, propertyController.getPropertyBySlug);
router.get('/:id', optionalAuth, propertyController.getPropertyById);
router.get('/:id/similar', propertyController.getSimilarProperties);

// Protected property creation and updates
router.post('/', authenticate, validateBody(propertyCreateSchema), propertyController.createProperty);
router.post('/:id/status', authenticate, propertyController.updatePropertyStatus);
router.patch('/:id/status', authenticate, propertyController.updatePropertyStatus);
router.post('/:id/media', authenticate, upload.array('files', 15), propertyController.uploadPropertyMedia);
router.patch('/:id', authenticate, propertyController.updateProperty);
router.delete('/:id', authenticate, propertyController.deleteProperty);

module.exports = router;

