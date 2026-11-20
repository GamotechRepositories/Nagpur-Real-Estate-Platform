const SiteVisit = require('../models/SiteVisit');
const Property = require('../models/Property');
const { sendNotification } = require('../services/notificationService');
const { sendSuccess, sendError } = require('../utils/response');
const { SITE_VISIT_STATUS, NOTIFICATION_TYPES, ROLES } = require('../constants');

/**
 * Request Site Visit (Customer / Public)
 */
const requestSiteVisit = async (req, res, next) => {
  try {
    const {
      propertyId,
      customerName,
      phoneNumber,
      email,
      preferredDate,
      preferredTimeSlot,
    } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return sendError(res, 'Property not found', 'NOT_FOUND', {}, 404);
    }

    const assignedAgent =
      property.assignedAgent ||
      (Array.isArray(property.assignedAgents) && property.assignedAgents.length > 0 ? property.assignedAgents[0] : null) ||
      property.owner;

    const visit = await SiteVisit.create({
      property: property._id,
      user: req.user ? req.user._id : undefined,
      customerName,
      phoneNumber,
      email,
      preferredDate: new Date(preferredDate),
      preferredTimeSlot,
      assignedAgent,
      status: SITE_VISIT_STATUS.REQUESTED,
    });

    if (assignedAgent) {
      await sendNotification({
        recipientId: assignedAgent,
        type: NOTIFICATION_TYPES.SITE_VISIT_REQUESTED,
        params: {
          customerName,
          title: property.title,
          date: new Date(preferredDate).toLocaleDateString(),
          slot: preferredTimeSlot,
        },
        data: { siteVisitId: visit._id, propertyId },
      });
    }

    return sendSuccess(res, 'Site visit requested successfully. Our team will confirm your slot.', visit, null, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Site Visits (filtered by role, sorted latest first)
 */
const getSiteVisits = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    let filter = {};

    if (req.user.role === ROLES.AGENT || req.user.role === ROLES.BUILDER) {
      const AgentProfile = require('../models/AgentProfile');
      const Builder = require('../models/Builder');
      const agentProfile = await AgentProfile.findOne({ user: req.user._id });
      const builderProfile = await Builder.findOne({ user: req.user._id });

      const possibleIds = [
        req.user._id,
        agentProfile ? agentProfile._id : null,
        builderProfile ? builderProfile._id : null,
      ].filter(Boolean);

      const myProperties = await Property.find({
        $or: [
          { owner: { $in: possibleIds } },
          { assignedAgent: { $in: possibleIds } },
          { assignedAgents: { $in: possibleIds } },
        ],
      }).select('_id');
      const propIds = myProperties.map((p) => p._id);
      filter.$or = [
        { assignedAgent: { $in: possibleIds } },
        { property: { $in: propIds } },
      ];
    } else if (req.user.role === ROLES.OWNER) {
      // Find properties owned by this owner
      const myProperties = await Property.find({ owner: req.user._id }).select('_id');
      filter.property = { $in: myProperties.map((p) => p._id) };
    } else if (req.user.role === ROLES.USER) {
      filter.$or = [{ user: req.user._id }, { phoneNumber: req.user.phone }];
    }

    if (status) filter.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.preferredDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const visits = await SiteVisit.find(filter)
      .populate('property')
      .populate('assignedAgent', 'name phone email avatar')
      .populate('user', 'name phone email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Site visits retrieved', visits);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Site Visit by ID with full Property and Agent details
 */
const getSiteVisitById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const visit = await SiteVisit.findById(id)
      .populate('property')
      .populate('assignedAgent', 'name phone email avatar agentProfile')
      .populate('user', 'name phone email');

    if (!visit) {
      return sendError(res, 'Site visit not found', 'NOT_FOUND', {}, 404);
    }

    return sendSuccess(res, 'Site visit details retrieved', visit);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Site Visit Status (Confirm, Reschedule, Cancel, Complete)
 */
const updateSiteVisit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason, feedbackNotes, preferredDate, preferredTimeSlot, assignedAgent } = req.body;

    const visit = await SiteVisit.findById(id).populate('property');
    if (!visit) {
      return sendError(res, 'Site visit not found', 'NOT_FOUND', {}, 404);
    }

    if (status) visit.status = status;
    if (cancellationReason !== undefined) visit.cancellationReason = cancellationReason;
    if (feedbackNotes !== undefined) visit.feedbackNotes = feedbackNotes;
    if (preferredDate) visit.preferredDate = new Date(preferredDate);
    if (preferredTimeSlot) visit.preferredTimeSlot = preferredTimeSlot;
    if (assignedAgent) visit.assignedAgent = assignedAgent;

    await visit.save();

    // If confirmed and user is registered, notify customer
    if (status === SITE_VISIT_STATUS.CONFIRMED && visit.user) {
      await sendNotification({
        recipientId: visit.user,
        type: NOTIFICATION_TYPES.SITE_VISIT_CONFIRMED,
        params: {
          title: visit.property ? visit.property.title : 'Property',
          date: new Date(visit.preferredDate).toLocaleDateString(),
          slot: visit.preferredTimeSlot,
        },
        data: { siteVisitId: visit._id },
      });
    }

    return sendSuccess(res, 'Site visit updated successfully', visit);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestSiteVisit,
  getSiteVisits,
  getSiteVisitById,
  updateSiteVisit,
};
