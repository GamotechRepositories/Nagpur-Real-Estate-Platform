/**
 * Granular Permission Constants for Staff Members
 */

const PERMISSIONS = {
  // Overview Dashboard
  DASHBOARD_VIEW: 'dashboard.view',

  // Moderation
  MODERATION_VIEW: 'moderation.view',
  MODERATION_REVIEW: 'moderation.review', // approve / reject with feedback

  // Listings Management
  LISTINGS_VIEW: 'listings.view',
  LISTINGS_CREATE: 'listings.create',
  LISTINGS_EDIT: 'listings.edit',
  LISTINGS_ALLOCATE: 'listings.allocate', // assign citizen listings to agents/builders
  LISTINGS_DELETE: 'listings.delete',

  // Projects / Townships & High-Rises
  PROJECTS_VIEW: 'projects.view',
  PROJECTS_MANAGE: 'projects.manage',
  PROJECTS_DELETE: 'projects.delete',

  // Localities & Market Data
  LOCALITIES_MANAGE: 'localities.manage',

  // Leads & CRM Pipeline
  LEADS_VIEW: 'leads.view',
  LEADS_MANAGE: 'leads.manage', // status change, assign, add call notes & logs
  LEADS_EXPORT: 'leads.export',

  // Site Visits
  SITE_VISITS_VIEW: 'visits.view',
  SITE_VISITS_MANAGE: 'visits.manage', // confirm, reschedule, inspection dossier, feedback notes

  // Certified Agents Management
  AGENTS_VIEW: 'agents.view',
  AGENTS_MANAGE: 'agents.manage', // verify RERA, assign properties, commission status

  // Builders & Township Developers
  BUILDERS_VIEW: 'builders.view',
  BUILDERS_MANAGE: 'builders.manage', // verify developer credentials, manage partners

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

const PERMISSION_MODULES = [
  {
    id: 'overview',
    title: 'Dashboard & Platform Analytics',
    badge: 'Executive',
    permissions: [
      { key: PERMISSIONS.DASHBOARD_VIEW, label: 'View Dashboard & Analytics', desc: 'Can view platform statistics, overview charts, and daily conversion metrics' },
    ],
  },
  {
    id: 'moderation',
    title: 'Listing Moderation Queue',
    badge: 'Core',
    permissions: [
      { key: PERMISSIONS.MODERATION_VIEW, label: 'View Moderation Queue', desc: 'Can view submissions waiting for approval' },
      { key: PERMISSIONS.MODERATION_REVIEW, label: 'Approve & Reject Listings', desc: 'Can approve or reject submitted listings with reasons' },
    ],
  },
  {
    id: 'listings',
    title: 'Property Listings',
    badge: 'Inventory',
    permissions: [
      { key: PERMISSIONS.LISTINGS_VIEW, label: 'View All Listings', desc: 'Can view published, under-review, and confidential property records' },
      { key: PERMISSIONS.LISTINGS_CREATE, label: 'Create New Listings', desc: 'Can create and post new properties directly' },
      { key: PERMISSIONS.LISTINGS_EDIT, label: 'Edit Listings & Badges', desc: 'Can update property details, custom specs, featured tags, and mark as sold' },
      { key: PERMISSIONS.LISTINGS_ALLOCATE, label: 'Allocate to Agents & Builders', desc: 'Assign citizen/homeowner properties to certified partners for client handling' },
      { key: PERMISSIONS.LISTINGS_DELETE, label: 'Archive / Delete Listings', desc: 'Can unpublish or archive outdated properties' },
    ],
  },
  {
    id: 'projects',
    title: 'Township & Builder Projects',
    badge: 'Developments',
    permissions: [
      { key: PERMISSIONS.PROJECTS_VIEW, label: 'View Township Projects', desc: 'Browse registered high-rises, gated villa townships, and plotted schemes' },
      { key: PERMISSIONS.PROJECTS_MANAGE, label: 'Create & Manage Projects', desc: 'Register developments, configure custom specs, RERA verification, and unit inventory' },
      { key: PERMISSIONS.PROJECTS_DELETE, label: 'Archive / Delete Projects', desc: 'Unpublish or remove builder developments' },
    ],
  },
  {
    id: 'localities',
    title: 'Localities & Market Data',
    badge: 'Geographic',
    permissions: [
      { key: PERMISSIONS.LOCALITIES_MANAGE, label: 'Manage Localities & Circle Rates', desc: 'Can edit Nagpur locality details, pincodes, circle rates, and area guides' },
    ],
  },
  {
    id: 'crm',
    title: 'CRM & Leads Pipeline',
    badge: 'Sales',
    permissions: [
      { key: PERMISSIONS.LEADS_VIEW, label: 'View Leads Pipeline', desc: 'Access buyer inquiries, Kanban pipeline stages, and buyer dossiers' },
      { key: PERMISSIONS.LEADS_MANAGE, label: 'Manage & Assign Leads', desc: 'Can update lead status, assign agents, and log activities' },
      { key: PERMISSIONS.LEADS_EXPORT, label: 'Export Leads CSV', desc: 'Can download inquiries and lead data as CSV' },
    ],
  },
  {
    id: 'site_visits',
    title: 'Site Visits Management',
    badge: 'Operations',
    permissions: [
      { key: PERMISSIONS.SITE_VISITS_VIEW, label: 'View Scheduled Visits', desc: 'Can view scheduled and requested buyer inspection tours' },
      { key: PERMISSIONS.SITE_VISITS_MANAGE, label: 'Manage Site Visits', desc: 'Can confirm, reschedule, view inspection dossier, and record feedback notes' },
    ],
  },
  {
    id: 'agents',
    title: 'Certified Agents Management',
    badge: 'Partners',
    permissions: [
      { key: PERMISSIONS.AGENTS_VIEW, label: 'View Agent Directory', desc: 'Browse certified broker profiles, ratings, and active property counts' },
      { key: PERMISSIONS.AGENTS_MANAGE, label: 'Verify & Manage Agents', desc: 'Approve agents, verify MahaRERA registration, assign properties, and manage status' },
    ],
  },
  {
    id: 'builders',
    title: 'Builders & Developers',
    badge: 'Partners',
    permissions: [
      { key: PERMISSIONS.BUILDERS_VIEW, label: 'View Builder Accounts', desc: 'Browse developer corporate profiles and township portfolios' },
      { key: PERMISSIONS.BUILDERS_MANAGE, label: 'Verify & Manage Builders', desc: 'Approve developer partners, verify RERA track record, and update verification badges' },
    ],
  },
  {
    id: 'loans',
    title: 'Home Loan Requests',
    badge: 'Financial',
    permissions: [
      { key: PERMISSIONS.LOANS_VIEW, label: 'View Loan Requests', desc: 'Can view buyer loan applications from EMI calculator' },
      { key: PERMISSIONS.LOANS_MANAGE, label: 'Process Loan Requests', desc: 'Can assign to banking partners and update loan status' },
    ],
  },
  {
    id: 'content',
    title: 'Articles & FAQs (CMS)',
    badge: 'Content',
    permissions: [
      { key: PERMISSIONS.CONTENT_VIEW, label: 'View Content Pages', desc: 'Can view articles, guides, and FAQs' },
      { key: PERMISSIONS.CONTENT_MANAGE, label: 'Create & Edit Content', desc: 'Can publish and edit blogs, area guides, and FAQs' },
    ],
  },
  {
    id: 'users',
    title: 'Public Users / Citizens',
    badge: 'Users',
    permissions: [
      { key: PERMISSIONS.USERS_VIEW, label: 'View Registered Citizens', desc: 'Can view public user directory, phone verification status, and posted listings' },
      { key: PERMISSIONS.USERS_MANAGE, label: 'Manage Citizen Accounts', desc: 'Can suspend/activate users, update verification, and remove fraudulent accounts' },
    ],
  },
  {
    id: 'notifications',
    title: 'Broadcast Alerts',
    badge: 'Outreach',
    permissions: [
      { key: PERMISSIONS.NOTIFICATIONS_SEND, label: 'Send Broadcasts', desc: 'Can broadcast push or WhatsApp alerts to platform users' },
    ],
  },
  {
    id: 'administration',
    title: 'Staff, Roles & Security',
    badge: 'Security',
    permissions: [
      { key: PERMISSIONS.STAFF_MANAGE, label: 'Staff & Roles Management', desc: 'Create employees, configure role titles, and assign granular feature access' },
      { key: PERMISSIONS.AUDIT_LOGS_VIEW, label: 'Audit Trail Viewer', desc: 'Inspect security audit logs, employee IP addresses, and operational timestamps' },
      { key: PERMISSIONS.SETTINGS_MANAGE, label: 'Platform Settings', desc: 'Update system parameters, SLA timings, contact info, and WhatsApp config' },
    ],
  },
];

module.exports = {
  PERMISSIONS,
  PERMISSION_MODULES,
};
