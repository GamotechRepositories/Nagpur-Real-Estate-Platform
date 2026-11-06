const { z } = require('zod');
const {
  PROPERTY_PURPOSE,
  PROPERTY_CATEGORIES,
  PROPERTY_SUBTYPES,
  FURNISHING_STATUS,
  POSSESSION_STATUS,
} = require('../constants');

// Indian 10-digit mobile number or +91 standard format
const phoneRegex = /^(\+91[\-\s]?)?[6789]\d{9}$/;

const requestOtpSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid Indian mobile number. Must be a 10-digit number starting with 6, 7, 8, or 9.'),
  name: z.string().min(2).max(100).optional(),
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid Indian mobile number'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  name: z.string().optional(),
  role: z.enum(['USER', 'OWNER', 'AGENT']).optional(),
});

const adminLoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  twoFactorCode: z.string().length(6, '2FA Code must be 6 digits').optional(),
});

const propertyCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(180),
  purpose: z.enum(Object.values(PROPERTY_PURPOSE)),
  category: z.enum(Object.values(PROPERTY_CATEGORIES)).default(PROPERTY_CATEGORIES.RESIDENTIAL),
  subtype: z.enum(Object.values(PROPERTY_SUBTYPES)),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().positive('Price must be greater than zero'),
  priceUnit: z.string().default('Total'),
  priceNegotiable: z.boolean().default(false),
  areaSqFt: z.number().positive('Area must be greater than zero'),
  areaUnit: z.enum(['Sq.Ft', 'Sq.Yd', 'Sq.Mtr', 'Acre', 'Hectare']).default('Sq.Ft'),
  bedrooms: z.number().min(0).default(0),
  bathrooms: z.number().min(0).default(0),
  balconies: z.number().min(0).default(0),
  floor: z.number().default(0),
  totalFloors: z.number().min(1).default(1),
  furnishing: z.enum(Object.values(FURNISHING_STATUS)).default(FURNISHING_STATUS.UNFURNISHED),
  possessionStatus: z.enum(Object.values(POSSESSION_STATUS)).default(POSSESSION_STATUS.READY_TO_MOVE),
  possessionDate: z.string().optional(),
  propertyAge: z.string().default('New'),
  facing: z.string().default('NOT_SPECIFIED'),
  amenities: z.array(z.string()).default([]),
  reraNumber: z.string().optional().default(''),
  address: z.string().min(5, 'Address is required'),
  localityName: z.string().min(2, 'Locality is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Nagpur pincode must be a 6-digit number'),
  latitude: z.number().min(20.0).max(22.0, 'Latitude must be in Nagpur region'),
  longitude: z.number().min(78.5).max(80.0, 'Longitude must be in Nagpur region'),
  images: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
    isCover: z.boolean().optional(),
  })).optional().default([]),
  videoUrl: z.string().optional(),
  floorPlanUrl: z.string().optional(),
  brochureUrl: z.string().optional(),
});

const enquiryCreateSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  phoneNumber: z.string().regex(phoneRegex, 'Valid Indian phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  propertyId: z.string().optional(),
  message: z.string().max(1000).optional(),
  leadSource: z.string().optional(),
  budget: z.number().optional(),
  locality: z.string().optional(),
});

const siteVisitCreateSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  customerName: z.string().min(2, 'Name is required'),
  phoneNumber: z.string().regex(phoneRegex, 'Valid Indian phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  preferredDate: z.string().min(1, 'Preferred visit date is required'),
  preferredTimeSlot: z.string().min(1, 'Time slot is required'),
});

const loanRequestCreateSchema = z.object({
  applicantName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().regex(phoneRegex, 'Valid Indian phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  employmentType: z.enum(['SALARIED', 'SELF_EMPLOYED_BUSINESS', 'SELF_EMPLOYED_PROFESSIONAL']),
  monthlyIncome: z.number().positive('Monthly income is required'),
  loanAmountRequired: z.number().positive('Loan amount is required'),
  propertyEstimatedValue: z.number().optional(),
  selectedProperty: z.string().optional(),
});

const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestOtpSchema,
  verifyOtpSchema,
  adminLoginSchema,
  propertyCreateSchema,
  enquiryCreateSchema,
  siteVisitCreateSchema,
  loanRequestCreateSchema,
  validateBody,
};
