const AgentProfile = require('../models/AgentProfile');
const Property = require('../models/Property');
const User = require('../models/User');
const Enquiry = require('../models/Enquiry');
const { sendSuccess, sendError } = require('../utils/response');
const { PROPERTY_STATUS } = require('../constants');

// Module-level classification helpers for agent inventory
const isRent = (l) => {
  const p = (l?.purpose || '').toUpperCase();
  return p.includes('RENT') || p.includes('LEASE');
};

const isBuySale = (l) => {
  const p = (l?.purpose || '').toUpperCase();
  return p.includes('BUY') || p.includes('SALE') || (!p.includes('RENT') && !p.includes('LEASE'));
};

const isPlot = (l) => {
  const cat = (l?.category || '').toUpperCase();
  const sub = (l?.subtype || '').toUpperCase();
  const title = (l?.title || '').toUpperCase();
  return (
    cat === 'PLOT' ||
    cat === 'AGRICULTURAL' ||
    cat.includes('LAND') ||
    sub.includes('PLOT') ||
    sub.includes('LAND') ||
    title.includes('PLOT') ||
    title.includes('LAND') ||
    title.includes('LAYOUT')
  );
};

const isCommercial = (l) => {
  const cat = (l?.category || '').toUpperCase();
  const sub = (l?.subtype || '').toUpperCase();
  const title = (l?.title || '').toUpperCase();
  return (
    cat.includes('COMMERCIAL') ||
    sub.includes('COMMERCIAL') ||
    sub.includes('OFFICE') ||
    sub.includes('SHOP') ||
    sub.includes('RETAIL') ||
    sub.includes('WAREHOUSE') ||
    title.includes('COMMERCIAL') ||
    title.includes('OFFICE') ||
    title.includes('SHOP')
  );
};

const isVilla = (l) => {
  const sub = (l?.subtype || '').toUpperCase();
  const title = (l?.title || '').toUpperCase();
  if (sub.includes('PENTHOUSE') || title.includes('PENTHOUSE')) return false;
  return (
    sub.includes('VILLA') ||
    sub.includes('HOUSE_VILLA') ||
    sub.includes('BUNGALOW') ||
    title.includes('VILLA') ||
    title.includes('BUNGALOW') ||
    title.includes('INDEPENDENT HOUSE') ||
    title.includes('ROW HOUSE')
  );
};

