const Enquiry = require('../models/Enquiry');
const Property = require('../models/Property');
const User = require('../models/User');
const LeadActivity = require('../models/LeadActivity');
const { routeLead } = require('../services/leadRoutingService');
const { sendNotification } = require('../services/notificationService');
const { sendSuccess, sendError } = require('../utils/response');
const { NOTIFICATION_TYPES, ROLES, LEAD_STATUS } = require('../constants');
const { logAudit } = require('../services/auditService');

/**
 * Submit Enquiry (Public / User)
 */
const createEnquiry = async (req, res, next) => {
  try {
    const {
      customerName,
      phoneNumber,
      email,
      propertyId,
      message,
      leadSource = 'PROPERTY_ENQUIRY',
      budget,
      locality,
    } = req.body;

    let propertyDoc = null;
    let propertyOwnerId = null;
    let propertyTitle = '';
    let localityName = locality || '';

    if (propertyId) {
      propertyDoc = await Property.findById(propertyId);
      if (propertyDoc) {
        propertyOwnerId = propertyDoc.owner;
        propertyTitle = propertyDoc.title;
        localityName = propertyDoc.localityName;
        // Increment property enquiries counter
        Property.findByIdAndUpdate(propertyId, { $inc: { enquiriesCount: 1 } }).exec();
      }
    }

    const enquiry = new Enquiry({
      customerName,
      phoneNumber,
      email,
      property: propertyId || undefined,
      propertyTitle,
      propertyOwner: propertyOwnerId,
      locality: localityName,
      budget,
      message,
      leadSource,
      leadStatus: LEAD_STATUS.NEW,
    });

    // Auto-route lead to eligible Nagpur agent
    await routeLead(enquiry);

    // If property has an owner, notify owner
    if (propertyOwnerId) {
      await sendNotification({
        recipientId: propertyOwnerId,
        type: NOTIFICATION_TYPES.NEW_ENQUIRY,
        params: {
          customerName,
          title: propertyTitle,
          phoneNumber,
        },
        data: { leadId: enquiry._id, propertyId },
      });
    }

    return sendSuccess(res, 'Enquiry submitted successfully. An agent will contact you shortly.', enquiry, null, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Enquiries for Current User (Owner receiving enquiries or Buyer sending them)
 */
const getMyEnquiries = async (req, res, next) => {
  try {
    const isOwner = req.user.role === ROLES.OWNER;
    const isAgent = req.user.role === ROLES.AGENT;

    let filter = {};
    if (isOwner) {
      filter.propertyOwner = req.user._id;
    } else if (isAgent) {
      filter.assignedAgent = req.user._id;
    } else {
      filter.phoneNumber = req.user.phone;
    }

    const enquiries = await Enquiry.find(filter)
      .populate('property', 'title slug price coverImage localityName')
      .populate('assignedAgent', 'name phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Enquiries retrieved', enquiries);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin / CRM Manager Lead Table with Filtering and Pagination
 */
const getAdminLeads = async (req, res, next) => {
  try {
    const {
      status,
      source,
      agentId,
      locality,
      search,
      isEscalated,
      page = 1,
      limit = 15,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNumber - 1) * pageSize;

    const filter = {};

    // If user is AGENT, only allow viewing their assigned leads
    if (req.user.role === ROLES.AGENT) {
      filter.assignedAgent = req.user._id;
    } else if (agentId) {
      filter.assignedAgent = agentId;
    }

    if (status) filter.leadStatus = status;
    if (source) filter.leadSource = source;
    if (locality) filter.locality = { $regex: new RegExp(locality, 'i') };
    if (isEscalated === 'true') filter.isEscalated = true;

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { propertyTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const [leads, totalCount] = await Promise.all([
      Enquiry.find(filter)
        .populate('assignedAgent', 'name phone email avatar')
        .populate('property', 'title slug price coverImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Enquiry.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return sendSuccess(res, 'CRM Leads fetched successfully', leads, {
      totalCount,
      page: pageNumber,
      pageSize,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CRM Kanban Board View - Group leads by status
 */
const getLeadsKanban = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === ROLES.AGENT) {
      filter.assignedAgent = req.user._id;
    }

    const allLeads = await Enquiry.find(filter)
      .populate('assignedAgent', 'name phone avatar')
      .populate('property', 'title price localityName')
      .sort({ updatedAt: -1 })
      .limit(150)
      .lean();

    const kanban = {
      NEW: [],
      CONTACTED: [],
      VISIT_SCHEDULED: [],
      CLOSED_WON: [],
      CLOSED_LOST: [],
    };

    allLeads.forEach((lead) => {
      const status = lead.leadStatus || 'NEW';
      if (kanban[status]) {
        kanban[status].push(lead);
      }
    });

    return sendSuccess(res, 'Kanban leads retrieved', kanban);
  } catch (error) {
    next(error);
  }
};

/**
 * Lead Details with Timeline Activity
 */
const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await Enquiry.findById(id)
      .populate('assignedAgent', 'name phone email avatar agentProfile')
      .populate('property')
      .populate('propertyOwner', 'name phone email');

    if (!lead) {
      return sendError(res, 'Lead not found', 'NOT_FOUND', {}, 404);
    }

    // Role check for agents
    if (req.user.role === ROLES.AGENT && (!lead.assignedAgent || lead.assignedAgent._id.toString() !== req.user._id.toString())) {
      return sendError(res, 'Unauthorized to view this lead', 'FORBIDDEN', {}, 403);
    }

    const activities = await LeadActivity.find({ enquiry: lead._id })
      .populate('performedBy', 'name role avatar')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Lead details retrieved', {
      lead,
      activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Lead Status / Notes
 */
const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { leadStatus, followUpDate, notes } = req.body;

    const lead = await Enquiry.findById(id);
    if (!lead) {
      return sendError(res, 'Lead not found', 'NOT_FOUND', {}, 404);
    }

    const previousStatus = lead.leadStatus;
    if (leadStatus && previousStatus !== leadStatus) {
      lead.leadStatus = leadStatus;
      await LeadActivity.create({
        enquiry: lead._id,
        performedBy: req.user._id,
        activityType: 'STATUS_CHANGE',
        previousStatus,
        newStatus: leadStatus,
        details: `Status transitioned from ${previousStatus} to ${leadStatus} by ${req.user.name}`,
      });
    }

    if (followUpDate) lead.followUpDate = new Date(followUpDate);
    if (notes !== undefined) lead.notes = notes;

    await lead.save();

    return sendSuccess(res, 'Lead updated successfully', lead);
  } catch (error) {
    next(error);
  }
};

/**
 * Add CRM Activity (Note, Call, WhatsApp log)
 */
const addLeadActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activityType, details } = req.body;

    const lead = await Enquiry.findById(id);
    if (!lead) {
      return sendError(res, 'Lead not found', 'NOT_FOUND', {}, 404);
    }

    const activity = await LeadActivity.create({
      enquiry: lead._id,
      performedBy: req.user._id,
      activityType: activityType || 'NOTE_ADDED',
      details,
    });

    return sendSuccess(res, 'Activity recorded in CRM timeline', activity, null, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Reassign Lead to Another Agent
 */
const reassignLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const lead = await Enquiry.findById(id);
    if (!lead) {
      return sendError(res, 'Lead not found', 'NOT_FOUND', {}, 404);
    }

    const newAgent = await User.findById(agentId);
    if (!newAgent || newAgent.role !== ROLES.AGENT) {
      return sendError(res, 'Target agent not found or invalid role', 'INVALID_AGENT', {}, 400);
    }

    lead.assignedAgent = newAgent._id;
    lead.assignedAt = new Date();
    await lead.save();

    await LeadActivity.create({
      enquiry: lead._id,
      performedBy: req.user._id,
      activityType: 'REASSIGNED',
      details: `Lead reassigned to ${newAgent.name} by ${req.user.name}`,
    });

    await sendNotification({
      recipientId: newAgent._id,
      type: NOTIFICATION_TYPES.LEAD_ASSIGNED,
      params: { customerName: lead.customerName, sla: '4' },
      data: { leadId: lead._id },
    });

    await logAudit({
      req,
      action: 'REASSIGN_LEAD',
      targetType: 'LEAD',
      targetId: lead._id,
      notes: `Reassigned lead to ${newAgent.name}`,
    });

    return sendSuccess(res, `Lead successfully reassigned to ${newAgent.name}`, lead);
  } catch (error) {
    next(error);
  }
};

/**
 * Export Leads as CSV
 */
const exportLeadsCsv = async (req, res, next) => {
  try {
    const leads = await Enquiry.find().populate('assignedAgent', 'name phone').sort({ createdAt: -1 }).limit(1000);

    const headers = ['ID,Customer Name,Phone,Email,Property,Locality,Status,Source,Assigned Agent,Created At\n'];
    const rows = leads.map((l) =>
      `"${l._id}","${l.customerName.replace(/"/g, '""')}","${l.phoneNumber}","${l.email || ''}","${(l.propertyTitle || '').replace(/"/g, '""')}","${l.locality || ''}","${l.leadStatus}","${l.leadSource}","${l.assignedAgent ? l.assignedAgent.name : 'Unassigned'}","${l.createdAt.toISOString()}"\n`
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="nagpur_real_estate_leads.csv"');
    return res.status(200).send(headers.concat(rows).join(''));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEnquiry,
  getMyEnquiries,
  getAdminLeads,
  getLeadsKanban,
  getLeadById,
  updateLead,
  addLeadActivity,
  reassignLead,
  exportLeadsCsv,
};
