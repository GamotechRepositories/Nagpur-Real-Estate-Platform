import React, { useState } from 'react';
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
      {/* Top Editorial Utility Strip */}
      <div className="bg-[#172C3B] text-[#E9E4DA] text-[11px] tracking-wider uppercase border-b border-[#B89A65]/20 py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span>Nagpur &middot; Maharashtra &middot; India</span>
            <span className="text-[#B89A65]">Private Advisory: +91 712 2550100</span>
            <span className="text-slate-400">MahaRERA Registered Marketplace</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/tools/emi-calculator" className="hover:text-[#B89A65] transition-colors">
              Mortgage Calculator
            </Link>
            <Link to="/tools/area-converter" className="hover:text-[#B89A65] transition-colors">
              Area Converter (Guntha / Sq.Ft)
            </Link>
            {user && ['SUPER_ADMIN', 'MODERATOR', 'CRM_MANAGER', 'CONTENT_EDITOR'].includes(user.role) && (
              <Link to="/admin/dashboard" className="text-[#B89A65] font-semibold hover:underline">
                Staff Console &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Luxury Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E9E4DA] transition-all shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Classic Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 border border-[#B89A65] bg-[#172C3B] flex items-center justify-center text-[#B89A65] transition-transform group-hover:scale-105">
              <span className="font-serif text-lg font-bold">N</span>
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#172C3B] uppercase block">
                Nagpur <span className="font-light text-[#B89A65]">Estates</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#252525]/60 font-medium block -mt-1">
                Luxury &middot; Land &middot; Residences
              </span>
            </div>
          </Link>

          {/* Clean Editorial Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 text-[13px] uppercase tracking-luxury font-medium text-[#252525]">
            <Link to="/properties?purpose=BUY" className="hover:text-[#B89A65] transition-colors">
              {t('nav.buy')}
            </Link>
            <Link to="/properties?purpose=RENT" className="hover:text-[#B89A65] transition-colors">
              {t('nav.rent')}
            </Link>
            <Link to="/properties?category=PLOT" className="hover:text-[#B89A65] transition-colors">
              {t('nav.plots')}
            </Link>
            <Link to="/properties?category=COMMERCIAL" className="hover:text-[#B89A65] transition-colors">
              {t('nav.commercial')}
            </Link>
            <Link to="/projects" className="hover:text-[#B89A65] transition-colors">
              {t('nav.projects')}
            </Link>
            <Link to="/localities" className="hover:text-[#B89A65] transition-colors">
              {t('nav.localities')}
            </Link>
            <Link to="/agents" className="hover:text-[#B89A65] transition-colors">
              {t('nav.agents')}
            </Link>
          </nav>

          {/* Action CTAs & Language Switcher */}
          <div className="hidden lg:flex items-center space-x-5">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 py-1.5 px-2.5 border border-[#E9E4DA] bg-[#F7F4ED] hover:bg-[#EFECE3] text-xs font-medium text-[#252525] transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-[#B89A65]" />
                <span>{getLanguageLabel()}</span>
                <ChevronDown className="w-3 h-3 text-[#252525]/60" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-[#FFFFFF] border border-[#E9E4DA] shadow-dropdown py-1 z-50 text-xs font-medium">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-3 py-2 hover:bg-[#F7F4ED] ${i18n.language.startsWith('en') ? 'text-[#B89A65] font-bold' : 'text-[#252525]'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('hi')}
                    className={`w-full text-left px-3 py-2 hover:bg-[#F7F4ED] ${i18n.language.startsWith('hi') ? 'text-[#B89A65] font-bold' : 'text-[#252525]'}`}
                  >
                    हिन्दी (Hindi)
                  </button>
                  <button
                    onClick={() => changeLanguage('mr')}
                    className={`w-full text-left px-3 py-2 hover:bg-[#F7F4ED] ${i18n.language.startsWith('mr') ? 'text-[#B89A65] font-bold' : 'text-[#252525]'}`}
                  >
                    मराठी (Marathi)
                  </button>
                </div>
              )}
            </div>

            {/* Saved Wishlist */}
            {isAuthenticated && (
              <Link
                to="/account/saved"
                className="p-2 text-[#252525] hover:text-[#B89A65] transition-colors"
                title="Saved Properties"
              >
                <Heart className="w-4 h-4" />
              </Link>
            )}

            {/* User Account / Sign In */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 py-1.5 px-3 border border-[#E9E4DA] bg-[#F7F4ED] hover:bg-[#EFECE3] transition-colors text-xs font-medium text-[#252525]"
                >
                  <span className="w-5 h-5 rounded-full bg-[#172C3B] text-[#F7F4ED] flex items-center justify-center font-bold text-[10px]">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </span>
                  <span className="max-w-[110px] truncate">{user?.name || 'My Account'}</span>
                  <ChevronDown className="w-3 h-3 text-[#252525]/60" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-[#FFFFFF] border border-[#E9E4DA] shadow-dropdown py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-[#E9E4DA]">
                      <p className="font-bold text-[#172C3B]">{user?.name}</p>
                      <p className="text-[11px] text-slate-500">{user?.phone || user?.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-[#E9E4DA] text-[#172C3B]">
                        {user?.role}
                      </span>
                    </div>

                    {['SUPER_ADMIN', 'MODERATOR', 'CRM_MANAGER', 'CONTENT_EDITOR'].includes(user?.role) && (
                      to = "/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-[#172C3B] hover:bg-[#F7F4ED] font-semibold"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 mr-2 text-[#B89A65]" />
                        Management Console
                      </Link>
                    )}

                    <Link
                      to="/account/my-properties"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-[#252525] hover:bg-[#F7F4ED]"
                    >
                      <Building className="w-3.5 h-3.5 mr-2 text-slate-500" />
                      My Properties
                    </Link>

                    <Link
                      to="/account/saved"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-[#252525] hover:bg-[#F7F4ED]"
                    >
                      <Heart className="w-3.5 h-3.5 mr-2 text-slate-500" />
                      Saved Wishlist
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-red-700 hover:bg-red-50 border-t border-[#E9E4DA] mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-xs uppercase tracking-luxury font-medium text-[#252525] hover:text-[#B89A65] transition-colors py-2 px-2"
              >
                Sign In
              </button>
            )}

            {/* Post Property Button — Classic Navy with Champagne Accent */}
            <button
              onClick={handlePostPropertyClick}
              className="bg-[#172C3B] hover:bg-[#223D52] text-white text-xs uppercase tracking-luxury font-medium py-2.5 px-4 border border-[#B89A65]/40 transition-colors shadow-sm"
            >
              List Property
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center space-x-3 lg:hidden">
            <button
              onClick={handlePostPropertyClick}
              className="bg-[#172C3B] text-white text-[11px] uppercase tracking-luxury font-medium py-2 px-3 border border-[#B89A65]/40"
            >
              List
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#172C3B] hover:text-[#B89A65]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E9E4DA] bg-[#FFFFFF] px-6 py-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E4DA]">
              <span className="text-xs uppercase tracking-wider text-[#252525]/60 font-semibold">Language</span>
              <div className="flex space-x-2 text-xs font-medium">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2.5 py-1 ${i18n.language.startsWith('en') ? 'bg-[#172C3B] text-white' : 'border border-[#E9E4DA]'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`px-2.5 py-1 ${i18n.language.startsWith('hi') ? 'bg-[#172C3B] text-white' : 'border border-[#E9E4DA]'}`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => changeLanguage('mr')}
                  className={`px-2.5 py-1 ${i18n.language.startsWith('mr') ? 'bg-[#172C3B] text-white' : 'border border-[#E9E4DA]'}`}
                >
                  मराठी
                </button>
              </div>
            </div>

            <nav className="flex flex-col space-y-3 text-sm font-medium text-[#252525]">
              <Link to="/properties?purpose=BUY" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B89A65]">
                {t('nav.buy')}
              </Link>
              <Link to="/properties?purpose=RENT" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B89A65]">
                {t('nav.rent')}
              </Link>
              <Link to="/properties?category=PLOT" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B89A65]">
                {t('nav.plots')}
              </Link>
              <Link to="/properties?category=COMMERCIAL" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B89A65]">
                {t('nav.commercial')}
              </Link>
              <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B89A65]">
                {t('nav.projects')}
              </Link>
              <Link to="/localities" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B89A65]">
                {t('nav.localities')}
              </Link>
              <Link to="/agents" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B89A65]">
                {t('nav.agents')}
              </Link>
              <Link to="/tools/emi-calculator" onClick={() => setMobileMenuOpen(false)} className="text-[#B89A65]">
                Mortgage Calculator
              </Link>
            </nav>

            <div className="pt-4 border-t border-[#E9E4DA]">
              {isAuthenticated ? (
                <div className="space-y-2 text-sm">
                  <Link to="/account/my-properties" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                    My Properties
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-red-700 font-semibold py-1">
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); setAuthModalOpen(true); }}
                  className="w-full py-2.5 border border-[#172C3B] text-[#172C3B] text-xs uppercase tracking-luxury font-bold text-center"
                >
                  Sign In / Register
                </button>
              )
}
          </div >
        )}
      </header >

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
};

export default Header;
