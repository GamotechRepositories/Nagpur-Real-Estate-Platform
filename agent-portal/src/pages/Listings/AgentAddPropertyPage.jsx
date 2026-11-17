import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Building2,
  Layers,
  MapPin,
  IndianRupee,
  Home,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { apiClient } from '../../api/client';

const AMENITY_OPTIONS = [
  'Lift / Elevator',
  '24x7 Security & Guard',
  'Reserved Covered Parking',
  'Power Backup',
  '24 Hours Water Supply',
  'Gymnasium',
  'Swimming Pool',
  'Clubhouse',
  'Children Play Area',
  'CCTV Surveillance',
  'Intercom Facility',
  'Rainwater Harvesting',
  'Fire Safety Equipment',
  'Vastu Compliant',
];

export const AgentAddPropertyPage = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Fetch Projects for township linkage
  const { data: projectsData } = useQuery({
    queryKey: ['projects-dropdown'],
    queryFn: () => apiClient.get('/projects'),
  });

  // Fetch Localities for dropdown
  const { data: localitiesData } = useQuery({
    queryKey: ['localities-dropdown'],
    queryFn: () => apiClient.get('/localities'),
  });

  const projects = projectsData?.data || [];
  const localities = localitiesData?.data || [];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    purpose: 'SALE',
    category: 'RESIDENTIAL',
    subtype: 'APARTMENT',
    price: '',
    pricePerSqFt: '',
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    areaSqFt: '',
    carpetAreaSqFt: '',
    project: '',
    localityName: 'Besa',
    address: '',
    pincode: '440034',
    latitude: 21.1458,
    longitude: 79.0882,
    possessionStatus: 'READY_TO_MOVE',
    furnishing: 'SEMI_FURNISHED',
    amenities: ['24 Hours Water Supply', 'Reserved Covered Parking', 'Lift / Elevator'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Front Elevation',
        isCover: true,
      },
    ],
  });

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          url: imageUrlInput.trim(),
          caption: `Property Image ${prev.images.length + 1}`,
          isCover: prev.images.length === 0,
        },
      ],
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleToggleAmenity = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const createMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/properties', payload),
    onSuccess: () => {
      navigate('/listings?status=PENDING_REVIEW');
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to submit property listing.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Please enter a listing title.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setErrorMsg('Please enter a valid price.');
      return;
    }
    if (!formData.areaSqFt || Number(formData.areaSqFt) <= 0) {
      setErrorMsg('Please enter the built-up area in sq.ft.');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      pricePerSqFt: formData.pricePerSqFt ? Number(formData.pricePerSqFt) : undefined,
      areaSqFt: Number(formData.areaSqFt),
      carpetAreaSqFt: formData.carpetAreaSqFt ? Number(formData.carpetAreaSqFt) : undefined,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      balconies: Number(formData.balconies),
      latitude: Number(formData.latitude) || 21.1458,
      longitude: Number(formData.longitude) || 79.0882,
      project: formData.project ? formData.project : undefined,
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Heading */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/listings')}
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Post New Property Listing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit your residential or commercial inventory directly to Nagpur Real Estate marketplace.
          </p>
        </div>
      </div>

      {/* Info notice about moderation workflow */}
      <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start gap-2.5">
        <Info size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-bold text-teal-950">Moderation Review Notice</p>
          <p className="text-teal-800 mt-0.5">
            All partner listings are automatically verified by our local operations desk within 24 hours
            before going live to buyers. Once approved, you'll receive direct WhatsApp inquiries on your dashboard.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Property Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Building2 size={15} className="text-teal-600" />
            <span>1. Basic Listing Specifications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purpose *
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
              >
                <option value="SALE">For Sale</option>
                <option value="RENT">For Rent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
              >
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="PLOT">Plot / Land</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subtype *
              </label>
              <select
                value={formData.subtype}
                onChange={(e) => setFormData({ ...formData, subtype: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
              >
                <option value="APARTMENT">Apartment / Flat</option>
                <option value="INDEPENDENT_HOUSE">Independent House</option>
                <option value="VILLA">Luxury Villa</option>
                <option value="RESIDENTIAL_PLOT">Residential Plot</option>
                <option value="COMMERCIAL_OFFICE">Commercial Office</option>
                <option value="RETAIL_SHOP">Retail Shop</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Property Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Premium 3 BHK Luxury Apartment in Besa with Modular Kitchen"
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Highlight construction quality, natural lighting, road width, nearby metro/hospital/school..."
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600 resize-none"
            />
          </div>
        </div>

        {/* Pricing & Dimensions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <IndianRupee size={15} className="text-teal-600" />
            <span>2. Pricing & Dimensions</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Price (₹) *
              </label>
              <input
                type="number"
                min={0}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., 6500000"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Built-up Area (Sq.Ft) *
              </label>
              <input
                type="number"
                min={1}
                value={formData.areaSqFt}
                onChange={(e) => setFormData({ ...formData, areaSqFt: e.target.value })}
                placeholder="e.g., 1450"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Carpet Area (Sq.Ft)
              </label>
              <input
                type="number"
                min={1}
                value={formData.carpetAreaSqFt}
                onChange={(e) => setFormData({ ...formData, carpetAreaSqFt: e.target.value })}
                placeholder="e.g., 1120"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bedrooms (BHK)
              </label>
              <select
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
              >
                <option value={0}>0 (Plot / Studio)</option>
                <option value={1}>1 BHK</option>
                <option value={2}>2 BHK</option>
                <option value={3}>3 BHK</option>
                <option value={4}>4 BHK</option>
                <option value={5}>5+ BHK</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bathrooms
              </label>
              <select
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
              >
                <option value={1}>1 Bathroom</option>
                <option value={2}>2 Bathrooms</option>
                <option value={3}>3 Bathrooms</option>
                <option value={4}>4+ Bathrooms</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Possession Status
              </label>
              <select
                value={formData.possessionStatus}
                onChange={(e) => setFormData({ ...formData, possessionStatus: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
              >
                <option value="READY_TO_MOVE">Ready to Move</option>
                <option value="UNDER_CONSTRUCTION">Under Construction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Furnishing
              </label>
              <select
                value={formData.furnishing}
                onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
              >
                <option value="UNFURNISHED">Unfurnished</option>
                <option value="SEMI_FURNISHED">Semi-Furnished</option>
                <option value="FURNISHED">Fully Furnished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Township Project & Locality Linkage */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Layers size={15} className="text-teal-600" />
            <span>3. Township Project & Location in Nagpur</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Project Linkage Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Part of a Township / Project? (Optional)
              </label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full bg-white border border-teal-300 rounded-lg px-3 py-2 text-xs text-teal-800 font-semibold outline-none focus:border-teal-600"
              >
                <option value="">-- Standalone / Individual Listing --</option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    🏢 {proj.name} ({proj.localityName || 'Nagpur'})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Linking attaches this listing directly to the project's inventory showcase.
              </span>
            </div>

            {/* Locality Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Locality / Area Name *
              </label>
              <select
                value={formData.localityName}
                onChange={(e) => setFormData({ ...formData, localityName: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
              >
                {localities.length > 0 ? (
                  localities.map((loc) => (
                    <option key={loc._id} value={loc.name}>
                      📍 {loc.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Besa">Besa</option>
                    <option value="Manish Nagar">Manish Nagar</option>
                    <option value="Wardha Road">Wardha Road</option>
                    <option value="Dharampeth">Dharampeth</option>
                    <option value="Hingna Road">Hingna Road</option>
                    <option value="MIHAN">MIHAN</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exact Address / Landmark
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g., Near Besa Square, Opposite Royal Palace, Nagpur"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600"
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Home size={15} className="text-teal-600" />
            <span>4. Amenities & Facilities</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {AMENITY_OPTIONS.map((amenity) => {
              const isChecked = formData.amenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => handleToggleAmenity(amenity)}
                  className={`p-2.5 rounded-lg border text-left text-xs font-medium transition flex items-center justify-between ${
                    isChecked
                      ? 'bg-teal-50 text-teal-800 border-teal-300 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{amenity}</span>
                  {isChecked && <CheckCircle size={14} className="text-teal-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Media / Photos */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5">
            5. Listing Photos & Gallery
          </h3>

          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Paste direct image URL (e.g., https://...)"
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus size={14} />
              <span>Add URL</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative rounded-lg overflow-hidden group bg-slate-100 aspect-video border border-slate-200">
                <img src={img.url} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition hover:bg-rose-600 hover:text-white"
                >
                  <Trash2 size={13} />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 bg-teal-700 text-[9px] font-bold text-white px-1.5 py-0.5 rounded">
                    COVER
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-2xs transition disabled:opacity-50"
          >
            {createMutation.isPending ? 'Submitting to Moderation...' : 'Submit Property for Review'}
          </button>
        </div>
      </form>
    </div>
  );
};
