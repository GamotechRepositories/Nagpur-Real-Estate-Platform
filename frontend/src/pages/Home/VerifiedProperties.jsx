import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';
import PropertyCard from '../../components/common/PropertyCard';

const VerifiedProperties = ({ onOpenAuth }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['verified-properties'],
    queryFn: async () => {
      const res = await apiClient.get('/properties?isVerified=true&limit=4');
      return res.data?.data || [];
    },
  });

  return (
    <section className="py-20 bg-white border-t border-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-semibold uppercase tracking-luxury text-gold border border-gold/40 px-3 py-1 bg-ivory mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sanction & Title Cleared</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-navy font-normal tracking-tight">
              Verified Residences & Estates
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2 max-w-2xl font-sans leading-relaxed">
              Every property on this roster has undergone physical documentation verification, NMRDA/NMC approval review, and title validation by our real estate desk.
            </p>
          </div>

          <Link
            to="/properties?isVerified=true"
            className="mt-6 md:mt-0 inline-flex items-center space-x-2 text-xs uppercase tracking-luxury text-navy hover:text-gold transition-colors font-medium border-b border-navy/20 pb-1"
          >
            <span>Explore All Verified Assets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-ivory border border-beige h-96 animate-pulse"></div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.map((property) => (
              <PropertyCard key={property._id} property={property} layout="grid" onOpenAuth={onOpenAuth} />
            ))}
          </div>
        ) : (
          <div className="bg-ivory border border-beige p-12 text-center text-xs uppercase tracking-luxury text-charcoal-muted">
            No verified properties cataloged at present.
          </div>
        )}
      </div>
    </section>
  );
};

export default VerifiedProperties;
