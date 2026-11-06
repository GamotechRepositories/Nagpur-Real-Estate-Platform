import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  SlidersHorizontal,
  Grid,
  List,
  Search,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import apiClient from '../../api/client';
import PropertyCard from '../../components/common/PropertyCard';
import AuthModal from '../../components/common/AuthModal';

const NAGPUR_LOCALITIES = [
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

const PropertyListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Filters State derived from URL
  const purpose = searchParams.get('purpose') || '';
  const category = searchParams.get('category') || '';
  const subtype = searchParams.get('subtype') || '';
  const locality = searchParams.get('locality') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const furnishing = searchParams.get('furnishing') || '';
  const possessionStatus = searchParams.get('possessionStatus') || '';
  const isVerified = searchParams.get('isVerified') || '';
  const isFeatured = searchParams.get('isFeatured') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Form input local state for smooth filter editing
  const [localLocality, setLocalLocality] = useState(locality);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  useEffect(() => {
    setLocalLocality(locality);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [locality, minPrice, maxPrice]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
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
  const meta = response?.meta || { totalCount: 0, totalPages: 1 };

  return (
    <>
      <Helmet>
        <title>
          {locality
            ? `Properties in ${locality}, Nagpur — Flats, Plots & Villas`
            : 'Properties for Sale and Rent in Nagpur — Nagpur Real Estate'}
        </title>
        <meta
          name="description"
          content={`Browse verified real estate properties in ${locality || 'Nagpur'}. Buy and rent flats, plots, apartments with transparent pricing and RERA verification.`}
        />
      </Helmet>

      <div className="bg-slate-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Title */}
          <div className="mb-6">
            <nav className="text-xs text-slate-500 mb-2 flex items-center space-x-1.5">
              <Link to="/" className="hover:text-brand-orange">Home</Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Nagpur Properties</span>
              {locality && (
                <>
                  <span>/</span>
                  <span className="text-brand-orange font-bold">{locality}</span>
                </>
              )}
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
                  {locality ? `Properties in ${locality}, Nagpur` : 'Properties for Sale & Rent in Nagpur'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Showing <strong>{meta.totalCount}</strong> verified properties
                </p>
              </div>

              {/* View layout & Mobile filter button */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center space-x-1.5 bg-white border border-slate-200 py-2 px-3.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm"
                >
                  <SlidersHorizontal className="w-4 h-4 text-brand-orange" />
                  <span>Filters</span>
                </button>

                {/* Sort selector */}
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="bg-white border border-slate-200 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                >
                  <option value="latest">Sort: Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="area_desc">Area: High to Low</option>
                  <option value="featured">Featured First</option>
                </select>

                {/* Grid / List layout switcher */}
                <div className="hidden sm:flex border border-slate-200 rounded-xl bg-white p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-slate-100 text-brand-orange' : 'text-slate-400'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-slate-100 text-brand-orange' : 'text-slate-400'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid: Sidebar + Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Desktop Filters Sidebar (Span 3) */}
            <aside className="hidden lg:block lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200 shadow-card sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <span className="text-sm font-black text-brand-navy flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-brand-orange" />
                  <span>Filter Properties</span>
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-brand-orange font-bold hover:underline"
                >
                  Reset All
                </button>
              </div>

              <div className="space-y-6 text-xs font-semibold text-slate-700">
                {/* Purpose Tab */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Purpose
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['BUY', 'RENT'].map((p) => (
                      <button
                        key={p}
                        onClick={() => updateParam('purpose', purpose === p ? '' : p)}
                        className={`py-2 px-3 rounded-xl border text-center transition-all ${
                          purpose === p
                            ? 'border-brand-navy bg-brand-navy text-white shadow-sm'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {p === 'BUY' ? 'Buy / Sale' : 'Rent / Lease'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nagpur Locality */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Nagpur Locality
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => updateParam('locality', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  >
                    <option value="">All Nagpur Localities</option>
                    {NAGPUR_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Property Type
                  </label>
                  <select
                    value={subtype}
                    onChange={(e) => updateParam('subtype', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  >
                    <option value="">All Types</option>
                    <option value="FLAT">Flat / Apartment</option>
                    <option value="HOUSE_VILLA">Independent House / Villa</option>
                    <option value="PLOT">Residential Plot</option>
                    <option value="COMMERCIAL_SHOP">Commercial Shop</option>
                    <option value="COMMERCIAL_OFFICE">Office Space</option>
                  </select>
                </div>

                {/* Bedrooms (BHK) */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Bedrooms (BHK)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['1', '2', '3', '4', '5'].map((b) => (
                      <button
                        key={b}
                        onClick={() => updateParam('bedrooms', bedrooms === b ? '' : b)}
                        className={`w-10 h-10 rounded-xl border font-bold text-xs flex items-center justify-center transition-all ${
                          bedrooms === b
                            ? 'border-brand-orange bg-brand-orange text-white'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {b}{b === '5' ? '+' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Furnishing */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Furnishing
                  </label>
                  <select
                    value={furnishing}
                    onChange={(e) => updateParam('furnishing', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  >
                    <option value="">Any Furnishing</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                    <option value="SEMI_FURNISHED">Semi-Furnished</option>
                    <option value="FULLY_FURNISHED">Fully Furnished</option>
                  </select>
                </div>

                {/* Verified Only Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVerified === 'true'}
                      onChange={(e) => updateParam('isVerified', e.target.checked ? 'true' : '')}
                      className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange accent-brand-orange"
                    />
                    <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Properties Only</span>
                    </span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Listings Section (Span 9) */}
            <main className="lg:col-span-9 space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
                  ))}
                </div>
              ) : properties.length > 0 ? (
                <>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-6'
                    }
                  >
                    {properties.map((property) => (
                      <PropertyCard
                        key={property._id}
                        property={property}
                        onOpenAuth={() => setAuthModalOpen(true)}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {meta.totalPages > 1 && (
                    <div className="pt-8 flex items-center justify-center space-x-2">
                      <button
                        disabled={page <= 1}
                        onClick={() => updateParam('page', (page - 1).toString())}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => updateParam('page', p.toString())}
                          className={`w-10 h-10 rounded-xl font-bold text-xs ${
                            page === p
                              ? 'bg-brand-navy text-white shadow-md'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}

                      <button
                        disabled={page >= meta.totalPages}
                        onClick={() => updateParam('page', (page + 1).toString())}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-orange-50 text-brand-orange flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No properties matched your criteria</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try broadening your filters or clearing locality and budget constraints to view more properties in Nagpur.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-brand-teal hover:bg-brand-teal-light text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default PropertyListingPage;

