const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    checklist: {
      ownerIdentityVerified: { type: Boolean, default: false },
      propertyPhotosVerified: { type: Boolean, default: false },
      detailsVerified: { type: Boolean, default: false },
      duplicateListingChecked: { type: Boolean, default: false },
      locationAccuracyVerified: { type: Boolean, default: false },
    },
    documentsChecked: [
      {
        docType: { type: String }, // e.g. "7/12 Satbara Extract", "Sale Deed", "RERA Reg"
        verified: { type: Boolean, default: false },
        notes: { type: String, default: '' },
      },
    ],
    reviewNotes: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    slaDeadline: {
      type: Date,
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolutionTimeMinutes: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Verification', verificationSchema);

