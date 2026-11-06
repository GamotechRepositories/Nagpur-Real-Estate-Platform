const mongoose = require('mongoose');
const { LEAD_STATUS, LEAD_SOURCE } = require('../constants');

const enquirySchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      index: true,
    },
    propertyTitle: {
      type: String,
      default: '',
    },
    propertyOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    locality: {
      type: String,
      default: '',
    },
    budget: {
      type: Number,
    },
    message: {
      type: String,
      default: 'I am interested in this property. Please contact me.',
    },
    leadSource: {
      type: String,
      enum: Object.values(LEAD_SOURCE),
      default: LEAD_SOURCE.PROPERTY_ENQUIRY,
      index: true,
    },
    leadStatus: {
      type: String,
      enum: Object.values(LEAD_STATUS),
      default: LEAD_STATUS.NEW,
      index: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    assignedAt: {
      type: Date,
    },
    slaDeadline: {
      type: Date,
      index: true,
    },
    isEscalated: {
      type: Boolean,
      default: false,
      index: true,
    },
    followUpDate: {
      type: Date,
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

enquirySchema.index({ leadStatus: 1, assignedAgent: 1, createdAt: -1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
