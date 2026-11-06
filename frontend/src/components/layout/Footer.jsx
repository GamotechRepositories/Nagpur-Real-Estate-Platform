import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, MessageSquare, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-navy text-slate-300 pt-16 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-teal to-slate-800 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-brand-orange" />
              </div>
              <span className="text-2xl font-black text-white">
                Nagpur<span className="text-brand-orange">Estate</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed pr-6">
              Nagpur’s dedicated real estate marketplace for verified residential apartments, independent villas, commercial spaces, and NMRDA sanctioned plots. Empowering homebuyers, sellers, and agents across Nagpur, Maharashtra.
            </p>
            <div className="pt-2 flex items-center space-x-3">
              <a
                href="https://wa.me/919823000000?text=Hello%20Nagpur%20Real%20Estate"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-900/30"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>MahaRERA Registered</span>
              </span>
            </div>
          </div>

          {/* Quick Locality Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Top Localities</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/properties?locality=Dharampeth" className="hover:text-brand-orange transition-colors">
                  Flats in Dharampeth
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Manish Nagar" className="hover:text-brand-orange transition-colors">
                  Flats in Manish Nagar
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Wardha Road" className="hover:text-brand-orange transition-colors">
                  Properties on Wardha Road
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Besa" className="hover:text-brand-orange transition-colors">
                  Plots & Flats in Besa
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Civil Lines" className="hover:text-brand-orange transition-colors">
                  Homes in Civil Lines
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Ramdaspeth" className="hover:text-brand-orange transition-colors">
                  Properties in Ramdaspeth
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Searches */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Quick Categories</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/properties?purpose=BUY&subtype=FLAT" className="hover:text-brand-orange transition-colors">
                  Flats for Sale in Nagpur
                </Link>
              </li>
              <li>
                <Link to="/properties?purpose=RENT" className="hover:text-brand-orange transition-colors">
                  Flats for Rent in Nagpur
                </Link>
              </li>
              <li>
                <Link to="/properties?category=PLOT" className="hover:text-brand-orange transition-colors">
                  NMRDA Plots in Nagpur
                </Link>
              </li>
              <li>
                <Link to="/properties?category=COMMERCIAL" className="hover:text-brand-orange transition-colors">
                  Commercial Offices & Shops
                </Link>
              </li>
              <li>
                <Link to="/tools/emi-calculator" className="hover:text-brand-orange transition-colors">
                  Home Loan EMI Calculator
                </Link>
              </li>
              <li>
                <Link to="/tools/area-converter" className="hover:text-brand-orange transition-colors">
                  Area Unit Converter
                </Link>
              </li>
            </ul>
          </div>

          {/* Nagpur Office Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Nagpur Office</h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                <span>Civil Lines, Nagpur, Maharashtra 440001</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-brand-orange flex-shrink-0" />
                <span>+91 712 2550100</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-brand-orange flex-shrink-0" />
                <span>support@nagpurestate.com</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/admin/login"
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Staff Admin Portal Login →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} Nagpur Real Estate Platform. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/content/terms" className="hover:text-slate-400">Terms of Service</Link>
            <Link to="/content/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link to="/content/rera-disclaimer" className="hover:text-slate-400">RERA Disclaimer</Link>
            <Link to="/content/faq" className="hover:text-slate-400">FAQs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

