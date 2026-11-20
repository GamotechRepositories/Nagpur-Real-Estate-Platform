const { ROLES } = require('../constants');
const { sendError } = require('../utils/response');

/**
 * Granular default permissions map for legacy staff roles
 */
const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.CRM_MANAGER]: [
    'dashboard.view',
    'leads.view',
    'leads.manage',
    'leads.export',
    'visits.view',
    'visits.manage',
    'agents.view',
    'agents.manage',
    'builders.view',
    'builders.manage',
    'loans.view',
    'loans.manage',
    'listings.view',
    'listings.allocate',
  ],
  [ROLES.MODERATOR]: [
    'dashboard.view',
    'moderation.view',
    'moderation.review',
    'listings.view',
    'listings.edit',
    'listings.allocate',
    'projects.view',
    'agents.view',
    'builders.view',
  ],
  [ROLES.CONTENT_EDITOR]: [
    'dashboard.view',
    'content.view',
    'content.manage',
    'localities.manage',
    'projects.view',
    'projects.manage',
  ],
};

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

    // User explicitly has wildcard permissions
    if (Array.isArray(req.user.permissions) && req.user.permissions.includes('*')) {
      return next();
    }

    // Match primary role or secondary roles
    const userRole = req.user.role;
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];

    if (allowedRoles.includes(userRole) || userRoles.some((r) => allowedRoles.includes(r))) {
      return next();
    }

    // If staff member has granular permissions matching role capabilities
    const staffPerms = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    if (allowedRoles.includes(ROLES.CRM_MANAGER) && (staffPerms.includes('leads.manage') || staffPerms.includes('leads.view'))) {
      return next();
    }
    if (allowedRoles.includes(ROLES.CONTENT_EDITOR) && (staffPerms.includes('content.manage') || staffPerms.includes('projects.manage') || staffPerms.includes('localities.manage'))) {
      return next();
    }
    if (allowedRoles.includes(ROLES.MODERATOR) && (staffPerms.includes('moderation.review') || staffPerms.includes('moderation.view') || staffPerms.includes('listings.edit'))) {
      return next();
    }

    return sendError(
      res,
      `Access denied. Role '${userRole}' is not authorized to access this resource.`,
      'FORBIDDEN',
      { requiredRoles: allowedRoles, currentRole: userRole },
      403
    );
  };
};

/**
 * Restrict route by granular permissions
 * Allows access if:
 * 1. User is SUPER_ADMIN
 * 2. User has '*' wildcard permission
 * 3. User has any of the required permissions in their permissions array (or inherited from role defaults)
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

    const explicitPerms = Array.isArray(req.user.permissions) && req.user.permissions.length > 0
      ? req.user.permissions
      : (DEFAULT_ROLE_PERMISSIONS[req.user.role] || []);

    if (explicitPerms.includes('*')) {
      return next();
    }

    const hasAccess = requiredPermissions.some((perm) => explicitPerms.includes(perm));

    if (!hasAccess) {
      return sendError(
        res,
        'Access denied. You lack the necessary permissions for this action.',
        'FORBIDDEN',
        { requiredPermissions, userPermissions: explicitPerms },
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
