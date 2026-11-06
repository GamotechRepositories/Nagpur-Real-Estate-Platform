import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Building,
  Home,
  MapPin,
  Image as ImageIcon,
  Send,
  Save,
  AlertCircle,
  Upload,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import AuthModal from '../../components/common/AuthModal';

const STEPS = [
  { id: 1, name: 'Purpose' },
  { id: 2, name: 'Asset Type' },
  { id: 3, name: 'Specifications' },
  { id: 4, name: 'Enclave & Map' },
  { id: 5, name: 'Photography' },
  { id: 6, name: 'Review & Submit' },
];

const NAGPUR_LOCALITY_OPTIONS = [
  { name: 'Dharampeth', lat: 21.1438, lng: 79.0607, pincode: '440010' },
  { name: 'Manish Nagar', lat: 21.0922, lng: 79.0831, pincode: '440015' },
  { name: 'Wardha Road', lat: 21.0664, lng: 79.0628, pincode: '440025' },
  { name: 'Besa', lat: 21.0851, lng: 79.1027, pincode: '440037' },
  { name: 'Civil Lines', lat: 21.1558, lng: 79.0725, pincode: '440001' },
  { name: 'Ramdaspeth', lat: 21.1372, lng: 79.0718, pincode: '440010' },
  { name: 'Shankar Nagar', lat: 21.1345, lng: 79.0588, pincode: '440010' },
  { name: 'Sitabuldi', lat: 21.1466, lng: 79.0839, pincode: '440012' },
  { name: 'Hingna Road', lat: 21.1098, lng: 78.9954, pincode: '440016' },
  { name: 'Pratap Nagar', lat: 21.1189, lng: 79.0567, pincode: '440022' },
];

const STANDARD_AMENITIES = [
  '24x7 Security & CCTV',
  '100% Power Backup',
  'High Speed Lift',
  'Gymnasium & Fitness',
  'Swimming Pool',
  'Reserved Covered Parking',
  'Children Play Area & Park',
  'Club House',
  'Rainwater Harvesting',
  'Piped Gas Connection',
];

const PostPropertyPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    purpose: 'BUY',
    category: 'RESIDENTIAL',
    subtype: 'FLAT',
    title: '',
    description: '',
    price: '',
    priceUnit: 'TOTAL',
    areaSqFt: '',
    bedrooms: 3,
    bathrooms: 2,
    balconies: 1,
    furnishing: 'SEMI_FURNISHED',
    possessionStatus: 'READY_TO_MOVE',
    facing: 'EAST',
    floor: 4,
    totalFloors: 10,
    localityName: 'Dharampeth',
    address: '',
    pincode: '440010',
    latitude: 21.1438,
    longitude: 79.0607,
    amenities: ['24x7 Security & CCTV', 'Reserved Covered Parking'],
    images: [
      { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', caption: 'Living Room' },
    ],
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  const updateField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const toggleAmenity = (amenity) => {
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

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { url: imageUrlInput.trim(), caption: 'Property Photo' }],
    }));
    setImageUrlInput('');
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleLocalitySelect = (name) => {
    const loc = NAGPUR_LOCALITY_OPTIONS.find((l) => l.name === name);
    if (loc) {
      setFormData((prev) => ({
        ...prev,
        localityName: loc.name,
        pincode: loc.pincode,
        latitude: loc.lat,
        longitude: loc.lng,
      }));
    }
  };

  const validateCurrentStep = () => {
    setError('');
    if (currentStep === 3) {
      if (!formData.title.trim()) {
        setError('Please provide a listing title');
        return false;
      }
      if (!formData.price || Number(formData.price) <= 0) {
        setError('Please provide a valid property valuation/price');
        return false;
      }
      if (!formData.areaSqFt || Number(formData.areaSqFt) <= 0) {
        setError('Please enter the built-up area in square feet');
        return false;
      }
    }
    if (currentStep === 4) {
      if (!formData.address.trim()) {
        setError('Please provide a detailed address or landmark in Nagpur');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        areaSqFt: Number(formData.areaSqFt),
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        balconies: Number(formData.balconies) || 0,
        floor: Number(formData.floor) || 0,
        totalFloors: Number(formData.totalFloors) || 1,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      };

      await apiClient.post(`/properties?draft=${isDraft}`, payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit property. Please check the fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-ivory-light py-20">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-6 bg-white p-12 border border-beige shadow-subtle">
          <div className="w-16 h-16 border border-gold text-gold flex items-center justify-center mx-auto bg-ivory">
            <CheckCircle className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="font-serif text-3xl text-navy">Asset Listing Submitted</h2>
          <p className="text-xs text-charcoal-muted max-w-md mx-auto font-sans leading-relaxed">
            Your property portfolio asset has been recorded for review. Our compliance desk will verify title documentation to publish it live on the marketplace.
          </p>
          <div className="pt-4 flex justify-center space-x-4">
            <button
              onClick={() => navigate('/account/my-properties')}
              className="bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase py-3.5 px-6 transition-colors"
            >
              My Listings
            </button>
            <button
              onClick={() => navigate('/properties')}
              className="border border-beige bg-ivory text-charcoal text-xs font-medium tracking-luxury uppercase py-3.5 px-6 hover:border-gold transition-colors"
            >
              Browse Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>List Your Property in Nagpur | Nagpur Estates Private Portal</title>
        <meta
          name="description"
          content="Privately list your luxury apartment, independent bungalow, or NMRDA sanctioned plot in Nagpur."
        />
      </Helmet>

      <div className="bg-ivory-light min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10 border-b border-beige pb-6">
            <span className="text-[10px] uppercase tracking-luxury text-gold font-semibold block mb-1">
              Private Placement & Public Listing
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-navy font-normal tracking-tight">
              Publish Your Nagpur Property Asset
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2 font-sans">
              Connect directly with verified investors, homebuyers, and executive corporate tenants
            </p>
          </div>

          {/* Stepper Wizard Indicator */}
          <div className="bg-white p-5 border border-beige shadow-subtle mb-10">
            <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-0">
              {STEPS.map((s) => (
                <div key={s.id} className="flex items-center space-x-2 shrink-0">
                  <div
                    className={`w-7 h-7 flex items-center justify-center text-xs font-mono transition-colors ${
                      currentStep === s.id
                        ? 'bg-navy text-gold border border-gold'
                        : currentStep > s.id
                        ? 'bg-gold text-navy font-bold'
                        : 'bg-ivory text-charcoal-muted border border-beige'
                    }`}
                  >
                    {currentStep > s.id ? '✓' : s.id}
                  </div>
                  <span
                    className={`text-[11px] uppercase tracking-luxury hidden sm:inline font-sans ${
                      currentStep === s.id ? 'text-navy font-semibold' : 'text-charcoal-muted'
                    }`}
                  >
                    {s.name}
                  </span>
                  {s.id < STEPS.length && (
                    <div className="w-4 sm:w-8 h-[1px] bg-beige mx-1 sm:mx-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white p-8 sm:p-12 border border-beige shadow-subtle">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-xs text-red-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: PURPOSE */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl text-navy font-normal">Step 1: Listing Mandate Purpose</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'BUY', label: 'Sell Property / Capital Disposition', desc: 'Attract qualified buyers for flats, villas, plots, or commercial suites' },
                    { id: 'RENT', label: 'Executive Lease / Rental', desc: 'Engage high-caliber corporate and residential tenants' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => updateField('purpose', p.id)}
                      className={`p-6 border text-left transition-colors ${
                        formData.purpose === p.id
                          ? 'border-navy bg-ivory text-navy'
                          : 'border-beige hover:border-gold'
                      }`}
                    >
                      <h3 className="font-serif text-lg text-navy">{p.label}</h3>
                      <p className="text-xs text-charcoal-muted mt-1 font-sans">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: ASSET TYPE */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl text-navy font-normal">Step 2: Property Asset Classification</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { subtype: 'FLAT', category: 'RESIDENTIAL', label: 'Luxury Apartment / Flat' },
                    { subtype: 'HOUSE_VILLA', category: 'RESIDENTIAL', label: 'Independent Villa / Bungalow' },
                    { subtype: 'PLOT', category: 'PLOT', label: 'NMRDA Sanctioned Plot' },
                    { subtype: 'COMMERCIAL_SHOP', category: 'COMMERCIAL', label: 'Retail Commercial Shop' },
                    { subtype: 'COMMERCIAL_OFFICE', category: 'COMMERCIAL', label: 'Grade-A Office Suite' },
                    { subtype: 'WAREHOUSE', category: 'COMMERCIAL', label: 'Industrial Warehouse' },
                  ].map((item) => (
                    <button
                      key={item.subtype}
                      type="button"
                      onClick={() => {
                        updateField('subtype', item.subtype);
                        updateField('category', item.category);
                      }}
                      className={`p-6 border text-center transition-colors ${
                        formData.subtype === item.subtype
                          ? 'border-navy bg-ivory text-navy font-semibold'
                          : 'border-beige text-charcoal hover:border-gold'
                      }`}
                    >
                      <Building className="w-6 h-6 mx-auto mb-2 text-gold stroke-[1.5]" />
                      <span className="text-xs block font-sans uppercase tracking-luxury">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: DETAILS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl text-navy font-normal">Step 3: Specifications & Capital Valuation</h2>

                <div>
                  <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                    Asset Headline Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spacious 3 BHK Garden Facing Residence in Dharampeth West"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                      Valuation (₹ in Rupees)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 8500000"
                      value={formData.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                      Super Built-up Area (Sq.Ft)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1650"
                      value={formData.areaSqFt}
                      onChange={(e) => updateField('areaSqFt', e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                    />
                  </div>
                </div>

                {formData.category === 'RESIDENTIAL' && formData.subtype !== 'PLOT' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                        Bedrooms
                      </label>
                      <select
                        value={formData.bedrooms}
                        onChange={(e) => updateField('bedrooms', Number(e.target.value))}
                        className="w-full p-2.5 border border-beige bg-ivory-light text-xs text-navy font-sans"
                      >
                        {[1, 2, 3, 4, 5].map((b) => (
                          <option key={b} value={b}>{b} BHK</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                        Bathrooms
                      </label>
                      <select
                        value={formData.bathrooms}
                        onChange={(e) => updateField('bathrooms', Number(e.target.value))}
                        className="w-full p-2.5 border border-beige bg-ivory-light text-xs text-navy font-sans"
                      >
                        {[1, 2, 3, 4].map((b) => (
                          <option key={b} value={b}>{b} Baths</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                        Furnishing
                      </label>
                      <select
                        value={formData.furnishing}
                        onChange={(e) => updateField('furnishing', e.target.value)}
                        className="w-full p-2.5 border border-beige bg-ivory-light text-xs text-navy font-sans"
                      >
                        <option value="UNFURNISHED">Unfurnished</option>
                        <option value="SEMI_FURNISHED">Semi-Furnished</option>
                        <option value="FULLY_FURNISHED">Fully Furnished</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                        Possession
                      </label>
                      <select
                        value={formData.possessionStatus}
                        onChange={(e) => updateField('possessionStatus', e.target.value)}
                        className="w-full p-2.5 border border-beige bg-ivory-light text-xs text-navy font-sans"
                      >
                        <option value="READY_TO_MOVE">Ready to Move</option>
                        <option value="UNDER_CONSTRUCTION">Under Construction</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                    Detailed Narrative & Features
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe architectural attributes, natural illumination, cross ventilation, distance to Nagpur Metro, MahaRERA certifications..."
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full p-3.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-2 font-medium">
                    Amenities Provided
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STANDARD_AMENITIES.map((am) => (
                      <button
                        key={am}
                        type="button"
                        onClick={() => toggleAmenity(am)}
                        className={`p-2.5 border text-xs text-left transition-colors font-sans ${
                          formData.amenities.includes(am)
                            ? 'border-navy bg-navy text-white font-medium'
                            : 'border-beige bg-ivory-light text-charcoal hover:border-gold'
                        }`}
                      >
                        {formData.amenities.includes(am) ? '✓ ' : '+ '}
                        {am}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: LOCATION */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl text-navy font-normal">Step 4: Nagpur Enclave & Precise Address</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                      Corridor / Locality
                    </label>
                    <select
                      value={formData.localityName}
                      onChange={(e) => handleLocalitySelect(e.target.value)}
                      className="w-full p-2.5 border border-beige bg-ivory-light text-xs text-navy font-sans"
                    >
                      {NAGPUR_LOCALITY_OPTIONS.map((loc) => (
                        <option key={loc.name} value={loc.name}>
                          {loc.name} (Pincode: {loc.pincode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                      Pincode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => updateField('pincode', e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                    Building / Street / Landmark Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suite 402, Shiv Regency, West High Court Road"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => updateField('latitude', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => updateField('longitude', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: MEDIA */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl text-navy font-normal">Step 5: Architectural Photography</h2>
                <p className="text-xs text-charcoal-muted font-sans leading-relaxed">
                  High-definition photography enhances client engagement and expedites qualification viewings.
                </p>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (Unsplash, Cloudinary, etc.)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase px-5 py-2.5 transition-colors"
                  >
                    Add Image
                  </button>
                </div>

                {/* Images Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-video overflow-hidden border border-beige group">
                        <img src={img.url} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-navy text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-navy text-gold text-[9px] uppercase tracking-luxury px-1.5 py-0.5">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: PREVIEW & SUBMIT */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl text-navy font-normal">Step 6: Dossier Review & Placement</h2>

                <div className="bg-ivory-light p-6 border border-beige space-y-3 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted uppercase tracking-luxury text-[10px]">Headline:</span>
                    <strong className="text-navy">{formData.title}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted uppercase tracking-luxury text-[10px]">Mandate:</span>
                    <strong className="text-navy">{formData.purpose} — {formData.subtype}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted uppercase tracking-luxury text-[10px]">Valuation:</span>
                    <strong className="text-navy font-semibold text-sm">₹ {Number(formData.price).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted uppercase tracking-luxury text-[10px]">Area:</span>
                    <strong className="text-navy">{formData.areaSqFt} Sq.Ft</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted uppercase tracking-luxury text-[10px]">Enclave:</span>
                    <strong className="text-navy">{formData.address}, {formData.localityName}, Nagpur</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted uppercase tracking-luxury text-[10px]">Photographs:</span>
                    <strong className="text-navy">{formData.images.length} Image(s) Attached</strong>
                  </div>
                </div>

                <p className="text-xs text-charcoal-muted leading-relaxed font-sans">
                  Upon submission, your asset will be queued in the Nagpur Estates moderation desk. Following title and sanction validation, the listing will be initiated for its 90-day marketplace cycle.
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="pt-8 border-t border-beige flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center space-x-1.5 text-xs font-medium tracking-luxury uppercase text-charcoal-muted hover:text-navy py-3 px-4 border border-beige transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center space-x-3">
                {currentStep === 6 ? (
                  <>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSubmit(true)}
                      className="border border-beige bg-ivory text-charcoal text-xs font-medium tracking-luxury uppercase py-3 px-5 hover:border-gold transition-colors flex items-center space-x-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Draft</span>
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSubmit(false)}
                      className="bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase py-3 px-6 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5 text-gold" />
                      <span>{loading ? 'Submitting...' : 'Submit For Moderation'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase py-3 px-6 transition-colors flex items-center space-x-1.5"
                  >
                    <span>Proceed Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default PostPropertyPage;
