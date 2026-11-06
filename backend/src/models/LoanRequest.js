const mongoose = require('mongoose');

const loanRequestSchema = new mongoose.Schema(
  {
    applicantName: {
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
    },
    employmentType: {
      type: String,
      enum: ['SALARIED', 'SELF_EMPLOYED_BUSINESS', 'SELF_EMPLOYED_PROFESSIONAL'],
      default: 'SALARIED',
    },
    monthlyIncome: {
      type: Number,
      required: true,
    },
    loanAmountRequired: {
      type: Number,
      required: true,
    },
    propertyEstimatedValue: {
      type: Number,
    },
    selectedProperty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
    },
    status: {
      type: String,
      enum: ['NEW', 'DOCUMENTS_REQUESTED', 'SUBMITTED_TO_BANK', 'APPROVED', 'REJECTED'],
      default: 'NEW',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LoanRequest', loanRequestSchema);
