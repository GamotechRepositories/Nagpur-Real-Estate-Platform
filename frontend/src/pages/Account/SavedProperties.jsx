import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Heart, Search, Building } from 'lucide-react';
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
        <title>Saved Properties Wishlist — Nagpur Real Estate</title>
      </Helmet>

      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-brand-navy flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <span>Saved Properties Wishlist</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your bookmarked flats, plots, and villas in Nagpur for quick comparison
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
              ))}
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.map((prop) => (
                <PropertyCard key={prop._id} property={{ ...prop, isSaved: true }} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Heart className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore Nagpur flats and click the heart icon on any listing to save it here for future reference.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SavedPropertiesPage;

