const mongoose = require('mongoose');
const { NOTIFICATION_TYPES, NOTIFICATION_CHANNELS } = require('../constants');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
      leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry' },
      siteVisitId: { type: mongoose.Schema.Types.ObjectId, ref: 'SiteVisit' },
      link: { type: String },
    },
    channel: {
      type: String,
      enum: Object.values(NOTIFICATION_CHANNELS),
      default: NOTIFICATION_CHANNELS.IN_APP,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

