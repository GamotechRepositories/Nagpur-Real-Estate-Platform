import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Building,
  School,
  Hospital,
  Train,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import apiClient from '../../api/client';
import PropertyCard from '../../components/common/PropertyCard';

const LocalityDetailsPage = () => {
  const { slug } = useParams();

  const { data: locality, isLoading: locLoading } = useQuery({
    queryKey: ['locality-detail', slug],
    queryFn: async () => {
      const res = await apiClient.get(`/localities/${slug}`);
      return res.data?.data;
    },
  });

  const { data: propertiesResponse, isLoading: propLoading } = useQuery({
    queryKey: ['locality-properties', locality?.name],
    queryFn: async () => {
      if (!locality?.name) return [];
      const res = await apiClient.get(`/properties?locality=${locality.name}&limit=8`);
      return res.data?.data || [];
    },
    enabled: Boolean(locality?.name),
  });

  const properties = propertiesResponse || [];

  if (locLoading) {
    return <div className="py-24 text-center text-xs text-slate-400 font-serif">Curating neighborhood portfolio...</div>;
  }

  if (!locality) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#172C3B]">Locality Guide Not Found</h2>
        <Link to="/localities" className="text-[#B89A65] text-xs uppercase tracking-luxury font-semibold hover:underline">
          Return to All Nagpur Localities &rarr;
        </Link>
      </div>
    );
  }

  const guide = locality.areaGuide || {};

  return (
    <>
      <Helmet>
        <title>{`${locality.name}, Nagpur — Real Estate Guide & Luxury Properties`}</title>
        <meta
          name="description"
          content={`In-depth neighborhood guide for ${locality.name}, Nagpur. Current average valuation: ₹${guide.averagePricePerSqFt || 5500}/sq.ft. Connectivity and prestigious residences.`}
        />
      </Helmet>

      <div className="bg-[#F7F4ED] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <nav className="text-xs text-[#252525]/60 flex items-center space-x-2">
            <Link to="/" className="hover:text-[#B89A65]">Home</Link>
            <span>/</span>
            <Link to="/localities" className="hover:text-[#B89A65]">Localities</Link>
            <span>/</span>
            <span className="font-bold text-[#172C3B]">{locality.name}</span>
          </nav>

          {/* Hero Banner */}
          <div className="relative border border-[#E9E4DA] bg-[#172C3B] text-white p-8 sm:p-14 overflow-hidden shadow-hover">
            {locality.heroImage && (
              <img
                src={locality.heroImage}
                alt={locality.name}
                className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity filter contrast-125"
              />
            )}
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-[#B89A65] font-semibold block">
                Nagpur District &middot; Postal Code {locality.pincode}
              </span>

              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
                {locality.name}
              </h1>

              <p className="text-xs sm:text-sm text-[#E9E4DA]/90 font-light leading-relaxed">
                {locality.description || `Prestigious residential enclave recognized for high lifestyle standards and solid capital appreciation.`}
              </p>

              <div className="pt-4 flex flex-wrap gap-4 text-xs">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 text-white flex items-center space-x-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[#B89A65]" />
                  <span>Average Valuation: <strong>₹ {guide.averagePricePerSqFt || 5500} / sq.ft</strong></span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 text-white flex items-center space-x-2">
                  <Building className="w-3.5 h-3.5 text-[#B89A65]" />
                  <span>{locality.propertyCount || properties.length} Listed Residences</span>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Column Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FFFFFF] border border-[#E9E4DA] p-6 shadow-subtle space-y-3">
              <Train className="w-5 h-5 text-[#B89A65]" />
              <h3 className="font-serif text-lg font-bold text-[#172C3B]">Connectivity</h3>
              <p className="text-xs text-[#252525]/70 leading-relaxed font-light">
                {guide.connectivity || 'Seamless access to Nagpur Metro, West High Court Road, and arterial expressways.'}
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E9E4DA] p-6 shadow-subtle space-y-3">
              <School className="w-5 h-5 text-[#B89A65]" />
              <h3 className="font-serif text-lg font-bold text-[#172C3B]">Schools & Academics</h3>
              <ul className="text-xs text-[#252525]/70 space-y-1.5 font-light">
                {guide.schoolsAndColleges?.length > 0 ? (
                  guide.schoolsAndColleges.map((s, i) => <li key={i}>&mdash; {s}</li>)
                ) : (
                  <li>&mdash; Premier educational institutions within minutes</li>
                )}
              </ul>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E9E4DA] p-6 shadow-subtle space-y-3">
              <Hospital className="w-5 h-5 text-[#B89A65]" />
              <h3 className="font-serif text-lg font-bold text-[#172C3B]">Healthcare</h3>
              <ul className="text-xs text-[#252525]/70 space-y-1.5 font-light">
                {guide.hospitals?.length > 0 ? (
                  guide.hospitals.map((h, i) => <li key={i}>&mdash; {h}</li>)
                ) : (
                  <li>&mdash; Renowned tertiary hospitals and private medical facilities</li>
                )}
              </ul>
            </div>
          </div>

          {/* Available Properties */}
          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E9E4DA]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B89A65] font-semibold block">
                  Neighborhood Portfolio
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#172C3B]">
                  Residences in {locality.name}
                </h2>
              </div>
              <Link
                to={`/properties?locality=${locality.name}`}
                className="text-xs uppercase tracking-luxury font-medium text-[#172C3B] hover:text-[#B89A65] flex items-center space-x-1"
              >
                <span>View Complete Listings</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B89A65]" />
              </Link>
            </div>

            {propLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white border border-[#E9E4DA] h-84 animate-pulse"></div>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {properties.map((prop) => (
                  <PropertyCard key={prop._id} property={prop} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#E9E4DA] p-12 text-center text-xs text-[#252525]/60">
                No active properties listed in {locality.name} at this time.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LocalityDetailsPage;
