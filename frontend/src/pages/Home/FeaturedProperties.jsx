import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';
import PropertyCard from '../../components/common/PropertyCard';

const FeaturedProperties = ({ onOpenAuth }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      const res = await apiClient.get('/properties?isFeatured=true&limit=4');
      return res.data?.data || [];
    },
  });

  return (
    <section className="py-20 bg-[#F7F4ED] border-b border-[#E9E4DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#E9E4DA]">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest text-[#B89A65] font-semibold block">
              Curated Portfolio
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#172C3B]">
              Featured Residences & Estates
            </h2>
            <p className="text-xs sm:text-sm text-[#252525]/70 max-w-xl font-light">
              Handpicked luxury apartments, private bungalows, and prime land parcels across Nagpur.
            </p>
          </div>

          <Link
            to="/properties?isFeatured=true"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-xs uppercase tracking-luxury font-medium text-[#172C3B] hover:text-[#B89A65] transition-colors group"
          >
            <span>View All Curated Listings</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B89A65] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-[#E9E4DA] h-84 animate-pulse"></div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.map((property) => (
              <PropertyCard key={property._id} property={property} layout="grid" onOpenAuth={onOpenAuth} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 text-center text-xs text-[#252525]/60 border border-[#E9E4DA]">
            No featured residences currently available.
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
