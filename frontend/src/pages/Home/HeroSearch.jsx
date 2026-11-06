import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Building, IndianRupee, Bed, ChevronDown } from 'lucide-react';

const NAGPUR_POPULAR_LOCALITIES = [
  'Dharampeth',
  'Manish Nagar',
  'Wardha Road',
  'Besa',
  'Civil Lines',
  'Ramdaspeth',
  'Shankar Nagar',
  'Sitabuldi',
  'Hingna Road',
  'Pratap Nagar',
];

const HeroSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [purpose, setPurpose] = useState('BUY'); // 'BUY' | 'RENT' | 'PLOT' | 'COMMERCIAL'
  const [locality, setLocality] = useState('');
  const [subtype, setSubtype] = useState('');
  const [bhk, setBhk] = useState('');
  const [budget, setBudget] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleLocalityInput = (val) => {
    setLocality(val);
    if (val.trim().length > 0) {
      const filtered = NAGPUR_POPULAR_LOCALITIES.filter((loc) =>
        loc.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (purpose === 'PLOT') {
      params.append('category', 'PLOT');
    } else if (purpose === 'COMMERCIAL') {
      params.append('category', 'COMMERCIAL');
    } else {
      params.append('purpose', purpose);
    }

    if (locality) params.append('locality', locality);
    if (subtype) params.append('subtype', subtype);
    if (bhk) params.append('bedrooms', bhk);

    if (budget) {
      const [min, max] = budget.split('-');
      if (min) params.append('minPrice', min);
      if (max) params.append('maxPrice', max);
    }

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="relative bg-gradient-to-b from-brand-teal-dark via-brand-teal to-brand-navy text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle geometric background overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        {/* Nagpur Badge */}
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-orange-300 border border-white/10 mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
          <span>Nagpur's #1 Dedicated Real Estate Marketplace</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          {t('hero.title')}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal">
          {t('hero.subtitle')}
        </p>

        {/* Search Filter Box Card */}
        <div className="mt-10 bg-white rounded-3xl p-3 sm:p-5 shadow-2xl border border-white/20 text-slate-900 max-w-4xl mx-auto backdrop-blur-lg">
          {/* Top Purpose Tabs */}
          <div className="flex border-b border-slate-100 pb-3 mb-4 space-x-2 sm:space-x-4 overflow-x-auto">
            {[
              { id: 'BUY', label: t('filters.buy') },
              { id: 'RENT', label: t('filters.rent') },
              { id: 'PLOT', label: t('filters.plots') },
              { id: 'COMMERCIAL', label: t('filters.commercial') },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setPurpose(tab.id);
                  setSubtype('');
                }}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  purpose === tab.id
                    ? 'bg-brand-navy text-white shadow-md'
                    : 'text-slate-600 hover:text-brand-orange hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Inputs Grid */}
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Locality Autocomplete (Span 4) */}
            <div className="md:col-span-4 relative text-left">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                Locality / Area
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-brand-orange absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Dharampeth, Manish Nagar"
                  value={locality}
                  onChange={(e) => handleLocalityInput(e.target.value)}
                  onFocus={() => {
                    if (locality) setShowSuggestions(true);
                  }}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-semibold text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Autocomplete dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 max-h-48 overflow-y-auto">
                  {suggestions.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setLocality(loc);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-orange flex items-center space-x-2"
                    >
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{loc}, Nagpur</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Type Dropdown (Span 3) */}
            <div className="md:col-span-3 text-left">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                Property Type
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={subtype}
                  onChange={(e) => setSubtype(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium text-slate-800 bg-white appearance-none"
                >
                  <option value="">All Types</option>
                  {purpose === 'COMMERCIAL' ? (
                    <>
                      <option value="COMMERCIAL_SHOP">Retail Shop</option>
                      <option value="COMMERCIAL_OFFICE">Office Space</option>
                      <option value="WAREHOUSE">Warehouse / Godown</option>
                    </>
                  ) : purpose === 'PLOT' ? (
                    <>
                      <option value="PLOT">Residential Plot</option>
                      <option value="FARM_LAND">Agricultural / Farm Land</option>
                    </>
                  ) : (
                    <>
                      <option value="FLAT">Flat / Apartment</option>
                      <option value="HOUSE_VILLA">Independent House / Villa</option>
                      <option value="PENTHOUSE">Penthouse</option>
                    </>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* BHK / Bedrooms (Span 2) */}
            {purpose !== 'PLOT' && purpose !== 'COMMERCIAL' ? (
              <div className="md:col-span-2 text-left">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                  Bedrooms
                </label>
                <div className="relative">
                  <Bed className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={bhk}
                    onChange={(e) => setBhk(e.target.value)}
                    className="w-full pl-9 pr-6 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium text-slate-800 bg-white appearance-none"
                  >
                    <option value="">Any</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            ) : (
              /* Budget if plot / commercial */
              <div className="md:col-span-2 text-left">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                  Budget
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-9 pr-6 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium text-slate-800 bg-white appearance-none"
                  >
                    <option value="">Any</option>
                    <option value="0-3000000">&lt; 30 Lakhs</option>
                    <option value="3000000-6000000">30L - 60 Lakhs</option>
                    <option value="6000000-10000000">60L - 1 Crore</option>
                    <option value="10000000-25000000">1 Cr - 2.5 Cr</option>
                    <option value="25000000-">2.5 Cr +</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Search Submit Button (Span 3) */}
            <div className="md:col-span-3 pt-4 md:pt-5">
              <button
                type="submit"
                className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center space-x-2 text-sm hover:scale-[1.02] active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>{t('hero.searchBtn')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Trending Localities Chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
          <span className="font-semibold text-white">Popular in Nagpur:</span>
          {NAGPUR_POPULAR_LOCALITIES.slice(0, 6).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => navigate(`/properties?locality=${loc}`)}
              className="bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1 rounded-full text-slate-200 transition-colors"
            >
              {loc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;

