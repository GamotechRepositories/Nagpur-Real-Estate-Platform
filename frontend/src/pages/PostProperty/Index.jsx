import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Building,
  Home,
  MapPin,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import AuthModal from '../../components/common/AuthModal';

const STEPS = [
  { id: 1, name: 'Basic Info' },
  { id: 2, name: 'Details' },
  { id: 3, name: 'Location' },
  { id: 4, name: 'Media' },
  { id: 5, name: 'Review' },
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
  'Children Play Area',
  'Club House',
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
    floor: 3,
    totalFloors: 8,
    localityName: 'Dharampeth',
    address: '',
    pincode: '440010',
    latitude: 21.1438,
    longitude: 79.0607,
    amenities: ['24x7 Security & CCTV', 'Reserved Covered Parking'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        caption: 'Property Photo',
      },
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

  const validateStep = (step) => {
    setError('');
    if (step === 1) {
      if (!formData.title.trim()) {
        setError('Please provide a property title.');
        return false;
      }
      if (!formData.description.trim()) {
        setError('Please provide a brief property description.');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.price || Number(formData.price) <= 0) {
        setError('Please enter a valid price/budget in Rupees.');
        return false;
      }
      if (!formData.areaSqFt || Number(formData.areaSqFt) <= 0) {
        setError('Please enter the built-up area in square feet.');
        return false;
      }
    }
    if (step === 3) {
      if (!formData.address.trim()) {
        setError('Please provide the property address or landmark.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
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

      await apiClient.post('/properties', payload);
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to submit property. Please verify all details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#F7F4ED] min-h-screen py-16">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-[#E9E4DA] shadow-card text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#172C3B]">
              Property Submitted Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Your property has been submitted for moderation. Once verified by our team, it will go live for thousands of verified Nagpur buyers and tenants.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/account/my-properties"
                className="px-6 py-2.5 bg-[#B89A65] hover:bg-[#A38753] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                View My Listings
              </Link>
              <Link
                to="/"
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Post Your Property | Nagpur Realty</title>
        <meta
          name="description"
          content="List your flat, house, villa, plot, or commercial property on Nagpur Realty. Reach thousands of verified buyers and tenants in Nagpur."
        />
      </Helmet>

      <div className="bg-[#F7F4ED] min-h-screen py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Title & Subtitle matching Screen 7 & 8 */}
          <div className="text-center sm:text-left space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#172C3B]">
              Post Your Property
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
              List your property on Nagpur's leading real estate platform get genuine buyers and tenants.
            </p>
          </div>

          {/* 5-Step Stepper Bar matching Screen 7 & 8 */}
          <div className="bg-white rounded-xl border border-[#E9E4DA] p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {STEPS.map((step, idx) => {
                const isActive = currentStep === step.id;
                const isPassed = currentStep > step.id;
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#B89A65] text-white shadow-sm ring-4 ring-[#B89A65]/20'
                            : isPassed
                            ? 'bg-[#172C3B] text-white'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {isPassed ? <Check className="w-4 h-4" /> : step.id}
                      </div>
                      <span
                        className={`hidden md:inline text-xs font-medium ${
                          isActive
                            ? 'text-[#172C3B] font-bold'
                            : isPassed
                            ? 'text-gray-700'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                          isPassed ? 'bg-[#172C3B]' : 'bg-gray-200'
                        }`}
                      ></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Error notification if any */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 2-Column Grid Layout matching screen 7 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Card */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E9E4DA] p-6 sm:p-8 shadow-sm space-y-6">
              {/* STEP 1: Basic Information matching Screen 7 */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="font-serif text-xl font-bold text-[#172C3B] pb-3 border-b border-gray-100">
                    Basic Information
                  </h2>

                  {/* Listing Type Radio: Buy / Rent */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">
                      Listing Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-6 text-sm text-gray-700 pt-1">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="purpose"
                          checked={formData.purpose === 'BUY'}
                          onChange={() => updateField('purpose', 'BUY')}
                          className="h-4 w-4 text-[#B89A65] focus:ring-[#B89A65] border-gray-300"
                        />
                        <span>Buy</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="purpose"
                          checked={formData.purpose === 'RENT'}
                          onChange={() => updateField('purpose', 'RENT')}
                          className="h-4 w-4 text-[#B89A65] focus:ring-[#B89A65] border-gray-300"
                        />
                        <span>Rent</span>
                      </label>
                    </div>
                  </div>

                  {/* Property Type Dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      Property Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subtype}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateField('subtype', val);
                        if (val === 'PLOT') updateField('category', 'PLOT');
                        else if (val.startsWith('COMMERCIAL')) updateField('category', 'COMMERCIAL');
                        else updateField('category', 'RESIDENTIAL');
                      }}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] focus:bg-white"
                    >
                      <option value="FLAT">Flat / Apartment</option>
                      <option value="INDEPENDENT_HOUSE">Independent House</option>
                      <option value="VILLA">Villa</option>
                      <option value="PLOT">Plot / Land</option>
                      <option value="COMMERCIAL_OFFICE">Commercial Office</option>
                    </select>
                  </div>

                  {/* Property Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      Property Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="e.g., 3 BHK Apartment in Manish Nagar"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] focus:bg-white text-gray-800"
                    />
                  </div>

                  {/* Property Description */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-gray-700">
                        Property Description <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-gray-400">
                        {formData.description.length} / 500
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      maxLength={500}
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Describe your property, features, and highlights..."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65] focus:bg-white text-gray-800"
                    ></textarea>
                  </div>

                  {/* Next Button */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full sm:w-auto px-8 py-3 bg-[#B89A65] hover:bg-[#A38753] text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-2"
                    >
                      <span>Next: Property Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="font-serif text-xl font-bold text-[#172C3B] pb-3 border-b border-gray-100">
                    Property Specifications & Price
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Expected Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => updateField('price', e.target.value)}
                        placeholder="e.g. 7500000"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Super Built-up Area (Sq.Ft.) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.areaSqFt}
                        onChange={(e) => updateField('areaSqFt', e.target.value)}
                        placeholder="e.g. 1450"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Bedrooms
                      </label>
                      <select
                        value={formData.bedrooms}
                        onChange={(e) => updateField('bedrooms', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                      >
                        {[1, 2, 3, 4, 5].map((b) => (
                          <option key={b} value={b}>
                            {b} BHK
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Bathrooms
                      </label>
                      <select
                        value={formData.bathrooms}
                        onChange={(e) => updateField('bathrooms', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                      >
                        {[1, 2, 3, 4].map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Furnishing Status
                      </label>
                      <select
                        value={formData.furnishing}
                        onChange={(e) => updateField('furnishing', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                      >
                        <option value="UNFURNISHED">Unfurnished</option>
                        <option value="SEMI_FURNISHED">Semi-Furnished</option>
                        <option value="FULLY_FURNISHED">Fully-Furnished</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Possession Status
                      </label>
                      <select
                        value={formData.possessionStatus}
                        onChange={(e) => updateField('possessionStatus', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                      >
                        <option value="READY_TO_MOVE">Ready to Move</option>
                        <option value="UNDER_CONSTRUCTION">Under Construction</option>
                      </select>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Key Amenities
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {STANDARD_AMENITIES.map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`p-2.5 text-xs rounded-lg border text-left flex items-center space-x-1.5 transition-all ${
                            formData.amenities.includes(amenity)
                              ? 'bg-[#F7F4ED] border-[#B89A65] text-[#172C3B] font-semibold'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Check
                            className={`w-3.5 h-3.5 ${
                              formData.amenities.includes(amenity)
                                ? 'text-[#B89A65]'
                                : 'opacity-0'
                            }`}
                          />
                          <span className="truncate">{amenity}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-2.5 bg-[#B89A65] hover:bg-[#A38753] text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center space-x-2"
                    >
                      <span>Next: Location</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Location */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="font-serif text-xl font-bold text-[#172C3B] pb-3 border-b border-gray-100">
                    Location & Nagpur Enclave
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nagpur Locality <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.localityName}
                        onChange={(e) => handleLocalitySelect(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                      >
                        {NAGPUR_LOCALITY_OPTIONS.map((loc) => (
                          <option key={loc.name} value={loc.name}>
                            {loc.name} (Pincode: {loc.pincode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Complete Address & Landmark <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        placeholder="e.g., Flat 402, Royal Palms, Near Shankar Nagar Square"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Postal Pincode
                      </label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => updateField('pincode', e.target.value)}
                        placeholder="440010"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-2.5 bg-[#B89A65] hover:bg-[#A38753] text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center space-x-2"
                    >
                      <span>Next: Media</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Media */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="font-serif text-xl font-bold text-[#172C3B] pb-3 border-b border-gray-100">
                    Property Photography
                  </h2>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                      />
                      <button
                        type="button"
                        onClick={addImageUrl}
                        className="px-4 py-2.5 bg-[#B89A65] text-white text-xs font-semibold rounded-lg flex items-center space-x-1 hover:bg-[#A38753]"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Photo</span>
                      </button>
                    </div>

                    {/* Image Preview Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {formData.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 group bg-gray-100"
                        >
                          <img
                            src={img.url}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-2.5 bg-[#B89A65] hover:bg-[#A38753] text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center space-x-2"
                    >
                      <span>Next: Review</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h2 className="font-serif text-xl font-bold text-[#172C3B] pb-3 border-b border-gray-100">
                    Review & Publish Listing
                  </h2>

                  {/* Property Summary Preview Card */}
                  <div className="bg-[#F7F4ED] rounded-xl p-5 border border-[#B89A65]/40 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-[#B89A65] text-white rounded">
                          {formData.purpose === 'BUY' ? 'For Sale' : 'For Rent'}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-[#172C3B] mt-2">
                          {formData.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formData.localityName}, Nagpur • Pincode {formData.pincode}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[#172C3B] block">
                          ₹ {Number(formData.price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formData.areaSqFt} Sq.Ft.
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-3">
                      {formData.description}
                    </p>

                    <div className="pt-2 border-t border-gray-200/60 flex items-center space-x-4 text-xs text-gray-600">
                      <span>{formData.bedrooms} BHK</span>
                      <span>•</span>
                      <span>{formData.bathrooms} Bath</span>
                      <span>•</span>
                      <span>{formData.furnishing?.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>{formData.possessionStatus?.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSubmit}
                      className="px-8 py-3 bg-[#B89A65] hover:bg-[#A38753] text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-sm flex items-center space-x-2"
                    >
                      {loading ? (
                        <span>Publishing Property...</span>
                      ) : (
                        <span>Publish Property Free</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: "Why List With Us?" Card matching Screen 7 */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E9E4DA] overflow-hidden shadow-sm sticky top-24">
              <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                  alt="Why List With Us"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#172C3B]">
                  Why List With Us?
                </h3>

                <ul className="space-y-3 text-xs text-gray-700">
                  <li className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#F7F4ED] text-[#B89A65] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Reach thousands of verified buyers and tenants in Nagpur</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#F7F4ED] text-[#B89A65] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Verified & trusted platform with MahaRERA compliance</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#F7F4ED] text-[#B89A65] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Dedicated site visit scheduling and direct inquiries</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#F7F4ED] text-[#B89A65] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Zero upfront fee for property owners</span>
                  </li>
                </ul>
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
