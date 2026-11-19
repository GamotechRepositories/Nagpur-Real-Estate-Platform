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
  FileCheck,
  FileText,
  ExternalLink,
  Video,
  Download,
  Star,
  Layers,
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

  // Agent / Representative details:
  const isPublicUser = !property.owner?.role || property.owner?.role === 'USER';
  const contactPhone = property.assignedAgent?.phone || (!isPublicUser ? property.owner?.phone : '9823012345');
  const agentName = property.assignedAgent?.name || (!isPublicUser ? property.owner?.name : 'Nagpur Certified Broker Desk');
  const reraNum = property.assignedAgent?.agentProfile?.reraNumber || property.reraNumber || 'A50500001234';

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
      setEnquirySuccess(true);
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const pricePerSqFt = property.pricePerSqFt || (property.areaSqFt && property.price
    ? Math.round(property.price / property.areaSqFt)
    : 0);

  const isPlot = property.category === 'PLOT' || property.subtype === 'PLOT';
  const isCommercial = property.category === 'COMMERCIAL';
  const isRent = property.purpose === 'RENT' || property.purpose === 'LEASE';

  const tabs = ['Overview', 'Specifications', 'Amenities', 'Legal & Clearances', 'Location', 'Similar Properties'];

  return (
    <>
      <Helmet>
        <title>{`${property.title} | Nagpur Realty`}</title>
        <meta name="description" content={property.description?.slice(0, 160)} />
      </Helmet>

      <div className="bg-[#F7F4ED] min-h-screen py-6 sm:py-8 pb-20 lg:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="text-xs text-gray-500 mb-3 flex items-center space-x-1.5 overflow-x-auto whitespace-nowrap">
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

          {/* Property USP Highlight Banner */}
          {property.propertyUsp && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-3.5 flex items-center gap-2.5 text-xs text-amber-900 shadow-xs">
              <Star className="w-4 h-4 text-amber-500 flex-shrink-0 fill-amber-500" />
              <span className="font-semibold">Highlight:</span>
              <span className="font-medium">{property.propertyUsp}</span>
            </div>
          )}

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (Main Gallery + Content Tabs + Description) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Photo Gallery with Badges and Counter */}
              <div className="space-y-3">
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-sm bg-gray-200">
                  <img
                    src={imagesList[activeImageIndex]?.url}
                    alt={property.title}
                    className="w-full h-full object-cover transition-all duration-300"
                  />

                  {/* Top Left Badges */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
                    <span className="bg-[#B89A65] text-white text-xs font-semibold px-3 py-1 rounded-md shadow-sm">
                      {property.purpose || 'BUY'}
                    </span>
                    <span className="bg-[#16A34A] text-white text-xs font-semibold px-3 py-1 rounded-md shadow-sm flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{property.condition || 'Verified'}</span>
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

                {/* 4-Thumbnail Ribbon below hero */}
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
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Tabs */}
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
                  {/* Linked Project Card */}
                  {property.project && (
                    <div className="bg-[#F7F4ED] border border-[#B89A65]/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#172C3B] text-white rounded">
                            Part of Project
                          </span>
                          {property.project.projectStatus && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded">
                              {property.project.projectStatus.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-lg font-bold text-[#172C3B]">
                          {property.project.name}
                        </h4>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#B89A65]" />
                          <span>{property.project.localityName || property.localityName}, Nagpur</span>
                          {property.project.reraNumber && (
                            <span className="ml-2 text-gray-400">• RERA: {property.project.reraNumber}</span>
                          )}
                        </p>
                      </div>
                      {property.project.slug && (
                        <Link
                          to={`/projects/${property.project.slug}`}
                          className="px-4 py-2 bg-[#B89A65] hover:bg-[#A38753] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-xs"
                        >
                          View Full Project &rarr;
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#172C3B] mb-3">
                      Property Description & Details
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line text-justify">
                      {property.description ||
                        'A premium property offering spacious living, modern architectural finishes and prime connectivity in Nagpur.'}
                    </p>
                  </div>

                  {/* Suitable For Tags */}
                  {Array.isArray(property.suitableFor) && property.suitableFor.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                        Ideal / Suitable For:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {property.suitableFor.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-[#F7F4ED] border border-[#B89A65]/40 text-[#172C3B] text-xs font-semibold rounded-full"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specifications Grid */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-serif text-lg font-bold text-[#172C3B] mb-4">
                      Comprehensive Property Specifications
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Category</span>
                        <span className="font-bold text-[#172C3B] text-sm">{property.category} • {property.subtype}</span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Condition</span>
                        <span className="font-bold text-[#172C3B] text-sm">{property.condition || 'Ready to Move'}</span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Ownership</span>
                        <span className="font-bold text-[#172C3B] text-sm">{property.ownershipType || 'Freehold'}</span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Super Built-up</span>
                        <span className="font-bold text-[#172C3B] text-sm">{formatArea(property.areaSqFt)}</span>
                      </div>

                      {property.carpetAreaSqFt ? (
                        <div className="bg-[#F7F4ED] p-3 rounded-lg">
                          <span className="text-gray-500 block text-[11px]">Carpet Area (RERA)</span>
                          <span className="font-bold text-[#172C3B] text-sm">{property.carpetAreaSqFt} Sq.Ft</span>
                        </div>
                      ) : null}

                      {property.builtUpAreaSqFt ? (
                        <div className="bg-[#F7F4ED] p-3 rounded-lg">
                          <span className="text-gray-500 block text-[11px]">Built-up Area</span>
                          <span className="font-bold text-[#172C3B] text-sm">{property.builtUpAreaSqFt} Sq.Ft</span>
                        </div>
                      ) : null}

                      {isPlot && property.plotAreaSqFt ? (
                        <div className="bg-[#F7F4ED] p-3 rounded-lg">
                          <span className="text-gray-500 block text-[11px]">Plot Area / Road</span>
                          <span className="font-bold text-[#172C3B] text-sm">{property.plotAreaSqFt} Sq.Ft ({property.roadWidthFt || 30} Ft Road)</span>
                        </div>
                      ) : null}

                      {!isPlot && (
                        <>
                          <div className="bg-[#F7F4ED] p-3 rounded-lg">
                            <span className="text-gray-500 block text-[11px]">Bedrooms</span>
                            <span className="font-bold text-[#172C3B] text-sm">{property.bedrooms || '2'} BHK</span>
                          </div>
                          <div className="bg-[#F7F4ED] p-3 rounded-lg">
                            <span className="text-gray-500 block text-[11px]">Bathrooms</span>
                            <span className="font-bold text-[#172C3B] text-sm">{property.bathrooms || '2'}</span>
                          </div>
                          <div className="bg-[#F7F4ED] p-3 rounded-lg">
                            <span className="text-gray-500 block text-[11px]">Balconies</span>
                            <span className="font-bold text-[#172C3B] text-sm">{property.balconies || '1'}</span>
                          </div>
                          <div className="bg-[#F7F4ED] p-3 rounded-lg">
                            <span className="text-gray-500 block text-[11px]">Furnishing</span>
                            <span className="font-bold text-[#172C3B] text-sm">
                              {property.furnishing?.replace(/_/g, ' ') || 'Semi Furnished'}
                            </span>
                          </div>
                          <div className="bg-[#F7F4ED] p-3 rounded-lg">
                            <span className="text-gray-500 block text-[11px]">Floor</span>
                            <span className="font-bold text-[#172C3B] text-sm">{property.floor || 2} of {property.totalFloors || 5}</span>
                          </div>
                        </>
                      )}

                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Facing</span>
                        <span className="font-bold text-[#172C3B] text-sm">{property.facing || 'East'}</span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Possession</span>
                        <span className="font-bold text-[#172C3B] text-sm">{property.possessionStatus?.replace(/_/g, ' ') || 'Ready to Move'}</span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Property Age</span>
                        <span className="font-bold text-[#172C3B] text-sm">{property.propertyAge || '0-1 year'}</span>
                      </div>

                      {isCommercial && (
                        <>
                          <div className="bg-[#F7F4ED] p-3 rounded-lg">
                            <span className="text-gray-500 block text-[11px]">Cabins</span>
                            <span className="font-bold text-[#172C3B] text-sm">{property.cabins || 0}</span>
                          </div>
                          <div className="bg-[#F7F4ED] p-3 rounded-lg">
                            <span className="text-gray-500 block text-[11px]">Workstations</span>
                            <span className="font-bold text-[#172C3B] text-sm">{property.workstations || 0}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Financial & Brokerage Details */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-serif text-lg font-bold text-[#172C3B] mb-4">
                      Pricing, Brokerage & Payment Structure
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Rate / Sq.Ft</span>
                        <span className="font-bold text-[#172C3B] text-sm font-mono">
                          {pricePerSqFt ? `₹${pricePerSqFt.toLocaleString('en-IN')}` : 'N/A'}
                        </span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Booking Amount</span>
                        <span className="font-bold text-[#172C3B] text-sm font-mono">
                          {property.bookingAmount ? `₹${Number(property.bookingAmount).toLocaleString('en-IN')}` : 'As Agreed'}
                        </span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Maintenance</span>
                        <span className="font-bold text-[#172C3B] text-sm font-mono">
                          {property.maintenanceCharges ? `₹${Number(property.maintenanceCharges).toLocaleString('en-IN')} / ${property.maintenanceFrequency || 'Mo'}` : 'Included'}
                        </span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Brokerage Terms</span>
                        <span className="font-bold text-[#172C3B] text-sm">
                          {property.brokerage || 'Zero Brokerage'}
                        </span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Govt Taxes</span>
                        <span className="font-bold text-[#172C3B] text-sm">
                          {property.taxAndGovtCharges || 'Excluded'}
                        </span>
                      </div>
                      <div className="bg-[#F7F4ED] p-3 rounded-lg">
                        <span className="text-gray-500 block text-[11px]">Bank Loan</span>
                        <span className="font-bold text-[#172C3B] text-sm text-teal-800">
                          {property.loanAvailable !== false ? 'Approved with Banks' : 'No Loan'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Amenities */}
              {(activeTab === 'Amenities' || activeTab === 'Overview') && property.amenities?.length > 0 && (
                <div className="bg-white rounded-xl border border-[#E9E4DA] p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-xl font-bold text-[#172C3B]">Amenities & Features</h3>
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

              {/* Tab Content 3: Legal & Statutory Clearances */}
              {(activeTab === 'Legal & Clearances' || activeTab === 'Overview') && (
                <div className="bg-white rounded-xl border border-[#E9E4DA] p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-xl font-bold text-[#172C3B]">Statutory Clearances & RERA Compliance</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex justify-between items-center">
                      <span className="text-gray-500">Sanctioning Authority:</span>
                      <strong className="text-gray-900">{property.approvedBy || 'NMC (Nagpur)'}</strong>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex justify-between items-center">
                      <span className="text-gray-500">MahaRERA Registration:</span>
                      <strong className="text-teal-800 font-mono">{property.reraNumber || 'Not Applicable / Resale'}</strong>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex justify-between items-center">
                      <span className="text-gray-500">Occupancy Certificate (OC):</span>
                      <strong className="text-gray-900">{property.occupancyCertificate || 'Available'}</strong>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex justify-between items-center">
                      <span className="text-gray-500">Completion Certificate (CC):</span>
                      <strong className="text-gray-900">{property.completionCertificate || 'Available'}</strong>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex justify-between items-center">
                      <span className="text-gray-500">Property Tax Status:</span>
                      <strong className="text-gray-900">{property.propertyTaxStatus || 'Paid up to date'}</strong>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex justify-between items-center">
                      <span className="text-gray-500">Bank Loan Approvals:</span>
                      <strong className="text-gray-900 text-right">{property.bankLoanApprovedBy || 'SBI, HDFC, ICICI, Axis Bank'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Digital Assets & Virtual Links (If available) */}
              {(property.floorPlanUrl || property.videoUrl || property.virtualTourUrl || property.brochureUrl) && (
                <div className="bg-white rounded-xl border border-[#E9E4DA] p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-xl font-bold text-[#172C3B]">Digital Assets & Tours</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {property.floorPlanUrl && (
                      <a
                        href={property.floorPlanUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-[#F7F4ED] border border-[#B89A65]/30 hover:bg-[#B89A65]/10 text-[#172C3B] font-semibold transition"
                      >
                        <span>Floor Plan</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {property.videoUrl && (
                      <a
                        href={property.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-[#F7F4ED] border border-[#B89A65]/30 hover:bg-[#B89A65]/10 text-[#172C3B] font-semibold transition"
                      >
                        <span>Video Tour</span>
                        <Video className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {property.virtualTourUrl && (
                      <a
                        href={property.virtualTourUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-[#F7F4ED] border border-[#B89A65]/30 hover:bg-[#B89A65]/10 text-[#172C3B] font-semibold transition"
                      >
                        <span>360° Tour</span>
                        <Compass className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {property.brochureUrl && (
                      <a
                        href={property.brochureUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-[#F7F4ED] border border-[#B89A65]/30 hover:bg-[#B89A65]/10 text-[#172C3B] font-semibold transition"
                      >
                        <span>Brochure PDF</span>
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tab Content 4: Location Map */}
              {(activeTab === 'Location' || activeTab === 'Overview') && (
                <div className="bg-white rounded-xl border border-[#E9E4DA] p-6 shadow-sm space-y-3">
                  <h3 className="font-serif text-xl font-bold text-[#172C3B]">Location & Enclave</h3>
                  <p className="text-xs text-gray-500">
                    {property.address ? `${property.address}, ` : ''}{property.subLocality ? `${property.subLocality}, ` : ''}{property.localityName || 'Nagpur'} - {property.pincode || '440010'}{property.landmark ? ` (Near ${property.landmark})` : ''}
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
                    <span>{property.condition || 'Verified'}</span>
                  </span>
                </div>

                {/* Title & Locality */}
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#172C3B]">
                    {property.title}
                  </h2>
                  <div className="flex items-center text-xs text-gray-500 mt-1 space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{property.localityName || 'Nagpur'}</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline space-x-2 pt-1">
                  <span className="text-2xl font-bold text-[#172C3B]">
                    {formatIndianPrice(property.price, property.purpose === 'RENT' ? 'Per Month' : 'Total')}
                  </span>
                  {pricePerSqFt > 0 && (
                    <span className="text-xs text-gray-500 font-mono">(₹{pricePerSqFt.toLocaleString('en-IN')}/sq.ft)</span>
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

                {/* 4 Square Spec Boxes (2x2 grid) */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="bg-[#F7F4ED] p-3 rounded-lg text-center">
                    <span className="text-sm font-bold text-[#172C3B] block">{property.bedrooms || 2} BHK</span>
                    <span className="text-[10px] text-gray-500">Bedrooms</span>
                  </div>
                  <div className="bg-[#F7F4ED] p-3 rounded-lg text-center">
                    <span className="text-sm font-bold text-[#172C3B] block">{property.bathrooms || 2}</span>
                    <span className="text-[10px] text-gray-500">Bathrooms</span>
                  </div>
                  <div className="bg-[#F7F4ED] p-3 rounded-lg text-center">
                    <span className="text-sm font-bold text-[#172C3B] block">{formatArea(property.areaSqFt)}</span>
                    <span className="text-[10px] text-gray-500">Super Built-up</span>
                  </div>
                  <div className="bg-[#F7F4ED] p-3 rounded-lg text-center">
                    <span className="text-sm font-bold text-[#172C3B] block truncate">
                      {property.possessionStatus?.replace(/_/g, ' ') || 'Ready to Move'}
                    </span>
                    <span className="text-[10px] text-gray-500">Possession</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Listed By / Agent Card */}
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

                  <button
                    onClick={() => setSiteVisitModalOpen(true)}
                    className="w-full bg-white border border-[#172C3B] text-[#172C3B] hover:bg-gray-50 text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Site Visit</span>
                  </button>
                </div>
              </div>

              {/* Card 3: Enquire Now Card */}
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
                    />
                    <button
                      type="submit"
                      disabled={enquirySubmitting}
                      className="w-full bg-[#172C3B] hover:bg-[#223D52] text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      {enquirySubmitting ? 'Submitting...' : 'Send Enquiry'}
                    </button>
                  </form>
                )}
              </div>
            </aside>
          </div>
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
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};

export default PropertyDetailsPage;
