import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  Settings,
  FileText,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Kanban,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Moderation Queue', href: '/admin/moderation', icon: ShieldCheck },
    { name: 'All Listings', href: '/admin/listings', icon: Building2 },
    { name: 'CRM & Leads', href: '/admin/leads', icon: Kanban },
    { name: 'Site Visits', href: '/admin/site-visits', icon: Calendar },
    { name: 'Agents & Staff', href: '/admin/agents', icon: Users },
    { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ivory-light flex flex-col lg:flex-row text-charcoal">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-navy-dark text-white p-4 flex items-center justify-between border-b border-navy-light/40">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 border border-gold/40 flex items-center justify-center bg-navy">
            <span className="font-serif text-sm font-bold text-gold">NE</span>
          </div>
          <span className="font-serif text-lg font-bold text-white">Nagpur Estates Admin</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-ivory/80 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Primary Navy Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-dark text-ivory/80 flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:h-screen border-r border-white/10 shadow-card`}
      >
        <div>
          {/* Logo & Portal Identity */}
          <div className="p-6 border-b border-white/10">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 border border-gold/40 flex items-center justify-center bg-navy transition-colors group-hover:border-gold">
                <span className="font-serif text-base font-bold text-gold">NE</span>
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-white tracking-tight">
                  NAGPUR<span className="text-gold font-light ml-1 text-sm uppercase tracking-luxury">Estates</span>
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-ivory/50 font-sans mt-0.5">
                  Management Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 text-xs font-medium tracking-luxury transition-colors ${
                    isActive
                      ? 'bg-navy text-gold border-l-2 border-gold shadow-subtle'
                      : 'text-ivory/70 hover:text-white hover:bg-navy/60'
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-gold' : 'text-ivory/50'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Identity & Logout */}
        <div className="p-5 border-t border-white/10 bg-navy-deep/60 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 border border-gold/30 bg-navy flex items-center justify-center font-serif text-sm font-bold text-gold shrink-0">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate font-sans">{user?.name || 'Administrator'}</p>
              <span className="text-[10px] text-gold uppercase tracking-widest font-mono">
                {user?.role || 'SUPER_ADMIN'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <Link
              to="/"
              className="text-ivory/60 hover:text-white flex items-center space-x-1.5 transition-colors text-[11px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 flex items-center space-x-1.5 transition-colors text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Minimal Admin Header */}
        <header className="bg-white border-b border-beige px-6 sm:px-8 py-4 flex items-center justify-between shadow-subtle shrink-0">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-luxury text-gold">
              Nagpur Real Estate Operations
            </span>
            <h2 className="font-serif text-lg text-navy font-normal">Staff Administration & CRM</h2>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center space-x-1.5 text-xs text-charcoal-muted border border-beige px-3 py-1 bg-ivory">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>System Online</span>
            </span>
          </div>
        </header>

        {/* Routed Sub-pages */}
        <main className="p-6 sm:p-8 flex-1 bg-ivory-light">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
