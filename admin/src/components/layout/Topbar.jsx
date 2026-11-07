import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  User as UserIcon,
  Sliders,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { formatRole } from '../../utils/formatters';

export const Topbar = ({ onOpenMobileSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const publicUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173';

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const userInitial = user?.name?.[0]?.toUpperCase() || 'A';
  const roleDisplay = formatRole(user?.role) || 'Super Admin';

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
          <span className="text-xs font-semibold text-slate-800">
            Nagpur Real Estate
          </span>
          <span className="hidden sm:inline-block text-slate-300">•</span>
          <span className="hidden sm:inline-block text-xs text-slate-500 font-medium">
            Admin Console
          </span>
        </div>
      </div>

      {/* Right side: Interactive Profile Button & Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={`flex items-center space-x-2 py-1.5 px-2 rounded-lg border transition-all ${
            dropdownOpen
              ? 'bg-slate-100 border-slate-300 shadow-2xs'
              : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
          }`}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <div className="w-7 h-7 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
            {userInitial}
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[130px] truncate">
            {user?.name || 'Super Admin'}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180 text-slate-700' : ''
            }`}
          />
        </button>

        {/* Profile Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Header / User Info Card */}
            <div className="px-3.5 py-3 border-b border-slate-100">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-2xs">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.name || 'Super Admin'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {user?.email || 'admin@nagpurestate.com'}
                  </p>
                  <div className="mt-1.5 inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-teal-50 border border-teal-200 text-[10px] font-semibold text-teal-800">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    <span>{roleDisplay}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="py-1">
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center space-x-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center space-x-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Platform Settings</span>
              </Link>

              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>Public Website</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">New tab</span>
              </a>
            </div>

            {/* Sign Out Option */}
            <div className="pt-1 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;