/**
 * System-Wide Permissions and Role Modules Configuration
 * Used for dynamic RBAC access control across Admin Dashboard
 */

export const PERMISSIONS = {
  // Overview Dashboard
  DASHBOARD_VIEW: 'dashboard.view',

  // Moderation
  MODERATION_VIEW: 'moderation.view',
  MODERATION_REVIEW: 'moderation.review',

  // Listings Management
  LISTINGS_VIEW: 'listings.view',
  LISTINGS_CREATE: 'listings.create',
  LISTINGS_EDIT: 'listings.edit',
  LISTINGS_DELETE: 'listings.delete',

  // Leads & CRM Pipeline
  LEADS_VIEW: 'leads.view',
  LEADS_MANAGE: 'leads.manage',
  LEADS_EXPORT: 'leads.export',

  // Site Visits
  SITE_VISITS_VIEW: 'visits.view',
  SITE_VISITS_MANAGE: 'visits.manage',

  // Loan Requests
  LOANS_VIEW: 'loans.view',
  LOANS_MANAGE: 'loans.manage',

  // Content & CMS
  CONTENT_VIEW: 'content.view',
  CONTENT_MANAGE: 'content.manage',

  // Localities & Projects
  LOCALITIES_MANAGE: 'localities.manage',
  PROJECTS_MANAGE: 'projects.manage',

  // Notifications Broadcast
  NOTIFICATIONS_SEND: 'notifications.send',

  // System & Staff Management
  STAFF_MANAGE: 'staff.manage',
  SETTINGS_MANAGE: 'settings.manage',
  AUDIT_LOGS_VIEW: 'audit.view',
};

export const PERMISSION_MODULES = [
  {
    id: 'overview',
    title: 'Dashboard & Platform Analytics',
    badge: 'Executive',
    permissions: [
      { key: PERMISSIONS.DASHBOARD_VIEW, label: 'View Dashboard & Analytics', desc: 'Can view platform statistics, top localities, and daily conversion metrics' },
    ],
  },
  {
    id: 'moderation',
    title: 'Listing Moderation Queue',
    badge: 'Core',
    permissions: [
      { key: PERMISSIONS.MODERATION_VIEW, label: 'View Moderation Queue', desc: 'Can view submissions waiting for approval' },
      { key: PERMISSIONS.MODERATION_REVIEW, label: 'Approve / Reject Listings', desc: 'Can approve or reject properties with custom reason' },
    ],
  },
  {
    id: 'listings',
    title: 'Property Listings',
    badge: 'Inventory',
    permissions: [
      { key: PERMISSIONS.LISTINGS_VIEW, label: 'View All Listings', desc: 'Browse full marketplace listings' },
      { key: PERMISSIONS.LISTINGS_CREATE, label: 'Add New Properties', desc: 'Create and post new listings directly' },
      { key: PERMISSIONS.LISTINGS_EDIT, label: 'Edit & Badge Control', desc: 'Toggle Verified, Featured badges, and edit properties' },
      { key: PERMISSIONS.LISTINGS_DELETE, label: 'Archive / Delete', desc: 'Unpublish or archive outdated properties' },
    ],
  },
  {
    id: 'crm',
    title: 'CRM & Leads Pipeline',
    badge: 'Sales',
    permissions: [
      { key: PERMISSIONS.LEADS_VIEW, label: 'View Inquiries & Pipeline', desc: 'Access leads Kanban and table list' },
      { key: PERMISSIONS.LEADS_MANAGE, label: 'Manage & Assign Leads', desc: 'Reassign leads, update stages, add activity notes' },
      { key: PERMISSIONS.LEADS_EXPORT, label: 'Export Leads CSV', desc: 'Download lead reports for external analysis' },
    ],
  },
  {
    id: 'site_visits',
    title: 'Site Visits Management',
    badge: 'Operations',
    permissions: [
      { key: PERMISSIONS.SITE_VISITS_VIEW, label: 'View Scheduled Visits', desc: 'View calendar of buyer property tours' },
      { key: PERMISSIONS.SITE_VISITS_MANAGE, label: 'Manage & Confirm Visits', desc: 'Confirm slots, reschedule, or cancel visits' },
    ],
  },
  {
    id: 'loans',
    title: 'Home Loan Requests',
    badge: 'Financial',
    permissions: [
      { key: PERMISSIONS.LOANS_VIEW, label: 'View Loan Enquiries', desc: 'See bank loan applications from EMI calculator' },
      { key: PERMISSIONS.LOANS_MANAGE, label: 'Process Loan Requests', desc: 'Assign to banking partners and update loan status' },
    ],
  },
  {
    id: 'content',
    title: 'Articles & FAQ (CMS)',
    badge: 'Marketing',
    permissions: [
      { key: PERMISSIONS.CONTENT_VIEW, label: 'View Content Pages', desc: 'Read CMS articles, guides, and FAQs' },
      { key: PERMISSIONS.CONTENT_MANAGE, label: 'Publish & Edit Articles', desc: 'Create, update, and remove CMS content' },
    ],
  },
  {
    id: 'localities_projects',
    title: 'Localities & Projects',
    badge: 'Data',
    permissions: [
      { key: PERMISSIONS.LOCALITIES_MANAGE, label: 'Edit Localities & Pincodes', desc: 'Manage Nagpur localities and area guides' },
      { key: PERMISSIONS.PROJECTS_MANAGE, label: 'Manage Builder Projects', desc: 'Create new builder developments and RERA units' },
    ],
  },
  {
    id: 'notifications',
    title: 'Broadcast Alerts',
    badge: 'Outreach',
    permissions: [
      { key: PERMISSIONS.NOTIFICATIONS_SEND, label: 'Send Platform Broadcasts', desc: 'Push web notifications and WhatsApp messages' },
    ],
  },
  {
    id: 'administration',
    title: 'Staff, Audit & Settings',
    badge: 'Security',
    permissions: [
      { key: PERMISSIONS.STAFF_MANAGE, label: 'Staff & Roles Management', desc: 'Create employees and configure granular access' },
      { key: PERMISSIONS.AUDIT_LOGS_VIEW, label: 'Audit Trail Viewer', desc: 'Review staff actions and security timestamps' },
      { key: PERMISSIONS.SETTINGS_MANAGE, label: 'Platform Settings', desc: 'Update system rules, SLA timings, and defaults' },
    ],
  },
];

