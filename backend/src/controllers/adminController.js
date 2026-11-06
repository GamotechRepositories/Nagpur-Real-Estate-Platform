const Property = require('../models/Property');
const User = require('../models/User');
const Enquiry = require('../models/Enquiry');
const SiteVisit = require('../models/SiteVisit');
const Verification = require('../models/Verification');
const AuditLog = require('../models/AuditLog');
const AppSettings = require('../models/AppSettings');
const { sendNotification } = require('../services/notificationService');
const { logAudit } = require('../services/auditService');
const { sendSuccess, sendError } = require('../utils/response');
const { PROPERTY_STATUS, ROLES, NOTIFICATION_TYPES } = require('../constants');

/**
 * Admin Dashboard Overview with Live Database Aggregations
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      propertyStats,
      totalUsers,
      totalAgents,
      todayEnquiries,
      pendingVisits,
      leadStats,
      topLocalities,
    ] = await Promise.all([
      // Property status count aggregation
      Property.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Total users
      User.countDocuments({ role: ROLES.USER }),

      // Total agents
      User.countDocuments({ role: ROLES.AGENT }),

      // Today's enquiries
      Enquiry.countDocuments({ createdAt: { $gte: today } }),

      // Pending site visits
      SiteVisit.countDocuments({ status: 'REQUESTED' }),

      // Lead conversion metrics
      Enquiry.aggregate([
        {
          $group: {
            _id: '$leadStatus',
            count: { $sum: 1 },
          },
        },
      ]),

      // Top localities in Nagpur
      Property.aggregate([
        { $match: { status: PROPERTY_STATUS.LIVE } },
        {
          $group: {
            _id: '$localityName',
            propertyCount: { $sum: 1 },
            avgPrice: { $avg: '$price' },
          },
        },
        { $sort: { propertyCount: -1 } },
        { $limit: 6 },
      ]),
    ]);

    // Format property status counts
    const propertyCounts = {
      TOTAL: 0,
      LIVE: 0,
      PENDING_REVIEW: 0,
      REJECTED: 0,
      EXPIRED: 0,
      SOLD: 0,
      RENTED: 0,
      DRAFT: 0,
    };

    propertyStats.forEach((stat) => {
      if (propertyCounts.hasOwnProperty(stat._id)) {
        propertyCounts[stat._id] = stat.count;
      }
      propertyCounts.TOTAL += stat.count;
    });

    // Lead conversion rate
    let totalLeads = 0;
    let closedWonLeads = 0;
    leadStats.forEach((l) => {
      totalLeads += l.count;
      if (l._id === 'CLOSED_WON') closedWonLeads += l.count;
    });
    const conversionRate = totalLeads > 0 ? ((closedWonLeads / totalLeads) * 100).toFixed(1) : 0;

    return sendSuccess(res, 'Dashboard statistics aggregated successfully', {
      properties: propertyCounts,
      users: {
        total: totalUsers,
        agents: totalAgents,
      },
      crm: {
        todayEnquiries,
        pendingSiteVisits: pendingVisits,
        totalLeads,
        closedWonLeads,
        conversionRate: `${conversionRate}%`,
      },
      topLocalities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Property Moderation Queue
 */
const getModerationQueue = async (req, res, next) => {
  try {
    const { status = 'PENDING', page = 1, limit = 15 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNumber - 1) * pageSize;

    const [verifications, totalCount] = await Promise.all([
      Verification.find({ status })
        .populate({
          path: 'property',
          populate: { path: 'owner', select: 'name phone email role' },
        })
        .populate('reviewer', 'name email')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Verification.countDocuments({ status }),
    ]);

    return sendSuccess(res, 'Moderation queue retrieved', verifications, {
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
 * Approve Property Listing
 */
const approveProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewNotes = 'Property details and documents verified' } = req.body;

    const property = await Property.findById(id).populate('owner');
    if (!property) {
      return sendError(res, 'Property not found', 'NOT_FOUND', {}, 404);
    }

    // Set 90 days validity period
    const validityDays = 90;
    const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

    property.status = PROPERTY_STATUS.LIVE;
    property.isVerified = true;
    property.verifiedAt = new Date();
    property.verifiedBy = req.user._id;
    property.expiresAt = expiresAt;
    property.reviewNotes = reviewNotes;
    property.rejectionReason = '';
    await property.save();

    // Update Verification ticket
    await Verification.findOneAndUpdate(
      { property: property._id, status: 'PENDING' },
      {
        reviewer: req.user._id,
        status: 'APPROVED',
        reviewNotes,
        resolvedAt: new Date(),
      }
    );

    // Notify owner
    await sendNotification({
      recipientId: property.owner._id,
      type: NOTIFICATION_TYPES.PROPERTY_APPROVED,
      params: { title: property.title },
      data: { propertyId: property._id },
    });

    // Write audit log
    await logAudit({
      req,
      action: 'APPROVE_PROPERTY',
      targetType: 'PROPERTY',
      targetId: property._id,
      notes: `Listing approved by ${req.user.name}. Valid until ${expiresAt.toLocaleDateString()}`,
    });

    return sendSuccess(res, 'Property approved and live on marketplace', property);
  } catch (error) {
    next(error);
  }
};

/**
 * Reject Property Listing with Specific Reason
 */
const rejectProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason, reviewNotes } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return sendError(res, 'A clear rejection reason must be provided to the owner', 'REASON_REQUIRED', {}, 400);
    }

    const property = await Property.findById(id).populate('owner');
    if (!property) {
      return sendError(res, 'Property not found', 'NOT_FOUND', {}, 404);
    }

    property.status = PROPERTY_STATUS.REJECTED;
    property.rejectionReason = rejectionReason;
    property.reviewNotes = reviewNotes || '';
    property.isVerified = false;
    await property.save();

    // Update Verification ticket
    await Verification.findOneAndUpdate(
      { property: property._id, status: 'PENDING' },
      {
        reviewer: req.user._id,
        status: 'REJECTED',
        rejectionReason,
        reviewNotes: reviewNotes || '',
        resolvedAt: new Date(),
      }
    );

    // Notify owner with the rejection reason
    await sendNotification({
      recipientId: property.owner._id,
      type: NOTIFICATION_TYPES.PROPERTY_REJECTED,
      params: {
        title: property.title,
        reason: rejectionReason,
      },
      data: { propertyId: property._id },
    });

    // Write audit log
    await logAudit({
      req,
      action: 'REJECT_PROPERTY',
      targetType: 'PROPERTY',
      targetId: property._id,
      notes: `Listing rejected by ${req.user.name}. Reason: ${rejectionReason}`,
    });

    return sendSuccess(res, 'Property rejected and notification sent to owner', property);
  } catch (error) {
    next(error);
  }
};

