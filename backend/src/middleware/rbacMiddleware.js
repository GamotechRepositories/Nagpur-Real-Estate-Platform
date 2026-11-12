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
 * Restrict route by granular permissions
 * Allows access if:
 * 1. User is SUPER_ADMIN
 * 2. User has any of the required permissions in their permissions array
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 'UNAUTHORIZED', {}, 401);
    }

    // Master bypass for SUPER_ADMIN
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const userPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];

    const hasAccess = requiredPermissions.some((perm) => userPermissions.includes(perm));

    if (!hasAccess) {
      return sendError(
        res,
        'Access denied. You lack the necessary permissions for this action.',
        'FORBIDDEN',
        { requiredPermissions, userPermissions },
        403
      );
    }

    next();
  };
};

/**
 * Staff-only access helper (SUPER_ADMIN or any internal staff user)
 */
const requireStaff = (req, res, next) => {
  const legacyStaffRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.MODERATOR,
    ROLES.CRM_MANAGER,
    ROLES.CONTENT_EDITOR,
  ];

  const isStaffMember = req.user?.isStaff || legacyStaffRoles.includes(req.user?.role);

  if (!req.user || !isStaffMember) {
    return sendError(res, 'Staff privileges required for this action.', 'FORBIDDEN', {}, 403);
  }
  next();
};

module.exports = {
  authorize,
  requirePermission,
  requireStaff,
};