const isApartment = (l) => {
  if (isPlot(l) || isCommercial(l) || isVilla(l)) return false;
  const cat = (l?.category || '').toUpperCase();
  const sub = (l?.subtype || '').toUpperCase();
  const title = (l?.title || '').toUpperCase();
  return (
    sub.includes('FLAT') ||
    sub.includes('APARTMENT') ||
    sub.includes('PENTHOUSE') ||
    cat === 'RESIDENTIAL' ||
    title.includes('FLAT') ||
    title.includes('APARTMENT') ||
    title.includes('PENTHOUSE') ||
    title.includes('BHK') ||
    Number(l?.bedrooms) > 0
  );
};

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
    }).populate('user', 'name phone email avatar status createdAt');

    if (!profile) {
      return sendError(res, 'Agent profile not found', 'NOT_FOUND', {}, 404);
    }

    const userId = profile.user?._id;

    // Fetch all listings for this agent
    const listings = await Property.find({
      $or: [{ assignedAgent: userId }, { owner: userId }],
    })
      .select(
        'title slug price pricePerSqFt coverImage localityName purpose category subtype bedrooms bathrooms areaSqFt status viewsCount createdAt'
      )
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const propertyIds = listings.map((p) => p._id);

    // Fetch leads/inquiries for this agent
    const leads = await Enquiry.find({
      $or: [
        { assignedAgent: userId },
        { propertyOwner: userId },
        { property: { $in: propertyIds } },
      ],
    })
      .populate('property', 'title price slug')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Classify listings using module-level helpers
    const summary = {
      total: listings.length,
      buySale: listings.filter(isBuySale).length,
      rent: listings.filter(isRent).length,
      plots: listings.filter(isPlot).length,
      apartments: listings.filter(isApartment).length,
      villas: listings.filter(isVilla).length,
      commercial: listings.filter(isCommercial).length,
      live: listings.filter((l) => {
        const s = (l.status || '').toUpperCase();
        return s === 'LIVE' || s === 'APPROVED' || s === 'ACTIVE' || !s;
      }).length,
      pending: listings.filter((l) => {
        const s = (l.status || '').toUpperCase();
        return s === 'PENDING_REVIEW' || s === 'PENDING' || s === 'DRAFT' || s === 'UNDER_MODERATION';
      }).length,
      rejected: listings.filter((l) => (l.status || '').toUpperCase() === 'REJECTED').length,
      sold: listings.filter((l) => {
        const s = (l.status || '').toUpperCase();
        return s === 'SOLD' || s === 'RENTED';
      }).length,
      totalValuation: listings.reduce((sum, l) => sum + (Number(l.price) || 0), 0),
      totalViews: listings.reduce((sum, l) => sum + (Number(l.viewsCount) || 0), 0),
      totalLeads: leads.length,
    };

    return sendSuccess(res, 'Agent details retrieved', {
      profile,
      listings,
      leads,
      summary,
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
      password,
      avatar,
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
        email: email ? email.trim().toLowerCase() : undefined,
        password: password ? password.trim() : 'Nagpur@Agent2026!',
        avatar: avatar ? avatar.trim() : '',
        role: 'AGENT',
        status: 'ACTIVE',
        isPhoneVerified: true,
      });
    } else {
      user.role = 'AGENT';
      if (email && !user.email) user.email = email.trim().toLowerCase();
      if (avatar) user.avatar = avatar.trim();
      if (password && password.trim()) user.password = password.trim();
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
 * Admin: Update Agent Profile, Password, Credentials & Availability
 */
const updateAgentByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      email,
      password,
      avatar,
      status,
      agencyName,
      reraNumber,
      experienceYears,
      areasServed,
      bio,
      isAvailable,
      verificationStatus,
      contactPhone,
      whatsappNumber,
    } = req.body;

    const profile = await AgentProfile.findOne({
      $or: [{ _id: id }, { user: id }],
    }).populate('user');

    if (!profile) {
      return sendError(res, 'Agent profile not found', 'NOT_FOUND', {}, 404);
    }

    // Update User model
    const userId = profile.user?._id || profile.user;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        if (name && name.trim()) user.name = name.trim();

        if (phone && phone.trim()) {
          const cleanPhone = phone.trim();
          if (cleanPhone !== user.phone) {
            const existingPhone = await User.findOne({
              phone: cleanPhone,
              _id: { $ne: user._id },
            });
            if (existingPhone) {
              return sendError(
                res,
                'This mobile number is already in use by another user account.',
                'DUPLICATE_PHONE',
                {},
                400
              );
            }
            user.phone = cleanPhone;
          }
        }

        if (email !== undefined) {
          const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : undefined;
          if (cleanEmail && cleanEmail !== user.email) {
            const existingEmail = await User.findOne({
              email: cleanEmail,
              _id: { $ne: user._id },
            });
            if (existingEmail) {
              return sendError(
                res,
                'This email address is already in use by another user account.',
                'DUPLICATE_EMAIL',
                {},
                400
              );
            }
          }
          user.email = cleanEmail;
        }

        if (avatar !== undefined) user.avatar = avatar.trim();
        if (status) user.status = status;
        if (password && password.trim()) {
          user.password = password.trim();
        }

        await user.save();
      }
    }

    // Update AgentProfile model
    if (agencyName !== undefined) profile.agencyName = agencyName.trim();
    if (reraNumber !== undefined) profile.reraNumber = reraNumber.trim();
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears) || 1;
    if (areasServed !== undefined) {
      profile.areasServed = Array.isArray(areasServed)
        ? areasServed
        : areasServed.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (bio !== undefined) profile.bio = bio;
    if (isAvailable !== undefined) profile.isAvailable = Boolean(isAvailable);
    if (verificationStatus !== undefined) profile.verificationStatus = verificationStatus;
    if (contactPhone !== undefined) profile.contactPhone = contactPhone.trim();
    if (whatsappNumber !== undefined) profile.whatsappNumber = whatsappNumber.trim();

    await profile.save();

    const populated = await AgentProfile.findById(profile._id).populate('user', 'name phone email avatar status');
    return sendSuccess(res, 'Agent profile and credentials updated successfully', populated);
  } catch (error) {
    next(error);
  }
};

const updateAgentStatusByAdmin = async (req, res, next) => {
  return updateAgentByAdmin(req, res, next);
};

/**
 * Agent Self: Get Dashboard Performance Stats
 */
