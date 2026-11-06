const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    filters: {
      purpose: { type: String },
      category: { type: String },
      subtype: { type: String },
      locality: { type: String },
      minPrice: { type: Number },
      maxPrice: { type: Number },
      bedrooms: { type: Number },
      furnishing: { type: String },
      possessionStatus: { type: String },
    },
    alertFrequency: {
      type: String,
      enum: ['INSTANT', 'DAILY', 'WEEKLY', 'OFF'],
      default: 'DAILY',
    },
    lastAlertSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SavedSearch', savedSearchSchema);

