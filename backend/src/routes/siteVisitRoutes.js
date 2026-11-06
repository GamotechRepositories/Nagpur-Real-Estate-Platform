const express = require('express');
const router = express.Router();
const siteVisitController = require('../controllers/siteVisitController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { validateBody, siteVisitCreateSchema } = require('../validators');

// Public or Authenticated site visit booking
router.post('/', optionalAuth, validateBody(siteVisitCreateSchema), siteVisitController.requestSiteVisit);

// View and update site visits
router.get('/', authenticate, siteVisitController.getSiteVisits);
router.patch('/:id', authenticate, siteVisitController.updateSiteVisit);

module.exports = router;

