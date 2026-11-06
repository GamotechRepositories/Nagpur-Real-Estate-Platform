import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Building, ChevronDown, Check } from 'lucide-react';

const NAGPUR_POPULAR_LOCALITIES = [
  'Dharampeth',
  'Civil Lines',
  'Ramdaspeth',
  'Manish Nagar',
  'Wardha Road',
  'Besa',
  'Shankar Nagar',
  'Sitabuldi',
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
    <div className="relative bg-[#172C3B] text-white overflow-hidden border-b border-[#E9E4DA]">
      {/* Background Architectural Luxury Image with Editorial Tint */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
          alt="Luxury Architecture in Nagpur"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity filter brightness-90 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#172C3B] via-[#172C3B]/90 to-[#172C3B]/70"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 relative z-10">
        {/* Editorial Headline & Subtitle */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 text-[11px] uppercase tracking-widest text-[#B89A65] font-semibold">
            <span className="w-6 h-px bg-[#B89A65]"></span>
            <span>Nagpur's Premier Real Estate Portfolio</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FFFFFF] leading-[1.1]">
            Find Your Place in Nagpur.
          </h1>

          <p className="text-base sm:text-lg text-[#E9E4DA]/90 font-light max-w-2xl leading-relaxed pt-1">
            Discover exceptional properties, trusted agents, and the perfect place to call home.
          </p>
        </div>

        {/* Luxury Search Interface Panel */}
        <div className="mt-12 bg-[#FFFFFF] border border-[#E9E4DA] shadow-hover p-4 sm:p-6 text-[#252525]">
          {/* Top Category Tabs */}
          <div className="flex border-b border-[#E9E4DA] mb-6 space-x-6 sm:space-x-10 overflow-x-auto text-xs uppercase tracking-luxury font-medium">
            {[
              { id: 'BUY', label: 'Buy Residence' },
              { id: 'RENT', label: 'Rent Residence' },
              { id: 'PLOT', label: 'Land & Plots' },
              { id: 'COMMERCIAL', label: 'Commercial' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setPurpose(tab.id);
                  setSubtype('');
                }}
                className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
                  purpose === tab.id
                    ? 'border-[#B89A65] text-[#172C3B] font-bold'
                    : 'border-transparent text-[#252525]/60 hover:text-[#172C3B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Fields Grid */}
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Location (Span 4) */}
            <div className="md:col-span-4 relative text-left">
              <label className="block text-[10px] uppercase tracking-widest text-[#252525]/60 font-semibold mb-1.5">
                Location / Neighborhood
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#B89A65] absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Dharampeth, Civil Lines, Manish Nagar..."
                  value={locality}
                  onChange={(e) => handleLocalityInput(e.target.value)}
                  onFocus={() => {
                    if (locality) setShowSuggestions(true);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F7F4ED] border border-[#E9E4DA] focus:border-[#172C3B] text-xs font-medium text-[#252525] placeholder-[#252525]/40 outline-none transition-colors"
                />
              </div>

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E9E4DA] shadow-dropdown py-1 z-50 text-xs">
                  {suggestions.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setLocality(loc);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-[#F7F4ED] hover:text-[#B89A65] flex items-center justify-between"
                    >
                      <span>{loc}, Nagpur</span>
                      <span className="text-[10px] text-slate-400">Maharashtra</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Type (Span 3) */}
            <div className="md:col-span-3 text-left">
              <label className="block text-[10px] uppercase tracking-widest text-[#252525]/60 font-semibold mb-1.5">
                Property Category
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-[#252525]/40 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={subtype}
                  onChange={(e) => setSubtype(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-[#F7F4ED] border border-[#E9E4DA] focus:border-[#172C3B] text-xs font-medium text-[#252525] outline-none appearance-none cursor-pointer transition-colors"
                >
                  <option value="">All Categories</option>
                  {purpose === 'COMMERCIAL' ? (
                    <>
                      <option value="COMMERCIAL_SHOP">Retail Space & Shop</option>
                      <option value="COMMERCIAL_OFFICE">Corporate Office Space</option>
                      <option value="WAREHOUSE">Warehouse / Industrial</option>
                    </>
                  ) : purpose === 'PLOT' ? (
                    <>
                      <option value="PLOT">Residential Layout Plot</option>
                      <option value="FARM_LAND">Agricultural & Farm Land</option>
                    </>
                  ) : (
                    <>
                      <option value="FLAT">Luxury Apartment / Flat</option>
                      <option value="HOUSE_VILLA">Independent Bungalow / Villa</option>
                      <option value="PENTHOUSE">Exclusive Penthouse</option>
                    </>
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#252525]/40 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Bedrooms or Budget (Span 3) */}
            <div className="md:col-span-3 text-left">
              <label className="block text-[10px] uppercase tracking-widest text-[#252525]/60 font-semibold mb-1.5">
                {purpose === 'PLOT' || purpose === 'COMMERCIAL' ? 'Price Range' : 'Bedrooms (BHK)'}
              </label>
              <div className="relative">
                {purpose === 'PLOT' || purpose === 'COMMERCIAL' ? (
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F7F4ED] border border-[#E9E4DA] focus:border-[#172C3B] text-xs font-medium text-[#252525] outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Any Budget</option>
                    <option value="0-5000000">Up to ₹ 50 Lakhs</option>
                    <option value="5000000-10000000">₹ 50L - ₹ 1 Crore</option>
                    <option value="10000000-25000000">₹ 1 Cr - ₹ 2.5 Crore</option>
                    <option value="25000000-">Above ₹ 2.5 Crore</option>
                  </select>
                ) : (
                  <select
                    value={bhk}
                    onChange={(e) => setBhk(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F7F4ED] border border-[#E9E4DA] focus:border-[#172C3B] text-xs font-medium text-[#252525] outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Any Configuration</option>
                    <option value="1">1 BHK Residence</option>
                    <option value="2">2 BHK Residence</option>
                    <option value="3">3 BHK Premium</option>
                    <option value="4">4 BHK Luxury</option>
                    <option value="5">5+ BHK Estate</option>
                  </select>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-[#252525]/40 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Search Button (Span 2) */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-[#172C3B] hover:bg-[#223D52] text-[#FFFFFF] text-xs uppercase tracking-luxury font-medium py-3 px-4 border border-[#B89A65]/40 transition-colors flex items-center justify-center space-x-2"
              >
                <Search className="w-3.5 h-3.5 text-[#B89A65]" />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>

        {/* Minimal Enclave Bar */}
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#E9E4DA]/80">
          <span className="font-serif italic text-white">Distinguished Enclaves:</span>
          {NAGPUR_POPULAR_LOCALITIES.slice(0, 5).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => navigate(`/properties?locality=${loc}`)}
              className="hover:text-[#B89A65] underline decoration-[#B89A65]/50 underline-offset-4 transition-colors"
            >
              {loc}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
