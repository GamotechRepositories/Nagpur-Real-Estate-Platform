import React from 'react';
import { Menu, ExternalLink, Bell, ShieldAlert, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const Topbar = ({ onOpenMobileSidebar }) => {
  const { user, pendingReviewCount } = useAuthStore();
  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Mobile Hamburger & Platform title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-slate-400">
            Nagpur Real Estate Platform
          </span>
          <span className="hidden sm:inline-block text-slate-300">•</span>
          <span className="text-xs font-bold text-slate-700">
            Central Administrative System
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3">
        {/* Pending Moderation Quick Notification */}
        {pendingReviewCount > 0 && (
          <Link
            to="/moderation"
            className="flex items-center space-x-1.5 py-1.5 px-3 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors animate-pulse"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>{pendingReviewCount} Awaiting Review</span>
          </Link>
        )}

        {/* Quick Add Property Button */}
        <Link
          to="/listings/new"
          className="hidden md:inline-flex items-center space-x-1.5 py-1.5 px-3.5 rounded-xl bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Listing</span>
        </Link>

        {/* Public Website Link */}
        <a
          href={publicSiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
        >
          <span className="hidden sm:inline">View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        {/* Health status badge */}
        <div className="hidden lg:flex items-center space-x-1.5 py-1 px-2.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>API Connected</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
