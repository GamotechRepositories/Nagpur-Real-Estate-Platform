/**
 * Granular Permission Constants for Staff Members
 */

const PERMISSIONS = {
  // Moderation
  MODERATION_VIEW: 'moderation.view',
  MODERATION_REVIEW: 'moderation.review', // approve / reject

  // Listings Management
  LISTINGS_VIEW: 'listings.view',
  LISTINGS_CREATE: 'listings.create',
  LISTINGS_EDIT: 'listings.edit',
  LISTINGS_DELETE: 'listings.delete',

  // Leads & CRM
  LEADS_VIEW: 'leads.view',
  LEADS_MANAGE: 'leads.manage', // status change, assign, add notes
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

  // Notifications
  NOTIFICATIONS_SEND: 'notifications.send',

  // System & Staff Management
  STAFF_MANAGE: 'staff.manage',
  SETTINGS_MANAGE: 'settings.manage',
  AUDIT_LOGS_VIEW: 'audit.view',
};

const PERMISSION_MODULES = [
  {
    id: 'moderation',
    name: 'Moderation Queue',
    permissions: [
      { key: PERMISSIONS.MODERATION_VIEW, label: 'View Moderation Queue', description: 'Can view pending property submissions' },
      { key: PERMISSIONS.MODERATION_REVIEW, label: 'Approve & Reject Listings', description: 'Can approve or reject submitted listings with reasons' },
    ],
  },
  {
    id: 'listings',
    name: 'Listings Management',
    permissions: [
      { key: PERMISSIONS.LISTINGS_VIEW, label: 'View All Listings', description: 'Can view published and draft listings' },
      { key: PERMISSIONS.LISTINGS_CREATE, label: 'Create New Listings', description: 'Can create new properties directly' },
      { key: PERMISSIONS.LISTINGS_EDIT, label: 'Edit Listings & Badges', description: 'Can update property details, featured tags, and verify badges' },
      { key: PERMISSIONS.LISTINGS_DELETE, label: 'Archive / Delete Listings', description: 'Can unpublish or archive listings' },
    ],
  },
  {
    id: 'crm',
    name: 'Leads & CRM Pipeline',
    permissions: [
      { key: PERMISSIONS.LEADS_VIEW, label: 'View Leads Pipeline', description: 'Can view inquiries and lead details' },
      { key: PERMISSIONS.LEADS_MANAGE, label: 'Manage & Assign Leads', description: 'Can update lead status, assign agents, and log activities' },
      { key: PERMISSIONS.LEADS_EXPORT, label: 'Export Leads CSV', description: 'Can download inquiries and lead data as CSV' },
    ],
  },
  {
    id: 'site_visits',
    name: 'Site Visits',
    permissions: [
      { key: PERMISSIONS.SITE_VISITS_VIEW, label: 'View Site Visits', description: 'Can view scheduled and requested site visits' },
      { key: PERMISSIONS.SITE_VISITS_MANAGE, label: 'Manage Site Visits', description: 'Can confirm, reschedule, or cancel site visits' },
    ],
  },
  {
    id: 'loans',
    name: 'Loan Requests',
    permissions: [
      { key: PERMISSIONS.LOANS_VIEW, label: 'View Loan Requests', description: 'Can view buyer loan applications' },
      { key: PERMISSIONS.LOANS_MANAGE, label: 'Manage Loan Requests', description: 'Can update status and partner hand-offs' },
    ],
  },
  {
    id: 'content',
    name: 'CMS & Content Pages',
    permissions: [
      { key: PERMISSIONS.CONTENT_VIEW, label: 'View Content Pages', description: 'Can view articles, guides, and FAQs' },
      { key: PERMISSIONS.CONTENT_MANAGE, label: 'Create & Edit Content', description: 'Can publish and edit blogs, area guides, and FAQs' },
    ],
  },
  {
    id: 'localities_projects',
    name: 'Localities & Builder Projects',
    permissions: [
      { key: PERMISSIONS.LOCALITIES_MANAGE, label: 'Manage Localities', description: 'Can edit locality details, pincodes, and guide content' },
      { key: PERMISSIONS.PROJECTS_MANAGE, label: 'Manage Builder Projects', description: 'Can create and edit builder projects and units' },
    ],
  },
  {
    id: 'notifications',
    name: 'Notifications Broadcast',
    permissions: [
      { key: PERMISSIONS.NOTIFICATIONS_SEND, label: 'Send Broadcasts', description: 'Can broadcast push or WhatsApp alerts to platform users' },
    ],
  },
  {
    id: 'system',
    name: 'Administration & System',
    permissions: [
      { key: PERMISSIONS.STAFF_MANAGE, label: 'Manage Staff & Roles', description: 'Can add employees and configure permissions' },
      { key: PERMISSIONS.AUDIT_LOGS_VIEW, label: 'View Audit Logs', description: 'Can inspect staff audit trail and security history' },
      { key: PERMISSIONS.SETTINGS_MANAGE, label: 'Manage Platform Settings', description: 'Can modify platform configuration and expiry rules' },
    ],
  },
];

module.exports = {
  PERMISSIONS,
  PERMISSION_MODULES,
};

