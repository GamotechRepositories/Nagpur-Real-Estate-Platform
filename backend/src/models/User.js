const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../constants');

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: 'Nagpur Resident',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    password: {
      type: String,
      select: false, // Do not expose password by default
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
      index: true,
    },
    roles: {
      type: [String],
      default: [],
      index: true,
    },
    agentPassword: {
      type: String,
      select: false,
    },
    builderPassword: {
      type: String,
      select: false,
    },
    designation: {
      type: String,
      trim: true,
      default: '',
    },
    isStaff: {
      type: Boolean,
      default: false,
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'PENDING'],
      default: 'ACTIVE',
      index: true,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    agentProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgentProfile',
    },
    builderProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Builder',
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isModified('agentPassword') && this.agentPassword) {
    this.agentPassword = await bcrypt.hash(this.agentPassword, salt);
  }
  if (this.isModified('builderPassword') && this.builderPassword) {
    this.builderPassword = await bcrypt.hash(this.builderPassword, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.compareRolePassword = async function (candidatePassword, targetRole) {
  if (targetRole === ROLES.AGENT && this.agentPassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.agentPassword);
    if (isMatch) return true;
  }
  if (targetRole === ROLES.BUILDER && this.builderPassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.builderPassword);
    if (isMatch) return true;
  }
  if (this.password) {
    return bcrypt.compare(candidatePassword, this.password);
  }
  return false;
};

userSchema.methods.hasRoleAccess = function (targetRole) {
  if (this.role === targetRole) return true;
  if (Array.isArray(this.roles) && this.roles.includes(targetRole)) return true;
  return false;
};

module.exports = mongoose.model('User', userSchema);

