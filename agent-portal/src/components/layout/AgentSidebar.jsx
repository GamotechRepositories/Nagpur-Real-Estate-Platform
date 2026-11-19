import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Users2,
  UserCheck,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Layers,
  Compass,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import clsx from 'clsx';

export const AgentSidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, profile, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isBuilder = user?.role === 'BUILDER';

  const navItems = isBuilder
    ? [
        { label: 'Dashboard', to: '/', icon: LayoutDashboard },
        { label: 'My Projects', to: '/projects', icon: Compass },
        { label: 'Project Inventory', to: '/listings', icon: Building2 },
        { label: 'Buyer Leads', to: '/leads', icon: Users2 },
        { label: 'Company Profile', to: '/profile', icon: UserCheck },
      ]
    : [
        { label: 'Dashboard', to: '/', icon: LayoutDashboard },
        { label: 'My Listings', to: '/listings', icon: Building2 },
        { label: 'Buyer Leads', to: '/leads', icon: Users2 },
        { label: 'Agency Profile', to: '/profile', icon: UserCheck },
      ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-700 w-64 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs flex-shrink-0">
            {isBuilder ? <Compass size={20} /> : <Building2 size={20} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-sm truncate">
                Nagpur Real Estate
              </span>
            </div>
            <p className="text-[11px] text-teal-700 font-semibold uppercase tracking-wider">
              {isBuilder ? 'Developer Partner Portal' : 'Agent Partner Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {isBuilder ? 'Developer Workspace' : 'Agent Workspace'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition',
                  isActive
                    ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                  item.highlight && !isActive && 'text-teal-700 font-bold'
                )
              }
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[9px] bg-teal-100 text-teal-800 border border-teal-200 font-bold px-1.5 py-0.5 rounded">
                  NEW
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Section: Profile Identity Card & Actions */}
      <div className="p-3 border-t border-slate-200 space-y-2 bg-slate-50/60">
        {/* Identity Card */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0">
              {user?.avatar || profile?.logo ? (
                <img src={user.avatar || profile.logo} alt={profile?.name || user?.name} className="w-full h-full object-cover" />
              ) : (
                (profile?.name || user?.name || 'P').charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {profile?.name || user?.name || (isBuilder ? 'Township Developer' : 'Authorized Broker')}
              </h4>
              <p className="text-[10px] text-slate-500 truncate">
                {isBuilder
                  ? (profile?.contactPerson ? `${profile.contactPerson} • Builder` : 'Nagpur Developer')
                  : (profile?.agencyName || 'Nagpur Real Estate Partner')}
              </p>
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[10px]">
              <ShieldCheck size={11} className="text-emerald-600" />
              {profile?.verificationStatus === 'VERIFIED' ? 'MahaRERA Verified' : 'Registered Partner'}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              {profile?.reraNumber ? String(profile.reraNumber).slice(-8) : 'ACTIVE'}
            </span>
          </div>
        </div>

        <div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition"
          >
            <LogOut size={14} className="text-slate-400" />
            Sign Out of Portal
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0 sticky top-0 h-screen z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full shadow-2xl">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
