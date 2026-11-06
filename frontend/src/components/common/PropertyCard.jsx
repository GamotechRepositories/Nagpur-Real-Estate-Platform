import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bed,
  Bath,
  Square,
  MapPin,
  ShieldCheck,
  Heart,
  Phone,
  MessageSquare,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { formatIndianPrice, formatArea, calculateEstimateEmi, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../store/useAuthStore';
import apiClient from '../../api/client';

const PropertyCard = ({ property, onOpenAuth }) => {
  const { isAuthenticated, savedPropertyIds, toggleSavedPropertyId } = useAuthStore();
  const isSaved = savedPropertyIds.has(property._id) || property.isSaved;

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth();
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
      // Revert if API fails
      toggleSavedPropertyId(property._id);
    }
  };

  const handleCallClick = (e) => {
    e.stopPropagation();
    const phone = property.assignedAgent?.phone || property.owner?.phone || '9823000000';
    window.location.href = `tel:+91${phone}`;
  };

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    const phone = property.assignedAgent?.phone || property.owner?.phone || '9823000000';
    const text = encodeURIComponent(
      `Hello! I am interested in your listing on Nagpur Real Estate: "${property.title}" (₹ ${property.price.toLocaleString('en-IN')}) in ${property.localityName}. Please share details.`
    );
    window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
  };

  // Fallback image
  const defaultImage =
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
  const coverImage = property.coverImage || (property.images && property.images[0]?.url) || defaultImage;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image & Badges Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <Link to={`/properties/${property.slug}`}>
            <img
              src={coverImage}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {property.isVerified && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600/95 backdrop-blur text-white text-[11px] font-bold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            )}
            {property.isFeatured && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-brand-orange text-white text-[11px] font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured</span>
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-brand-navy/80 backdrop-blur text-white text-[11px] font-semibold">
              {property.purpose === 'BUY' ? 'For Sale' : 'For Rent'}
            </span>
          </div>

          {/* Save Wishlist Heart Button */}
          <button
            onClick={handleSaveToggle}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur text-slate-700 hover:text-red-500 hover:bg-white shadow-md transition-all active:scale-90"
            title={isSaved ? 'Remove from saved' : 'Save property'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          {/* Property Subtype pill */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-800 shadow-sm">
            {property.subtype?.replace('_', ' ')}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5">
          {/* Price & Estimated EMI */}
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl sm:text-2xl font-black text-brand-navy">
              {formatIndianPrice(property.price, property.priceUnit)}
            </span>
            {property.purpose === 'BUY' && (
              <span className="text-[11px] font-medium text-slate-500">
                EMI from <strong className="text-slate-800">{calculateEstimateEmi(property.price)}</strong>
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/properties/${property.slug}`}>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-orange transition-colors line-clamp-2 mb-2 leading-snug">
              {property.title}
            </h3>
          </Link>

          {/* Locality */}
          <div className="flex items-center text-xs text-slate-500 mb-4">
            <MapPin className="w-3.5 h-3.5 text-brand-orange mr-1 flex-shrink-0" />
            <span className="truncate">{property.localityName}, Nagpur</span>
          </div>

          {/* Property Specifications Grid */}
          <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-b border-slate-100 text-xs text-slate-700 font-medium">
            {property.bedrooms > 0 ? (
              <div className="flex items-center space-x-1.5">
                <Bed className="w-4 h-4 text-brand-teal flex-shrink-0" />
                <span>{property.bedrooms} BHK</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Square className="w-4 h-4 text-brand-teal flex-shrink-0" />
                <span>Open Plot</span>
              </div>
            )}

            {property.bathrooms > 0 && (
              <div className="flex items-center space-x-1.5">
                <Bath className="w-4 h-4 text-brand-teal flex-shrink-0" />
                <span>{property.bathrooms} Baths</span>
              </div>
            )}

            <div className="flex items-center space-x-1.5">
              <Square className="w-4 h-4 text-brand-teal flex-shrink-0" />
              <span>{formatArea(property.areaSqFt, 'sqft')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 pt-0">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Posted {formatDate(property.createdAt)}</span>
          </span>
          <span className="text-slate-600 font-medium">{property.furnishing?.replace('_', ' ')}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCallClick}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-brand-teal" />
            <span>Call</span>
          </button>
          <button
            onClick={handleWhatsAppClick}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;

