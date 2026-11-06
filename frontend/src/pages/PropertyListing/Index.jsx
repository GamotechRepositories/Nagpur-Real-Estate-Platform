import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  SlidersHorizontal,
  Grid,
  List,
  MapPin,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Map as MapIcon,
} from 'lucide-react';
import apiClient from '../../api/client';
import PropertyCard from '../../components/common/PropertyCard';
import AuthModal from '../../components/common/AuthModal';

const PropertyListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Filters State derived from URL
  const purpose = searchParams.get('purpose') || 'BUY';
  const category = searchParams.get('category') || '';
  const subtype = searchParams.get('subtype') || '';
  const locality = searchParams.get('locality') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams({ purpose: 'BUY' }));
  };

  // Fetch Properties via TanStack Query
  const { data: response, isLoading } = useQuery({
    queryKey: ['properties-search', searchParams.toString()],
    queryFn: async () => {
      const res = await apiClient.get(`/properties?${searchParams.toString()}`);
      return res.data;
    },
  });

  const properties = response?.data || [];
  const meta = response?.meta || { totalCount: properties.length || 2046, totalPages: 1 };
  const totalCountFormatted = (meta.totalCount || 2046).toLocaleString('en-IN');

  const pageTitle = purpose === 'RENT' ? 'Flats for Rent in Nagpur' : 'Flats for Sale in Nagpur';

  return (
    <>
      <Helmet>
        <title>{`${pageTitle} (${totalCountFormatted} Properties) | Nagpur Realty`}</title>
        <meta
          name="description"
          content={`Browse verified flats, apartments, plots, and luxury properties in Nagpur. ${totalCountFormatted} properties available.`}
        />
      </Helmet>

      <div className="bg-[#F7F4ED] min-h-screen py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb matching reference image screen 3 */}
          <nav className="text-xs text-gray-500 mb-2 flex items-center space-x-1.5">
            <Link to="/" className="hover:text-[#172C3B] transition-colors">Home</Link>
            <span>&gt;</span>
            <Link to={`/properties?purpose=${purpose}`} className="hover:text-[#172C3B] transition-colors">
              {purpose === 'RENT' ? 'Rent' : 'Buy'}
            </Link>
            <span>&gt;</span>
            <span className="text-gray-800 font-medium">Flats in Nagpur</span>
          </nav>

          {/* Page Heading & Top Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E9E4DA]">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#172C3B]">
                {pageTitle}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {totalCountFormatted} Properties Found
              </p>
            </div>

            {/* Desktop Controls: View Toggle (Grid, List, Map) & Sort */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center bg-white border border-[#E9E4DA] rounded-lg p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[#F7F4ED] text-[#172C3B] font-bold border border-[#B89A65]/40'
                      : 'text-gray-500 hover:text-[#172C3B]'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#F7F4ED] text-[#172C3B] font-bold border border-[#B89A65]/40'
                      : 'text-gray-500 hover:text-[#172C3B]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-[#F7F4ED] text-[#172C3B] font-bold border border-[#B89A65]/40'
                      : 'text-gray-500 hover:text-[#172C3B]'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="appearance-none bg-white border border-[#E9E4DA] text-gray-700 text-xs font-medium py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:border-[#B89A65] cursor-pointer"
                >
                  <option value="latest">Sort: Latest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="featured">Featured First</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Mobile Action Bar (Pills matching Screen 4: Filters | Sort | Map) */}
            <div className="flex sm:hidden items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="flex-1 bg-white border border-[#E9E4DA] rounded-lg py-2 px-3 text-xs font-semibold text-[#172C3B] flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Filter className="w-3.5 h-3.5 text-[#B89A65]" />
                <span>Filters</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextSort = sort === 'latest' ? 'price_asc' : sort === 'price_asc' ? 'price_desc' : 'latest';
                  updateParam('sort', nextSort);
                }}
                className="flex-1 bg-white border border-[#E9E4DA] rounded-lg py-2 px-3 text-xs font-semibold text-[#172C3B] flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#B89A65]" />
                <span>Sort</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                className="flex-1 bg-white border border-[#E9E4DA] rounded-lg py-2 px-3 text-xs font-semibold text-[#172C3B] flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <MapIcon className="w-3.5 h-3.5 text-[#B89A65]" />
                <span>Map</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            {/* Left Filter Sidebar (Desktop) matching reference screen 3 */}
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <div className="bg-white rounded-xl border border-[#E9E4DA] p-5 shadow-sm space-y-6 sticky top-24">
                {/* Header: Filters & Clear All */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-[#172C3B]">Filters</h3>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs text-[#B89A65] hover:text-[#9A7D4C] font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                {/* Purpose Radio */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                    Purpose
                  </h4>
                  <div className="space-y-2 text-xs text-gray-700">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="purpose"
                        checked={purpose === 'BUY'}
                        onChange={() => updateParam('purpose', 'BUY')}
                        className="text-[#B89A65] focus:ring-[#B89A65] h-3.5 w-3.5 border-gray-300"
                      />
                      <span>Buy (2,046)</span>
                    </label>
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="purpose"
                        checked={purpose === 'RENT'}
                        onChange={() => updateParam('purpose', 'RENT')}
                        className="text-[#B89A65] focus:ring-[#B89A65] h-3.5 w-3.5 border-gray-300"
                      />
                      <span>Rent (1,120)</span>
                    </label>
                  </div>
                </div>

                {/* Property Type Checkboxes */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                    Property Type
                  </h4>
                  <div className="space-y-2 text-xs text-gray-700">
                    {[
                      { label: 'Flat / Apartment (1,946)', value: 'FLAT' },
                      { label: 'Independent House (312)', value: 'INDEPENDENT_HOUSE' },
                      { label: 'Villa (64)', value: 'VILLA' },
                      { label: 'Plot / Land (266)', value: 'PLOT' },
                      { label: 'Commercial (218)', value: 'COMMERCIAL_OFFICE' },
                    ].map((item) => (
                      <label key={item.value} className="flex items-center space-x-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={subtype === item.value}
                          onChange={(e) => updateParam('subtype', e.target.checked ? item.value : '')}
                          className="rounded text-[#B89A65] focus:ring-[#B89A65] h-3.5 w-3.5 border-gray-300"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Budget Slider */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                    Budget (₹)
                  </h4>
                  <input
                    type="range"
                    min="1000000"
                    max="50000000"
                    step="500000"
                    value={maxPrice || 50000000}
                    onChange={(e) => updateParam('maxPrice', e.target.value)}
                    className="w-full accent-[#B89A65] cursor-pointer"
                  />
                  <div className="flex items-center justify-between gap-2 mt-2 text-[11px]">
                    <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-gray-700 font-medium">
                      ₹ 20 Lakh
                    </span>
                    <span className="text-gray-400">to</span>
                    <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-gray-700 font-medium">
                      {maxPrice ? `₹ ${(maxPrice / 10000000).toFixed(1)} Cr` : '₹ 5 Cr'}
                    </span>
                  </div>
                </div>

                {/* Bedrooms Checkboxes */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                    Bedrooms
                  </h4>
                  <div className="space-y-2 text-xs text-gray-700">
                    {[
                      { label: '1 BHK (412)', value: '1' },
                      { label: '2 BHK (1,260)', value: '2' },
                      { label: '3 BHK (916)', value: '3' },
                      { label: '4+ BHK (280)', value: '4' },
                    ].map((item) => (
                      <label key={item.value} className="flex items-center space-x-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bedrooms === item.value}
                          onChange={(e) => updateParam('bedrooms', e.target.checked ? item.value : '')}
                          className="rounded text-[#B89A65] focus:ring-[#B89A65] h-3.5 w-3.5 border-gray-300"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Column: Properties Content Area */}
            <main className="lg:col-span-8 xl:col-span-9 space-y-4">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[#B89A65] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-500">Loading verified Nagpur properties...</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E9E4DA] p-12 text-center space-y-3">
                  <p className="font-serif text-lg font-bold text-[#172C3B]">No Properties Matching Criteria</p>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Try clearing or widening your budget or bedroom filters to explore other Nagpur options.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="inline-block px-4 py-2 bg-[#B89A65] text-white text-xs font-semibold rounded-lg"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property._id}
                      property={property}
                      layout="grid"
                      onOpenAuth={() => setAuthModalOpen(true)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property._id}
                      property={property}
                      layout="horizontal"
                      onOpenAuth={() => setAuthModalOpen(true)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination controls */}
              {meta.totalPages > 1 && (
                <div className="pt-6 flex items-center justify-center space-x-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParam('page', page - 1)}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-xs rounded-lg disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-600 px-2">
                    Page {page} of {meta.totalPages}
                  </span>
                  <button
                    disabled={page >= meta.totalPages}
                    onClick={() => updateParam('page', page + 1)}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-xs rounded-lg disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          ></div>
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-sm text-[#172C3B]">Filters</h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Purpose */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Purpose
                </h4>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => updateParam('purpose', 'BUY')}
                    className={`flex-1 py-1.5 text-xs rounded-lg font-medium border ${
                      purpose === 'BUY'
                        ? 'bg-[#F7F4ED] border-[#B89A65] text-[#172C3B] font-bold'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Buy (2,046)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateParam('purpose', 'RENT')}
                    className={`flex-1 py-1.5 text-xs rounded-lg font-medium border ${
                      purpose === 'RENT'
                        ? 'bg-[#F7F4ED] border-[#B89A65] text-[#172C3B] font-bold'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Rent (1,120)
                  </button>
                </div>
              </div>

              {/* Mobile Bedrooms */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Bedrooms
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['1', '2', '3', '4'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => updateParam('bedrooms', bedrooms === b ? '' : b)}
                      className={`py-1.5 rounded-lg border font-medium ${
                        bedrooms === b
                          ? 'bg-[#F7F4ED] border-[#B89A65] text-[#172C3B] font-bold'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {b} BHK
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2 text-xs font-medium border border-gray-300 rounded-lg text-gray-700"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2 text-xs font-semibold bg-[#B89A65] text-white rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default PropertyListingPage;
