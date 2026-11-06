import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Compass,
  ArrowRight,
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
      <div className="min-h-screen bg-ivory-light flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-ivory-light py-24">
        <div className="max-w-xl mx-auto px-4 text-center space-y-4 bg-white p-12 border border-beige shadow-subtle">
          <div className="w-14 h-14 border border-red-300 text-red-600 flex items-center justify-center mx-auto bg-red-50">
            <AlertCircle className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h2 className="font-serif text-2xl text-navy">Asset Listing Not Found</h2>
          <p className="text-xs text-charcoal-muted font-sans leading-relaxed">
            The requested estate may have completed acquisition, leased out, or been archived by the principal.
          </p>
          <Link
            to="/properties"
            className="inline-block bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase px-6 py-3 transition-colors"
          >
            Explore Active Nagpur Portfolio
          </Link>
        </div>
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
      latitude: property.location?.coordinates?.[1] || 21.1458,
      longitude: property.location?.coordinates?.[0] || 79.0882,
    },
  };

  return (
    <>
      <Helmet>
        <title>{`${property.title} | Nagpur Estates`}</title>
        <meta name="description" content={property.description.slice(0, 160)} />
        <link rel="canonical" href={`https://nagpurestate.com/properties/${property.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="bg-ivory-light min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb Navigation */}
          <nav className="text-xs uppercase tracking-luxury text-charcoal-muted flex items-center space-x-2">
            <Link to="/" className="hover:text-navy transition-colors font-medium">Home</Link>
            <span>/</span>
            <Link to={`/properties?purpose=${property.purpose}`} className="hover:text-navy transition-colors">
              {property.purpose === 'BUY' ? 'For Sale' : 'Executive Lease'}
            </Link>
            <span>/</span>
            <Link to={`/properties?locality=${property.localityName}`} className="hover:text-navy transition-colors">
              {property.localityName}
            </Link>
            <span>/</span>
            <span className="text-navy font-semibold truncate max-w-xs">{property.title}</span>
          </nav>

          {/* Header Strip */}
          <div className="bg-white p-8 md:p-10 border border-beige shadow-subtle flex flex-col lg:flex-row justify-between lg:items-center gap-8">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                {property.isVerified && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-ivory text-gold text-[10px] font-semibold uppercase tracking-luxury border border-gold/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>MahaRERA & Physically Verified</span>
                  </span>
                )}
                <span className="px-3 py-1 bg-navy text-white text-[10px] font-semibold uppercase tracking-luxury">
                  {property.purpose === 'BUY' ? 'For Sale' : 'For Lease'}
                </span>
                <span className="px-3 py-1 bg-ivory-light border border-beige text-charcoal text-[10px] uppercase tracking-luxury font-medium">
                  {property.subtype?.replace(/_/g, ' ')}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-navy font-normal tracking-tight">
                {property.title}
              </h1>

              <div className="flex items-center text-xs text-charcoal-muted font-sans">
                <MapPin className="w-3.5 h-3.5 text-gold mr-1.5 shrink-0" />
                <span>{property.address}, {property.localityName}, Nagpur - {property.pincode}</span>
              </div>
            </div>

            {/* Price & Action Strip */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-6 lg:pt-0 border-beige">
              <div>
                <div className="font-serif text-3xl sm:text-4xl text-navy font-semibold">
                  {formatIndianPrice(property.price, property.priceUnit)}
                </div>
                {property.purpose === 'BUY' && (
                  <p className="text-xs text-charcoal-muted mt-1 font-sans">
                    Estimated EMI starts <strong className="text-navy font-sans font-semibold">{calculateEstimateEmi(property.price)}</strong> / mo
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveToggle}
                  className={`flex items-center space-x-1.5 py-2.5 px-4 border text-xs font-medium tracking-luxury uppercase transition-colors ${
                    isSaved
                      ? 'border-gold bg-ivory text-navy'
                      : 'border-beige bg-white text-charcoal hover:border-gold'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-gold text-gold' : 'text-charcoal-muted'}`} />
                  <span>{isSaved ? 'Saved Asset' : 'Save Asset'}</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Listing link copied to clipboard.');
                  }}
                  className="flex items-center space-x-1.5 py-2.5 px-4 border border-beige bg-white text-charcoal hover:border-gold text-xs font-medium tracking-luxury uppercase transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-charcoal-muted" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="bg-white p-4 sm:p-6 border border-beige shadow-subtle space-y-4">
            {/* Main Active Photo */}
            <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-navy-dark">
              <img
                src={imagesList[activeImageIndex]?.url}
                alt={imagesList[activeImageIndex]?.caption || property.title}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              <div className="absolute bottom-4 left-4 bg-navy-deep/80 backdrop-blur-md px-3.5 py-1.5 text-[10px] uppercase tracking-luxury text-ivory font-sans">
                {activeImageIndex + 1} of {imagesList.length} Photographs
              </div>
            </div>

            {/* Thumbnail Ribbon */}
            {imagesList.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-1">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-28 h-18 overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specifications, Overview & Concierge Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Key Specifications Grid */}
              <div className="bg-white p-8 border border-beige shadow-subtle">
                <h2 className="font-serif text-2xl text-navy font-normal mb-6">Asset Specifications</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                  <div className="bg-ivory-light p-4 border border-beige">
                    <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">Configuration</span>
                    <strong className="text-sm font-semibold text-navy">
                      {property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Plot Layout'}
                    </strong>
                  </div>
                  <div className="bg-ivory-light p-4 border border-beige">
                    <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">Super Built-up Area</span>
                    <strong className="text-sm font-semibold text-navy">
                      {formatArea(property.areaSqFt, 'sq.ft')}
                    </strong>
                  </div>
                  <div className="bg-ivory-light p-4 border border-beige">
                    <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">Bathrooms</span>
                    <strong className="text-sm font-semibold text-navy">{property.bathrooms || 'N/A'}</strong>
                  </div>
                  <div className="bg-ivory-light p-4 border border-beige">
                    <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">Furnishing</span>
                    <strong className="text-sm font-semibold text-navy">
                      {property.furnishing?.replace(/_/g, ' ') || 'Unfurnished'}
                    </strong>
                  </div>
                  <div className="bg-ivory-light p-4 border border-beige">
                    <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">Floor Level</span>
                    <strong className="text-sm font-semibold text-navy">
                      {property.floor} of {property.totalFloors}
                    </strong>
                  </div>
                  <div className="bg-ivory-light p-4 border border-beige">
                    <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">Possession</span>
                    <strong className="text-sm font-semibold text-navy">
                      {property.possessionStatus?.replace(/_/g, ' ') || 'Ready'}
                    </strong>
                  </div>
                  <div className="bg-ivory-light p-4 border border-beige">
                    <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">Orientation / Facing</span>
                    <strong className="text-sm font-semibold text-navy">{property.facing || 'East'}</strong>
                  </div>
                  <div className="bg-ivory-light p-4 border border-beige">
                    <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">MahaRERA Reference</span>
                    <strong className="text-xs font-mono text-navy truncate block">
                      {property.reraNumber || 'Verified Exemption'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-8 border border-beige shadow-subtle space-y-4">
                <h2 className="font-serif text-2xl text-navy font-normal">Architectural & Asset Description</h2>
                <div className="text-xs sm:text-sm text-charcoal-light leading-relaxed whitespace-pre-line font-sans">
                  {property.description}
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="bg-white p-8 border border-beige shadow-subtle">
                  <h2 className="font-serif text-2xl text-navy font-normal mb-6">Features & Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {property.amenities.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2.5 text-xs text-charcoal bg-ivory-light p-3 border border-beige font-sans">
                        <CheckCircle className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Map Preview */}
              <div className="bg-white p-8 border border-beige shadow-subtle space-y-4">
                <h2 className="font-serif text-2xl text-navy font-normal">Enclave Location</h2>
                <p className="text-xs text-charcoal-muted font-sans">
                  Strategically situated in prime <strong>{property.localityName}</strong>, Nagpur. Coordinates: {property.location?.coordinates?.[1] || 21.1458}, {property.location?.coordinates?.[0] || 79.0882}.
                </p>
                <div className="h-72 overflow-hidden bg-ivory border border-beige relative">
                  <iframe
                    title="Google Maps Location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://maps.google.com/maps?q=${property.location?.coordinates?.[1] || 21.1458},${property.location?.coordinates?.[0] || 79.0882}&hl=en&z=14&output=embed`}
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Right Sticky Sidebar */}
            <aside className="lg:col-span-4 space-y-6 sticky top-28">
              {/* Agent / Contact Card */}
              <div className="bg-white p-7 border border-beige shadow-subtle space-y-6">
                <div className="flex items-start space-x-4 pb-5 border-b border-beige">
                  <div className="w-14 h-14 border border-gold/40 bg-navy text-gold flex items-center justify-center font-serif text-xl font-bold shrink-0">
                    {property.assignedAgent?.name?.[0] || property.owner?.name?.[0] || 'N'}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-normal text-navy">
                      {property.assignedAgent?.name || property.owner?.name || 'Verified Property Advisor'}
                    </h3>
                    <span className="text-xs text-charcoal-muted font-sans block mt-0.5">
                      {property.assignedAgent ? 'Certified Nagpur Estates Broker' : 'Direct Asset Principal'}
                    </span>
                    <span className="inline-flex items-center text-[10px] uppercase tracking-luxury text-gold font-medium mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      MahaRERA Accreditation Verified
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setEnquiryModalOpen(true)}
                    className="w-full bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase py-3.5 transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-gold" />
                    <span>Inquire Concerning Asset</span>
                  </button>

                  <button
                    onClick={() => setSiteVisitModalOpen(true)}
                    className="w-full bg-ivory hover:bg-ivory-dark text-navy border border-beige text-xs font-medium tracking-luxury uppercase py-3.5 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-3.5 h-3.5 text-gold" />
                    <span>Schedule Private Viewing</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <a
                      href={`tel:+91${contactPhone}`}
                      className="flex items-center justify-center space-x-1.5 py-3 border border-beige bg-white text-navy hover:border-gold text-xs uppercase tracking-luxury font-medium transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-gold" />
                      <span>Direct Call</span>
                    </a>
                    <a
                      href={`https://wa.me/91${contactPhone}?text=Hello!%20I%20am%20inquiring%20regarding%20"${encodeURIComponent(property.title)}"%20on%20Nagpur%20Estates.`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center space-x-1.5 py-3 bg-gold hover:bg-gold-light text-navy text-xs uppercase tracking-luxury font-medium transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Capital & Mortgage Planning Card */}
              <div className="bg-navy text-ivory p-7 border border-navy-light shadow-subtle space-y-4">
                <span className="text-[10px] font-semibold uppercase tracking-luxury text-gold border border-gold/40 px-2.5 py-0.5 bg-navy-dark inline-block">
                  Institutional Capital
                </span>
                <h4 className="font-serif text-xl font-normal text-white">Mortgage & Financing Desk</h4>
                <p className="text-xs text-ivory/70 leading-relaxed font-sans">
                  Access preferential borrowing rates with HDFC, ICICI, SBI, and Axis Bank for acquisition in {property.localityName}.
                </p>
                <Link
                  to="/tools/emi-calculator"
                  className="inline-flex items-center text-xs uppercase tracking-luxury text-gold hover:text-white transition-colors font-medium pt-2"
                >
                  <span>Review Amortization Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            </aside>
          </div>

          {/* Similar Properties Section */}
          {similarProperties && similarProperties.length > 0 && (
            <div className="pt-12 border-t border-beige">
              <div className="mb-8">
                <span className="text-[10px] uppercase tracking-luxury text-gold font-semibold block mb-1">
                  Complementary Enclave
                </span>
                <h2 className="font-serif text-3xl text-navy font-normal">
                  Related Residences in {property.localityName}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
