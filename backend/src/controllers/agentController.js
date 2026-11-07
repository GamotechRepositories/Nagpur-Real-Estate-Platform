const AgentProfile = require('../models/AgentProfile');
const Property = require('../models/Property');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { PROPERTY_STATUS } = require('../constants');

/**
 * Get List of Real Estate Agents in Nagpur
 */
const getAgents = async (req, res, next) => {
  try {
    const { locality, search } = req.query;
    const filter = { verificationStatus: 'VERIFIED', isAvailable: true };

    if (locality) {
      filter.areasServed = { $regex: new RegExp(locality, 'i') };
    }

    const profiles = await AgentProfile.find(filter)
      .populate('user', 'name phone email avatar status')
      .sort({ rating: -1, closedDealsCount: -1 });

    const activeAgents = profiles.filter((p) => p.user && p.user.status === 'ACTIVE');

    return sendSuccess(res, 'Agents fetched successfully', activeAgents);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Agent Details with Active Listings
 */
const getAgentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await AgentProfile.findOne({
      $or: [{ _id: id }, { user: id }],
    }).populate('user', 'name phone email avatar status');

    if (!profile) {
      return sendError(res, 'Agent profile not found', 'NOT_FOUND', {}, 404);
    }

    const listings = await Property.find({
      $or: [{ assignedAgent: profile.user._id }, { owner: profile.user._id }],
      status: PROPERTY_STATUS.LIVE,
    })
      .select('title slug price coverImage localityName purpose bedrooms bathrooms areaSqFt')
      .limit(20);

    return sendSuccess(res, 'Agent details retrieved', {
      profile,
      listings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Logged-in Agent Profile
 */
const updateMyAgentProfile = async (req, res, next) => {
  try {
    let profile = await AgentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new AgentProfile({ user: req.user._id });
    }

    const {
      agencyName,
      reraNumber,
      bio,
      experienceYears,
      areasServed,
      propertyTypes,
      isAvailable,
      contactPhone,
      whatsappNumber,
    } = req.body;

    if (agencyName !== undefined) profile.agencyName = agencyName;
    if (reraNumber !== undefined) profile.reraNumber = reraNumber;
    if (bio !== undefined) profile.bio = bio;
    if (experienceYears !== undefined) profile.experienceYears = experienceYears;
    if (areasServed !== undefined) profile.areasServed = areasServed;
    if (propertyTypes !== undefined) profile.propertyTypes = propertyTypes;
    if (isAvailable !== undefined) profile.isAvailable = isAvailable;
    if (contactPhone !== undefined) profile.contactPhone = contactPhone;
    if (whatsappNumber !== undefined) profile.whatsappNumber = whatsappNumber;

    await profile.save();

    return sendSuccess(res, 'Agent profile updated successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create / Onboard New Certified Agent
 */
const createAgentByAdmin = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      agencyName,
      reraNumber,
      experienceYears = 3,
      areasServed = ['Besa', 'Wardha Road'],
      propertyTypes = ['FLAT', 'PLOT', 'HOUSE_VILLA'],
    } = req.body;

    if (!name || !phone) {
      return sendError(res, 'Agent name and phone number are required', 'VALIDATION_ERROR', {}, 400);
    }

    // Find or create User with role AGENT
    let user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      user = await User.create({
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : undefined,
        role: 'AGENT',
        status: 'ACTIVE',
        isPhoneVerified: true,
      });
    } else {
      user.role = 'AGENT';
      if (email && !user.email) user.email = email.trim();
      await user.save();
    }

    // Find or create AgentProfile
    let profile = await AgentProfile.findOne({ user: user._id });
    if (!profile) {
      profile = new AgentProfile({
        user: user._id,
        agencyName: agencyName ? agencyName.trim() : `${name.trim()} Real Estate`,
        reraNumber: reraNumber ? reraNumber.trim() : '',
        experienceYears: Number(experienceYears) || 3,
        areasServed: Array.isArray(areasServed) ? areasServed : [areasServed],
        propertyTypes: Array.isArray(propertyTypes) ? propertyTypes : [propertyTypes],
        verificationStatus: 'VERIFIED',
        isAvailable: true,
        contactPhone: phone.trim(),
      });
    } else {
      if (agencyName) profile.agencyName = agencyName.trim();
      if (reraNumber) profile.reraNumber = reraNumber.trim();
      if (experienceYears) profile.experienceYears = Number(experienceYears) || 3;
      if (areasServed) profile.areasServed = Array.isArray(areasServed) ? areasServed : [areasServed];
      profile.verificationStatus = 'VERIFIED';
    }

    await profile.save();

    const populated = await AgentProfile.findById(profile._id).populate('user', 'name phone email avatar status');
    return sendSuccess(res, 'Agent registered and verified successfully', populated, null, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Agent Verification or Availability
 */
const updateAgentStatusByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verificationStatus, isAvailable, reraNumber } = req.body;

    const profile = await AgentProfile.findById(id);
    if (!profile) {
      return sendError(res, 'Agent profile not found', 'NOT_FOUND', {}, 404);
    }

    if (verificationStatus !== undefined) profile.verificationStatus = verificationStatus;
    if (isAvailable !== undefined) profile.isAvailable = isAvailable;
    if (reraNumber !== undefined) profile.reraNumber = reraNumber.trim();

    await profile.save();

    const populated = await AgentProfile.findById(profile._id).populate('user', 'name phone email avatar status');
    return sendSuccess(res, 'Agent status updated successfully', populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAgents,
  getAgentById,
  updateMyAgentProfile,
  createAgentByAdmin,
  updateAgentStatusByAdmin,
};