/**
 * Manage All Listings (Admin Table)
 */
const getAllListings = async (req, res, next) => {
  try {
    const { status, purpose, locality, search, page = 1, limit = 15 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNumber - 1) * pageSize;

    const filter = {};
    if (status) filter.status = status;
    if (purpose) filter.purpose = purpose;
    if (locality) filter.localityName = { $regex: new RegExp(locality, 'i') };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { localityName: { $regex: search, $options: 'i' } },
      ];
    }

    const [listings, totalCount] = await Promise.all([
      Property.find(filter)
        .populate('owner', 'name phone email role')
        .populate('assignedAgent', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Property.countDocuments(filter),
    ]);

    return sendSuccess(res, 'Listings fetched successfully', listings, {
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
 * Toggle Featured / Verified Status
 */
const togglePropertyBadges = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isFeatured, isVerified } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return sendError(res, 'Property not found', 'NOT_FOUND', {}, 404);
    }

    if (typeof isFeatured === 'boolean') {
      property.isFeatured = isFeatured;
      if (isFeatured) {
        property.featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    }

    if (typeof isVerified === 'boolean') {
      property.isVerified = isVerified;
      if (isVerified) {
        property.verifiedAt = new Date();
        property.verifiedBy = req.user._id;
      }
    }

    await property.save();

    await logAudit({
      req,
      action: 'TOGGLE_BADGES',
      targetType: 'PROPERTY',
      targetId: property._id,
      notes: `Updated badges: isFeatured=${isFeatured}, isVerified=${isVerified}`,
    });

    return sendSuccess(res, 'Property badges updated', property);
  } catch (error) {
    next(error);
  }
};

/**
 * Renew Listing (Admin / Owner)
 */
const renewListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property) {
      return sendError(res, 'Property not found', 'NOT_FOUND', {}, 404);
    }

    const validityDays = 90;
    property.status = PROPERTY_STATUS.LIVE;
    property.expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
    property.expiryReminderSent7Days = false;
    property.expiryReminderSent1Day = false;
    await property.save();

    await logAudit({
      req,
      action: 'RENEW_PROPERTY',
      targetType: 'PROPERTY',
      targetId: property._id,
      notes: `Renewed property for 90 days until ${property.expiresAt.toLocaleDateString()}`,
    });

    return sendSuccess(res, 'Listing renewed for 90 days', property);
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Users (List & Status)
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNumber - 1) * pageSize;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, 'Users retrieved', users, {
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
 * Update User Role or Status (Admin only)
 */
const updateUserRoleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 'User not found', 'NOT_FOUND', {}, 404);
    }

    if (role && Object.values(ROLES).includes(role)) {
      user.role = role;
    }
    if (status && ['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
      user.status = status;
    }

    await user.save();

    await logAudit({
      req,
      action: 'UPDATE_USER_PERMISSIONS',
      targetType: 'USER',
      targetId: user._id,
      notes: `Updated user role=${role}, status=${status}`,
    });

    return sendSuccess(res, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Platform Settings
 */
const getSettings = async (req, res, next) => {
  try {
    let settings = await AppSettings.findOne({ key: 'GENERAL_CONFIG' });
    if (!settings) {
      settings = await AppSettings.create({ key: 'GENERAL_CONFIG' });
    }
    return sendSuccess(res, 'Settings retrieved', settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Platform Settings
 */
const updateSettings = async (req, res, next) => {
  try {
    let settings = await AppSettings.findOne({ key: 'GENERAL_CONFIG' });
    if (!settings) {
      settings = new AppSettings({ key: 'GENERAL_CONFIG' });
    }

    Object.assign(settings, req.body);
    await settings.save();

    await logAudit({
      req,
      action: 'UPDATE_PLATFORM_SETTINGS',
      targetType: 'SETTINGS',
      targetId: settings._id,
      notes: 'Platform configuration updated',
    });

    return sendSuccess(res, 'Settings saved successfully', settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Audit Logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 25, targetType, action } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const skip = (pageNumber - 1) * pageSize;

    const filter = {};
    if (targetType) filter.targetType = targetType;
    if (action) filter.action = action;

    const [logs, totalCount] = await Promise.all([
      AuditLog.find(filter)
        .populate('performedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return sendSuccess(res, 'Audit logs retrieved', logs, {
      totalCount,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getModerationQueue,
  approveProperty,
  rejectProperty,
  getAllListings,
  togglePropertyBadges,
  renewListing,
  getUsers,
  updateUserRoleStatus,
  getSettings,
  updateSettings,
  getAuditLogs,
};

