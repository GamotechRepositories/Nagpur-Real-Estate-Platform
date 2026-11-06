import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  PlusCircle,
  User,
  Heart,
  Globe,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Calculator,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import AuthModal from '../common/AuthModal';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLangDropdownOpen(false);
  };

  const getLanguageLabel = () => {
    if (i18n.language.startsWith('hi')) return 'हिन्दी';
    if (i18n.language.startsWith('mr')) return 'मराठी';
    return 'English';
  };

  const handlePostPropertyClick = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    } else {
      navigate('/post-property');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        {/* Top announcement / helpline strip */}
        <div className="bg-brand-navy text-slate-300 text-xs py-1.5 px-4 hidden md:block">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span>📍 Nagpur, Maharashtra, India</span>
              <span>📞 Helpline: 0712-2550100</span>
              <span className="text-emerald-400 font-medium">✓ 100% MahaRERA Verified Properties</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/tools/emi-calculator" className="hover:text-white flex items-center space-x-1">
                <Calculator className="w-3.5 h-3.5 text-brand-orange" />
                <span>EMI Calculator</span>
              </Link>
              {user && (user.role === 'SUPER_ADMIN' || user.role === 'MODERATOR' || user.role === 'CRM_MANAGER') && (
                <Link to="/admin/dashboard" className="text-brand-orange font-semibold hover:underline">
                  Admin Dashboard →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-teal to-brand-navy flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-brand-orange" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-brand-navy">
                Nagpur<span className="text-brand-orange">Estate</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 -mt-1">
                Real Estate Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-slate-700">
            <Link to="/" className="hover:text-brand-orange transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/properties?purpose=BUY" className="hover:text-brand-orange transition-colors">
              {t('nav.buy')}
            </Link>
            <Link to="/properties?purpose=RENT" className="hover:text-brand-orange transition-colors">
              {t('nav.rent')}
            </Link>
            <Link to="/properties?category=PLOT" className="hover:text-brand-orange transition-colors">
              {t('nav.plots')}
            </Link>
            <Link to="/properties?category=COMMERCIAL" className="hover:text-brand-orange transition-colors">
              {t('nav.commercial')}
            </Link>
            <Link to="/projects" className="hover:text-brand-orange transition-colors">
              {t('nav.projects')}
            </Link>
            <Link to="/agents" className="hover:text-brand-orange transition-colors">
              {t('nav.agents')}
            </Link>
            <Link to="/localities" className="hover:text-brand-orange transition-colors">
              {t('nav.localities')}
            </Link>
          </nav>

          {/* Action Buttons & Language Selector */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-brand-teal" />
                <span>{getLanguageLabel()}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs font-medium">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 ${i18n.language.startsWith('en') ? 'text-brand-orange font-bold' : 'text-slate-700'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('hi')}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 ${i18n.language.startsWith('hi') ? 'text-brand-orange font-bold' : 'text-slate-700'}`}
                  >
                    हिन्दी (Hindi)
                  </button>
                  <button
                    onClick={() => changeLanguage('mr')}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 ${i18n.language.startsWith('mr') ? 'text-brand-orange font-bold' : 'text-slate-700'}`}
                  >
                    मराठी (Marathi)
                  </button>
                </div>
              )}
            </div>

            {/* Saved properties button */}
            {isAuthenticated && (
              <Link
                to="/account/saved"
                className="p-2 rounded-lg text-slate-600 hover:text-brand-orange hover:bg-slate-100 transition-colors"
                title={t('nav.savedProperties')}
              >
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* User Account / Login Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {user?.name || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-sm font-medium">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.phone || user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-brand-orange">
                        {user?.role}
                      </span>
                    </div>

                    {/* Staff dashboard link */}
                    {['SUPER_ADMIN', 'MODERATOR', 'CRM_MANAGER', 'CONTENT_EDITOR'].includes(user?.role) && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-brand-teal hover:bg-slate-50"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}

                    {/* Owner / Agent Dashboard */}
                    {user?.role === 'AGENT' && (
                      <Link
                        to="/agent/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Agent Leads & Listings
                      </Link>
                    )}

                    <Link
                      to="/account/my-properties"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      My Properties
                    </Link>

                    <Link
                      to="/account/saved"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Saved Wishlist
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-brand-orange py-2 px-3 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{t('nav.login')}</span>
              </button>
            )}

            {/* Post Property Orange CTA Button */}
            <button
              onClick={handlePostPropertyClick}
              className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('nav.postProperty')}</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center space-x-3 lg:hidden">
            <button
              onClick={handlePostPropertyClick}
              className="bg-brand-orange text-white text-xs font-bold py-2 px-3 rounded-lg"
            >
              Post Free
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase">Select Language</span>
              <div className="flex space-x-2 text-xs font-semibold">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2 py-1 rounded ${i18n.language.startsWith('en') ? 'bg-brand-teal text-white' : 'bg-slate-100'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`px-2 py-1 rounded ${i18n.language.startsWith('hi') ? 'bg-brand-teal text-white' : 'bg-slate-100'}`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => changeLanguage('mr')}
                  className={`px-2 py-1 rounded ${i18n.language.startsWith('mr') ? 'bg-brand-teal text-white' : 'bg-slate-100'}`}
                >
                  मराठी
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-2 font-medium text-slate-800">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-orange">
                {t('nav.home')}
              </Link>
              <Link to="/properties?purpose=BUY" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-orange">
                {t('nav.buy')}
              </Link>
              <Link to="/properties?purpose=RENT" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-orange">
                {t('nav.rent')}
              </Link>
              <Link to="/properties?category=PLOT" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-orange">
                {t('nav.plots')}
              </Link>
              <Link to="/properties?category=COMMERCIAL" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-orange">
                {t('nav.commercial')}
              </Link>
              <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-orange">
                {t('nav.projects')}
              </Link>
              <Link to="/agents" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-orange">
                {t('nav.agents')}
              </Link>
              <Link to="/localities" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-orange">
                {t('nav.localities')}
              </Link>
              <Link to="/tools/emi-calculator" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-orange text-brand-orange">
                EMI Calculator & Tools
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account/my-properties"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-sm font-semibold text-slate-800"
                  >
                    My Properties
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-sm font-semibold text-red-600"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl border border-brand-teal text-brand-teal font-bold text-center text-sm"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Header;

