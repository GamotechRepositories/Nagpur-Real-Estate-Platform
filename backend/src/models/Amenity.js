const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nameEn: {
      type: String,
      required: true,
    },
    nameHi: {
      type: String,
      default: '',
    },
    nameMr: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'CheckCircle',
    },
    category: {
      type: String,
      enum: ['BASIC', 'LEISURE', 'SECURITY', 'ECO_FRIENDLY', 'COMMERCIAL'],
      default: 'BASIC',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Amenity', amenitySchema);
