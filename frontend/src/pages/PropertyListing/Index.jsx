import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  SlidersHorizontal,
  Grid,
  List,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  RotateCcw,
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
  const isVerified = searchParams.get('isVerified') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1', 10);

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
            ? `Curated Properties in ${locality}, Nagpur | Nagpur Estates`
            : 'Properties For Sale & Executive Lease in Nagpur | Nagpur Estates'}
        </title>
        <meta
          name="description"
          content={`Browse verified luxury apartments, independent villas, and NMRDA sanctioned plots in ${locality || 'Nagpur'}. Curated by Nagpur Estates.`}
        />
      </Helmet>

      <div className="bg-ivory-light min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Header */}
          <div className="mb-8">
            <nav className="text-xs uppercase tracking-luxury text-charcoal-muted mb-3 flex items-center space-x-2">
              <Link to="/" className="hover:text-navy transition-colors font-medium">Home</Link>
              <span>/</span>
              <span className="text-navy font-semibold">Nagpur Portfolio</span>
              {locality && (
                <>
                  <span>/</span>
                  <span className="text-gold font-bold">{locality}</span>
                </>
              )}
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-beige pb-6">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl text-navy font-normal tracking-tight">
                  {locality ? `Distinguished Residences in ${locality}` : 'Nagpur Curated Property Portfolio'}
                </h1>
                <p className="text-xs text-charcoal-muted mt-2 font-sans">
                  Presenting <span className="font-semibold text-navy">{meta.totalCount}</span> verified residential and commercial assets
                </p>
              </div>

              {/* View Layout & Filters Control */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center space-x-2 bg-white border border-beige py-2 px-3.5 text-xs uppercase tracking-luxury font-medium text-navy shadow-subtle"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-gold" />
                  <span>Filters</span>
                </button>

                {/* Sort selector */}
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="bg-white border border-beige py-2 px-3 text-xs text-charcoal focus:outline-none focus:border-gold font-sans font-medium"
                >
                  <option value="latest">Sort: Newest Acquisitions</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="area_desc">Area: Largest First</option>
                  <option value="featured">Featured First</option>
                </select>

                {/* Grid / List switcher */}
                <div className="hidden sm:flex border border-beige bg-white">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-navy text-white' : 'text-charcoal-muted hover:text-navy'}`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-navy text-white' : 'text-charcoal-muted hover:text-navy'}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid: Sidebar + Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 bg-white p-6 border border-beige shadow-subtle sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-beige mb-6">
                <span className="font-serif text-sm font-semibold uppercase tracking-luxury text-navy flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-gold" />
                  <span>Refine Selection</span>
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] uppercase tracking-luxury text-charcoal-muted hover:text-navy flex items-center transition-colors"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </button>
              </div>

              <div className="space-y-6 text-xs text-charcoal">
                {/* Purpose */}
                <div>
                  <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted font-medium mb-2.5">
                    Acquisition Purpose
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Buy / Own', value: 'BUY' },
                      { label: 'Lease / Rent', value: 'RENT' },
                    ].map((p) => (
                      <button
                        key={p.value}
                        onClick={() => updateParam('purpose', purpose === p.value ? '' : p.value)}
                        className={`py-2 px-2 border text-center transition-colors text-xs font-medium tracking-luxury uppercase ${
                          purpose === p.value
                            ? 'border-navy bg-navy text-white'
                            : 'border-beige bg-ivory-light text-charcoal hover:border-gold'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nagpur Locality */}
                <div>
                  <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted font-medium mb-2">
                    Enclave / Corridor
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => updateParam('locality', e.target.value)}
                    className="w-full p-2.5 border border-beige bg-ivory-light font-sans text-xs text-charcoal focus:outline-none focus:border-gold"
                  >
                    <option value="">All Nagpur Enclaves</option>
                    {NAGPUR_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted font-medium mb-2">
                    Asset Class
                  </label>
                  <select
                    value={subtype}
                    onChange={(e) => updateParam('subtype', e.target.value)}
                    className="w-full p-2.5 border border-beige bg-ivory-light font-sans text-xs text-charcoal focus:outline-none focus:border-gold"
                  >
                    <option value="">All Categories</option>
                    <option value="FLAT">Luxury Apartment / Flat</option>
                    <option value="HOUSE_VILLA">Independent Villa / Bungalow</option>
                    <option value="PLOT">NMRDA Sanctioned Plot</option>
                    <option value="COMMERCIAL_SHOP">Retail Commercial Suite</option>
                    <option value="COMMERCIAL_OFFICE">Corporate Office Space</option>
                  </select>
                </div>

                {/* Bedrooms (BHK) */}
                <div>
                  <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted font-medium mb-2">
                    Bedrooms (BHK)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['1', '2', '3', '4', '5'].map((b) => (
                      <button
                        key={b}
                        onClick={() => updateParam('bedrooms', bedrooms === b ? '' : b)}
                        className={`w-9 h-9 border text-xs font-semibold flex items-center justify-center transition-colors ${
                          bedrooms === b
                            ? 'border-navy bg-navy text-white'
                            : 'border-beige bg-ivory-light text-charcoal hover:border-gold'
                        }`}
                      >
                        {b}{b === '5' ? '+' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verified Only Checkbox */}
                <div className="pt-2 border-t border-beige">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVerified === 'true'}
                      onChange={(e) => updateParam('isVerified', e.target.checked ? 'true' : '')}
                      className="w-4 h-4 accent-gold"
                    />
                    <span className="text-xs text-navy font-medium flex items-center space-x-1.5 font-sans">
                      <ShieldCheck className="w-4 h-4 text-gold" />
                      <span>MahaRERA Verified Only</span>
                    </span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 flex lg:hidden">
                <div
                  className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm"
                  onClick={() => setMobileFilterOpen(false)}
                />
                <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-card z-10 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-beige">
                    <span className="font-serif text-base text-navy font-semibold">Filter Portfolio</span>
                    <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-charcoal-muted">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-2 font-medium">
                      Purpose
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['BUY', 'RENT'].map((p) => (
                        <button
                          key={p}
                          onClick={() => updateParam('purpose', purpose === p ? '' : p)}
                          className={`py-2 px-2 border text-center text-xs font-medium uppercase ${
                            purpose === p
                              ? 'border-navy bg-navy text-white'
                              : 'border-beige bg-ivory text-charcoal'
                          }`}
                        >
                          {p === 'BUY' ? 'Buy' : 'Rent'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Locality */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-2 font-medium">
                      Locality
                    </label>
                    <select
                      value={locality}
                      onChange={(e) => updateParam('locality', e.target.value)}
                      className="w-full p-2.5 border border-beige bg-ivory text-xs"
                    >
                      <option value="">All Nagpur Enclaves</option>
                      {NAGPUR_LOCALITIES.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Verified */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isVerified === 'true'}
                        onChange={(e) => updateParam('isVerified', e.target.checked ? 'true' : '')}
                        className="accent-gold w-4 h-4"
                      />
                      <span className="text-xs text-navy font-medium">MahaRERA Verified Only</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-beige flex gap-2">
                    <button
                      onClick={clearAllFilters}
                      className="w-1/2 py-2.5 border border-beige text-xs uppercase tracking-luxury text-charcoal"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="w-1/2 py-2.5 bg-navy text-white text-xs uppercase tracking-luxury"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Listings Section */}
            <main className="lg:col-span-9 space-y-8">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="bg-white border border-beige h-96 animate-pulse"></div>
                  ))}
                </div>
              ) : properties.length > 0 ? (
                <>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
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
                    <div className="pt-10 flex items-center justify-center space-x-2 border-t border-beige mt-10">
                      <button
                        disabled={page <= 1}
                        onClick={() => updateParam('page', (page - 1).toString())}
                        className="p-2.5 border border-beige bg-white text-charcoal hover:border-gold disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => updateParam('page', p.toString())}
                          className={`w-9 h-9 border text-xs font-semibold transition-colors ${
                            page === p
                              ? 'border-navy bg-navy text-white'
                              : 'border-beige bg-white text-charcoal hover:border-gold'
                          }`}
                        >
                          {p}
                        </button>
                      ))}

                      <button
                        disabled={page >= meta.totalPages}
                        onClick={() => updateParam('page', (page + 1).toString())}
                        className="p-2.5 border border-beige bg-white text-charcoal hover:border-gold disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white p-14 text-center border border-beige shadow-subtle space-y-4">
                  <div className="w-14 h-14 border border-gold/40 text-gold flex items-center justify-center mx-auto bg-ivory">
                    <Search className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h3 className="font-serif text-2xl text-navy font-normal">No Properties Matched</h3>
                  <p className="text-xs text-charcoal-muted max-w-sm mx-auto font-sans leading-relaxed">
                    Adjust your corridor selections, budget parameters, or remove specific amenity filters to view broader listings in Nagpur.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="inline-block bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase px-6 py-3 transition-colors mt-2"
                  >
                    Reset All Filters
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
