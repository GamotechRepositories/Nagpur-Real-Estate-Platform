const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const propertyRoutes = require('./propertyRoutes');
const enquiryRoutes = require('./enquiryRoutes');
const siteVisitRoutes = require('./siteVisitRoutes');
const localityRoutes = require('./localityRoutes');
const projectRoutes = require('./projectRoutes');
const agentRoutes = require('./agentRoutes');
const savedRoutes = require('./savedRoutes');
const adminRoutes = require('./adminRoutes');
const toolsRoutes = require('./toolsRoutes');
const contentRoutes = require('./contentRoutes');
const notificationRoutes = require('./notificationRoutes');

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'Nagpur Real Estate Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Modular v1 routes
router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/site-visits', siteVisitRoutes);
router.use('/localities', localityRoutes);
router.use('/projects', projectRoutes);
router.use('/agents', agentRoutes);
router.use('/me/saved', savedRoutes);
router.use('/admin', adminRoutes);
router.use('/tools', toolsRoutes);
router.use('/content', contentRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
