import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { MapPin, ArrowRight, IndianRupee, School, Hospital, ShieldCheck } from 'lucide-react';
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
        <title>Nagpur Locality Guides & Neighborhoods — Real Estate Prices</title>
        <meta
          name="description"
          content="Explore real estate guides for Nagpur's top localities: Dharampeth, Manish Nagar, Wardha Road, Besa, Civil Lines, Ramdaspeth with average price per sq.ft and connectivity."
        />
      </Helmet>

      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
              Neighborhood Explorer
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy mt-1">
              Nagpur Real Estate Locality Guides
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Explore property price trends, connectivity, schools, and hospitals across prime Nagpur areas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl h-72 animate-pulse border border-slate-200"></div>
              ))
            ) : localities && localities.length > 0 ? (
              localities.map((loc) => (
                <div
                  key={loc._id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-card hover:shadow-hover transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/9] bg-slate-900">
                    <img
                      src={loc.heroImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                      alt={loc.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-brand-navy/90 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      {loc.name}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur text-brand-navy text-xs font-bold px-2.5 py-1 rounded-md">
                      {loc.propertyCount || 0} Properties
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Avg. Price / Sq.Ft:</span>
                      <strong className="text-brand-orange font-bold text-sm">
                        ₹ {loc.areaGuide?.averagePricePerSqFt || 5500} / sq.ft
                      </strong>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {loc.description || `Comprehensive guide to living and investing in ${loc.name}, Nagpur.`}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Pincode: {loc.pincode}</span>
                      <Link
                        to={`/properties?locality=${loc.name}`}
                        className="inline-flex items-center text-xs font-bold text-brand-teal hover:text-brand-orange transition-colors"
                      >
                        <span>View Properties</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-xs text-slate-400">
                No localities found.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LocalitiesPage;

