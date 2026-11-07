import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MapPin,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  CalendarCheck,
  Landmark,
} from 'lucide-react';

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

    if (locality) params.append('locality', locality);
    if (propertyType) params.append('subtype', propertyType);
    if (bedrooms) params.append('bedrooms', bedrooms);

    if (budget) {
      const [min, max] = budget.split('-');
      if (min) params.append('minPrice', min);
      if (max) params.append('maxPrice', max);
    }

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <>
      {/* Hero Section with exact background image and gradient overlay matching Image 1 */}
      <section className="relative bg-[#0F1E28] text-white pt-10 sm:pt-16 pb-14 sm:pb-20 overflow-hidden w-full max-w-full min-h-[540px] sm:min-h-[580px] lg:min-h-[640px] flex items-center">
        {/* Desktop Background Image (Image 2) */}
        <img
          src="/images/hero-desktop.jpg"
          alt="Nagpur Luxury Residences"
          className="hidden md:block absolute inset-0 w-full h-full object-cover object-right lg:object-[85%_center] filter brightness-[0.98]"
        />

        {/* Desktop Gradient Overlay - Soft, reduced shadow that keeps the text readable while revealing more of the building and trees */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#0F1E28]/90 via-[#0F1E28]/50 via-32% to-transparent pointer-events-none"></div>
        <div className="hidden md:block absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0F1E28]/40 to-transparent pointer-events-none"></div>

        {/* Mobile Background Image (Image 3) */}
        <img
          src="/images/hero-mobile.jpg"
          alt="Nagpur Luxury Residences"
          className="block md:hidden absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.98]"
        />

        {/* Mobile Gradient Overlay */}
        <div className="block md:hidden absolute inset-0 bg-gradient-to-b from-[#0F1E28]/80 via-[#0F1E28]/50 via-35% to-[#0F1E28]/85 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full space-y-8 sm:space-y-12">
          {/* Headline & Subhead on Left matching Image 1 */}
          <div className="max-w-xl space-y-3">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.12] drop-shadow-sm">
              Find Your Place<br className="hidden sm:inline" /> in Nagpur.
            </h1>
            <p className="text-sm sm:text-base text-white/90 font-normal max-w-lg leading-relaxed pt-1 drop-shadow-xs">
              Discover exceptional properties, trusted agents, and the perfect place call a home.
            </p>
          </div>

          {/* Prominent Floating Search Card matching Image 1 */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 text-[#252525] shadow-lg border border-gray-100/90 w-full max-w-6xl min-w-0">
            {/* Category Tabs: Buy | Rent | Plots | Commercial */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 pb-3 sm:pb-4 mb-4 border-b border-gray-100 overflow-x-auto scrollbar-none">
              {['Buy', 'Rent', 'Plots', 'Commercial'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === tab
                      ? 'bg-[#F5E6CC] text-[#172C3B] border border-[#B89A65]/40 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-[#172C3B] hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Form Input Controls - 5 Items in Single Row on Desktop matching Image 1 */}
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
                {/* Select Locality */}
                <div className="lg:col-span-3 min-w-0 relative">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">
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
                      className="w-full pl-9 pr-7 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] text-gray-800 placeholder-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {showLocalityDropdown && (
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
                  )}
                </div>

                {/* Property Type */}
                <div className="lg:col-span-2 min-w-0">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">
                    Property Type
                  </label>
                  <div className="relative">
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full appearance-none pl-3 pr-8 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] text-gray-800 cursor-pointer"
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

                {/* Budget */}
                <div className="lg:col-span-2 min-w-0">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">
                    Budget
                  </label>
                  <div className="relative">
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full appearance-none pl-3 pr-8 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] text-gray-800 cursor-pointer"
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

                {/* Bedrooms */}
                <div className="lg:col-span-2 min-w-0">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">
                    Bedrooms
                  </label>
                  <div className="relative">
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full appearance-none pl-3 pr-8 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] text-gray-800 cursor-pointer"
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

                {/* Search Button */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <button
                    type="submit"
                    className="w-full h-[42px] bg-[#B89A65] hover:bg-[#A38753] text-white font-semibold text-sm rounded-lg transition-colors shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 4 Feature Items Bar below Hero */}
      <section className="bg-[#F7F4ED] pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-[#E9E4DA] text-[#252525] w-full overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {/* Feature 1 */}
              <div className="flex items-center space-x-2 sm:space-x-3.5 min-w-0">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#F7F4ED] border border-[#B89A65]/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-[#B89A65]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-[11px] sm:text-sm text-[#172C3B] truncate">Verified Properties</h4>
                  <p className="text-[9px] sm:text-[11px] text-gray-500 truncate">100% Verified</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center space-x-2 sm:space-x-3.5 min-w-0">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#F7F4ED] border border-[#B89A65]/30 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 sm:w-6 sm:h-6 text-[#B89A65]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-[11px] sm:text-sm text-[#172C3B] truncate">Trusted Agents</h4>
                  <p className="text-[9px] sm:text-[11px] text-gray-500 truncate">RERA Registered</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center space-x-2 sm:space-x-3.5 min-w-0">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#F7F4ED] border border-[#B89A65]/30 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-4 h-4 sm:w-6 sm:h-6 text-[#B89A65]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-[11px] sm:text-sm text-[#172C3B] truncate">Easy Site Visit</h4>
                  <p className="text-[9px] sm:text-[11px] text-gray-500 truncate">Book At Convenience</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-center space-x-2 sm:space-x-3.5 min-w-0">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#F7F4ED] border border-[#B89A65]/30 flex items-center justify-center shrink-0">
                  <Landmark className="w-4 h-4 sm:w-6 sm:h-6 text-[#B89A65]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-[11px] sm:text-sm text-[#172C3B] truncate">Home Loan Support</h4>
                  <p className="text-[9px] sm:text-[11px] text-gray-500 truncate">Best Loan Options</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSearch;
