const mongoose = require('mongoose');

const contactInquirySchema = new mongoose.Schema(
  {
    fullName: {
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
      default: '',
    },
    interestType: {
      type: String,
      default: 'BUYING',
      index: true,
    },
    locality: {
      type: String,
      default: '',
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'NEW',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    source: {
      type: String,
      default: 'APP_HOME_CONTACT_FORM',
    },
  },
  {
    timestamps: true,
  }
);

contactInquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactInquiry', contactInquirySchema);
