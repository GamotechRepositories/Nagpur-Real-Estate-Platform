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
  FileText,
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
    queryKey: ['sidebar-stats'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/admin/dashboard');
        return res.data?.data;
      } catch (e) {
        return null;
      }
    },
    refetchInterval: 30000,
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
          badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-200 h-screen ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'w-16' : 'w-60'}`}
      >
        <div>
          {/* Top Brand Header */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-slate-800">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2.5 overflow-hidden"
              onClick={closeMobile}
            >
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <span className="text-sm font-bold text-white tracking-tight">Nagpur Estate</span>
                  <span className="text-[10px] text-slate-400 block -mt-1 font-medium">Admin Panel</span>
                </div>
              )}
            </Link>

            <button
              onClick={closeMobile}
              className="p-1 text-slate-400 hover:text-white rounded lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-2 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
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
                      `relative flex items-center px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      } ${sidebarCollapsed ? 'justify-center' : 'space-x-2.5'}`
                    }
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />

                    {!sidebarCollapsed && <span className="flex-1 truncate">{item.name}</span>}

                    {!sidebarCollapsed && item.badge !== null && (
                      <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${item.badgeColor}`}>
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
        </div>

        {/* Footer: User Details, Collapse Toggle & Sign Out */}
        <div className="p-2 border-t border-slate-800 bg-slate-950/40">
          <div className={`flex items-center p-2 rounded-lg ${sidebarCollapsed ? 'justify-center' : 'space-x-2.5'}`}>
            <div className="w-7 h-7 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Staff'}</p>
                <span className="text-[10px] text-slate-400 block truncate">{formatRole(user?.role)}</span>
              </div>
            )}
          </div>

          <div className={`flex items-center pt-1 ${sidebarCollapsed ? 'flex-col space-y-1' : 'justify-between'}`}>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 text-xs flex items-center space-x-1"
              title="Open Public Website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {!sidebarCollapsed && <span className="text-[11px]">Public Site</span>}
            </a>

            <button
              onClick={toggleSidebarCollapsed}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-950/30 text-xs flex items-center space-x-1"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
