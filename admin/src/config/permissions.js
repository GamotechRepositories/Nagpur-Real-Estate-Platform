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
  LISTINGS_ALLOCATE: 'listings.allocate',
  LISTINGS_DELETE: 'listings.delete',

  // Projects / Townships & High-Rises
  PROJECTS_VIEW: 'projects.view',
  PROJECTS_MANAGE: 'projects.manage',
  PROJECTS_DELETE: 'projects.delete',

  // Localities & Market Data
  LOCALITIES_MANAGE: 'localities.manage',

  // Leads & CRM Pipeline
  LEADS_VIEW: 'leads.view',
  LEADS_MANAGE: 'leads.manage',
  LEADS_EXPORT: 'leads.export',

  // Site Visits
  SITE_VISITS_VIEW: 'visits.view',
  SITE_VISITS_MANAGE: 'visits.manage',

  // Certified Agents Management
  AGENTS_VIEW: 'agents.view',
  AGENTS_MANAGE: 'agents.manage',

  // Builders & Township Developers
  BUILDERS_VIEW: 'builders.view',
  BUILDERS_MANAGE: 'builders.manage',

  // Loan Requests
  LOANS_VIEW: 'loans.view',
  LOANS_MANAGE: 'loans.manage',

  // Content & CMS
  CONTENT_VIEW: 'content.view',
  CONTENT_MANAGE: 'content.manage',

  // Public Users / Registered Citizens
  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',

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
      {
        key: PERMISSIONS.DASHBOARD_VIEW,
        label: 'View Dashboard & Analytics',
        desc: 'Can view platform statistics, top localities, and daily conversion metrics',
      },
    ],
  },
  {
    id: 'moderation',
    title: 'Listing Moderation Queue',
    badge: 'Core',
    permissions: [
      {
        key: PERMISSIONS.MODERATION_VIEW,
        label: 'View Moderation Queue',
        desc: 'Can view submissions waiting for approval',
      },
      {
        key: PERMISSIONS.MODERATION_REVIEW,
        label: 'Approve / Reject Listings',
        desc: 'Can approve or reject properties with custom reason',
      },
    ],
  },
  {
    id: 'listings',
    title: 'Property Listings',
    badge: 'Inventory',
    permissions: [
      {
        key: PERMISSIONS.LISTINGS_VIEW,
        label: 'View All Listings',
        desc: 'Browse full marketplace listings and confidential records',
      },
      {
        key: PERMISSIONS.LISTINGS_CREATE,
        label: 'Add New Properties',
        desc: 'Create and post new listings directly',
      },
      {
        key: PERMISSIONS.LISTINGS_EDIT,
        label: 'Edit & Badge Control',
        desc: 'Update property details, custom specs, featured tags, and mark as sold',
      },
      {
        key: PERMISSIONS.LISTINGS_ALLOCATE,
        label: 'Allocate to Agents & Builders',
        desc: 'Assign citizen/homeowner properties to certified partners for client handling',
      },
      {
        key: PERMISSIONS.LISTINGS_DELETE,
        label: 'Archive / Delete',
        desc: 'Unpublish or archive outdated properties',
      },
    ],
  },
  {
    id: 'projects',
    title: 'Township & Builder Projects',
    badge: 'Developments',
    permissions: [
      {
        key: PERMISSIONS.PROJECTS_VIEW,
        label: 'View Township Projects',
        desc: 'Browse registered high-rises, gated villa townships, and plotted schemes',
      },
      {
        key: PERMISSIONS.PROJECTS_MANAGE,
        label: 'Create & Manage Projects',
        desc: 'Register developments, configure custom specs, RERA verification, and unit inventory',
      },
      {
        key: PERMISSIONS.PROJECTS_DELETE,
        label: 'Archive / Delete Projects',
        desc: 'Unpublish or remove builder developments',
      },
    ],
  },
  {
    id: 'localities',
    title: 'Localities & Market Data',
    badge: 'Geographic',
    permissions: [
      {
        key: PERMISSIONS.LOCALITIES_MANAGE,
        label: 'Manage Localities & Circle Rates',
        desc: 'Update Nagpur localities, pincodes, circle rates, and area guides',
      },
    ],
  },
  {
    id: 'crm',
    title: 'CRM & Leads Pipeline',
    badge: 'Sales',
    permissions: [
      {
        key: PERMISSIONS.LEADS_VIEW,
        label: 'View Inquiries & Pipeline',
        desc: 'Access buyer inquiries, Kanban pipeline stages, and buyer dossiers',
      },
      {
        key: PERMISSIONS.LEADS_MANAGE,
        label: 'Manage & Assign Leads',
        desc: 'Reassign leads, update pipeline stages, and add call notes & logs',
      },
      {
        key: PERMISSIONS.LEADS_EXPORT,
        label: 'Export Leads CSV',
        desc: 'Download lead reports for external analysis',
      },
    ],
  },
  {
    id: 'site_visits',
    title: 'Site Visits Management',
    badge: 'Operations',
    permissions: [
      {
        key: PERMISSIONS.SITE_VISITS_VIEW,
        label: 'View Scheduled Visits',
        desc: 'View calendar of buyer property tours and inspection appointments',
      },
      {
        key: PERMISSIONS.SITE_VISITS_MANAGE,
        label: 'Manage & Confirm Visits',
        desc: 'Confirm slots, reschedule, view inspection dossier, and record feedback notes',
      },
    ],
  },
  {
    id: 'agents',
    title: 'Certified Agents Management',
    badge: 'Partners',
    permissions: [
      {
        key: PERMISSIONS.AGENTS_VIEW,
        label: 'View Agent Directory',
        desc: 'Browse certified broker profiles, ratings, and active property counts',
      },
      {
        key: PERMISSIONS.AGENTS_MANAGE,
        label: 'Verify & Manage Agents',
        desc: 'Approve agents, verify MahaRERA registration, assign properties, and manage status',
      },
    ],
  },
  {
    id: 'builders',
    title: 'Builders & Developers',
    badge: 'Partners',
    permissions: [
      {
        key: PERMISSIONS.BUILDERS_VIEW,
        label: 'View Builder Accounts',
        desc: 'Browse developer corporate profiles and township portfolios',
      },
      {
        key: PERMISSIONS.BUILDERS_MANAGE,
        label: 'Verify & Manage Builders',
        desc: 'Approve developer partners, verify RERA track record, and update verification badges',
      },
    ],
  },
  {
    id: 'loans',
    title: 'Home Loan Requests',
    badge: 'Financial',
    permissions: [
      {
        key: PERMISSIONS.LOANS_VIEW,
        label: 'View Loan Enquiries',
        desc: 'See buyer bank loan applications submitted via EMI calculator',
      },
      {
        key: PERMISSIONS.LOANS_MANAGE,
        label: 'Process Loan Requests',
        desc: 'Assign to banking partners, update sanction status, and record notes',
      },
    ],
  },
  {
    id: 'content',
    title: 'Articles & FAQs (CMS)',
    badge: 'Content',
    permissions: [
      {
        key: PERMISSIONS.CONTENT_VIEW,
        label: 'View Content Pages',
        desc: 'Read published CMS articles, real estate guides, and FAQs',
      },
      {
        key: PERMISSIONS.CONTENT_MANAGE,
        label: 'Publish & Edit Content',
        desc: 'Create, update, and remove blogs, area guides, and FAQ articles',
      },
    ],
  },
  {
    id: 'users',
    title: 'Public Users / Citizens',
    badge: 'Users',
    permissions: [
      {
        key: PERMISSIONS.USERS_VIEW,
        label: 'View Registered Citizens',
        desc: 'Browse user directory, phone verification status, and posted listings',
      },
      {
        key: PERMISSIONS.USERS_MANAGE,
        label: 'Manage Citizen Accounts',
        desc: 'Suspend/activate users, update verification, and remove fraudulent accounts',
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Broadcast Alerts',
    badge: 'Outreach',
    permissions: [
      {
        key: PERMISSIONS.NOTIFICATIONS_SEND,
        label: 'Send Platform Broadcasts',
        desc: 'Push web notifications, WhatsApp announcements, and promotional alerts',
      },
    ],
  },
  {
    id: 'administration',
    title: 'Staff, Roles & Security',
    badge: 'Security',
    permissions: [
      {
        key: PERMISSIONS.STAFF_MANAGE,
        label: 'Staff & Roles Management',
        desc: 'Create employees, configure role titles, and assign granular feature access',
      },
      {
        key: PERMISSIONS.AUDIT_LOGS_VIEW,
        label: 'Audit Trail Viewer',
        desc: 'Inspect security audit logs, employee IP addresses, and operational timestamps',
      },
      {
        key: PERMISSIONS.SETTINGS_MANAGE,
        label: 'Platform Settings',
        desc: 'Update system parameters, SLA timings, contact info, and WhatsApp config',
      },
    ],
  },
];

/**
 * Predefined Quick Templates for Employee Onboarding
 */
export const ROLE_PRESETS = {
  MODERATOR: {
    title: 'Listing Moderator',
    role: 'MODERATOR',
    permissions: [
      PERMISSIONS.MODERATION_VIEW,
      PERMISSIONS.MODERATION_REVIEW,
      PERMISSIONS.LISTINGS_VIEW,
      PERMISSIONS.LISTINGS_EDIT,
      PERMISSIONS.LISTINGS_ALLOCATE,
    ],
  },
  CRM_MANAGER: {
    title: 'CRM / Sales Executive',
    role: 'CRM_MANAGER',
    permissions: [
      PERMISSIONS.LEADS_VIEW,
      PERMISSIONS.LEADS_MANAGE,
      PERMISSIONS.LEADS_EXPORT,
      PERMISSIONS.SITE_VISITS_VIEW,
      PERMISSIONS.SITE_VISITS_MANAGE,
      PERMISSIONS.LOANS_VIEW,
      PERMISSIONS.LOANS_MANAGE,
      PERMISSIONS.AGENTS_VIEW,
    ],
  },
  PARTNER_RELATIONS: {
    title: 'Partner Relations Coordinator',
    role: 'CRM_MANAGER',
    permissions: [
      PERMISSIONS.AGENTS_VIEW,
      PERMISSIONS.AGENTS_MANAGE,
      PERMISSIONS.BUILDERS_VIEW,
      PERMISSIONS.BUILDERS_MANAGE,
      PERMISSIONS.LISTINGS_VIEW,
      PERMISSIONS.LISTINGS_ALLOCATE,
      PERMISSIONS.PROJECTS_VIEW,
      PERMISSIONS.SITE_VISITS_VIEW,
    ],
  },
  PROJECTS_SPECIALIST: {
    title: 'Township & Project Specialist',
    role: 'CONTENT_EDITOR',
    permissions: [
      PERMISSIONS.PROJECTS_VIEW,
      PERMISSIONS.PROJECTS_MANAGE,
      PERMISSIONS.BUILDERS_VIEW,
      PERMISSIONS.LOCALITIES_MANAGE,
      PERMISSIONS.LISTINGS_VIEW,
    ],
  },
  CONTENT_EDITOR: {
    title: 'Content & SEO Specialist',
    role: 'CONTENT_EDITOR',
    permissions: [
      PERMISSIONS.CONTENT_VIEW,
      PERMISSIONS.CONTENT_MANAGE,
      PERMISSIONS.LOCALITIES_MANAGE,
      PERMISSIONS.PROJECTS_VIEW,
    ],
  },
  OPERATIONS_EXECUTIVE: {
    title: 'Customer Operations Executive',
    role: 'CRM_MANAGER',
    permissions: [
      PERMISSIONS.LEADS_VIEW,
      PERMISSIONS.SITE_VISITS_VIEW,
      PERMISSIONS.SITE_VISITS_MANAGE,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.LOANS_VIEW,
    ],
  },
  SUPER_ADMIN: {
    title: 'Super Administrator',
    role: 'SUPER_ADMIN',
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
