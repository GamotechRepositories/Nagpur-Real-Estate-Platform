import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';
import PropertyCard from '../../components/common/PropertyCard';

const VerifiedProperties = ({ onOpenAuth }) => {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['verified-properties'],
    queryFn: async () => {
      const res = await apiClient.get('/properties?isVerified=true&limit=4');
      return res.data?.data || [];
    },
  });

  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Inspected & Verified</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy">
              {t('sections.verifiedTitle')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('sections.verifiedSubtitle')}
            </p>
          </div>

          <Link
            to="/properties?isVerified=true"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-bold text-brand-teal hover:text-brand-orange transition-colors"
          >
            <span>View All Verified Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-slate-100 rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.map((property) => (
              <PropertyCard key={property._id} property={property} onOpenAuth={onOpenAuth} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-8 text-center text-sm text-slate-500">
            No properties found.
          </div>
        )}
      </div>
    </section>
  );
};

export default VerifiedProperties;

