import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';
import PropertyCard from '../../components/common/PropertyCard';

const FeaturedProperties = ({ onOpenAuth }) => {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      const res = await apiClient.get('/properties?isFeatured=true&limit=4');
      return res.data?.data || [];
    },
  });

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange bg-orange-50 px-3 py-1 rounded-full mb-2 border border-orange-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Collection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy">
              {t('sections.featuredTitle')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('sections.featuredSubtitle')}
            </p>
          </div>

          <Link
            to="/properties?isFeatured=true"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-bold text-brand-teal hover:text-brand-orange transition-colors"
          >
            <span>Explore All Featured</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.map((property) => (
              <PropertyCard key={property._id} property={property} onOpenAuth={onOpenAuth} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center text-sm text-slate-500 border border-slate-200">
            No featured properties at the moment.
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