/**
 * Predefined Quick Templates for Employee Onboarding
 */
export const ROLE_PRESETS = {
  MODERATOR: {
    title: 'Listing Moderator',
    permissions: [
      PERMISSIONS.MODERATION_VIEW,
      PERMISSIONS.MODERATION_REVIEW,
      PERMISSIONS.LISTINGS_VIEW,
      PERMISSIONS.LISTINGS_EDIT,
    ],
  },
  CRM_MANAGER: {
    title: 'CRM / Sales Executive',
    permissions: [
      PERMISSIONS.LEADS_VIEW,
      PERMISSIONS.LEADS_MANAGE,
      PERMISSIONS.LEADS_EXPORT,
      PERMISSIONS.SITE_VISITS_VIEW,
      PERMISSIONS.SITE_VISITS_MANAGE,
      PERMISSIONS.LOANS_VIEW,
      PERMISSIONS.LOANS_MANAGE,
    ],
  },
  CONTENT_EDITOR: {
    title: 'Content & SEO Specialist',
    permissions: [
      PERMISSIONS.CONTENT_VIEW,
      PERMISSIONS.CONTENT_MANAGE,
      PERMISSIONS.LOCALITIES_MANAGE,
      PERMISSIONS.PROJECTS_MANAGE,
    ],
  },
  SUPER_ADMIN: {
    title: 'Super Administrator',
    permissions: Object.values(PERMISSIONS),
  },
};

/**
 * Helper to check if a user has access to a specific permission
 */
export const hasPermission = (user, permissionKey) => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  const userPerms = Array.isArray(user.permissions) ? user.permissions : [];
  if (userPerms.includes('*')) return true;
  return userPerms.includes(permissionKey);
};

/**
 * Helper to check if user has ANY of the specified permissions
 */
export const hasAnyPermission = (user, permissionKeys = []) => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (!permissionKeys || permissionKeys.length === 0) return true;
  const userPerms = Array.isArray(user.permissions) ? user.permissions : [];
  if (userPerms.includes('*')) return true;
  return permissionKeys.some((key) => userPerms.includes(key));
};

