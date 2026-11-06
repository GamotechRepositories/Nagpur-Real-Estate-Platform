const { ROLES } = require('../constants');
const { sendError } = require('../utils/response');

/**
 * Restrict route to specified roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 'UNAUTHORIZED', {}, 401);
    }

    // SUPER_ADMIN has master bypass for administrative operations
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
        'FORBIDDEN',
        { requiredRoles: allowedRoles, currentRole: req.user.role },
        403
      );
    }

    next();
  };
};

/**
 * Staff-only access helper (SUPER_ADMIN, MODERATOR, CRM_MANAGER, CONTENT_EDITOR)
 */
const requireStaff = (req, res, next) => {
  const staffRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.MODERATOR,
    ROLES.CRM_MANAGER,
    ROLES.CONTENT_EDITOR,
  ];

  if (!req.user || !staffRoles.includes(req.user.role)) {
    return sendError(res, 'Staff privileges required for this action.', 'FORBIDDEN', {}, 403);
  }
  next();
};

module.exports = {
  authorize,
  requireStaff,
};
