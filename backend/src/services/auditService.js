const AuditLog = require('../models/AuditLog');

const logAudit = async ({
  req,
  action,
  targetType,
  targetId,
  changes = null,
  notes = '',
}) => {
  try {
    const performedBy = req?.user?._id;
    if (!performedBy) return null;

    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    return await AuditLog.create({
      performedBy,
      action,
      targetType,
      targetId,
      changes,
      ipAddress,
      userAgent,
      notes,
    });
  } catch (err) {
    console.error('[Audit Logging Error]:', err.message);
    return null;
  }
};

module.exports = {
  logAudit,
};
