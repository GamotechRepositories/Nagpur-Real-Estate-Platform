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
    <section className="relative bg-[#172C3B] text-white pt-8 sm:pt-14 pb-12 sm:pb-16 overflow-hidden w-full max-w-full">
      {/* Background Architectural Accent & Soft Lighting */}
      <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80"
          alt="Nagpur Architecture"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#B89A65]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Split Hero Layout as in Reference Image Screen 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Heading + Subtitle + Search Card */}
          <div className="lg:col-span-7 space-y-6 w-full min-w-0">
            <div className="space-y-3">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                Find Your Place in Nagpur.
              </h1>
              <p className="text-sm sm:text-base text-white/80 font-normal max-w-xl leading-relaxed">
                Discover exceptional properties, trusted agents, and the perfect place to call home.
              </p>
            </div>

            {/* Prominent Floating Search Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 text-[#252525] shadow-2xl border border-[#E9E4DA] w-full min-w-0">
              {/* Category Tabs: Buy | Rent | Plots | Commercial */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 pb-3 sm:pb-4 mb-4 border-b border-gray-100 overflow-x-auto">
                {['Buy', 'Rent', 'Plots', 'Commercial'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                      activeTab === tab
                        ? 'bg-[#F7F4ED] text-[#172C3B] border border-[#B89A65]/40 shadow-sm'
                        : 'text-gray-500 hover:text-[#172C3B] hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Form Input Controls */}
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Select Locality */}
                  <div className="relative">
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
                        placeholder="Dharampeth, Manish..."
                        className="w-full pl-9 pr-7 py-2 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] focus:bg-white text-gray-800 placeholder-gray-400"
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
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                      Property Type
                    </label>
                    <div className="relative">
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] focus:bg-white text-gray-800 cursor-pointer"
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
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                      Budget
                    </label>
                    <div className="relative">
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] focus:bg-white text-gray-800 cursor-pointer"
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
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                      Bedrooms
                    </label>
                    <div className="relative">
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] focus:bg-white text-gray-800 cursor-pointer"
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
                </div>

                {/* Search Button (Full width or aligned right) */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-2.5 bg-[#B89A65] hover:bg-[#A38753] text-white font-semibold text-sm rounded-lg transition-colors shadow-md flex items-center justify-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: High Quality Modern Luxury Architecture Building Photo */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 aspect-[4/3] group">
              <img
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=85"
                alt="Luxury Residences in Nagpur"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg flex items-center justify-between text-charcoal">
                <div>
                  <p className="text-xs font-bold text-[#172C3B]">Skyline Residency</p>
                  <p className="text-[10px] text-gray-500">Wardha Road, Nagpur • From ₹82 Lakh</p>
                </div>
                <span className="text-[10px] bg-[#B89A65] text-white font-semibold px-2 py-1 rounded">
                  Featured
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Feature Items Bar below Hero (Screen 1 & 2) */}
        <div className="mt-8 sm:mt-12 bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-[#E9E4DA] text-[#252525] w-full overflow-hidden">
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
  );
};

export default HeroSearch;
