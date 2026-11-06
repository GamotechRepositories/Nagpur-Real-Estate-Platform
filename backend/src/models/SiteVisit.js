const mongoose = require('mongoose');
const { SITE_VISIT_STATUS } = require('../constants');

const siteVisitSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    preferredDate: {
      type: Date,
      required: true,
      index: true,
    },
    preferredTimeSlot: {
      type: String,
      required: true, // e.g. "10:00 AM - 12:00 PM", "02:00 PM - 04:00 PM"
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(SITE_VISIT_STATUS),
      default: SITE_VISIT_STATUS.REQUESTED,
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    feedbackNotes: {
      type: String,
      default: '',
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

siteVisitSchema.index({ preferredDate: 1, status: 1 });

module.exports = mongoose.model('SiteVisit', siteVisitSchema);

