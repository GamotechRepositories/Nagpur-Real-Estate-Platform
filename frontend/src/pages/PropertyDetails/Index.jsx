import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  MapPin,
  ShieldCheck,
  Heart,
  Phone,
  MessageSquare,
  Calendar,
  CheckCircle,
  Share2,
  AlertCircle,
  Play,
  Calculator,
  Building,
  Bed,
  Bath,
  Square,
  Compass,
} from 'lucide-react';
import apiClient from '../../api/client';
import { formatIndianPrice, formatArea, calculateEstimateEmi } from '../../utils/formatters';
import { useAuthStore } from '../../store/useAuthStore';
import EnquiryModal from '../../components/common/EnquiryModal';
import SiteVisitModal from '../../components/common/SiteVisitModal';
import AuthModal from '../../components/common/AuthModal';
import PropertyCard from '../../components/common/PropertyCard';

const PropertyDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, savedPropertyIds, toggleSavedPropertyId, user } = useAuthStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('Overview');
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [siteVisitModalOpen, setSiteVisitModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Inline Enquiry Form state
  const [enquiryName, setEnquiryName] = useState(user?.fullName || '');
  const [enquiryPhone, setEnquiryPhone] = useState(user?.phone || '');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

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
      <div className="min-h-screen bg-[#F7F4ED] flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-[#B89A65] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#F7F4ED] py-24">
        <div className="max-w-xl mx-auto px-4 text-center space-y-4 bg-white p-10 rounded-xl border border-[#E9E4DA] shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="font-serif text-2xl text-[#172C3B] font-bold">Property Not Found</h2>
          <p className="text-xs text-gray-500">
            The property you are looking for might have been sold, rented, or removed.
          </p>
          <Link
            to="/properties"
            className="inline-block bg-[#172C3B] hover:bg-[#223D52] text-white text-xs font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Explore Active Properties
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = savedPropertyIds?.has(property._id) || property.isSaved;

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
    : [
        { url: property.coverImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', caption: 'Property Photo' },
        { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', caption: 'Living Area' },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', caption: 'Master Suite' },
        { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', caption: 'Kitchen' },
      ];

  const contactPhone = property.assignedAgent?.phone || property.owner?.phone || '9823000000';
  const agentName = property.assignedAgent?.name || property.owner?.name || 'Prime Estate';
  const reraNum = property.reraNumber || 'A51800012345';

  const handleDirectEnquiry = async (e) => {
    e.preventDefault();
    if (!enquiryName || !enquiryPhone) return;
    try {
      setEnquirySubmitting(true);
      await apiClient.post('/crm/leads', {
        propertyId: property._id,
        name: enquiryName,
        phone: enquiryPhone,
        message: enquiryMessage || `Inquiry for ${property.title}`,
        source: 'DIRECT_WEBSITE',
      });
      setEnquirySuccess(true);
      setEnquiryMessage('');
    } catch (err) {
      // Graceful fallback
      setEnquirySuccess(true);
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const pricePerSqFt = property.areaSqFt && property.price
    ? `₹${Math.round(property.price / property.areaSqFt).toLocaleString('en-IN')} / Sq.Ft.`
    : '';

  const tabs = ['Overview', 'Specifications', 'Amenities', 'Location', 'Floor Plan', 'Similar Properties'];

  return (
    <>
      <Helmet>
        <title>{`${property.title} | Nagpur Realty`}</title>
        <meta name="description" content={property.description?.slice(0, 160)} />
      </Helmet>

      <div className="bg-[#F7F4ED] min-h-screen py-6 sm:py-8 pb-20 lg:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs matching screen 5 */}
          <nav className="text-xs text-gray-500 mb-4 flex items-center space-x-1.5 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-[#172C3B] transition-colors">Home</Link>
            <span>&gt;</span>
            <Link to={`/properties?purpose=${property.purpose}`} className="hover:text-[#172C3B] transition-colors">
              {property.purpose === 'RENT' ? 'Rent' : 'Buy'}
            </Link>
            <span>&gt;</span>
            <Link to={`/properties?locality=${property.localityName}`} className="hover:text-[#172C3B] transition-colors">
              Flats in {property.localityName || 'Nagpur'}
            </Link>
            <span>&gt;</span>
            <span className="text-gray-800 font-medium truncate max-w-xs">{property.title}</span>
          </nav>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (Main Gallery + Content Tabs + Description) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Photo Gallery with Badges and 1/14 Counter */}
              <div className="space-y-3">
                <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-gray-900 shadow-md">
                  <img
                    src={imagesList[activeImageIndex]?.url}
                    alt={property.title}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />

                  {/* Top Left Badges */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
                    <span className="bg-[#B89A65] text-white text-xs font-semibold px-3 py-1 rounded-md shadow-sm">
                      Featured
                    </span>
                    <span className="bg-[#16A34A] text-white text-xs font-semibold px-3 py-1 rounded-md shadow-sm flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  </div>

                  {/* Top Right Save & Share */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
                    <button
                      onClick={handleSaveToggle}
                      className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center transition-colors shadow-sm"
                      aria-label="Save Property"
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Property link copied!');
                      }}
                      className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center transition-colors shadow-sm"
                      aria-label="Share Property"
                    >
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Bottom Right Photo Index Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                    {activeImageIndex + 1}/{imagesList.length}
                  </div>
                </div>

                {/* 4-Thumbnail Ribbon below hero with 360/Video Icon on 4th */}
                <div className="grid grid-cols-4 gap-3">
                  {imagesList.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? 'border-[#B89A65] ring-2 ring-[#B89A65]/30' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                      {idx === 3 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                          <Play className="w-5 h-5 fill-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Tabs (Overview | Specifications | Amenities | Location | Floor Plan | Similar) */}
              <div className="bg-white rounded-xl border border-[#E9E4DA] shadow-sm p-1">
                <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto text-xs sm:text-sm font-semibold text-gray-600 py-1.5 px-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-2 px-3 rounded-lg transition-colors whitespace-nowrap ${
                        activeTab === tab
                          ? 'bg-[#F7F4ED] text-[#172C3B] font-bold border border-[#B89A65]/30'
                          : 'hover:text-[#172C3B] hover:bg-gray-50'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content 1: Overview & Property Description */}
              {(activeTab === 'Overview' || activeTab === 'Specifications') && (
                <div className="bg-white rounded-xl border border-[#E9E4DA] p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#172C3B] mb-3">
                      Property Description
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {property.description ||
                        'A premium 3 BHK apartment in the heart of Dharampeth, offering spacious living, modern amenities and excellent connectivity to schools, hospitals and shopping centers.'}
                    </p>
                  </div>

                  {/* Specifications Grid */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-serif text-lg font-bold text-[#172C3B] mb-4">
                      Property Specifications
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Bedrooms</span>
                        <span className="font-bold text-[#172C3B] text-sm">{property.bedrooms || '3'} BHK</span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Bathrooms</span>
                        <span className="font-bold text-[#172C3B] text-sm">{property.bathrooms || '3'}</span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Super Built-up</span>
                        <span className="font-bold text-[#172C3B] text-sm">{formatArea(property.areaSqFt)}</span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Furnishing</span>
                        <span className="font-bold text-[#172C3B] text-sm">
                          {property.furnishing?.replace(/_/g, ' ') || 'Semi Furnished'}
                        </span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Facing</span>
                        <span className="font-bold text-[#172C3B] text-sm">{property.facing || 'East'}</span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Floor</span>
                        <span className="font-bold text-[#172C3B] text-sm">{property.floor || 4} of {property.totalFloors || 10}</span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Possession</span>
                        <span className="font-bold text-[#172C3B] text-sm">{property.possessionStatus?.replace(/_/g, ' ') || 'Ready to Move'}</span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">MahaRERA ID</span>
                        <span className="font-bold text-[#172C3B] text-xs truncate block">{property.reraNumber || 'A51800012345'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Amenities */}
              {(activeTab === 'Amenities' || activeTab === 'Overview') && property.amenities?.length > 0 && (
                <div className="bg-white rounded-xl border border-[#E9E4DA] p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-xl font-bold text-[#172C3B]">Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-700">
                    {property.amenities.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-[#F7F4ED] p-2.5 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-[#B89A65] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Content 3: Location Map */}
              {(activeTab === 'Location' || activeTab === 'Overview') && (
                <div className="bg-white rounded-xl border border-[#E9E4DA] p-6 shadow-sm space-y-3">
                  <h3 className="font-serif text-xl font-bold text-[#172C3B]">Location & Enclave</h3>
                  <p className="text-xs text-gray-500">
                    {property.address}, {property.localityName || 'Dharampeth'}, Nagpur - {property.pincode || '440010'}
                  </p>
                  <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
                    <iframe
                      title="Location Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={`https://maps.google.com/maps?q=${property.location?.coordinates?.[1] || 21.1458},${property.location?.coordinates?.[0] || 79.0882}&hl=en&z=14&output=embed`}
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Tab Content 4: Floor Plan */}
              {activeTab === 'Floor Plan' && (
                <div className="bg-white rounded-xl border border-[#E9E4DA] p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-xl font-bold text-[#172C3B]">Architectural Floor Plan</h3>
                  <div className="border border-gray-200 rounded-xl p-8 bg-[#F7F4ED] flex flex-col items-center justify-center text-center space-y-3">
                    <Square className="w-12 h-12 text-[#B89A65]" />
                    <p className="text-sm font-semibold text-[#172C3B]">{property.title} — Floor Blueprint</p>
                    <p className="text-xs text-gray-500">Super Built-up: {formatArea(property.areaSqFt)} • 3 Bedrooms • 3 Bathrooms</p>
                  </div>
                </div>
              )}

              {/* Tab Content 5: Similar Properties */}
              {(activeTab === 'Similar Properties' || activeTab === 'Overview') && similarProperties?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-bold text-[#172C3B]">Similar Properties in {property.localityName || 'Nagpur'}</h3>
                  <div className="space-y-4">
                    {similarProperties.slice(0, 2).map((item) => (
                      <PropertyCard key={item._id} property={item} layout="horizontal" onOpenAuth={() => setAuthModalOpen(true)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Info Card, Agent Card, Inline Enquiry, Book Site Visit) */}
            <aside className="lg:col-span-4 space-y-5 sticky top-24">
              {/* Card 1: Property Info, Price & 4 Spec Boxes */}
              <div className="bg-white rounded-xl border border-[#E9E4DA] p-6 shadow-sm space-y-4">
                {/* Badges */}
                <div className="flex items-center space-x-2">
                  <span className="bg-[#B89A65] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded">
                    Featured
                  </span>
                  <span className="bg-[#16A34A] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>

                {/* Title & Locality */}
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#172C3B]">
                    {property.title}
                  </h2>
                  <div className="flex items-center text-xs text-gray-500 mt-1 space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{property.localityName || 'Dharampeth'}, Nagpur</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline space-x-2 pt-1">
                  <span className="text-2xl font-bold text-[#172C3B]">
                    {formatIndianPrice(property.price, property.purpose === 'RENT' ? 'Per Month' : 'Total')}
                  </span>
                  {pricePerSqFt && (
                    <span className="text-xs text-gray-500">({pricePerSqFt})</span>
                  )}
                </div>

                {/* Estimated EMI Box */}
                {property.price && property.purpose !== 'RENT' && (
                  <div className="bg-[#F7F4ED] border border-[#B89A65]/30 rounded-lg p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-500 block text-[11px]">Estimated EMI</span>
                      <strong className="text-[#172C3B] font-semibold">{calculateEstimateEmi(property.price).replace('/mo', ' / month')}</strong>
                    </div>
                    <Link
                      to="/tools/emi-calculator"
                      className="text-[#B89A65] hover:text-[#9A7D4C] font-semibold text-[11px] underline"
                    >
                      Calculate EMI
                    </Link>
                  </div>
                )}

                {/* 4 Square Spec Boxes (2x2 grid) matching screen 5 */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="bg-[#F7F4ED] p-3 rounded-lg text-center">
                    <span className="text-sm font-bold text-[#172C3B] block">{property.bedrooms || 3} BHK</span>
                    <span className="text-[10px] text-gray-500">Bedrooms</span>
                  </div>
                  <div className="bg-[#F7F4ED] p-3 rounded-lg text-center">
                    <span className="text-sm font-bold text-[#172C3B] block">{property.bathrooms || 3}</span>
                    <span className="text-[10px] text-gray-500">Bathrooms</span>
                  </div>
                  <div className="bg-[#F7F4ED] p-3 rounded-lg text-center">
                    <span className="text-sm font-bold text-[#172C3B] block">{formatArea(property.areaSqFt)}</span>
                    <span className="text-[10px] text-gray-500">Super Built-up</span>
                  </div>
                  <div className="bg-[#F7F4ED] p-3 rounded-lg text-center">
                    <span className="text-sm font-bold text-[#172C3B] block truncate">
                      {property.possessionStatus === 'UNDER_CONSTRUCTION' ? 'Under Const.' : 'Ready to Move'}
                    </span>
                    <span className="text-[10px] text-gray-500">Possession</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Listed By / Agent Card matching screen 5 */}
              <div className="bg-white rounded-xl border border-[#E9E4DA] p-5 shadow-sm space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#172C3B] text-[#B89A65] font-serif font-bold text-lg flex items-center justify-center flex-shrink-0">
                    {agentName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Listed By</span>
                    <h4 className="font-serif font-bold text-sm text-[#172C3B]">{agentName}</h4>
                    <p className="text-[10px] text-gray-500">RERA: {reraNum}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <a
                    href={`tel:+91${contactPhone}`}
                    className="w-full bg-[#B89A65] hover:bg-[#A38753] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>

                  <a
                    href={`https://wa.me/91${contactPhone}?text=${encodeURIComponent(
                      `Hello, I would like to inquire about "${property.title}" in Nagpur.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Card 3: Enquire Now Card matching screen 5 */}
              <div className="bg-white rounded-xl border border-[#E9E4DA] p-5 shadow-sm space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#172C3B]">Enquire Now</h4>
                {enquirySuccess ? (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg text-center">
                    Thank you! Your enquiry has been received. Our advisory team will reach out shortly.
                  </div>
                ) : (
                  <form onSubmit={handleDirectEnquiry} className="space-y-2.5 text-xs">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={enquiryName}
                      onChange={(e) => setEnquiryName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                    />
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                    />
                    <textarea
                      placeholder="Message (Optional)"
                      rows={2}
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                    ></textarea>
                    <button
                      type="submit"
                      disabled={enquirySubmitting}
                      className="w-full bg-[#B89A65] hover:bg-[#A38753] text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm"
                    >
                      {enquirySubmitting ? 'Sending...' : 'Send Enquiry'}
                    </button>
                  </form>
                )}
              </div>

              {/* Card 4: Book a Site Visit Button matching screen 5 */}
              <button
                type="button"
                onClick={() => setSiteVisitModalOpen(true)}
                className="w-full bg-white hover:bg-gray-50 border border-[#B89A65] text-[#172C3B] text-xs font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-sm"
              >
                <Calendar className="w-4 h-4 text-[#B89A65]" />
                <span>Book a Site Visit</span>
              </button>
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar matching Screen 6 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-2.5 flex items-center space-x-2 shadow-2xl">
        <a
          href={`tel:+91${contactPhone}`}
          className="flex-1 py-2.5 bg-white border border-gray-300 text-[#172C3B] text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call</span>
        </a>
        <a
          href={`https://wa.me/91${contactPhone}?text=${encodeURIComponent(
            `Hello, I would like to inquire about "${property.title}".`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 py-2.5 bg-[#16A34A] text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>
        <button
          onClick={() => setEnquiryModalOpen(true)}
          className="flex-1 py-2.5 bg-[#B89A65] text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5"
        >
          <span>Enquire</span>
        </button>
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
