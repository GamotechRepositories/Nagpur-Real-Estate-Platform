const mongoose = require('mongoose');
const {
  PROPERTY_STATUS,
  PROPERTY_PURPOSE,
  PROPERTY_CATEGORIES,
  PROPERTY_SUBTYPES,
  FURNISHING_STATUS,
  POSSESSION_STATUS,
} = require('../constants');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: 180,
      index: 'text',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: Object.values(PROPERTY_PURPOSE),
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(PROPERTY_CATEGORIES),
      default: PROPERTY_CATEGORIES.RESIDENTIAL,
      index: true,
    },
    subtype: {
      type: String,
      enum: Object.values(PROPERTY_SUBTYPES),
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      maxlength: 5000,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be greater than zero'],
      index: true,
    },
    priceUnit: {
      type: String,
      default: 'Total', // 'Total', 'Per Month', 'Per Sq.Ft'
    },
    priceNegotiable: {
      type: Boolean,
      default: false,
    },
    // Normalized area in Square Feet for consistent filtering
    areaSqFt: {
      type: Number,
      required: [true, 'Area is required'],
      min: [1, 'Area must be greater than zero'],
      index: true,
    },
    areaDisplay: {
      type: Number,
    },
    areaUnit: {
      type: String,
      enum: ['Sq.Ft', 'Sq.Yd', 'Sq.Mtr', 'Acre', 'Hectare'],
      default: 'Sq.Ft',
    },
    bedrooms: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    bathrooms: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    balconies: {
      type: Number,
      default: 0,
      min: 0,
    },
    floor: {
      type: Number,
      default: 0,
    },
    totalFloors: {
      type: Number,
      default: 1,
    },
    furnishing: {
      type: String,
      enum: Object.values(FURNISHING_STATUS),
      default: FURNISHING_STATUS.UNFURNISHED,
      index: true,
    },
    possessionStatus: {
      type: String,
      enum: Object.values(POSSESSION_STATUS),
      default: POSSESSION_STATUS.READY_TO_MOVE,
      index: true,
    },
    possessionDate: {
      type: Date,
    },
    propertyAge: {
      type: String,
      default: 'New', // 'New', '1-3 years', '3-5 years', '5-10 years', '10+ years'
    },
    facing: {
      type: String,
      enum: ['NORTH', 'SOUTH', 'EAST', 'WEST', 'NORTH_EAST', 'NORTH_WEST', 'SOUTH_EAST', 'SOUTH_WEST', 'NOT_SPECIFIED'],
      default: 'NOT_SPECIFIED',
    },
    amenities: [
      {
        type: String,
      },
    ],
    reraNumber: {
      type: String,
      trim: true,
      default: '',
    },
    // MongoDB GeoJSON Point: [longitude, latitude]
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
    },
    locality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Locality',
      index: true,
    },
    localityName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      default: 'Nagpur',
      index: true,
    },
    state: {
      type: String,
      default: 'Maharashtra',
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(PROPERTY_STATUS),
      default: PROPERTY_STATUS.DRAFT,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredUntil: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    expiresAt: {
      type: Date,
      index: true,
    },
    expiryReminderSent7Days: {
      type: Boolean,
      default: false,
    },
    expiryReminderSent1Day: {
      type: Boolean,
      default: false,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    enquiriesCount: {
      type: Number,
      default: 0,
    },
    coverImage: {
      type: String,
      default: '',
    },
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        isCover: { type: Boolean, default: false },
      },
    ],
    videoUrl: {
      type: String,
      default: '',
    },
    floorPlanUrl: {
      type: String,
      default: '',
    },
    brochureUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// GeoJSON 2dsphere index for geospatial searches (nearby, radius, locality)
propertySchema.index({ location: '2dsphere' });

// Compound indexes for high-frequency queries
propertySchema.index({ status: 1, purpose: 1, price: 1 });
propertySchema.index({ status: 1, localityName: 1, purpose: 1 });
propertySchema.index({ status: 1, subtype: 1, bedrooms: 1 });
propertySchema.index({ status: 1, isFeatured: -1, createdAt: -1 });

module.exports = mongoose.model('Property', propertySchema);

