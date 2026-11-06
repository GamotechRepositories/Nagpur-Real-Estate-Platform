import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { MapPin, ArrowRight, Building } from 'lucide-react';
import apiClient from '../../api/client';
import { formatIndianPrice } from '../../utils/formatters';

const DEFAULT_PROJECTS = [
  {
    _id: 'proj-1',
    slug: 'skyline-residency',
    name: 'Skyline Residency',
    builderName: 'Skyline Developers',
    localityName: 'Wardha Road',
    priceStarting: '₹82 Lakh Onwards',
    minPrice: 8200000,
    configurationsText: '2 & 3 BHK Apartments',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    status: 'Ready Possession',
  },
  {
    _id: 'proj-2',
    slug: 'trident-heights',
    name: 'Trident Heights',
    builderName: 'Trident Realty',
    localityName: 'Dharampeth',
    priceStarting: '₹1.45 Cr Onwards',
    minPrice: 14500000,
    configurationsText: '3 & 4 BHK Luxury Suites',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    status: 'Under Construction',
  },
  {
    _id: 'proj-3',
    slug: 'green-valley',
    name: 'Green Valley',
    builderName: 'Valley Infrastructures',
    localityName: 'Besa',
    priceStarting: '₹68 Lakh Onwards',
    minPrice: 6800000,
    configurationsText: '2 & 3 BHK Homes & Plots',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    status: 'New Launch',
  },
];

const ProjectsPage = () => {
  const { data: apiProjects, isLoading } = useQuery({
    queryKey: ['nagpur-projects'],
    queryFn: async () => {
      const res = await apiClient.get('/projects');
      return res.data?.data || [];
    },
  });

  const projects = apiProjects && apiProjects.length > 0 ? apiProjects : DEFAULT_PROJECTS;

  return (
    <>
      <Helmet>
        <title>New & Ongoing Projects in Nagpur | Nagpur Realty</title>
        <meta
          name="description"
          content="Explore new residential and commercial projects in Nagpur across Wardha Road, Dharampeth, Besa, and prime areas."
        />
      </Helmet>

      <div className="bg-[#F7F4ED] min-h-screen py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header matching Screen 9 */}
          <div className="space-y-1.5 border-b border-[#E9E4DA] pb-6">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#172C3B]">
              New & Ongoing Projects in Nagpur
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Discover MahaRERA registered townships, premium residential towers, and upcoming layouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl h-80 animate-pulse border border-[#E9E4DA]"></div>
              ))
            ) : (
              projects.map((proj) => {
                const cover =
                  proj.image ||
                  proj.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
                const starting =
                  proj.priceStarting ||
                  (proj.priceRange?.minPrice
                    ? `${formatIndianPrice(proj.priceRange.minPrice)} Onwards`
                    : '₹82 Lakh Onwards');

                return (
                  <Link
                    key={proj._id}
                    to={`/projects/${proj.slug || proj._id}`}
                    className="bg-white rounded-xl border border-[#E9E4DA] hover:border-[#B89A65]/60 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image with Tag */}
                      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                        <img
                          src={cover}
                          alt={proj.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-[#B89A65] text-white text-[10px] font-semibold px-2.5 py-1 rounded">
                          {proj.status || proj.projectStatus?.replace(/_/g, ' ') || 'Ongoing'}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        <h3 className="font-serif text-lg font-bold text-[#172C3B] group-hover:text-[#B89A65] transition-colors">
                          {proj.name}
                        </h3>

                        <div className="flex items-center text-xs text-gray-500 space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{proj.localityName}, Nagpur</span>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2 pt-1">
                          {proj.description ||
                            `Premium modern homes developed by ${proj.builderName || 'reputed builder'} with landscaped amenities and prime connectivity.`}
                        </p>
                      </div>
                    </div>

                    {/* Price and Action Footer */}
                    <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Starting From</span>
                        <span className="font-bold text-[#172C3B] text-sm sm:text-base">
                          {starting}
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-[#B89A65] group-hover:translate-x-0.5 transition-transform flex items-center">
                        Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectsPage;
