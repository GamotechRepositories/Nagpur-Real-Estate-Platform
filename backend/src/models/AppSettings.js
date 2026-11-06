const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'GENERAL_CONFIG',
    },
    leadRouting: {
      routingMode: {
        type: String,
        enum: ['ROUND_ROBIN', 'LOCALITY_BASED', 'MANUAL'],
        default: 'ROUND_ROBIN',
      },
      lastAssignedAgentIndex: {
        type: Number,
        default: 0,
      },
      defaultSlaHours: {
        type: Number,
        default: 4,
      },
      autoEscalateAfterSla: {
        type: Boolean,
        default: true,
      },
    },
    listingConfig: {
      validityDays: {
        type: Number,
        default: 90,
      },
      reminderDays: {
        type: [Number],
        default: [7, 1],
      },
      maxFreePhotos: {
        type: Number,
        default: 15,
      },
    },
    contacts: {
      helplinePhone: {
        type: String,
        default: '+91 712 2550100', // Nagpur area code 0712
      },
      supportEmail: {
        type: String,
        default: 'support@nagpurestate.com',
      },
      whatsappNumber: {
        type: String,
        default: '+91 9823000000',
      },
      officeAddress: {
        type: String,
        default: 'Civil Lines, Nagpur, Maharashtra 440001',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AppSettings', appSettingsSchema);

