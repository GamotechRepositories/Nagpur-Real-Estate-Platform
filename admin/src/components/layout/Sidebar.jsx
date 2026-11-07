import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  MapPin,
  Compass,
  Kanban,
  Calendar,
  Users2,
  UserCheck,
  Sliders,
  Shield,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { formatRole } from '../../utils/formatters';
import apiClient from '../../api/client';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const {
    user,
    logout,
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      group: 'Overview',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          badge: null,
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
        },
        {
          name: 'All Listings',
          href: '/listings',
          icon: Building2,
          badge: null,
        },
        {
          name: 'Localities',
          href: '/localities',
          icon: MapPin,
          badge: null,
        },
        {
          name: 'Projects',
          href: '/projects',
          icon: Compass,
          badge: null,
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
        },
        {
          name: 'Site Visits',
          href: '/site-visits',
          icon: Calendar,
          badge: pendingVisitsCount > 0 ? pendingVisitsCount : null,
          badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
        },
        {
          name: 'Agents',
          href: '/agents',
          icon: Users2,
          badge: null,
        },
      ],
    },
    {
      group: 'Administration',
      items: [
        {
          name: 'Users',
          href: '/users',
          icon: UserCheck,
          badge: null,
        },
        {
          name: 'Settings',
          href: '/settings',
          icon: Sliders,
          badge: null,
        },
        {
          name: 'Audit Logs',
          href: '/audit-logs',
          icon: Shield,
          badge: null,
        },
      ],
    },
  ];

  const publicUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173';

  // Secondary line under user name: show email or role (avoiding duplicate text if role matches name)
  const userSubtitle =
    user?.email ||
    (user?.role && formatRole(user.role) !== user?.name ? formatRole(user.role) : 'Administrator');

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

        {/* User Account Section (Placed at top - NEVER sinks to the bottom on tall screens) */}
        <div className="p-2.5 border-b border-slate-800/80 bg-slate-950/30 flex-shrink-0">
          {!sidebarCollapsed ? (
            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600/20 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{userSubtitle}</p>
                </div>
              </div>

              {/* Inline Quick Action Links */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-700/40 text-[11px]">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-slate-400 hover:text-teal-300 transition-colors"
                  title="Open Public Website in new tab"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Public Site</span>
                </a>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center space-x-1 text-slate-400 hover:text-red-400 transition-colors"
                  title="Sign out of Admin Console"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 py-1">
              <div
                className="w-8 h-8 rounded-lg bg-teal-600/20 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center justify-center cursor-default"
                title={`${user?.name || 'Administrator'} (${userSubtitle})`}
              >
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-teal-300 rounded hover:bg-slate-800 transition-colors"
                title="Public Site"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Links (Scrollable area) */}
        <div className="flex-1 p-2 space-y-3.5 overflow-y-auto">
          {navGroups.map((group, groupIdx) => (
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