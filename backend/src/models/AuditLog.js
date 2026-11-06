const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String, // e.g. "APPROVE_PROPERTY", "REJECT_PROPERTY", "UPDATE_LEAD_ROUTING", "ASSIGN_LEAD"
      required: true,
      index: true,
    },
    targetType: {
      type: String, // "PROPERTY", "USER", "LEAD", "SITE_VISIT", "SETTINGS"
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed, // Object storing before and after snapshots
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
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

auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

