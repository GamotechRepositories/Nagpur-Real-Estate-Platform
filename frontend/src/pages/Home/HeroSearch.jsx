import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MapPin,
  Building2,
  Wallet,
  Bed,
  ChevronDown,
  ShieldCheck,
  Users,
  Home,
  Landmark,
} from 'lucide-react';

const NAGPUR_POPULAR_LOCALITIES = [
  'Dharampeth, Nagpur',
  'Civil Lines, Nagpur',
  'Ramdaspeth, Nagpur',
  'Manish Nagar, Nagpur',
  'Wardha Road, Nagpur',
  'Besa, Nagpur',
  'Shankar Nagar, Nagpur',
  'Sitabuldi, Nagpur',
];

const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'FLAT', label: 'Flat / Apartment' },
  { value: 'INDEPENDENT_HOUSE', label: 'Independent House' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'PLOT', label: 'Plot / Land' },
  { value: 'COMMERCIAL_OFFICE', label: 'Commercial Office' },
];

const BUDGET_OPTIONS = [
  { value: '', label: '₹ Min - ₹ Max' },
  { value: '0-5000000', label: 'Under ₹50 Lakh' },
  { value: '5000000-10000000', label: '₹50 Lakh - ₹1 Cr' },
  { value: '10000000-20000000', label: '₹1 Cr - ₹2 Cr' },
  { value: '20000000-50000000', label: '₹2 Cr - ₹5 Cr' },
  { value: '50000000-999999999', label: 'Above ₹5 Cr' },
];

const BEDROOM_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1 BHK' },
  { value: '2', label: '2 BHK' },
  { value: '3', label: '3 BHK' },
  { value: '4', label: '4+ BHK' },
];

const HeroSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Buy'); // 'Buy', 'Rent', 'Plots', 'Commercial'
  const [locality, setLocality] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [budget, setBudget] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();

    if (activeTab === 'Plots') {
      params.append('category', 'PLOT');
      params.append('purpose', 'BUY');
    } else if (activeTab === 'Commercial') {
      params.append('category', 'COMMERCIAL');
    } else if (activeTab === 'Rent') {
      params.append('purpose', 'RENT');
    } else {
      params.append('purpose', 'BUY');
    }

    if (locality) {
      const cleanLocality = locality.replace(', Nagpur', '').trim();
      params.append('locality', cleanLocality);
    }
    if (propertyType) params.append('subtype', propertyType);
    if (bedrooms) params.append('bedrooms', bedrooms);

    if (budget) {
      const [min, max] = budget.split('-');
      if (min) params.append('minPrice', min);
      if (max) params.append('maxPrice', max);
    }

    navigate(`/properties?${params.toString()}`);
  };

  const getPropertyTypeLabel = () => {
    const found = PROPERTY_TYPES.find((p) => p.value === propertyType);
    return found ? found.label : 'All Types';
  };

  const getBudgetLabel = () => {
    const found = BUDGET_OPTIONS.find((b) => b.value === budget);
    return found ? found.label : '₹ Min - ₹ Max';
  };

  const getBedroomsLabel = () => {
    const found = BEDROOM_OPTIONS.find((b) => b.value === bedrooms);
    return found ? found.label : 'Any';
  };

  const getLocalityLabel = () => {
    return locality || 'Dharampeth, Nagpur';
  };

  return (
    <>
      {/* Hero Section matching exact Image 1 (Desktop) & Image 2 (Mobile) */}
      <section className="relative bg-[#0F1E28] text-white pt-8 sm:pt-14 pb-12 sm:pb-16 overflow-hidden w-full max-w-full min-h-[580px] sm:min-h-[620px] lg:min-h-[660px] flex flex-col justify-between">
        {/* Desktop Background Image (2nd Image provided by user) */}
        <img
          src="/images/hero-desktop.jpg"
          alt="Nagpur Luxury Residences"
          className="hidden md:block absolute inset-0 w-full h-full object-cover object-right lg:object-[82%_center] filter brightness-[0.98]"
        />

        {/* Desktop Gradient Overlay - Soft, revealing building & trees on right */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#0F1E28]/90 via-[#0F1E28]/50 via-32% to-transparent pointer-events-none"></div>
        <div className="hidden md:block absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0F1E28]/40 to-transparent pointer-events-none"></div>

        {/* Mobile Background Image (3rd Image provided by user) */}
        <img
          src="/images/hero-mobile.jpg"
          alt="Nagpur Luxury Residences"
          className="block md:hidden absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.98]"
        />

        {/* Mobile Gradient Overlay */}
        <div className="block md:hidden absolute inset-0 bg-gradient-to-b from-[#0F1E28]/80 via-[#0F1E28]/50 via-35% to-[#0F1E28]/85 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-1 flex flex-col justify-between">
          {/* Headline & Subhead on Left matching Images 1 & 2 */}
          <div className="max-w-xl space-y-3 pt-3 sm:pt-6">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.12] drop-shadow-sm">
              Find Your Place<br /> in Nagpur.
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-white/90 font-normal max-w-lg leading-relaxed pt-1 drop-shadow-xs">
              Discover exceptional properties, trusted agents, and the perfect place to call home.
            </p>
          </div>

          {/* ======================================================== */}
          {/* 1. DESKTOP SEARCH CARD (Matches Image 1 Exactly)         */}
          {/* ======================================================== */}
          <div className="hidden md:block mt-12 mb-2 bg-white rounded-2xl p-5 text-[#252525] shadow-lg border border-gray-100/90 w-full">
            {/* Category Tabs: Buy | Rent | Plots | Commercial */}
            <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-gray-100">
              {['Buy', 'Rent', 'Plots', 'Commercial'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === tab
                      ? 'bg-[#F3E5CC] text-[#172C3B] border border-[#B89A65]/40 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-[#172C3B] hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Desktop Form: 5 Horizontal Columns */}
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-12 gap-3 items-end">
                {/* Select Locality (3.5 cols) */}
                <div className="col-span-3 min-w-0 relative">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                    Select Locality
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <MapPin className="w-4 h-4 text-[#B89A65]" />
                    </div>
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => {
                        setLocality(e.target.value);
                        setShowLocalityDropdown(true);
                      }}
                      onFocus={() => setShowLocalityDropdown(true)}
                      placeholder="Dharampeth, Manish Nagar, ..."
                      className="w-full pl-9 pr-7 h-[42px] text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] text-gray-800 placeholder-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {showLocalityDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowLocalityDropdown(false)}
                      />
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
                        {NAGPUR_POPULAR_LOCALITIES.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setLocality(loc);
                              setShowLocalityDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-[#F7F4ED] text-gray-700 hover:text-[#172C3B]"
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Property Type (2 cols) */}
                <div className="col-span-2 min-w-0">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                    Property Type
                  </label>
                  <div className="relative">
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full h-[42px] appearance-none pl-3 pr-8 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] text-gray-800 cursor-pointer"
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Budget (2.5 cols) */}
                <div className="col-span-2 min-w-0">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                    Budget
                  </label>
                  <div className="relative">
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full h-[42px] appearance-none pl-3 pr-8 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] text-gray-800 cursor-pointer"
                    >
                      {BUDGET_OPTIONS.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Bedrooms (2 cols) */}
                <div className="col-span-2 min-w-0">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                    Bedrooms
                  </label>
                  <div className="relative">
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full h-[42px] appearance-none pl-3 pr-8 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] text-gray-800 cursor-pointer"
                    >
                      {BEDROOM_OPTIONS.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Search Button (2.5 cols) */}
                <div className="col-span-3">
                  <button
                    type="submit"
                    className="w-full h-[42px] bg-[#B89A65] hover:bg-[#A38753] text-white font-semibold text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* ======================================================== */}
          {/* 2. MOBILE SEARCH CARD (Matches Image 2 Exactly)           */}
          {/* ======================================================== */}
          <div className="block md:hidden mt-8 bg-white rounded-2xl p-4 text-[#252525] shadow-xl border border-gray-100/90 w-full">
            {/* Category Tabs: Buy | Rent | Plots | Commercial */}
            <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-gray-100 overflow-x-auto scrollbar-none">
              {['Buy', 'Rent', 'Plots', 'Commercial'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === tab
                      ? 'bg-[#F3E5CC] text-[#172C3B] border border-[#B89A65]/40 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-[#172C3B] hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Mobile Stacked 4 Boxes with Icon + Labels + Chevron (Image 2) */}
            <form onSubmit={handleSearch} className="space-y-2.5">
              {/* Field 1: Locality */}
              <div className="relative border border-gray-200 rounded-xl px-3 py-2 flex items-center justify-between bg-white hover:border-[#B89A65]/60 transition-colors">
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <MapPin className="w-4 h-4 text-gray-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-gray-400 font-medium block leading-none mb-0.5">
                      Select Locality
                    </span>
                    <span className="text-xs font-semibold text-gray-800 block truncate leading-tight">
                      {getLocalityLabel()}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                >
                  <option value="">Dharampeth, Nagpur</option>
                  {NAGPUR_POPULAR_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Property Type */}
              <div className="relative border border-gray-200 rounded-xl px-3 py-2 flex items-center justify-between bg-white hover:border-[#B89A65]/60 transition-colors">
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <Building2 className="w-4 h-4 text-gray-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-gray-400 font-medium block leading-none mb-0.5">
                      Property Type
                    </span>
                    <span className="text-xs font-semibold text-gray-800 block truncate leading-tight">
                      {getPropertyTypeLabel()}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3: Budget */}
              <div className="relative border border-gray-200 rounded-xl px-3 py-2 flex items-center justify-between bg-white hover:border-[#B89A65]/60 transition-colors">
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <Wallet className="w-4 h-4 text-gray-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-gray-400 font-medium block leading-none mb-0.5">
                      Budget
                    </span>
                    <span className="text-xs font-semibold text-gray-800 block truncate leading-tight">
                      {getBudgetLabel()}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                >
                  {BUDGET_OPTIONS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 4: Bedrooms */}
              <div className="relative border border-gray-200 rounded-xl px-3 py-2 flex items-center justify-between bg-white hover:border-[#B89A65]/60 transition-colors">
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <Bed className="w-4 h-4 text-gray-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-gray-400 font-medium block leading-none mb-0.5">
                      Bedrooms
                    </span>
                    <span className="text-xs font-semibold text-gray-800 block truncate leading-tight">
                      {getBedroomsLabel()}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                >
                  {BEDROOM_OPTIONS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Width Gold Search Button (Image 2) */}
              <button
                type="submit"
                className="w-full py-3 bg-[#B89A65] hover:bg-[#A38753] text-white font-semibold text-sm rounded-xl transition-colors shadow-md mt-1"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. 4 FEATURE ITEMS BAR BELOW HERO (Matches Image 1)       */}
      {/* ======================================================== */}
      <section className="bg-white border-b border-gray-100 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-gray-100">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center px-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#F7F4ED] border border-[#B89A65]/30 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-[#172C3B]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#172C3B]">Verified Properties</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">100% Verified Listings</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center px-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#F7F4ED] border border-[#B89A65]/30 flex items-center justify-center shrink-0 shadow-xs">
                <Users className="w-6 h-6 text-[#172C3B]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#172C3B]">Trusted Agents</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">RERA Registered</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center px-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#F7F4ED] border border-[#B89A65]/30 flex items-center justify-center shrink-0 shadow-xs">
                <Home className="w-6 h-6 text-[#172C3B]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#172C3B]">Easy Site Visit</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Book at Your Convenience</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center px-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#F7F4ED] border border-[#B89A65]/30 flex items-center justify-center shrink-0 shadow-xs">
                <Landmark className="w-6 h-6 text-[#172C3B]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#172C3B]">Home Loan Support</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Get Best Loan Options</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSearch;
