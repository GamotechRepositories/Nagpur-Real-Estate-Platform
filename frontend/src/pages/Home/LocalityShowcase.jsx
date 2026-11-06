import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, MapPin } from 'lucide-react';
import apiClient from '../../api/client';

const LocalityShowcase = () => {
  const { data: localities, isLoading } = useQuery({
    queryKey: ['localities-showcase'],
    queryFn: async () => {
      const res = await apiClient.get('/localities?featured=true');
      return res.data?.data || [];
    },
  });

  return (
    <section className="py-20 bg-[#FFFFFF] border-b border-[#E9E4DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#E9E4DA]">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest text-[#B89A65] font-semibold block">
              Neighborhood Directory
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#172C3B]">
              Distinguished Nagpur Enclaves
            </h2>
            <p className="text-xs sm:text-sm text-[#252525]/70 max-w-xl font-light">
              Explore property valuations, connectivity, and cultural landmarks across Nagpur's most sought-after neighborhoods.
            </p>
          </div>

          <Link
            to="/localities"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-xs uppercase tracking-luxury font-medium text-[#172C3B] hover:text-[#B89A65] transition-colors group"
          >
            <span>Explore All Nagpur Areas</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B89A65] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Editorial Locality Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 bg-[#F7F4ED] border border-[#E9E4DA] animate-pulse"></div>
            ))
          ) : localities && localities.length > 0 ? (
            localities.slice(0, 6).map((loc) => (
              <Link
                key={loc._id}
                to={`/localities/${loc.slug || loc.name.toLowerCase()}`}
                className="group relative h-80 overflow-hidden border border-[#E9E4DA] bg-[#172C3B] flex flex-col justify-end p-6 shadow-subtle hover:shadow-hover transition-all"
              >
                {/* Image Background */}
                <img
                  src={
                    loc.heroImage ||
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={loc.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 mix-blend-luminosity filter contrast-125"
                  loading="lazy"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#172C3B] via-[#172C3B]/60 to-transparent"></div>

                {/* Content */}
                <div className="relative z-10 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-[#B89A65] font-semibold">
                      Pincode {loc.pincode}
                    </span>
                    <span className="text-[11px] font-mono text-[#E9E4DA]/80">
                      {loc.propertyCount || 0} Listed
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-white group-hover:text-[#B89A65] transition-colors">
                    {loc.name}
                  </h3>

                  <p className="text-xs text-[#E9E4DA]/80 font-light line-clamp-2 leading-relaxed">
                    {loc.description || `Prestigious residential and commercial enclave in Nagpur.`}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-white/10">
                    <span className="text-[#E9E4DA]/60">Avg. Valuation:</span>
                    <strong className="text-white font-medium">₹ {loc.areaGuide?.averagePricePerSqFt || 5500} / sq.ft</strong>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-xs text-slate-500 border border-[#E9E4DA]">
              No locality data available.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LocalityShowcase;
