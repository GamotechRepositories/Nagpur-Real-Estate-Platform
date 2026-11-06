const mongoose = require('mongoose');

const localitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    nameEn: {
      type: String,
      required: true,
      trim: true,
    },
    nameHi: {
      type: String,
      trim: true,
      default: '',
    },
    nameMr: {
      type: String,
      trim: true,
      default: '',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      index: true,
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
    areaGuide: {
      overview: { type: String, default: '' },
      connectivity: { type: String, default: '' },
      schoolsAndColleges: [{ type: String }],
      hospitals: [{ type: String }],
      shoppingAndEntertainment: [{ type: String }],
      averagePricePerSqFt: { type: Number, default: 0 },
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    propertyCount: {
      type: Number,
      default: 0,
      index: true,
    },
    nearbyLocalities: [
      {
        type: String,
        trim: true,
      },
    ],
    heroImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

localitySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Locality', localitySchema);
