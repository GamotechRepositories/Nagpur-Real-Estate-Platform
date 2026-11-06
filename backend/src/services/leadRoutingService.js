const User = require('../models/User');
const AgentProfile = require('../models/AgentProfile');
const AppSettings = require('../models/AppSettings');
const LeadActivity = require('../models/LeadActivity');
const { sendNotification } = require('./notificationService');
const { ROLES, NOTIFICATION_TYPES } = require('../constants');

/**
 * Route lead dynamically using configured rules
 */
const routeLead = async (enquiry) => {
  try {
    // 1. Get settings
    let settings = await AppSettings.findOne({ key: 'GENERAL_CONFIG' });
    if (!settings) {
      settings = await AppSettings.create({ key: 'GENERAL_CONFIG' });
    }

    const { routingMode, defaultSlaHours } = settings.leadRouting;
    const slaDeadline = new Date(Date.now() + (defaultSlaHours || 4) * 60 * 60 * 1000);
    enquiry.slaDeadline = slaDeadline;

    // If manual routing, do not auto-assign
    if (routingMode === 'MANUAL') {
      await enquiry.save();
      return enquiry;
    }

    let assignedAgentUser = null;

    // 2. Locality-based routing
    if (routingMode === 'LOCALITY_BASED' && enquiry.locality) {
      // Find active verified agent serving this locality
      const matchingProfiles = await AgentProfile.find({
        isAvailable: true,
        verificationStatus: 'VERIFIED',
        areasServed: { $regex: new RegExp(`^${enquiry.locality}$`, 'i') },
      }).populate('user');

      const eligibleAgents = matchingProfiles
        .map((p) => p.user)
        .filter((u) => u && u.status === 'ACTIVE' && u.role === ROLES.AGENT);

      if (eligibleAgents.length > 0) {
        // Pick least loaded or random eligible agent
        assignedAgentUser = eligibleAgents[0];
      }
    }

    // 3. Fallback to Round-Robin routing across active verified agents
    if (!assignedAgentUser) {
      const allActiveAgents = await User.find({
        role: ROLES.AGENT,
        status: 'ACTIVE',
      });

      if (allActiveAgents.length > 0) {
        const nextIndex = (settings.leadRouting.lastAssignedAgentIndex + 1) % allActiveAgents.length;
        assignedAgentUser = allActiveAgents[nextIndex];

        // Update round-robin index
        settings.leadRouting.lastAssignedAgentIndex = nextIndex;
        await settings.save();
      }
    }

    if (assignedAgentUser) {
      enquiry.assignedAgent = assignedAgentUser._id;
      enquiry.assignedAt = new Date();

      // Log LeadActivity timeline event
      await LeadActivity.create({
        enquiry: enquiry._id,
        performedBy: assignedAgentUser._id,
        activityType: 'STATUS_CHANGE',
        newStatus: enquiry.leadStatus,
        details: `Lead automatically routed to ${assignedAgentUser.name} (${routingMode} routing). SLA: ${defaultSlaHours} hours.`,
      });

      // Send in-app notification to assigned agent
      await sendNotification({
        recipientId: assignedAgentUser._id,
        type: NOTIFICATION_TYPES.LEAD_ASSIGNED,
        params: {
          customerName: enquiry.customerName,
          sla: defaultSlaHours.toString(),
        },
        data: {
          leadId: enquiry._id,
        },
      });
    }

    await enquiry.save();
    return enquiry;
  } catch (err) {
    console.error('[Lead Routing Error]:', err.message);
    return enquiry;
  }
};

/**
 * Check and escalate leads exceeding SLA deadline
 */
const checkSlaBreaches = async () => {
  try {
    const overdueLeads = await Enquiry.find({
      leadStatus: 'NEW',
      isEscalated: false,
      slaDeadline: { $lt: new Date() },
    }).populate('assignedAgent');

    for (const lead of overdueLeads) {
      lead.isEscalated = true;
      await lead.save();

      // Find staff/crm managers to notify
      const crmManagers = await User.find({
        role: { $in: [ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER] },
        status: 'ACTIVE',
      });

      for (const manager of crmManagers) {
        await sendNotification({
          recipientId: manager._id,
          type: NOTIFICATION_TYPES.LEAD_ASSIGNED,
          params: {
            customerName: `[SLA BREACH ALERT] ${lead.customerName}`,
            sla: '0',
          },
          data: { leadId: lead._id },
        });
      }
    }
  } catch (err) {
    console.error('[SLA Check Error]:', err.message);
  }
};

module.exports = {
  routeLead,
  checkSlaBreaches,
};

