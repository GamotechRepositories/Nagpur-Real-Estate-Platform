import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Heart,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatIndianPrice, formatArea } from '../../utils/formatters';
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
      `Hello, I would like to inquire about "${property.title}" in ${property.localityName}, Nagpur.`
    );
    window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
  };

  const defaultImage =
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
  const coverImage = property.coverImage || (property.images && property.images[0]?.url) || defaultImage;

  return (
    <div className="group bg-[#FFFFFF] border border-[#E9E4DA] hover:border-[#B89A65]/60 transition-all duration-300 flex flex-col justify-between shadow-subtle hover:shadow-hover">
      <div>
        {/* Photo Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#172C3B]">
          <Link to={`/properties/${property.slug}`}>
            <img
              src={coverImage}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 text-[10px] uppercase tracking-wider font-semibold">
            {property.isFeatured && (
              <span className="bg-[#B89A65] text-[#FFFFFF] px-2.5 py-1">
                Curated
              </span>
            )}
            {property.isVerified && (
              <span className="bg-[#172C3B]/90 backdrop-blur-sm text-[#F7F4ED] px-2.5 py-1 border border-[#B89A65]/40 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-[#B89A65]" />
                <span>Verified</span>
              </span>
            )}
            <span className="bg-[#FFFFFF]/90 text-[#172C3B] px-2 py-1">
              {property.purpose === 'BUY' ? 'For Sale' : 'For Lease'}
            </span>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveToggle}
            className="absolute top-3 right-3 p-2 bg-[#FFFFFF]/90 text-[#252525] hover:text-[#B89A65] transition-colors shadow-sm"
            title={isSaved ? 'Remove from Wishlist' : 'Save Property'}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#B89A65] text-[#B89A65]' : ''}`} />
          </button>

          {/* Property Category Pill */}
          <div className="absolute bottom-3 left-3 bg-[#172C3B]/80 text-[#E9E4DA] text-[10px] uppercase tracking-wider px-2 py-0.5">
            {property.subtype?.replace('_', ' ')}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {/* Price */}
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-semibold text-[#172C3B] tracking-tight">
              {formatIndianPrice(property.price, property.priceUnit)}
            </span>
            <span className="text-[11px] text-[#252525]/60 uppercase tracking-wider font-medium">
              {property.localityName}
            </span>
          </div>

          {/* Property Title */}
          <Link to={`/properties/${property.slug}`}>
            <h3 className="font-serif text-base font-semibold text-[#252525] group-hover:text-[#B89A65] transition-colors line-clamp-2 leading-snug">
              {property.title}
            </h3>
          </Link>

          {/* Location */}
          <div className="flex items-center text-xs text-[#252525]/60">
            <MapPin className="w-3.5 h-3.5 text-[#B89A65] mr-1 flex-shrink-0" />
            <span className="truncate">{property.address || property.localityName}, Nagpur</span>
          </div>

          {/* Specifications Ribbon */}
          <div className="pt-3 border-t border-[#E9E4DA] grid grid-cols-3 gap-2 text-xs text-[#252525] font-medium">
            {property.bedrooms > 0 ? (
              <div className="flex items-center space-x-1.5">
                <Bed className="w-3.5 h-3.5 text-[#B89A65] flex-shrink-0" />
                <span>{property.bedrooms} BHK</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Square className="w-3.5 h-3.5 text-[#B89A65] flex-shrink-0" />
                <span>Plot</span>
              </div>
            )}

            {property.bathrooms > 0 && (
              <div className="flex items-center space-x-1.5">
                <Bath className="w-3.5 h-3.5 text-[#B89A65] flex-shrink-0" />
                <span>{property.bathrooms} Baths</span>
              </div>
            )}

            <div className="flex items-center space-x-1.5">
              <Square className="w-3.5 h-3.5 text-[#B89A65] flex-shrink-0" />
              <span>{formatArea(property.areaSqFt, 'sqft')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-5 pt-0 border-t border-transparent">
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E9E4DA]/60">
          <Link
            to={`/properties/${property.slug}`}
            className="flex items-center justify-center space-x-1 py-2 px-3 bg-[#172C3B] hover:bg-[#223D52] text-[#FFFFFF] text-[11px] uppercase tracking-luxury font-medium transition-colors"
          >
            <span>View Residence</span>
            <ArrowRight className="w-3 h-3 text-[#B89A65]" />
          </Link>

          <button
            onClick={handleWhatsAppClick}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-[#E9E4DA] hover:border-[#172C3B] text-[#252525] text-[11px] uppercase tracking-luxury font-medium transition-colors bg-[#F7F4ED]"
          >
            <MessageSquare className="w-3 h-3 text-[#B89A65]" />
            <span>Inquire</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
