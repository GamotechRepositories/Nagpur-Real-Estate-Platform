import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

const Footer = () => {
  return (
    <footer className="bg-[#172C3B] text-white/80 pt-16 pb-12 border-t border-[#223D52]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Presentation */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo light={true} showSubtitle={true} iconSize="w-9 h-7" />

            <p className="text-sm text-white/70 leading-relaxed font-sans pr-6">
              Nagpur’s premier real estate marketplace. Connecting buyers, sellers, tenants, and top verified agents across Dharampeth, Manish Nagar, Civil Lines, Wardha Road, and prime Nagpur localities.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/919823000000?text=Hello%20Nagpur%20Realty"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 bg-[#B89A65] hover:bg-[#A38753] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Advisory</span>
              </a>
              <div className="flex items-center space-x-1.5 text-xs text-white/70 border border-white/20 rounded-lg px-3 py-2">
                <ShieldCheck className="w-4 h-4 text-[#B89A65]" />
                <span>MahaRERA Registered</span>
              </div>
            </div>
          </div>

          {/* Popular Localities */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#B89A65] tracking-wide">
              Popular Localities
            </h4>
            <ul className="space-y-2 text-xs text-white/70 font-sans">
              <li>
                <Link to="/properties?locality=Dharampeth" className="hover:text-[#B89A65] transition-colors">
                  Dharampeth
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Manish Nagar" className="hover:text-[#B89A65] transition-colors">
                  Manish Nagar
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Civil Lines" className="hover:text-[#B89A65] transition-colors">
                  Civil Lines
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Wardha Road" className="hover:text-[#B89A65] transition-colors">
                  Wardha Road
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Ramdaspeth" className="hover:text-[#B89A65] transition-colors">
                  Ramdaspeth
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Besa" className="hover:text-[#B89A65] transition-colors">
                  Besa
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#B89A65] tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-white/70 font-sans">
              <li>
                <Link to="/properties?purpose=BUY" className="hover:text-[#B89A65] transition-colors">
                  Flats for Sale
                </Link>
              </li>
              <li>
                <Link to="/properties?purpose=RENT" className="hover:text-[#B89A65] transition-colors">
                  Flats for Rent
                </Link>
              </li>
              <li>
                <Link to="/properties?category=PLOT" className="hover:text-[#B89A65] transition-colors">
                  Plots & Land
                </Link>
              </li>
              <li>
                <Link to="/properties?category=COMMERCIAL" className="hover:text-[#B89A65] transition-colors">
                  Commercial Properties
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-[#B89A65] transition-colors">
                  Ongoing Projects
                </Link>
              </li>
              <li>
                <Link to="/agents" className="hover:text-[#B89A65] transition-colors">
                  Verified Agents
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#B89A65] transition-colors">
                  Real Estate Insights (Blog)
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#B89A65] tracking-wide">
              Tools & Advisory
            </h4>
            <ul className="space-y-2 text-xs text-white/70 font-sans">
              <li>
                <Link to="/tools/emi-calculator" className="hover:text-[#B89A65] transition-colors">
                  Home Loan EMI Calculator
                </Link>
              </li>
              <li>
                <Link to="/tools/area-converter" className="hover:text-[#B89A65] transition-colors">
                  Area Unit Converter (Guntha / Sq.Ft)
                </Link>
              </li>
              <li>
                <Link to="/post-property" className="hover:text-[#B89A65] transition-colors">
                  Post Free Property Ad
                </Link>
              </li>
              <li className="pt-2 text-white/60 text-[11px] leading-relaxed">
                <span>📍 Civil Lines, Nagpur, MH 440001</span>
                <br />
                <span>📞 +91 712 2550100</span>
                <br />
                <span>✉ contact@nagpurrealty.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} Nagpur Realty. All rights reserved. MahaRERA registered marketplace.</p>
          <div className="flex space-x-6">
            <Link to="/content/terms-of-service" className="hover:text-white/80">Terms</Link>
            <Link to="/content/privacy-policy" className="hover:text-white/80">Privacy</Link>
            <Link to="/content/disclaimer" className="hover:text-white/80">MahaRERA Disclaimer</Link>
            <Link to="/admin/login" className="hover:text-[#B89A65]">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
