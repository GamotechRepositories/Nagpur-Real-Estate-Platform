import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const AgentNavbar = ({ onOpenMobile }) => {
  const { user, profile } = useAuthStore();

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex-shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-bold text-slate-900 truncate">
              {user?.role === 'BUILDER' ? 'Developer' : 'Agent Workspace'}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block flex-shrink-0" />
            <span className="text-xs text-slate-500 font-medium hidden sm:inline-block truncate max-w-[140px] md:max-w-[200px]">
              {user?.role === 'BUILDER'
                ? (profile?.name || user?.name || 'Developer Partner')
                : (profile?.agencyName || 'Partner Agency')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Post Property Quick CTA */}
        <Link
          to="/listings/new"
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition"
        >
          <Plus size={14} className="flex-shrink-0" />
          <span className="hidden sm:inline">Post Listing</span>
        </Link>

        {/* Agent Avatar Link */}
        <Link
          to="/profile"
          className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 hover:opacity-80 transition"
          title="My Profile"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  );
};