const getMyAgentStats = async (req, res, next) => {
  try {
    const agentUserId = req.user._id;

    // Filter properties owned or assigned to this agent
    const propertyFilter = {
      $or: [{ owner: agentUserId }, { assignedAgent: agentUserId }],
    };

    const properties = await Property.find(propertyFilter)
      .select('title status price viewsCount category subtype purpose bedrooms createdAt')
      .lean();

    let totalListings = properties.length;
    let liveListings = 0;
    let pendingReview = 0;
    let rejectedListings = 0;
    let expiredListings = 0;
    let soldListings = 0;
    let totalViews = 0;
    let totalPortfolioValue = 0;

    properties.forEach((p) => {
      const s = (p.status || '').toUpperCase();
      if (s === 'LIVE' || s === 'APPROVED' || s === 'ACTIVE') {
        liveListings++;
        totalPortfolioValue += (Number(p.price) || 0);
      } else if (s === 'PENDING_REVIEW' || s === 'PENDING' || s === 'DRAFT') {
        pendingReview++;
      } else if (s === 'REJECTED') {
        rejectedListings++;
      } else if (s === 'EXPIRED') {
        expiredListings++;
      } else if (s === 'SOLD' || s === 'RENTED') {
        soldListings++;
      }
      totalViews += (Number(p.viewsCount) || 0);
    });

    // Sub-category counts matching Admin breakdown
    const buySale = properties.filter(isBuySale).length;
    const rent = properties.filter(isRent).length;
    const plots = properties.filter(isPlot).length;
    const apartments = properties.filter(isApartment).length;
    const villas = properties.filter(isVilla).length;
    const commercial = properties.filter(isCommercial).length;

    const propertyIds = properties.map((p) => p._id);

    // Count leads
    const totalLeads = await Enquiry.countDocuments({
      $or: [
        { assignedAgent: agentUserId },
        { propertyOwner: agentUserId },
        { property: { $in: propertyIds } },
      ],
    });

    const profile = await AgentProfile.findOne({ user: agentUserId }).lean();

    const statsPayload = {
      // Both naming conventions for total compatibility
      totalListings,
      totalProperties: totalListings,
      liveListings,
      liveCount: liveListings,
      pendingReview,
      pendingCount: pendingReview,
      rejectedListings,
      rejectedCount: rejectedListings,
      expiredListings,
      soldListings,
      soldCount: soldListings,
      totalViews,
      totalPortfolioValue,
      portfolioValuation: totalPortfolioValue,
      totalLeads,

      // Inventory breakdown matching Admin view exactly
      apartments,
      commercial,
      plots,
      villas,
      buySale,
      rent,

      closedDealsCount: profile?.closedDealsCount || soldListings,
      rating: profile?.rating || 4.9,
    };

    return sendSuccess(res, 'Agent dashboard statistics retrieved', statsPayload);
  } catch (error) {
    next(error);
  }
};

/**
 * Agent Self: Get Properties with Status Filter, Search, and Pagination
 */
const getMyProperties = async (req, res, next) => {
  try {
    const agentUserId = req.user._id;
    const { status, search, page = 1, limit = 50 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNumber - 1) * pageSize;

    const filter = {
      $or: [{ owner: agentUserId }, { assignedAgent: agentUserId }],
    };

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.$and = [
        {
          $or: [
            { title: { $regex: search.trim(), $options: 'i' } },
            { localityName: { $regex: search.trim(), $options: 'i' } },
            { address: { $regex: search.trim(), $options: 'i' } },
          ],
        },
      ];
    }

    const [properties, totalCount] = await Promise.all([
      Property.find(filter)
        .populate('project', 'name slug reraNumber')
        .populate('locality', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Property.countDocuments(filter),
    ]);

    return sendSuccess(res, 'Agent properties retrieved successfully', {
      properties,
      totalCount,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    }, {
      totalCount,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Agent Self: Get Inquiries & Leads for Agent's Properties
 */
const getMyLeads = async (req, res, next) => {
  try {
    const agentUserId = req.user._id;
    const { status, search, page = 1, limit = 50 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNumber - 1) * pageSize;

    // Find agent's properties
    const agentProperties = await Property.find({
      $or: [{ owner: agentUserId }, { assignedAgent: agentUserId }],
    }).select('_id');
    const propertyIds = agentProperties.map((p) => p._id);

    const filter = {
      $or: [
        { assignedAgent: agentUserId },
        { propertyOwner: agentUserId },
        { property: { $in: propertyIds } },
      ],
    };

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$and = [
        {
          $or: [{ customerName: regex }, { phoneNumber: regex }, { propertyTitle: regex }, { locality: regex }],
        },
      ];
    }

    const [leads, totalCount] = await Promise.all([
      Enquiry.find(filter)
        .populate('property', 'title slug price coverImage localityName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Enquiry.countDocuments(filter),
    ]);

    return sendSuccess(res, 'Agent leads retrieved successfully', {
      leads,
      totalCount,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    }, {
      totalCount,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Agent Self: Update status of a lead
 */
const updateLeadStatusByAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const lead = await Enquiry.findById(id);
    if (!lead) {
      return sendError(res, 'Lead not found', 'NOT_FOUND', {}, 404);
    }

    if (status) lead.status = status;
    if (notes) lead.notes = notes;

    await lead.save();

    return sendSuccess(res, 'Lead status updated successfully', lead);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAgents,
  getAgentById,
  updateMyAgentProfile,
  createAgentByAdmin,
  updateAgentByAdmin,
  updateAgentStatusByAdmin,
  getMyAgentStats,
  getMyProperties,
  getMyLeads,
  updateLeadStatusByAgent,
};

