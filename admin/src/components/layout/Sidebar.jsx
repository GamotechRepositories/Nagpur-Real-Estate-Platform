import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  ShieldAlert,
  Building2,
  PlusCircle,
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
  Sparkles,
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

  // Query live dashboard stats to show pending moderation counter badge in sidebar
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
    refetchInterval: 30000, // Poll every 30 seconds for live updates
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
          icon: ShieldAlert,
          badge: pendingCount > 0 ? pendingCount : null,
          badgeColor: 'bg-amber-500 text-white animate-pulse',
        },
        {
          name: 'All Listings',
          href: '/listings',
          icon: Building2,
          badge: null,
        },
        {
          name: 'Add Property',
          href: '/listings/new',
          icon: PlusCircle,
          badge: null,
        },
        {
          name: 'Localities Guide',
          href: '/localities',
          icon: MapPin,
          badge: null,
        },
        {
          name: 'New Projects',
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
          name: 'Leads & Enquiries',
          href: '/leads',
          icon: Kanban,
          badge: null,
        },
        {
          name: 'Site Visits',
          href: '/site-visits',
          icon: Calendar,
          badge: pendingVisitsCount > 0 ? pendingVisitsCount : null,
          badgeColor: 'bg-blue-500 text-white',
        },
        {
          name: 'Agents Directory',
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
          name: 'User Management',
          href: '/users',
          icon: UserCheck,
          badge: null,
        },
        {
          name: 'CMS & Guides',
          href: '/content',
          icon: FileText,
          badge: null,
        },
        {
          name: 'Platform Settings',
          href: '/settings',
          icon: Sliders,
          badge: null,
        },
        {
          name: 'Audit Trail',
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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between bg-brand-navy text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800 shadow-2xl h-screen ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Top Brand Header */}
        <div>
          <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
            <Link
              to="/dashboard"
              className="flex items-center space-x-3 overflow-hidden group"
              onClick={closeMobile}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-teal to-brand-orange flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-teal/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <span className="text-base font-black text-white tracking-tight flex items-center">
                    Nagpur<span className="text-brand-orange ml-1">Admin</span>
                    <Sparkles className="w-3 h-3 text-amber-400 ml-1.5" />
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block -mt-0.5">
                    Operations Portal
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={closeMobile}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div
            className={`p-3 space-y-5 overflow-y-auto ${
              sidebarCollapsed ? 'max-h-[calc(100vh-170px)]' : 'max-h-[calc(100vh-180px)]'
            }`}
          >
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                {!sidebarCollapsed && (
                  <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {group.group}
                  </h4>
                )}
                {sidebarCollapsed && <div className="h-2" />}

                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `relative flex items-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-orange to-orange-600 text-white shadow-md shadow-orange-950/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                      } ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />

                    {!sidebarCollapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}

                    {!sidebarCollapsed && item.badge !== null && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                          item.badgeColor || 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Small badge dot in collapsed mode */}
                    {sidebarCollapsed && item.badge !== null && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-brand-orange ring-2 ring-brand-navy" />
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer: User Details, Collapse Toggle & Sign Out */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 space-y-2">
          {/* User profile capsule */}
          <div
            className={`flex items-center rounded-xl p-2 bg-slate-900/80 border border-slate-800/80 ${
              sidebarCollapsed ? 'justify-center' : 'space-x-3'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-teal to-teal-700 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Staff User'}</p>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block truncate">
                  {formatRole(user?.role)}
                </span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className={`flex items-center ${sidebarCollapsed ? 'flex-col space-y-1' : 'justify-between'}`}>
            {/* External link to public portal */}
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Open Public Marketplace Website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Desktop Collapse / Expand toggle button */}
            <button
              onClick={toggleSidebarCollapsed}
              className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
