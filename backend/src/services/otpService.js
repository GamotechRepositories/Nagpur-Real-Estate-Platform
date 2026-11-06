const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const OTP = require('../models/OTP');

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

/**
 * Generate a secure 6-digit numeric OTP
 */
const generateNumericOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Request an OTP for a phone number
 * Returns status, delivery method, and in dev mode the OTP for local testing
 */
const requestOtp = async (phone) => {
  const isDevMode = process.env.NODE_ENV !== 'production' || process.env.OTP_MODE === 'development';
  const hasMsg91 = Boolean(process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID);

  let otpCode;
  let deliveryMethod;

  if (isDevMode && !hasMsg91) {
    // In dev mode when SMS gateway is not configured, generate random OTP or use fallback
    otpCode = process.env.DEVELOPMENT_DEFAULT_OTP || generateNumericOtp();
    deliveryMethod = 'DEVELOPMENT_SIMULATED_SMS';
    console.log(`\n[DEV OTP MODE] Phone: ${phone} -> Verification OTP Code: ${otpCode}\n`);
  } else if (hasMsg91) {
    // Send via MSG91 Indian SMS Gateway
    otpCode = generateNumericOtp();
    deliveryMethod = 'MSG91_SMS';
    try {
      // MSG91 API call format
      // In production MSG91 sends direct SMS via sender ID
      const response = await fetch('https://api.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: process.env.MSG91_AUTH_KEY,
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          mobile: phone.startsWith('+91') ? phone.replace('+91', '91') : `91${phone}`,
          otp: otpCode,
        }),
      });
      const resJson = await response.json();
      if (resJson.type !== 'success') {
        console.warn('[MSG91 Error]:', resJson);
      }
    } catch (err) {
      console.error('[MSG91 Exception]:', err.message);
      throw new Error('Failed to send SMS via OTP provider. Please try again later.');
    }
  } else {
    throw new Error('SMS service is not configured. Please contact administrator.');
  }

  // Hash OTP before storing
  const salt = await bcrypt.genSalt(8);
  const otpHash = await bcrypt.hash(otpCode, salt);

  // Invalidate any existing OTPs for this phone
  await OTP.deleteMany({ phone });

  // Store new OTP with 5 minute expiration
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await OTP.create({
    phone,
    otpHash,
    attempts: 0,
    expiresAt,
  });

  return {
    success: true,
    message: isDevMode && !hasMsg91
      ? `OTP sent in development mode. Verification code: ${otpCode}`
      : 'OTP sent successfully to your mobile number.',
    deliveryMethod,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
    ...(isDevMode && !hasMsg91 ? { devOtp: otpCode } : {}),
  };
};

/**
 * Verify OTP submitted by user
 */
const verifyOtp = async (phone, enteredOtp) => {
  const record = await OTP.findOne({ phone });

  if (!record) {
    return {
      isValid: false,
      message: 'OTP has expired or was not requested. Please request a new OTP.',
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await OTP.deleteOne({ _id: record._id });
    return {
      isValid: false,
      message: 'Maximum verification attempts exceeded. Please request a new OTP.',
    };
  }

  const isMatch = await bcrypt.compare(enteredOtp.toString(), record.otpHash);

  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    return {
      isValid: false,
      message: `Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempt(s) remaining.`,
    };
  }

  // OTP verified successfully -> cleanup record
  await OTP.deleteOne({ _id: record._id });

  return {
    isValid: true,
    message: 'OTP verified successfully.',
  };
};

module.exports = {
  requestOtp,
  verifyOtp,
};

