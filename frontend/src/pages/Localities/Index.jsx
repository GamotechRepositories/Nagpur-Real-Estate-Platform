import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { MapPin, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';

const DEFAULT_LOCALITIES = [
  {
    _id: 'loc-1',
    name: 'Dharampeth',
    propertyCount: 412,
    pincode: '440010',
    avgPrice: '₹7,500/Sq.Ft.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    description: 'Premier upscale residential hub with boutique retail, cafes, and top-tier connectivity.',
  },
  {
    _id: 'loc-2',
    name: 'Manish Nagar',
    propertyCount: 328,
    pincode: '440015',
    avgPrice: '₹5,800/Sq.Ft.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    description: 'Rapidly growing residential sector with modern apartments and easy airport access.',
  },
  {
    _id: 'loc-3',
    name: 'Civil Lines',
    propertyCount: 286,
    pincode: '440001',
    avgPrice: '₹9,200/Sq.Ft.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description: 'Prestigious administrative enclave known for wide green avenues and heritage residences.',
  },
  {
    _id: 'loc-4',
    name: 'Wardha Road',
    propertyCount: 514,
    pincode: '440025',
    avgPrice: '₹4,900/Sq.Ft.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    description: 'Major development corridor along MIHAN with high-rise gated communities and metro.',
  },
  {
    _id: 'loc-5',
    name: 'Besa',
    propertyCount: 245,
    pincode: '440037',
    avgPrice: '₹4,400/Sq.Ft.',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    description: 'Affordable and peaceful suburban locale popular for families and plotted layouts.',
  },
  {
    _id: 'loc-6',
    name: 'Ramdaspeth',
    propertyCount: 198,
    pincode: '440010',
    avgPrice: '₹8,400/Sq.Ft.',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    description: 'Central luxury district famous for premier medical facilities, restaurants, and luxury flats.',
  },
];

const LocalitiesPage = () => {
  const { data: apiLocalities, isLoading } = useQuery({
    queryKey: ['all-localities'],
    queryFn: async () => {
      const res = await apiClient.get('/localities');
      return res.data?.data || [];
    },
  });

  const localities = apiLocalities && apiLocalities.length > 0
    ? apiLocalities.map((loc, idx) => ({
        ...loc,
        propertyCount: loc.propertyCount || DEFAULT_LOCALITIES[idx % DEFAULT_LOCALITIES.length].propertyCount,
        image: loc.heroImage || DEFAULT_LOCALITIES[idx % DEFAULT_LOCALITIES.length].image,
        avgPrice: loc.areaGuide?.averagePricePerSqFt ? `₹${loc.areaGuide.averagePricePerSqFt}/Sq.Ft.` : DEFAULT_LOCALITIES[idx % DEFAULT_LOCALITIES.length].avgPrice,
      }))
    : DEFAULT_LOCALITIES;

  return (
    <>
      <Helmet>
        <title>Explore Nagpur Localities | Nagpur Realty</title>
        <meta
          name="description"
          content="Explore top localities in Nagpur: Dharampeth, Manish Nagar, Civil Lines, Wardha Road, and more with verified property listings."
        />
      </Helmet>

      <div className="bg-[#F7F4ED] min-h-screen py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header matching Screen 11 */}
          <div className="space-y-1.5 border-b border-[#E9E4DA] pb-6">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#172C3B]">
              Explore Nagpur Localities
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Discover prime residential sectors, market rates, and property opportunities across Nagpur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl h-72 animate-pulse border border-[#E9E4DA]"></div>
              ))
            ) : (
              localities.map((loc) => (
                <Link
                  key={loc._id || loc.name}
                  to={`/properties?locality=${encodeURIComponent(loc.name)}`}
                  className="bg-white rounded-xl border border-[#E9E4DA] hover:border-[#B89A65]/60 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Image with Tag */}
                    <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                      <img
                        src={loc.image}
                        alt={loc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-[#172C3B]/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-md">
                        {loc.name}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-[#B89A65] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-sm">
                        {loc.propertyCount} Properties
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Avg. Rate</span>
                        <strong className="text-[#172C3B] font-semibold">{loc.avgPrice}</strong>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {loc.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Pincode: {loc.pincode}</span>
                    <span className="font-semibold text-[#B89A65] group-hover:translate-x-0.5 transition-transform flex items-center">
                      View Properties <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LocalitiesPage;
