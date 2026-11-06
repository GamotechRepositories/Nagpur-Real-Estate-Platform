import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { MapPin, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';

const LocalitiesPage = () => {
  const { data: localities, isLoading } = useQuery({
    queryKey: ['all-localities'],
    queryFn: async () => {
      const res = await apiClient.get('/localities');
      return res.data?.data || [];
    },
  });

  return (
    <>
      <Helmet>
        <title>Prime Nagpur Enclaves & Neighborhood Intelligence | Nagpur Estates</title>
        <meta
          name="description"
          content="Explore comprehensive residential guides for Nagpur's premier enclaves: Dharampeth, Ramdaspeth, Civil Lines, Wardha Road, and Besa."
        />
      </Helmet>

      <div className="bg-ivory-light min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="border-b border-beige pb-6">
            <span className="text-[10px] uppercase tracking-luxury text-gold font-semibold block mb-1">
              Geographic Intelligence
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-navy font-normal tracking-tight">
              Nagpur Real Estate Enclaves & Valuation
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2 font-sans max-w-2xl leading-relaxed">
              Curated neighborhood dossiers detailing capital appreciation rates, transit corridors, healthcare proximity, and active luxury portfolio offerings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-beige h-80 animate-pulse"></div>
              ))
            ) : localities && localities.length > 0 ? (
              localities.map((loc) => (
                <Link
                  key={loc._id}
                  to={`/localities/${loc.slug || loc.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-white border border-beige hover:border-gold transition-colors duration-300 shadow-subtle flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-[16/9] bg-navy-dark overflow-hidden">
                      <img
                        src={loc.heroImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                        alt={loc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute top-3 left-3 bg-navy text-white text-[10px] font-semibold uppercase tracking-luxury px-3 py-1 border border-white/20">
                        {loc.name}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-navy-deep/80 text-gold text-[10px] font-medium uppercase tracking-luxury px-2.5 py-1 border border-gold/40">
                        {loc.propertyCount || 0} Assets
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs font-sans">
                        <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted">Valuation Benchmark</span>
                        <strong className="text-navy font-semibold text-sm">
                          ₹ {(loc.areaGuide?.averagePricePerSqFt || 5500).toLocaleString('en-IN')} / sq.ft
                        </strong>
                      </div>

                      <p className="text-xs text-charcoal-light line-clamp-2 font-sans leading-relaxed">
                        {loc.description || `Comprehensive neighborhood insights, connectivity, and residential dynamics in ${loc.name}, Nagpur.`}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-3 border-t border-beige flex items-center justify-between text-xs font-sans">
                    <span className="text-[11px] text-charcoal-muted">Pincode: {loc.pincode}</span>
                    <span className="text-[11px] uppercase tracking-luxury text-gold group-hover:text-navy transition-colors font-medium flex items-center">
                      Enclave Dossier <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-14 text-xs uppercase tracking-luxury text-charcoal-muted bg-white border border-beige">
                Enclave intelligence updating.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LocalitiesPage;
