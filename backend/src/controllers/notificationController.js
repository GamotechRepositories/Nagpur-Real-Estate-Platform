const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get User In-App Notifications
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return sendSuccess(res, 'Notifications retrieved', {
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark Single Notification as Read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notif) {
      return sendError(res, 'Notification not found', 'NOT_FOUND', {}, 404);
    }

    return sendSuccess(res, 'Marked as read', notif);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark All Notifications as Read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return sendSuccess(res, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Broadcast In-App Notification to User Segments
 */
const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, targetRole = 'ALL', channel = 'IN_APP', link } = req.body;
    const User = require('../models/User');

    if (!title || !message) {
      return sendError(res, 'Title and message are required', 'VALIDATION_ERROR', {}, 400);
    }

    const filter = { status: 'ACTIVE' };
    if (targetRole && targetRole !== 'ALL') {
      filter.role = targetRole;
    }

    const recipients = await User.find(filter).select('_id').lean();

    if (!recipients.length) {
      return sendError(res, 'No active users found for selected audience', 'NO_RECIPIENTS', {}, 400);
    }

    const notificationsToCreate = recipients.map((u) => ({
      recipient: u._id,
      type: 'SYSTEM_ANNOUNCEMENT',
      title,
      message,
      channel,
      data: { link: link || '' },
      isRead: false,
    }));

    // Batch insert notifications
    await Notification.insertMany(notificationsToCreate);

    return sendSuccess(res, `Broadcast sent successfully to ${recipients.length} users`, {
      recipientCount: recipients.length,
      targetRole,
      title,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get Recent Broadcast History
 */
const getBroadcastHistory = async (req, res, next) => {
  try {
    const broadcasts = await Notification.aggregate([
      { $match: { type: 'SYSTEM_ANNOUNCEMENT' } },
      {
        $group: {
          _id: { title: '$title', message: '$message' },
          totalSent: { $sum: 1 },
          lastSentAt: { $max: '$createdAt' },
          channel: { $first: '$channel' },
        },
      },
      { $sort: { lastSentAt: -1 } },
      { $limit: 20 },
    ]);

    return sendSuccess(res, 'Broadcast history retrieved', broadcasts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  broadcastNotification,
  getBroadcastHistory,
};

