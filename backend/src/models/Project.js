const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    builder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Builder',
    },
    builderUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    builderName: {
      type: String,
      trim: true,
      default: '',
    },
    reraNumber: {
      type: String,
      trim: true,
      default: '',
    },
    locality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Locality',
    },
    localityName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    address: {
      type: String,
      default: 'Nagpur, Maharashtra',
    },
    pincode: {
      type: String,
      default: '440001',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [79.0882, 21.1458],
      },
    },
    description: {
      type: String,
      default: '',
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    projectType: {
      type: String,
      enum: ['RESIDENTIAL', 'COMMERCIAL', 'PLOTTED', 'MIXED_USE', 'VILLA_TOWNSHIP', 'INDUSTRIAL'],
      default: 'RESIDENTIAL',
      index: true,
    },
    projectStatus: {
      type: String,
      enum: ['UPCOMING', 'NEW_LAUNCH', 'UNDER_CONSTRUCTION', 'READY_TO_MOVE', 'COMPLETED'],
      default: 'UNDER_CONSTRUCTION',
      index: true,
    },
    startingPrice: {
      type: Number,
      default: 0,
    },
    maxPrice: {
      type: Number,
      default: 0,
    },
    pricePerSqFt: {
      type: Number,
      default: 0,
    },
    totalLandArea: {
      type: String,
      default: '',
      trim: true,
    },
    totalTowers: {
      type: String,
      default: '',
      trim: true,
    },
    openSpacePercentage: {
      type: String,
      default: '',
      trim: true,
    },
    carpetAreaRange: {
      type: String,
      default: '',
      trim: true,
    },
    availableConfigurations: [
      {
        type: String,
        trim: true,
      },
    ],
    landmark: {
      type: String,
      default: '',
      trim: true,
    },
    masterPlanUrl: {
      type: String,
      default: '',
      trim: true,
    },
    videoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    virtualTourUrl: {
      type: String,
      default: '',
      trim: true,
    },
    reraWebsite: {
      type: String,
      default: '',
      trim: true,
    },
    approvals: [
      {
        type: String,
        trim: true,
      },
    ],
    approvedBanks: [
      {
        type: String,
        trim: true,
      },
    ],
    contactPhone: {
      type: String,
      default: '',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: '',
      trim: true,
    },
    contactWhatsApp: {
      type: String,
      default: '',
      trim: true,
    },
    siteOfficeTimings: {
      type: String,
      default: '10:00 AM - 7:00 PM',
      trim: true,
    },
    locationHighlights: [
      {
        type: String,
        trim: true,
      },
    ],
    totalUnits: {
      type: Number,
      default: 0,
    },
    configurations: [
      {
        bhk: { type: Number },
        type: { type: String }, // e.g. "2 BHK Apartment"
        carpetAreaSqFt: { type: Number },
        price: { type: Number },
      },
    ],
    priceRange: {
      minPrice: { type: Number, default: 0 },
      maxPrice: { type: Number, default: 0 },
    },
    amenities: [
      {
        type: String,
      },
    ],
    customFields: [
      {
        label: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        isCover: { type: Boolean, default: false },
      },
    ],
    floorPlans: [
      {
        title: { type: String },
        imageUrl: { type: String },
        bhk: { type: Number },
        areaSqFt: { type: Number },
      },
    ],
    brochureUrl: {
      type: String,
      default: '',
    },
    possessionDate: {
      type: Date,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Project', projectSchema);

