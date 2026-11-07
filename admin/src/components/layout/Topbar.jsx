import React from 'react';
import { Menu } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Topbar = ({ onOpenMobileSidebar }) => {
  const { user } = useAuthStore();

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

      {/* Right side: Clean staff user info */}
      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-semibold text-xs flex items-center justify-center">
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <span className="hidden sm:inline text-xs font-medium text-slate-700">{user?.name || 'Admin'}</span>
      </div>
    </header>
  );
};

export default Topbar;
