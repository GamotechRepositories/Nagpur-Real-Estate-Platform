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
      required: true,
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
        required: true,
      },
    },
    description: {
      type: String,
      default: '',
    },
    projectStatus: {
      type: String,
      enum: ['UPCOMING', 'UNDER_CONSTRUCTION', 'READY_TO_MOVE', 'COMPLETED'],
      default: 'UNDER_CONSTRUCTION',
      index: true,
    },
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
