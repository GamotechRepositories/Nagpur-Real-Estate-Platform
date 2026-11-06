const express = require('express');
const router = express.Router();
const savedController = require('../controllers/savedController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

// Saved properties
router.get('/properties', savedController.getSavedProperties);
router.post('/properties/:propertyId', savedController.saveProperty);
router.delete('/properties/:propertyId', savedController.removeSavedProperty);

// Saved searches
router.get('/searches', savedController.getSavedSearches);
router.post('/searches', savedController.createSavedSearch);
router.delete('/searches/:id', savedController.deleteSavedSearch);

module.exports = router;
