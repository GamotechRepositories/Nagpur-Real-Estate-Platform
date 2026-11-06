import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-dark text-ivory/80 pt-20 pb-12 border-t border-navy-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-white/10">
          {/* Brand Presentation */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 border border-gold/40 flex items-center justify-center bg-navy transition-colors group-hover:border-gold">
                <span className="font-serif text-lg font-bold text-gold">NE</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-white leading-none">
                  NAGPUR<span className="text-gold font-light ml-1.5 text-lg uppercase tracking-luxury">Estates</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-ivory/50 mt-1 font-sans">
                  The Premier Nagpur Property Marketplace
                </span>
              </div>
            </Link>

            <p className="text-sm text-ivory/70 leading-relaxed font-sans pr-6">
              Nagpur’s definitive luxury real estate authority. Curating verified residential sanctuaries, heritage bungalows, NMRDA sanctioned plotted layouts, and grade-A commercial addresses across the Tiger Capital.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="https://wa.me/919823000000?text=Hello%20Nagpur%20Estates%20Advisory"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 bg-gold hover:bg-gold-light text-navy text-xs font-medium tracking-luxury uppercase px-5 py-3 transition-colors shadow-subtle"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Private Advisory</span>
              </a>
              <div className="flex items-center space-x-2 text-xs text-ivory/60 border border-white/10 px-3.5 py-2.5">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span>MahaRERA Compliant</span>
              </div>
            </div>
          </div>

          {/* Nagpur Enclaves */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-luxury text-gold">
              Nagpur Enclaves
            </h4>
            <ul className="space-y-2.5 text-xs text-ivory/70 font-sans">
              <li>
                <Link to="/properties?locality=Dharampeth" className="hover:text-gold transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Dharampeth West</span>
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Ramdaspeth" className="hover:text-gold transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Ramdaspeth Central</span>
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Civil Lines" className="hover:text-gold transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Civil Lines Heritage</span>
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Wardha Road" className="hover:text-gold transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Wardha Road Corridor</span>
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Manish Nagar" className="hover:text-gold transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Manish Nagar Heights</span>
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Besa" className="hover:text-gold transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Besa Urban Belt</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-luxury text-gold">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-ivory/70 font-sans">
              <li>
                <Link to="/properties?purpose=BUY&subtype=FLAT" className="hover:text-gold transition-colors">
                  Luxury Residences For Sale
                </Link>
              </li>
              <li>
                <Link to="/properties?purpose=RENT" className="hover:text-gold transition-colors">
                  Curated Executive Rentals
                </Link>
              </li>
              <li>
                <Link to="/properties?category=PLOT" className="hover:text-gold transition-colors">
                  NMRDA Sanctioned Plots
                </Link>
              </li>
              <li>
                <Link to="/properties?category=COMMERCIAL" className="hover:text-gold transition-colors">
                  Grade-A Commercial Suites
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-gold transition-colors">
                  New Architectural Projects
                </Link>
              </li>
              <li>
                <Link to="/agents" className="hover:text-gold transition-colors">
                  Certified Advisory Agents
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge & Office */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-luxury text-gold">
              Concierge
            </h4>
            <ul className="space-y-3 text-xs text-ivory/70 font-sans">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>Palm Road, Civil Lines, Nagpur, Maharashtra 440001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span>+91 (0712) 256-0199</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span>advisory@nagpurestate.com</span>
              </li>
              <li className="pt-2">
                <Link
                  to="/post-property"
                  className="inline-flex items-center text-xs uppercase tracking-luxury text-gold hover:text-white transition-colors font-medium"
                >
                  List An Asset <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal, RERA & Sub-footer */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between text-xs text-ivory/50 space-y-4 md:space-y-0 font-sans">
          <p className="tracking-wide">
            &copy; {new Date().getFullYear()} Nagpur Estates Private Limited. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center space-x-6">
            <Link to="/content/terms-of-service" className="hover:text-gold transition-colors">
              Terms of Service
            </Link>
            <Link to="/content/privacy-policy" className="hover:text-gold transition-colors">
              Privacy Governance
            </Link>
            <Link to="/content/rera-compliance-guide" className="hover:text-gold transition-colors">
              MahaRERA Advisory
            </Link>
            <Link to="/admin/login" className="text-ivory/30 hover:text-ivory/60 transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
