const mongoose = require('mongoose');

const leadActivitySchema = new mongoose.Schema(
  {
    enquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry',
      required: true,
      index: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityType: {
      type: String,
      enum: ['STATUS_CHANGE', 'NOTE_ADDED', 'CALL_LOGGED', 'WHATSAPP_SENT', 'SITE_VISIT_SCHEDULED', 'REASSIGNED'],
      required: true,
    },
    previousStatus: {
      type: String,
    },
    newStatus: {
      type: String,
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LeadActivity', leadActivitySchema);
