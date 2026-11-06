import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  ShieldCheck,
  Heart,
  Phone,
  MessageSquare,
  Calendar,
  Building,
  Compass,
  CheckCircle,
  Share2,
  AlertCircle,
} from 'lucide-react';
import apiClient from '../../api/client';
import { formatIndianPrice, formatArea, calculateEstimateEmi, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../store/useAuthStore';
import EnquiryModal from '../../components/common/EnquiryModal';
import SiteVisitModal from '../../components/common/SiteVisitModal';
import AuthModal from '../../components/common/AuthModal';
import PropertyCard from '../../components/common/PropertyCard';

const PropertyDetailsPage = () => {
  const { slug } = useParams();
  const { isAuthenticated, savedPropertyIds, toggleSavedPropertyId } = useAuthStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [siteVisitModalOpen, setSiteVisitModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Fetch Property Details by Slug
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property-detail', slug],
    queryFn: async () => {
      const res = await apiClient.get(`/properties/details/${slug}`);
      return res.data?.data;
    },
  });

  // Fetch Similar Properties
  const { data: similarProperties } = useQuery({
    queryKey: ['property-similar', property?._id],
    queryFn: async () => {
      if (!property?._id) return [];
      const res = await apiClient.get(`/properties/${property._id}/similar`);
      return res.data?.data || [];
    },
    enabled: Boolean(property?._id),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold text-slate-600">Loading Nagpur Property Details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-brand-navy">Property Listing Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested listing may have been sold, rented, or archived by the owner.
        </p>
        <Link
          to="/properties"
          className="inline-block bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all"
        >
          Browse Active Nagpur Properties
        </Link>
      </div>
    );
  }

  const isSaved = savedPropertyIds.has(property._id) || property.isSaved;

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    try {
      toggleSavedPropertyId(property._id);
      if (isSaved) {
        await apiClient.delete(`/me/saved/properties/${property._id}`);
      } else {
        await apiClient.post(`/me/saved/properties/${property._id}`);
      }
    } catch (err) {
      toggleSavedPropertyId(property._id);
    }
  };

  const imagesList = property.images && property.images.length > 0
    ? property.images
    : [{ url: property.coverImage || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', caption: 'Property Photo' }];

  const contactPhone = property.assignedAgent?.phone || property.owner?.phone || '9823000000';

  // Schema.org RealEstateListing Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    price: property.price,
    priceCurrency: 'INR',
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.localityName,
      addressRegion: 'Maharashtra',
      postalCode: property.pincode,
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: property.location?.coordinates[1],
      longitude: property.location?.coordinates[0],
    },
  };

  return (
    <>
      <Helmet>
        <title>{`${property.title} — Nagpur Real Estate`}</title>
        <meta name="description" content={property.description.slice(0, 160)} />
        <link rel="canonical" href={`https://nagpurestate.com/properties/${property.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="bg-slate-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb & Navigation */}
          <nav className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Link to="/" className="hover:text-brand-orange">Home</Link>
            <span>/</span>
            <Link to={`/properties?purpose=${property.purpose}`} className="hover:text-brand-orange">
              {property.purpose === 'BUY' ? 'Buy' : 'Rent'}
            </Link>
            <span>/</span>
            <Link to={`/properties?locality=${property.localityName}`} className="hover:text-brand-orange">
              {property.localityName}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate max-w-xs">{property.title}</span>
          </nav>

          {/* Header Strip with Title, Price, Save, Share */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                {property.isVerified && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>MahaRERA & Physically Verified</span>
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-brand-navy text-white text-xs font-semibold">
                  {property.purpose === 'BUY' ? 'For Sale' : 'For Rent'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  {property.subtype?.replace('_', ' ')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
                {property.title}
              </h1>

              <div className="flex items-center text-xs text-slate-500">
                <MapPin className="w-4 h-4 text-brand-orange mr-1 flex-shrink-0" />
                <span>{property.address}, {property.localityName}, Nagpur - {property.pincode}</span>
              </div>
            </div>

            {/* Price & Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-brand-navy">
                  {formatIndianPrice(property.price, property.priceUnit)}
                </span>
                {property.purpose === 'BUY' && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Est. EMI Starts <strong>{calculateEstimateEmi(property.price)}</strong>
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveToggle}
                  className={`flex items-center space-x-1.5 py-2 px-3.5 rounded-xl border text-xs font-bold transition-all ${
                    isSaved
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-600' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Listing link copied to clipboard!');
                  }}
                  className="flex items-center space-x-1.5 py-2 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Photo Gallery Strip */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-card space-y-4">
            {/* Main Active Photo */}
            <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={imagesList[activeImageIndex]?.url}
                alt={imagesList[activeImageIndex]?.caption || property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-brand-navy/80 backdrop-blur-md px-3 py-1 rounded-md text-xs text-white">
                {activeImageIndex + 1} of {imagesList.length} Photos
              </div>
            </div>

            {/* Thumbnail Ribbon */}
            {imagesList.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImageIndex === idx ? 'border-brand-orange scale-95' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specifications, Overview & Contact Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Content (Span 8) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Key Features Overview */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
                <h2 className="text-lg font-black text-brand-navy mb-4">Property Specifications</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">Configuration</span>
                    <strong className="text-sm font-bold text-slate-800">
                      {property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Plot'}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">Super Built-up Area</span>
                    <strong className="text-sm font-bold text-slate-800">
                      {formatArea(property.areaSqFt, 'sq.ft')}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">Bathrooms</span>
                    <strong className="text-sm font-bold text-slate-800">{property.bathrooms || 'N/A'}</strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">Furnishing</span>
                    <strong className="text-sm font-bold text-slate-800">
                      {property.furnishing?.replace('_', ' ')}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">Floor Level</span>
                    <strong className="text-sm font-bold text-slate-800">
                      {property.floor} of {property.totalFloors}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">Possession Status</span>
                    <strong className="text-sm font-bold text-slate-800">
                      {property.possessionStatus?.replace('_', ' ')}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">Facing</span>
                    <strong className="text-sm font-bold text-slate-800">{property.facing}</strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">RERA Registered</span>
                    <strong className="text-sm font-bold text-slate-800">
                      {property.reraNumber || 'Verified RERA'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-4">
                <h2 className="text-lg font-black text-brand-navy">About this Property</h2>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-normal">
                  {property.description}
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
                  <h2 className="text-lg font-black text-brand-navy mb-5">Features & Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Map Preview */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-4">
                <h2 className="text-lg font-black text-brand-navy">Location & Neighborhood</h2>
                <p className="text-xs text-slate-500">
                  Located in prime <strong>{property.localityName}</strong>, Nagpur. Coordinates: {property.location?.coordinates[1]}, {property.location?.coordinates[0]}.
                </p>
                <div className="h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative flex items-center justify-center">
                  <iframe
                    title="Google Maps Location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://maps.google.com/maps?q=${property.location?.coordinates[1]},${property.location?.coordinates[0]}&hl=en&z=14&output=embed`}
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Right Sticky Sidebar (Span 4) */}
            <aside className="lg:col-span-4 space-y-6 sticky top-28">
              {/* Agent / Contact Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-5">
                <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-brand-teal text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {property.assignedAgent?.name?.[0] || property.owner?.name?.[0] || 'N'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {property.assignedAgent?.name || property.owner?.name || 'Verified Property Advisor'}
                    </h3>
                    <span className="text-xs font-semibold text-brand-teal block">
                      {property.assignedAgent ? 'Verified Nagpur Real Estate Agent' : 'Direct Property Owner'}
                    </span>
                    <span className="inline-flex items-center text-[10px] text-emerald-600 font-bold mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 mr-0.5" />
                      Phone & KYC Verified
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setEnquiryModalOpen(true)}
                    className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Message / Enquiry</span>
                  </button>

                  <button
                    onClick={() => setSiteVisitModalOpen(true)}
                    className="w-full bg-brand-teal hover:bg-brand-teal-light text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Site Visit</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <a
                      href={`tel:+91${contactPhone}`}
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                    >
                      <Phone className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Call Now</span>
                    </a>
                    <a
                      href={`https://wa.me/91${contactPhone}?text=Hello!%20I%20am%20interested%20in%20"${encodeURIComponent(property.title)}"%20on%20Nagpur%20Real%20Estate.`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Loan Help Banner */}
              <div className="bg-gradient-to-br from-brand-navy to-brand-teal text-white rounded-3xl p-6 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                  Bank Partnerships
                </span>
                <h4 className="text-base font-bold text-white">Need a Home Loan for this property?</h4>
                <p className="text-xs text-slate-300">
                  Get pre-approved home loans from SBI, HDFC, ICICI, and Axis Bank at special Nagpur interest rates.
                </p>
                <Link
                  to="/tools/emi-calculator"
                  className="inline-block bg-white text-brand-navy font-bold text-xs py-2 px-4 rounded-xl mt-2 hover:bg-slate-100 transition-colors"
                >
                  Calculate EMI & Apply →
                </Link>
              </div>
            </aside>
          </div>

          {/* Similar Properties Section */}
          {similarProperties && similarProperties.length > 0 && (
            <div className="pt-8">
              <h2 className="text-2xl font-black text-brand-navy mb-6">
                Similar Properties in {property.localityName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProperties.map((simProp) => (
                  <PropertyCard key={simProp._id} property={simProp} onOpenAuth={() => setAuthModalOpen(true)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        property={property}
      />
      <SiteVisitModal
        isOpen={siteVisitModalOpen}
        onClose={() => setSiteVisitModalOpen(false)}
        property={property}
      />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default PropertyDetailsPage;

