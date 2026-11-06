const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const AgentProfile = require('../models/AgentProfile');
const { requestOtp, verifyOtp } = require('../services/otpService');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, hashToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');
const { ROLES } = require('../constants');
const { otplib } = require('otplib');
const qrcode = require('qrcode');

/**
 * Request OTP via phone
 */
const handleRequestOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await requestOtp(phone);
    return sendSuccess(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and issue JWT access and refresh tokens
 */
const handleVerifyOtp = async (req, res, next) => {
  try {
    const { phone, otp, name, role } = req.body;

    const verification = await verifyOtp(phone, otp);
    if (!verification.isValid) {
      return sendError(res, verification.message, 'INVALID_OTP', {}, 400);
    }

    // Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone,
        name: name || 'Nagpur Resident',
        role: role && Object.values(ROLES).includes(role) ? role : ROLES.USER,
        isPhoneVerified: true,
        lastLoginAt: new Date(),
      });

      // If user registered as AGENT, create corresponding AgentProfile
      if (user.role === ROLES.AGENT) {
        const agentProfile = await AgentProfile.create({
          user: user._id,
          agencyName: `${user.name} Real Estate Services`,
        });
        user.agentProfile = agentProfile._id;
        await user.save();
      }
    } else {
      user.isPhoneVerified = true;
      user.lastLoginAt = new Date();
      if (name && (!user.name || user.name === 'Nagpur Resident')) {
        user.name = name;
      }
      await user.save();
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save hashed refresh token in database (7-day TTL)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      user: user._id,
      tokenHash: hashToken(refreshToken),
      deviceInfo: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
      expiresAt,
    });

    // Set HTTP-only secure cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, 'Authentication successful', {
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin and Staff Password Authentication with optional TOTP 2FA
 */
const handleAdminLogin = async (req, res, next) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    if (!user) {
      return sendError(res, 'Invalid email or password', 'INVALID_CREDENTIALS', {}, 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 'INVALID_CREDENTIALS', {}, 401);
    }

    // Role check - only staff roles can log in via admin portal
    const staffRoles = [
      ROLES.SUPER_ADMIN,
      ROLES.MODERATOR,
      ROLES.CRM_MANAGER,
      ROLES.CONTENT_EDITOR,
    ];

    if (!staffRoles.includes(user.role)) {
      return sendError(res, 'Access restricted to authorized administrative staff', 'FORBIDDEN', {}, 403);
    }

    // TOTP 2FA Verification if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return sendError(res, 'Two-factor authentication code required', 'TWO_FACTOR_REQUIRED', { requires2FA: true }, 403);
      }
      const isValid2FA = otplib.authenticator.check(twoFactorCode, user.twoFactorSecret);
      if (!isValid2FA) {
        return sendError(res, 'Invalid two-factor authentication code', 'INVALID_2FA_CODE', {}, 401);
      }
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      user: user._id,
      tokenHash: hashToken(refreshToken),
      deviceInfo: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
      expiresAt,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, 'Admin login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rotate Refresh Token
 */
const handleRefreshToken = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);
    if (!token) {
      return sendError(res, 'Refresh token required', 'TOKEN_MISSING', {}, 401);
    }

    const decoded = verifyRefreshToken(token);
    const hashed = hashToken(token);

    const storedToken = await RefreshToken.findOne({
      tokenHash: hashed,
      user: decoded.userId,
      isRevoked: false,
    });

    if (!storedToken) {
      return sendError(res, 'Refresh token expired or revoked', 'INVALID_REFRESH_TOKEN', {}, 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.status === 'SUSPENDED') {
      return sendError(res, 'User account unavailable', 'USER_UNAVAILABLE', {}, 403);
    }

    // Revoke old token and issue new token pair
    storedToken.isRevoked = true;
    await storedToken.save();

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      user: user._id,
      tokenHash: hashToken(newRefreshToken),
      deviceInfo: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
      expiresAt,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, 'Token refreshed successfully', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return sendError(res, 'Invalid or expired refresh token', 'TOKEN_EXPIRED', {}, 401);
  }
};

/**
 * Logout
 */
const handleLogout = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);
    if (token) {
      const hashed = hashToken(token);
      await RefreshToken.updateOne({ tokenHash: hashed }, { isRevoked: true });
    }

    res.clearCookie('refreshToken');
    return sendSuccess(res, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User Profile
 */
const handleGetMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('agentProfile');
    return sendSuccess(res, 'User profile fetched', user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Profile
 */
const handleUpdateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    await user.save();
    return sendSuccess(res, 'Profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleRequestOtp,
  handleVerifyOtp,
  handleAdminLogin,
  handleRefreshToken,
  handleLogout,
  handleGetMe,
  handleUpdateProfile,
};

