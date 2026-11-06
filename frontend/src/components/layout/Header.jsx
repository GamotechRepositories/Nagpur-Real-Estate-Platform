import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Menu,
  X,
  ChevronDown,
  Heart,
  User,
  LayoutDashboard,
  LogOut,
  Building,
  Plus,
  ShieldCheck,
  Calendar,
  Landmark,
  Calculator,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import AuthModal from '../common/AuthModal';
import BrandLogo from '../common/BrandLogo';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLangDropdownOpen(false);
  };

  const getLanguageCode = () => {
    if (i18n.language.startsWith('hi')) return 'HI';
    if (i18n.language.startsWith('mr')) return 'MR';
    return 'EN';
  };

  const handlePostPropertyClick = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    } else {
      navigate('/post-property');
    }
  };

  const navLinks = [
    { label: 'Buy', path: '/properties?purpose=BUY' },
    { label: 'Rent', path: '/properties?purpose=RENT' },
    { label: 'Plots', path: '/properties?category=PLOT' },
    { label: 'Commercial', path: '/properties?category=COMMERCIAL' },
    { label: 'Projects', path: '/projects' },
    { label: 'Agents', path: '/agents' },
    { label: 'Localities', path: '/localities' },
    { label: 'Blog', path: '/blog' },
  ];

  return (
    <>
      {/* Primary Luxury Header */}
      <header className="sticky top-0 z-40 bg-[#172C3B] text-white border-b border-[#223D52] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[70px] flex items-center justify-between">
          {/* Brand Logo matching reference */}
          <div className="flex-shrink-0">
            <BrandLogo light={true} showSubtitle={true} iconSize="w-9 h-7" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-7 text-[13px] font-medium text-white/90 font-sans">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="hover:text-[#B89A65] transition-colors py-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Selector Pill [ EN ⌵ ] */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 bg-[#223D52]/70 hover:bg-[#223D52] border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              >
                <span>{getLanguageCode()}</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/70" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white text-charcoal shadow-dropdown border border-beige py-1.5 z-50 rounded-md">
                  <button
                    onClick={() => changeLanguage('en')}
                    className="w-full text-left px-4 py-1.5 text-xs hover:bg-ivory hover:text-navy font-sans"
                  >
                    English (EN)
                  </button>
                  <button
                    onClick={() => changeLanguage('hi')}
                    className="w-full text-left px-4 py-1.5 text-xs hover:bg-ivory hover:text-navy font-sans"
                  >
                    हिन्दी (HI)
                  </button>
                  <button
                    onClick={() => changeLanguage('mr')}
                    className="w-full text-left px-4 py-1.5 text-xs hover:bg-ivory hover:text-navy font-sans"
                  >
                    मराठी (MR)
                  </button>
                </div>
              )}
            </div>

            {/* User Account / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 text-xs font-medium text-white hover:text-[#B89A65] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#B89A65] text-white flex items-center justify-center font-bold text-xs">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline font-sans truncate max-w-[100px]">
                    {user?.fullName?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white text-charcoal shadow-dropdown border border-beige py-2 z-50 rounded-md">
                    <div className="px-4 py-2 border-b border-beige">
                      <p className="text-xs font-bold text-navy truncate">{user?.fullName}</p>
                      <p className="text-[10px] text-charcoal-muted truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/account/saved"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs hover:bg-ivory text-charcoal"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#B89A65]" />
                      <span>Saved Properties</span>
                    </Link>

                    <Link
                      to="/account/my-properties"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs hover:bg-ivory text-charcoal"
                    >
                      <Building className="w-3.5 h-3.5 text-[#B89A65]" />
                      <span>My Listings</span>
                    </Link>

                    {user &&
                      ['SUPER_ADMIN', 'MODERATOR', 'CRM_MANAGER', 'CONTENT_EDITOR', 'AGENT'].includes(
                        user.role
                      ) && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs text-navy font-semibold hover:bg-ivory"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#B89A65]" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs hover:bg-red-50 text-red-600 border-t border-beige mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="text-white hover:text-[#B89A65] text-xs sm:text-sm font-medium transition-colors px-2 py-1"
              >
                Login
              </button>
            )}

            {/* Post Property Button (Solid Gold Rounded) */}
            <button
              type="button"
              onClick={handlePostPropertyClick}
              className="bg-[#B89A65] hover:bg-[#A38753] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <span>Post Property</span>
            </button>
          </div>

          {/* Mobile Right Controls: Heart + Hamburger */}
          <div className="flex items-center space-x-3 lg:hidden">
            <Link
              to="/account/saved"
              className="text-white/80 hover:text-white p-1.5"
              aria-label="Saved Properties"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white/90 hover:text-white p-1.5"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#172C3B] border-t border-[#223D52] px-4 pt-3 pb-6 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-white/90">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded bg-[#223D52]/50 hover:bg-[#223D52] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/tools/emi-calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded bg-[#223D52]/50 hover:bg-[#223D52] transition-colors"
              >
                EMI Calculator
              </Link>
              <Link
                to="/tools/area-converter"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded bg-[#223D52]/50 hover:bg-[#223D52] transition-colors"
              >
                Area Converter
              </Link>
            </div>

            {/* Language & Actions in Mobile */}
            <div className="pt-2 border-t border-[#223D52] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-white/80">
                <Globe className="w-3.5 h-3.5 text-[#B89A65]" />
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2 py-0.5 rounded ${i18n.language.startsWith('en') ? 'bg-[#B89A65] text-white' : 'text-white/70'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`px-2 py-0.5 rounded ${i18n.language.startsWith('hi') ? 'bg-[#B89A65] text-white' : 'text-white/70'}`}
                >
                  HI
                </button>
                <button
                  onClick={() => changeLanguage('mr')}
                  className={`px-2 py-0.5 rounded ${i18n.language.startsWith('mr') ? 'bg-[#B89A65] text-white' : 'text-white/70'}`}
                >
                  MR
                </button>
              </div>

              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="text-xs text-white underline hover:text-[#B89A65]"
                >
                  Login / Register
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-300 underline"
                >
                  Sign Out
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handlePostPropertyClick();
              }}
              className="w-full bg-[#B89A65] hover:bg-[#A38753] text-white text-xs font-semibold py-2.5 rounded-lg text-center"
            >
              Post Property Free
            </button>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (as seen on screens 2, 4, 6) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#172C3B] text-white/70 border-t border-[#223D52] shadow-2xl py-1.5 px-3 flex justify-around items-center">
        <Link
          to="/properties?verified=true"
          className="flex flex-col items-center text-[10px] hover:text-[#B89A65] py-1"
        >
          <ShieldCheck className="w-5 h-5 mb-0.5 text-[#B89A65]" />
          <span>Verified</span>
        </Link>
        <Link
          to="/agents"
          className="flex flex-col items-center text-[10px] hover:text-[#B89A65] py-1"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Agents</span>
        </Link>
        <Link
          to="/properties"
          className="flex flex-col items-center text-[10px] hover:text-[#B89A65] py-1"
        >
          <Calendar className="w-5 h-5 mb-0.5 text-[#B89A65]" />
          <span>Site Visit</span>
        </Link>
        <Link
          to="/tools/emi-calculator"
          className="flex flex-col items-center text-[10px] hover:text-[#B89A65] py-1"
        >
          <Calculator className="w-5 h-5 mb-0.5" />
          <span>Home Loan</span>
        </Link>
        <button
          onClick={handlePostPropertyClick}
          className="flex flex-col items-center text-[10px] text-[#B89A65] py-1 font-semibold"
        >
          <Plus className="w-5 h-5 mb-0.5" />
          <span>Post</span>
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Header;
