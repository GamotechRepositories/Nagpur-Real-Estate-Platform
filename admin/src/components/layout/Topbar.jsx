import React from 'react';
import { Menu, ExternalLink, ShieldAlert, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const Topbar = ({ onOpenMobileSidebar }) => {
  const { user, pendingReviewCount } = useAuthStore();
  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-14 px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Hamburger & Platform title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-700">
            Nagpur Real Estate
          </span>
          <span className="hidden sm:inline-block text-slate-300">•</span>
          <span className="hidden sm:inline-block text-xs text-slate-500">
            Admin Console
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2.5">
        {/* Pending Moderation Quick Alert */}
        {pendingReviewCount > 0 && (
          <Link
            to="/moderation"
            className="flex items-center space-x-1.5 py-1 px-2.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>{pendingReviewCount} Pending</span>
          </Link>
        )}

        {/* Quick Add Property Button */}
        <Link
          to="/listings/new"
          className="inline-flex items-center space-x-1 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Property</span>
        </Link>

        {/* Public Website Link */}
        <a
          href={publicSiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 py-1.5 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
        >
          <span className="hidden sm:inline">Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        {/* Status indicator */}
        <div className="hidden md:flex items-center space-x-1.5 py-1 px-2 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Online</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
