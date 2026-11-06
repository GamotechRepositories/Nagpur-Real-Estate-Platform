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
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-800">
      {/* Mobile Top Navbar */}
      <div className="lg:hidden bg-brand-navy text-white p-4 flex items-center justify-between shadow-md">
        <Link to="/" className="flex items-center space-x-2">
          <Building2 className="w-6 h-6 text-brand-orange" />
          <span className="font-black text-lg">NagpurEstate Admin</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-navy text-slate-300 flex flex-col justify-between transition-transform transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:h-screen shadow-xl`}
      >
        <div>
          {/* Logo & Portal Badge */}
          <div className="p-6 border-b border-slate-800">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-teal to-slate-800 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-brand-orange" />
              </div>
              <div>
                <span className="text-xl font-black text-white">
                  Nagpur<span className="text-brand-orange">Admin</span>
                </span>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Management Console
                </span>
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-orange text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-brand-teal text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Staff'}</p>
              <span className="text-[10px] uppercase font-bold text-orange-400 block">
                {user?.role || 'Staff'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col space-y-1">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-800/40"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-xs text-red-400 hover:text-red-300 px-2 py-1.5 rounded-lg hover:bg-slate-800/40 w-full text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 py-3.5 px-6 hidden lg:flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500">
            Nagpur Real Estate Platform &middot; Staff Portal
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● API Online
            </span>
            <Link to="/" className="text-xs font-bold text-brand-teal hover:underline flex items-center space-x-1">
              <span>View Public Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 sm:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
