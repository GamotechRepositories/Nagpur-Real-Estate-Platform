import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import PropertyCard from '../../components/common/PropertyCard';

const SavedPropertiesPage = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['saved-properties'],
    queryFn: async () => {
      const res = await apiClient.get('/me/saved/properties');
      return res.data?.data || [];
    },
  });

  return (
    <>
      <Helmet>
        <title>Curated Wishlist & Saved Assets | Nagpur Estates</title>
      </Helmet>

      <div className="bg-ivory-light min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="border-b border-beige pb-6">
            <span className="text-[10px] uppercase tracking-luxury text-gold font-semibold block mb-1">
              Private Portfolio Watchlist
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-navy font-normal tracking-tight">
              Curated Saved Residences & Plots
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2 font-sans">
              Bookmarked properties preserved for side-by-side comparative analysis and viewing coordination
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white border border-beige h-96 animate-pulse"></div>
              ))}
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {properties.map((prop) => (
                <PropertyCard key={prop._id} property={{ ...prop, isSaved: true }} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-14 text-center border border-beige shadow-subtle space-y-4 max-w-xl mx-auto">
              <div className="w-14 h-14 border border-beige text-gold flex items-center justify-center mx-auto bg-ivory">
                <Heart className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-2xl text-navy font-normal">Your Wishlist is Empty</h3>
              <p className="text-xs text-charcoal-muted font-sans leading-relaxed">
                Explore the Nagpur collection and bookmark residences to compare valuations, configurations, and location metrics.
              </p>
              <Link
                to="/properties"
                className="inline-block bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase px-6 py-3 transition-colors mt-2"
              >
                Explore Marketplace Portfolio
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SavedPropertiesPage;
