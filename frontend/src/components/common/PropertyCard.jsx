import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart, Phone, MessageSquare } from 'lucide-react';
import { formatIndianPrice, formatArea, calculateEstimateEmi } from '../../utils/formatters';
import { useAuthStore } from '../../store/useAuthStore';
import apiClient from '../../api/client';

const PropertyCard = ({ property, onOpenAuth, layout = 'horizontal' }) => {
  const navigate = useNavigate();
  const { isAuthenticated, savedPropertyIds, toggleSavedPropertyId } = useAuthStore();
  const isSaved = savedPropertyIds?.has(property?._id) || property?.isSaved;

  if (!property) return null;

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
    e.preventDefault();
    e.stopPropagation();
    const phone = property.assignedAgent?.phone || property.owner?.phone || '9823000000';
    window.location.href = `tel:+91${phone}`;
  };

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const phone = property.assignedAgent?.phone || property.owner?.phone || '9823000000';
    const text = encodeURIComponent(
      `Hello, I am interested in "${property.title}" in ${property.localityName || 'Nagpur'}.`
    );
    window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
  };

  const defaultImage =
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
  const coverImage = property.coverImage || property.images?.[0]?.url || defaultImage;

  const emiText = property.price ? calculateEstimateEmi(property.price).replace('/mo', '/month') : null;

  // Render Horizontal Layout (Matches Reference Image Screen 3 Desktop & collapses on Screen 4 Mobile)
  if (layout === 'horizontal') {
    return (
      <div
        onClick={() => navigate(`/properties/${property.slug}`)}
        className="group cursor-pointer bg-white rounded-xl border border-[#E9E4DA] hover:border-[#B89A65]/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row"
      >
        {/* Photo Container */}
        <div className="relative md:w-[38%] min-h-[210px] md:min-h-[220px] bg-gray-100 flex-shrink-0 overflow-hidden">
          <img
            src={coverImage}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />

          {/* Badges on Top Left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {property.isFeatured ? (
              <span className="bg-[#B89A65] text-white text-[10px] font-semibold px-2.5 py-1 rounded shadow-sm">
                Featured
              </span>
            ) : property.isVerified ? (
              <span className="bg-[#16A34A] text-white text-[10px] font-semibold px-2.5 py-1 rounded shadow-sm">
                Verified
              </span>
            ) : null}
          </div>

          {/* Save Heart Button Top Right */}
          <button
            type="button"
            onClick={handleSaveToggle}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center transition-colors shadow-sm z-10"
            aria-label="Save Property"
          >
            <Heart
              className={`w-4 h-4 ${
                isSaved ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </button>
        </div>

        {/* Content Details Container */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5">
            {/* Title */}
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#172C3B] group-hover:text-[#B89A65] transition-colors line-clamp-1">
              {property.title}
            </h3>

            {/* Locality */}
            <div className="flex items-center text-xs text-gray-500 space-x-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{property.localityName || 'Nagpur'}, Nagpur</span>
            </div>

            {/* Specs row: BHK | Bath | Area */}
            <div className="flex items-center text-xs text-gray-600 pt-1 space-x-2">
              {property.bedrooms > 0 && (
                <>
                  <span>{property.bedrooms} BHK</span>
                  <span className="text-gray-300">|</span>
                </>
              )}
              {property.bathrooms > 0 && (
                <>
                  <span>{property.bathrooms} Bath</span>
                  <span className="text-gray-300">|</span>
                </>
              )}
              <span>{formatArea(property.areaSqFt)}</span>
            </div>
          </div>

          {/* Bottom Price & Contact Row */}
          <div className="pt-4 mt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-[#172C3B]">
                {formatIndianPrice(property.price, property.purpose === 'RENT' ? 'Per Month' : 'Total')}
              </div>
              {emiText && property.purpose !== 'RENT' && (
                <div className="text-[11px] text-gray-500">
                  EMI from {emiText}
                </div>
              )}
            </div>

            {/* Action Buttons: Call & WhatsApp */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCallClick}
                className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-[#172C3B] text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 text-[#172C3B]" />
                <span>Call</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="px-3.5 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-white" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vertical Grid Layout (For Featured Properties Grid & Screen 4 Mobile)
  return (
    <div
      onClick={() => navigate(`/properties/${property.slug}`)}
      className="group cursor-pointer bg-white rounded-xl border border-[#E9E4DA] hover:border-[#B89A65]/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Photo Container */}
        <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
          <img
            src={coverImage}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />

          {/* Badges on Top Left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {property.isFeatured ? (
              <span className="bg-[#B89A65] text-white text-[10px] font-semibold px-2.5 py-1 rounded shadow-sm">
                Featured
              </span>
            ) : property.isVerified ? (
              <span className="bg-[#16A34A] text-white text-[10px] font-semibold px-2.5 py-1 rounded shadow-sm">
                Verified
              </span>
            ) : null}
          </div>

          {/* Save Heart Button Top Right */}
          <button
            type="button"
            onClick={handleSaveToggle}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center transition-colors shadow-sm z-10"
            aria-label="Save Property"
          >
            <Heart
              className={`w-4 h-4 ${
                isSaved ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-1.5">
          <h3 className="font-serif text-base font-bold text-[#172C3B] group-hover:text-[#B89A65] transition-colors line-clamp-1">
            {property.title}
          </h3>

          <div className="flex items-center text-xs text-gray-500 space-x-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{property.localityName || 'Nagpur'}, Nagpur</span>
          </div>

          <div className="flex items-center text-xs text-gray-600 pt-1 space-x-2">
            {property.bedrooms > 0 && (
              <>
                <span>{property.bedrooms} BHK</span>
                <span className="text-gray-300">|</span>
              </>
            )}
            {property.bathrooms > 0 && (
              <>
                <span>{property.bathrooms} Bath</span>
                <span className="text-gray-300">|</span>
              </>
            )}
            <span>{formatArea(property.areaSqFt)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Price & Contact Row */}
      <div className="p-4 pt-3 border-t border-gray-100 flex items-end justify-between">
        <div>
          <div className="text-lg font-bold text-[#172C3B]">
            {formatIndianPrice(property.price, property.purpose === 'RENT' ? 'Per Month' : 'Total')}
          </div>
          {emiText && property.purpose !== 'RENT' && (
            <div className="text-[10px] text-gray-500">
              EMI from {emiText}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={handleCallClick}
            className="p-2 bg-white hover:bg-gray-50 border border-gray-300 text-[#172C3B] rounded-lg transition-colors shadow-sm"
            title="Call Agent"
          >
            <Phone className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="px-2.5 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors shadow-sm"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
