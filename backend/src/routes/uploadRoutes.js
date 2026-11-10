const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { upload } = require('../middleware/uploadMiddleware');
const { authenticate } = require('../middleware/authMiddleware');

// Protected upload endpoints
router.post('/single', authenticate, upload.single('file'), uploadController.uploadSinglePhoto);
router.post('/multiple', authenticate, upload.array('files', 15), uploadController.uploadMultiplePhotos);

module.exports = router;

