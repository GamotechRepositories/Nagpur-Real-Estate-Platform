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

module.exports = {
  getAgents,
  getAgentById,
  updateMyAgentProfile,
};
