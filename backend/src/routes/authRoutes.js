const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { otpRequestLimiter, loginLimiter } = require('../middleware/rateLimiter');
const {
  validateBody,
  requestOtpSchema,
  verifyOtpSchema,
  adminLoginSchema,
} = require('../validators');

// Public OTP endpoints
router.post('/otp/request', otpRequestLimiter, validateBody(requestOtpSchema), authController.handleRequestOtp);
router.post('/otp/verify', validateBody(verifyOtpSchema), authController.handleVerifyOtp);

// Admin & Staff email/password login
router.post('/login', loginLimiter, validateBody(adminLoginSchema), authController.handleAdminLogin);

// Token management
router.post('/refresh', authController.handleRefreshToken);
router.post('/logout', authController.handleLogout);

// Protected profile endpoints
router.get('/me', authenticate, authController.handleGetMe);
router.patch('/profile', authenticate, authController.handleUpdateProfile);

module.exports = router;

