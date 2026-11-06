import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MapPin, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';

const LocalityShowcase = () => {
  const { t } = useTranslation();

  const { data: localities, isLoading } = useQuery({
    queryKey: ['localities-showcase'],
    queryFn: async () => {
      const res = await apiClient.get('/localities?featured=true');
      return res.data?.data || [];
    },
  });

  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-brand-teal bg-teal-50 px-3 py-1 rounded-full mb-2 border border-teal-200">
              <MapPin className="w-3.5 h-3.5" />
              <span>Orange City Localities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy">
              {t('sections.localitiesTitle')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('sections.localitiesSubtitle')}
            </p>
          </div>

          <Link
            to="/localities"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-bold text-brand-teal hover:text-brand-orange transition-colors"
          >
            <span>All Nagpur Localities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Localities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 rounded-2xl bg-slate-100 animate-pulse"></div>
            ))
          ) : localities && localities.length > 0 ? (
            localities.slice(0, 6).map((loc) => (
              <Link
                key={loc._id}
                to={`/properties?locality=${loc.name}`}
                className="group relative h-64 rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 flex flex-col justify-end p-6 border border-slate-200"
              >
                {/* Background image */}
                <img
                  src={
                    loc.heroImage ||
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={loc.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-75 group-hover:brightness-60"
                  loading="lazy"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/50 to-transparent"></div>

                {/* Content */}
                <div className="relative z-10 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-black text-white group-hover:text-orange-300 transition-colors">
                      {loc.name}
                    </h3>
                    <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-slate-100">
                      {loc.propertyCount || 0} Properties
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {loc.description || `Explore verified properties in ${loc.name}, Nagpur.`}
                  </p>
                  <div className="mt-3 flex items-center text-xs font-bold text-brand-orange group-hover:translate-x-1 transition-transform">
                    <span>Explore Properties</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-sm text-slate-500">
              No locality data available.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LocalityShowcase;
