import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  MapPin,
  Compass,
  Kanban,
  Calendar,
  Banknote,
  Users2,
  FileText,
  UserCheck,
  Bell,
  Sliders,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  UserCog,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import apiClient from '../../api/client';
import { hasAnyPermission, PERMISSIONS } from '../../config/permissions';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const {
    user,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    sidebarMobileOpen: storeMobileOpen,
    setSidebarMobileOpen: setStoreMobileOpen,
  } = useAuthStore();

  const isMobileOpen = mobileOpen !== undefined ? mobileOpen : storeMobileOpen;
  const closeMobile = () => {
    if (setMobileOpen) setMobileOpen(false);
    if (setStoreMobileOpen) setStoreMobileOpen(false);
  };

  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/admin/dashboard');
        return res.data?.data;
      } catch (e) {
        return null;
      }
    },
  });

  const pendingCount = stats?.properties?.PENDING_REVIEW || 0;
  const pendingVisitsCount = stats?.crm?.pendingSiteVisits || 0;
  const pendingLoansCount = stats?.crm?.pendingLoanRequests || 0;

  const navGroups = [
    {
      group: 'Overview',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          badge: null,
          permissions: [],
        },
      ],
    },
    {
      group: 'Marketplace',
      items: [
        {
          name: 'Moderation Queue',
          href: '/moderation',
          icon: ShieldCheck,
          badge: pendingCount > 0 ? pendingCount : null,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
          permissions: [PERMISSIONS.MODERATION_VIEW, PERMISSIONS.MODERATION_REVIEW],
        },
        {
          name: 'All Listings',
          href: '/listings',
          icon: Building2,
          badge: null,
          permissions: [PERMISSIONS.LISTINGS_VIEW, PERMISSIONS.LISTINGS_CREATE, PERMISSIONS.LISTINGS_EDIT],
        },
        {
          name: 'Localities',
          href: '/localities',
          icon: MapPin,
          badge: null,
          permissions: [PERMISSIONS.LOCALITIES_MANAGE],
        },
        {
          name: 'Projects',
          href: '/projects',
          icon: Compass,
          badge: null,
          permissions: [PERMISSIONS.PROJECTS_MANAGE],
        },
      ],
    },
    {
      group: 'CRM & Operations',
      items: [
        {
          name: 'Leads Pipeline',
          href: '/leads',
          icon: Kanban,
          badge: null,
          permissions: [PERMISSIONS.LEADS_VIEW, PERMISSIONS.LEADS_MANAGE],
        },
        {
          name: 'Site Visits',
          href: '/site-visits',
          icon: Calendar,
          badge: pendingVisitsCount > 0 ? pendingVisitsCount : null,
          badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
          permissions: [PERMISSIONS.SITE_VISITS_VIEW, PERMISSIONS.SITE_VISITS_MANAGE],
        },
        {
          name: 'Loan Requests',
          href: '/loan-requests',
          icon: Banknote,
          badge: pendingLoansCount > 0 ? pendingLoansCount : null,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
          permissions: [PERMISSIONS.LOANS_VIEW, PERMISSIONS.LOANS_MANAGE],
        },
        {
          name: 'Agents',
          href: '/agents',
          icon: Users2,
          badge: null,
          permissions: [PERMISSIONS.LEADS_VIEW, PERMISSIONS.LEADS_MANAGE],
        },
      ],
    },
    {
      group: 'Content & CMS',
      items: [
        {
          name: 'Articles & FAQs',
          href: '/content',
          icon: FileText,
          badge: null,
          permissions: [PERMISSIONS.CONTENT_VIEW, PERMISSIONS.CONTENT_MANAGE],
        },
      ],
    },
    {
      group: 'Administration',
      items: [
        {
          name: 'Staff & Roles',
          href: '/staff',
          icon: UserCog,
          badge: null,
          permissions: [PERMISSIONS.STAFF_MANAGE],
        },
        {
          name: 'Public Users',
          href: '/users',
          icon: UserCheck,
          badge: null,
          permissions: [PERMISSIONS.STAFF_MANAGE],
        },
        {
          name: 'Broadcasts',
          href: '/notifications',
          icon: Bell,
          badge: null,
          permissions: [PERMISSIONS.NOTIFICATIONS_SEND],
        },
        {
          name: 'Settings',
          href: '/settings',
          icon: Sliders,
          badge: null,
          permissions: [PERMISSIONS.SETTINGS_MANAGE],
        },
        {
          name: 'Audit Logs',
          href: '/audit-logs',
          icon: Shield,
          badge: null,
          permissions: [PERMISSIONS.AUDIT_LOGS_VIEW],
        },
      ],
    },
  ];

  const visibleNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permissions || item.permissions.length === 0) return true;
        return hasAnyPermission(user, item.permissions);
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-200 h-screen ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Top Brand Header */}
        <div className="flex items-center justify-between h-14 px-3.5 border-b border-slate-800 flex-shrink-0">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2.5 overflow-hidden"
            onClick={closeMobile}
          >
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <span className="text-sm font-bold text-white tracking-tight">Nagpur Estate</span>
                <span className="text-[10px] text-teal-400 block -mt-1 font-semibold uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            )}
          </Link>

          {/* Controls: Mobile Close & Desktop Collapse */}
          <div className="flex items-center">
            <button
              onClick={closeMobile}
              className="p-1 text-slate-400 hover:text-white rounded lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={toggleSidebarCollapsed}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 p-2 space-y-3.5 overflow-y-auto">
          {visibleNavGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-0.5">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {group.group}
                </div>
              )}
              {sidebarCollapsed && <div className="h-1" />}

              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `group relative flex items-center px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-teal-500/10 text-teal-300 font-semibold border-l-2 border-teal-500 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    } ${sidebarCollapsed ? 'justify-center' : 'space-x-2.5'}`
                  }
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />

                  {!sidebarCollapsed && <span className="flex-1 truncate">{item.name}</span>}

                  {!sidebarCollapsed && item.badge !== null && (
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {sidebarCollapsed && item.badge !== null && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;