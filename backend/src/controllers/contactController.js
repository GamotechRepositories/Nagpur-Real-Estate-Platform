const ContactInquiry = require('../models/ContactInquiry');
const Enquiry = require('../models/Enquiry');
const User = require('../models/User');
const { routeLead } = require('../services/leadRoutingService');
const { sendNotification } = require('../services/notificationService');
const { sendSuccess, sendError } = require('../utils/response');
const { NOTIFICATION_TYPES, ROLES, LEAD_STATUS } = require('../constants');

/**
 * Public Contact Form Submission (from Flutter App or Website)
 */
const createContactInquiry = async (req, res, next) => {
  try {
    const {
      fullName,
      name,
      phoneNumber,
      phone,
      email = '',
      interestType = 'BUYING',
      locality = '',
      message,
      source = 'APP_HOME_CONTACT_FORM',
    } = req.body;

    const contactName = (fullName || name || '').trim();
    const contactPhone = (phoneNumber || phone || '').toString().trim().replace(/^\+91/, '').replace(/\D/g, '');

    if (!contactName || contactName.length < 2) {
      return sendError(res, 'Please provide a valid full name (minimum 2 characters)', 400);
    }

    if (!contactPhone || contactPhone.length !== 10) {
      return sendError(res, 'Please enter a valid 10-digit Indian mobile number', 400);
    }

    if (!message || message.trim().length < 3) {
      return sendError(res, 'Please enter your message or requirement (minimum 3 characters)', 400);
    }

    // 1. Create ContactInquiry record
    const contactDoc = await ContactInquiry.create({
      fullName: contactName,
      phoneNumber: contactPhone,
      email: (email || '').trim().toLowerCase(),
      interestType,
      locality: (locality || '').trim(),
      message: message.trim(),
      source,
      status: 'NEW',
    });

    // 2. Also register into main Enquiry collection for agent CRM routing
    try {
      const generalEnquiry = new Enquiry({
        customerName: contactName,
        phoneNumber: contactPhone,
        email: (email || '').trim().toLowerCase(),
        propertyTitle: `Direct Contact: ${interestType.replace(/_/g, ' ')}`,
        locality: locality || 'Nagpur',
        message: `[Contact Form - ${interestType}] ${message.trim()}`,
        leadSource: 'WEBSITE',
        leadStatus: LEAD_STATUS.NEW,
      });

      await routeLead(generalEnquiry);
    } catch (leadErr) {
      console.warn('[Contact -> Enquiry sync warning]:', leadErr.message);
    }

    // 3. Notify Admin / CRM Managers
    try {
      const admins = await User.find({
        role: { $in: [ROLES.SUPER_ADMIN, ROLES.CRM_MANAGER] },
        status: 'ACTIVE',
      }).select('_id');

      for (const admin of admins) {
        await sendNotification({
          recipientId: admin._id,
          type: NOTIFICATION_TYPES.NEW_ENQUIRY,
          params: {
            customerName: contactName,
            title: `Contact Form (${interestType})`,
            phoneNumber: contactPhone,
          },
          data: { contactId: contactDoc._id },
        });
      }
    } catch (notifErr) {
      console.warn('[Contact notification warning]:', notifErr.message);
    }

    return sendSuccess(
      res,
      'Your inquiry has been submitted successfully. Our team will contact you shortly.',
      contactDoc,
      null,
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all Contact Inquiries with filtering, search & counts
 */
const getAdminContactInquiries = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * pageSize;

    const filter = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { phoneNumber: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { message: { $regex: q, $options: 'i' } },
        { locality: { $regex: q, $options: 'i' } },
      ];
    }

    const [items, totalCount, statusCounts] = await Promise.all([
      ContactInquiry.find(filter)
        .populate('assignedTo', 'name phone email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      ContactInquiry.countDocuments(filter),
      ContactInquiry.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const counts = {
      ALL: 0,
      NEW: 0,
      CONTACTED: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };

    statusCounts.forEach((sc) => {
      if (counts[sc._id] !== undefined) {
        counts[sc._id] = sc.count;
      }
      counts.ALL += sc.count;
    });

    return sendSuccess(
      res,
      'Contact inquiries retrieved successfully',
      items,
      {
        pagination: {
          page: pageNum,
          limit: pageSize,
          total: totalCount,
          pages: Math.ceil(totalCount / pageSize),
        },
        counts,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Contact Inquiry Status or Internal Notes
 */
const updateContactInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, assignedTo } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;

    const updated = await ContactInquiry.findByIdAndUpdate(id, updateData, { new: true }).populate(
      'assignedTo',
      'name phone email'
    );

    if (!updated) {
      return sendError(res, 'Contact inquiry not found', 404);
    }

    return sendSuccess(res, 'Contact inquiry updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete / Archive Contact Inquiry
 */
const deleteContactInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await ContactInquiry.findByIdAndDelete(id);

    if (!deleted) {
      return sendError(res, 'Contact inquiry not found', 404);
    }

    return sendSuccess(res, 'Contact inquiry deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContactInquiry,
  getAdminContactInquiries,
  updateContactInquiry,
  deleteContactInquiry,
};
