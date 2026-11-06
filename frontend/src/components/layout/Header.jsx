import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      <div className="bg-navy-dark text-ivory/80 text-[11px] tracking-luxury uppercase border-b border-white/10 py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-sans">
          <div className="flex items-center space-x-6">
            <span>Nagpur &bull; Maharashtra &bull; India</span>
            <span className="text-gold">Private Advisory: +91 712 2550100</span>
            <span className="text-ivory/50">MahaRERA Registered Marketplace</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/tools/emi-calculator" className="hover:text-gold transition-colors">
              Mortgage Calculator
            </Link>
            <Link to="/tools/area-converter" className="hover:text-gold transition-colors">
              Area Converter (Guntha / Sq.Ft)
            </Link>
            {user && ['SUPER_ADMIN', 'MODERATOR', 'CRM_MANAGER', 'CONTENT_EDITOR'].includes(user.role) && (
              <Link to="/admin/dashboard" className="text-gold font-medium hover:underline">
                Staff Console &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Luxury Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-beige transition-all shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Classic Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 border border-gold/40 bg-navy flex items-center justify-center text-gold transition-colors group-hover:border-gold">
              <span className="font-serif text-lg font-bold">NE</span>
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-navy uppercase block leading-none">
                Nagpur <span className="font-light text-gold text-base tracking-luxury">Estates</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-charcoal-muted font-medium block mt-1">
                Luxury &bull; Land &bull; Residences
              </span>
            </div>
          </Link>

          {/* Clean Editorial Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 text-[12px] uppercase tracking-luxury font-medium text-charcoal font-sans">
            <Link to="/properties?purpose=BUY" className="hover:text-gold transition-colors">
              {t('nav.buy') || 'Buy'}
            </Link>
            <Link to="/properties?purpose=RENT" className="hover:text-gold transition-colors">
              {t('nav.rent') || 'Rent'}
            </Link>
            <Link to="/properties?category=PLOT" className="hover:text-gold transition-colors">
              {t('nav.plots') || 'Plots'}
            </Link>
            <Link to="/properties?category=COMMERCIAL" className="hover:text-gold transition-colors">
              {t('nav.commercial') || 'Commercial'}
            </Link>
            <Link to="/projects" className="hover:text-gold transition-colors">
              {t('nav.projects') || 'Projects'}
            </Link>
            <Link to="/localities" className="hover:text-gold transition-colors">
              {t('nav.localities') || 'Localities'}
            </Link>
            <Link to="/agents" className="hover:text-gold transition-colors">
              {t('nav.agents') || 'Agents'}
            </Link>
          </nav>

          {/* Action CTAs & Language Switcher */}
          <div className="hidden lg:flex items-center space-x-5 font-sans">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 text-xs text-charcoal hover:text-navy py-1.5 px-2.5 border border-beige transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-gold" />
                <span className="font-medium text-[11px] uppercase tracking-wider">{getLanguageLabel()}</span>
                <ChevronDown className="w-3 h-3 text-charcoal-muted" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-beige shadow-dropdown py-1 z-50 text-xs">
                  <button
                    onClick={() => changeLanguage('en')}
                    className="w-full text-left px-4 py-2 hover:bg-ivory text-charcoal"
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('hi')}
                    className="w-full text-left px-4 py-2 hover:bg-ivory text-charcoal"
                  >
                    हिन्दी
                  </button>
                  <button
                    onClick={() => changeLanguage('mr')}
                    className="w-full text-left px-4 py-2 hover:bg-ivory text-charcoal"
                  >
                    मराठी
                  </button>
                </div>
              )}
            </div>

            {/* Saved Wishlist Link */}
            <Link
              to="/account/saved"
              className="text-charcoal hover:text-navy p-2 transition-colors relative"
              title="Saved Properties"
            >
              <Heart className="w-4 h-4 text-gold" />
            </Link>

            {/* User Session / Login Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 text-xs font-medium text-navy border border-beige px-3 py-2 bg-ivory-light hover:border-gold transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-gold" />
                  <span className="max-w-[100px] truncate">{user?.name || 'Account'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-beige shadow-dropdown py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-beige">
                      <p className="font-medium text-navy">{user?.name}</p>
                      <p className="text-[11px] text-charcoal-muted">{user?.phone || user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] uppercase tracking-luxury font-mono bg-ivory text-gold border border-gold/40">
                        {user?.role}
                      </span>
                    </div>

                    {['SUPER_ADMIN', 'MODERATOR', 'CRM_MANAGER', 'CONTENT_EDITOR'].includes(user?.role) && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-navy hover:bg-ivory font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 mr-2 text-gold" />
                        Management Console
                      </Link>
                    )}

                    <Link
                      to="/account/my-properties"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-charcoal hover:bg-ivory"
                    >
                      <Building className="w-3.5 h-3.5 mr-2 text-charcoal-muted" />
                      My Properties
                    </Link>

                    <Link
                      to="/account/saved"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-charcoal hover:bg-ivory"
                    >
                      <Heart className="w-3.5 h-3.5 mr-2 text-charcoal-muted" />
                      Saved Wishlist
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 border-t border-beige mt-1"
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
                className="text-xs uppercase tracking-luxury font-medium text-navy hover:text-gold transition-colors py-2 px-3 border border-beige hover:border-gold"
              >
                Sign In
              </button>
            )}

            {/* Post Property Luxury CTA */}
            <button
              onClick={handlePostPropertyClick}
              className="bg-navy hover:bg-navy-light text-white text-xs uppercase tracking-luxury font-medium py-2.5 px-5 border border-gold/40 transition-colors shadow-subtle flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-gold" />
              <span>List Property</span>
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={handlePostPropertyClick}
              className="bg-navy text-white text-[11px] uppercase tracking-luxury font-medium py-2 px-3 border border-gold/40"
            >
              List
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-navy hover:text-gold"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-beige bg-white px-6 py-6 space-y-5 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-beige">
              <span className="text-xs uppercase tracking-luxury text-charcoal-muted font-medium">Language</span>
              <div className="flex space-x-2 text-xs font-medium">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2.5 py-1 ${i18n.language.startsWith('en') ? 'bg-navy text-white' : 'border border-beige'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`px-2.5 py-1 ${i18n.language.startsWith('hi') ? 'bg-navy text-white' : 'border border-beige'}`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => changeLanguage('mr')}
                  className={`px-2.5 py-1 ${i18n.language.startsWith('mr') ? 'bg-navy text-white' : 'border border-beige'}`}
                >
                  मराठी
                </button>
              </div>
            </div>

            <nav className="flex flex-col space-y-3 text-xs uppercase tracking-luxury font-medium text-charcoal">
              <Link to="/properties?purpose=BUY" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold">
                {t('nav.buy') || 'Buy'}
              </Link>
              <Link to="/properties?purpose=RENT" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold">
                {t('nav.rent') || 'Rent'}
              </Link>
              <Link to="/properties?category=PLOT" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold">
                {t('nav.plots') || 'Plots'}
              </Link>
              <Link to="/properties?category=COMMERCIAL" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold">
                {t('nav.commercial') || 'Commercial'}
              </Link>
              <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold">
                {t('nav.projects') || 'Projects'}
              </Link>
              <Link to="/localities" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold">
                {t('nav.localities') || 'Localities'}
              </Link>
              <Link to="/agents" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold">
                {t('nav.agents') || 'Agents'}
              </Link>
              <Link to="/tools/emi-calculator" onClick={() => setMobileMenuOpen(false)} className="text-gold">
                Mortgage Calculator
              </Link>
            </nav>

            <div className="pt-4 border-t border-beige">
              {isAuthenticated ? (
                <div className="space-y-2 text-xs">
                  <Link to="/account/my-properties" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-navy font-medium">
                    My Properties
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-red-600 font-medium py-1">
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); setAuthModalOpen(true); }}
                  className="w-full py-3 bg-navy text-white text-xs uppercase tracking-luxury font-medium text-center"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Header;
