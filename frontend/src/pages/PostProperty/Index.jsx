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
  { id: 2, name: 'Type' },
  { id: 3, name: 'Details' },
  { id: 4, name: 'Location' },
  { id: 5, name: 'Media' },
  { id: 6, name: 'Preview & Submit' },
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
    priceUnit: 'Total',
    priceNegotiable: false,
    areaSqFt: '',
    areaUnit: 'Sq.Ft',
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    floor: 3,
    totalFloors: 7,
    furnishing: 'SEMI_FURNISHED',
    possessionStatus: 'READY_TO_MOVE',
    propertyAge: '1-3 years',
    facing: 'EAST',
    amenities: ['24x7 Security & CCTV', 'Power Backup', 'Lift'],
    reraNumber: '',
    state: 'Maharashtra',
    city: 'Nagpur',
    localityName: 'Dharampeth',
    pincode: '440010',
    address: '',
    latitude: 21.1438,
    longitude: 79.0607,
    images: [],
    videoUrl: '',
    floorPlanUrl: '',
    brochureUrl: '',
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocalitySelect = (locName) => {
    const loc = NAGPUR_LOCALITY_OPTIONS.find((l) => l.name === locName);
    if (loc) {
      setFormData((prev) => ({
        ...prev,
        localityName: loc.name,
        pincode: loc.pincode,
        latitude: loc.lat,
        longitude: loc.lng,
      }));
    } else {
      updateField('localityName', locName);
    }
  };

  const toggleAmenity = (item) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(item);
      const updated = exists ? prev.amenities.filter((a) => a !== item) : [...prev.amenities, item];
      return { ...prev, amenities: updated };
    });
  };

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          url: imageUrlInput.trim(),
          caption: `Photo ${prev.images.length + 1}`,
          isCover: prev.images.length === 0,
        },
      ],
    }));
    setImageUrlInput('');
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateCurrentStep = () => {
    setError('');
    if (currentStep === 1) return true;
    if (currentStep === 2) return true;
    if (currentStep === 3) {
      if (!formData.title.trim() || formData.title.length < 5) {
        setError('Please provide a descriptive title (at least 5 characters).');
        return false;
      }
      if (!formData.description.trim() || formData.description.length < 20) {
        setError('Please provide a detailed property description (at least 20 characters).');
        return false;
      }
      if (!formData.price || Number(formData.price) <= 0) {
        setError('Please specify a valid price.');
        return false;
      }
      if (!formData.areaSqFt || Number(formData.areaSqFt) <= 0) {
        setError('Please specify the built-up / carpet area.');
        return false;
      }
      return true;
    }
    if (currentStep === 4) {
      if (!formData.localityName) {
        setError('Please select a locality in Nagpur.');
        return false;
      }
      if (!formData.address.trim() || formData.address.length < 5) {
        setError('Please provide a detailed address or landmark.');
        return false;
      }
      return true;
    }
    if (currentStep === 5) {
      if (formData.images.length === 0) {
        // Fallback default image if none provided
        formData.images.push({
          url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          caption: 'Property Exterior',
          isCover: true,
        });
      }
      return true;
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
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-brand-navy">Listing Submitted Successfully!</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Your property has been submitted for moderation. Our verification team will verify the details and documents to make it LIVE within 24 hours.
        </p>
        <div className="pt-4 flex justify-center space-x-3">
          <button
            onClick={() => navigate('/account/my-properties')}
            className="bg-brand-navy text-white text-xs font-bold py-3 px-5 rounded-xl hover:bg-slate-800 transition-all"
          >
            Go to My Properties
          </button>
          <button
            onClick={() => navigate('/properties')}
            className="border border-slate-200 text-slate-700 text-xs font-bold py-3 px-5 rounded-xl hover:bg-slate-50 transition-all"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Post Free Property Listing in Nagpur — Nagpur Real Estate</title>
        <meta name="description" content="List your flat, house, plot, or commercial property for sale or rent in Nagpur. Reach verified buyers and tenants directly." />
      </Helmet>

      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Zero Brokerage Submission
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy mt-1">
              Post Your Property in Nagpur
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Connect with thousands of serious buyers & tenants across Nagpur
            </p>
          </div>

          {/* Stepper Wizard Indicator */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-8">
            <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-0">
              {STEPS.map((s) => (
                <div key={s.id} className="flex items-center space-x-2 flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep === s.id
                        ? 'bg-brand-orange text-white ring-4 ring-orange-100'
                        : currentStep > s.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {currentStep > s.id ? '✓' : s.id}
                  </div>
                  <span
                    className={`text-xs font-bold hidden sm:inline ${
                      currentStep === s.id ? 'text-brand-navy' : 'text-slate-400'
                    }`}
                  >
                    {s.name}
                  </span>
                  {s.id < STEPS.length && (
                    <div className="w-4 sm:w-8 h-0.5 bg-slate-200 mx-1 sm:mx-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-card">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: PURPOSE */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-black text-brand-navy">Step 1: What is your listing purpose?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'BUY', label: 'Sell Property', desc: 'Find buyers looking for flats, villas, plots, or shops' },
                    { id: 'RENT', label: 'Rent / Lease Property', desc: 'Find reliable tenants for monthly rental income' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => updateField('purpose', p.id)}
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${
                        formData.purpose === p.id
                          ? 'border-brand-orange bg-orange-50/50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <h3 className="text-base font-bold text-brand-navy">{p.label}</h3>
                      <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: PROPERTY TYPE */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-black text-brand-navy">Step 2: What type of property is it?</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { subtype: 'FLAT', category: 'RESIDENTIAL', label: 'Flat / Apartment' },
                    { subtype: 'HOUSE_VILLA', category: 'RESIDENTIAL', label: 'House / Villa' },
                    { subtype: 'PLOT', category: 'PLOT', label: 'Residential Plot' },
                    { subtype: 'COMMERCIAL_SHOP', category: 'COMMERCIAL', label: 'Commercial Shop' },
                    { subtype: 'COMMERCIAL_OFFICE', category: 'COMMERCIAL', label: 'Office Space' },
                    { subtype: 'WAREHOUSE', category: 'COMMERCIAL', label: 'Warehouse / Godown' },
                  ].map((item) => (
                    <button
                      key={item.subtype}
                      type="button"
                      onClick={() => {
                        updateField('subtype', item.subtype);
                        updateField('category', item.category);
                      }}
                      className={`p-5 rounded-2xl border-2 text-center transition-all ${
                        formData.subtype === item.subtype
                          ? 'border-brand-teal bg-teal-50/50 shadow-md font-bold text-brand-teal'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Building className="w-6 h-6 mx-auto mb-2 text-brand-teal" />
                      <span className="text-xs font-bold block">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: DETAILS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-black text-brand-navy">Step 3: Property Details & Pricing</h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Listing Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spacious 3 BHK Garden Facing Flat in Dharampeth"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Expected Price (₹ in Rupees)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 7500000"
                      value={formData.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Built-up Area (in Sq.Ft)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1450"
                      value={formData.areaSqFt}
                      onChange={(e) => updateField('areaSqFt', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                    />
                  </div>
                </div>

                {formData.category === 'RESIDENTIAL' && formData.subtype !== 'PLOT' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Bedrooms (BHK)
                      </label>
                      <select
                        value={formData.bedrooms}
                        onChange={(e) => updateField('bedrooms', Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                      >
                        {[1, 2, 3, 4, 5].map((b) => (
                          <option key={b} value={b}>{b} BHK</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Bathrooms
                      </label>
                      <select
                        value={formData.bathrooms}
                        onChange={(e) => updateField('bathrooms', Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                      >
                        {[1, 2, 3, 4].map((b) => (
                          <option key={b} value={b}>{b} Baths</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Furnishing
                      </label>
                      <select
                        value={formData.furnishing}
                        onChange={(e) => updateField('furnishing', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                      >
                        <option value="UNFURNISHED">Unfurnished</option>
                        <option value="SEMI_FURNISHED">Semi-Furnished</option>
                        <option value="FULLY_FURNISHED">Fully Furnished</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Possession
                      </label>
                      <select
                        value={formData.possessionStatus}
                        onChange={(e) => updateField('possessionStatus', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                      >
                        <option value="READY_TO_MOVE">Ready to Move</option>
                        <option value="UNDER_CONSTRUCTION">Under Construction</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Property Description
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe highlights: sunlight, ventilation, distance to metro, school, water supply, gated amenities..."
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Amenities Available
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STANDARD_AMENITIES.map((am) => (
                      <button
                        key={am}
                        type="button"
                        onClick={() => toggleAmenity(am)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                          formData.amenities.includes(am)
                            ? 'border-brand-teal bg-teal-50 text-brand-teal font-bold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
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
                <h2 className="text-lg font-black text-brand-navy">Step 4: Location & Address in Nagpur</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Nagpur Locality
                    </label>
                    <select
                      value={formData.localityName}
                      onChange={(e) => handleLocalitySelect(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800"
                    >
                      {NAGPUR_LOCALITY_OPTIONS.map((loc) => (
                        <option key={loc.name} value={loc.name}>
                          {loc.name} (Pincode: {loc.pincode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => updateField('pincode', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Detailed Address / Society / Landmark
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Shiv Regency, Near Traffic Park, WHC Road"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => updateField('latitude', Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => updateField('longitude', Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: MEDIA */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-lg font-black text-brand-navy">Step 5: Photos & Media</h2>
                <p className="text-xs text-slate-500">
                  Properties with high-resolution photos receive up to 5x more buyer enquiries.
                </p>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (e.g. Unsplash or Cloudinary image link)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="bg-brand-teal hover:bg-brand-teal-light text-white text-xs font-bold px-4 py-2.5 rounded-xl"
                  >
                    Add Image
                  </button>
                </div>

                {/* Images Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={img.url} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-brand-navy/90 text-white text-[10px] px-1.5 py-0.5 rounded">
                            Cover
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
                <h2 className="text-lg font-black text-brand-navy">Step 6: Review & Final Submission</h2>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Title:</span>
                    <strong className="text-slate-900">{formData.title}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Purpose / Type:</span>
                    <strong className="text-slate-900">{formData.purpose} — {formData.subtype}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Price:</span>
                    <strong className="text-brand-orange font-bold text-sm">₹ {Number(formData.price).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Area:</span>
                    <strong className="text-slate-900">{formData.areaSqFt} Sq.Ft</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <strong className="text-slate-900">{formData.address}, {formData.localityName}, Nagpur</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Photos attached:</span>
                    <strong className="text-slate-900">{formData.images.length} photo(s)</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Upon submission, our moderation team will review this listing against our Nagpur property guidelines. Once verified, it will be published to the public search with a 90-day validity.
                </p>
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 py-2.5 px-4 rounded-xl border border-slate-200"
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
                      className="border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center space-x-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save as Draft</span>
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSubmit(false)}
                      className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{loading ? 'Submitting...' : 'Submit for Verification'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <span>Next Step</span>
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

