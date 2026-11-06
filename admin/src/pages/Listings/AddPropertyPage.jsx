import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  PlusCircle,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Home,
  FileText,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';

const NAGPUR_LOCALITIES = [
  'Dharampeth',
  'Ramdaspeth',
  'Civil Lines',
  'Wardha Road',
  'Manish Nagar',
  'Besa',
  'Shankar Nagar',
  'Pratap Nagar',
  'Laxmi Nagar',
  'Hingna Road',
  'Khamla',
  'Sadar',
  'Sitabuldi',
  'Trimurti Nagar',
  'Narendra Nagar',
  'Koradi Road',
];

export const AddPropertyPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    purpose: 'BUY',
    category: 'RESIDENTIAL',
    subtype: 'FLAT',
    description: '',
    price: '',
    priceNegotiable: false,
    areaSqFt: '',
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    floor: 2,
    totalFloors: 5,
    furnishing: 'SEMI_FURNISHED',
    possessionStatus: 'READY_TO_MOVE',
    reraNumber: '',
    address: '',
    localityName: 'Dharampeth',
    pincode: '440010',
    latitude: 21.1458,
    longitude: 79.0882,
    coverImageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Power Backup', 'Lift', 'Security Personnel', 'Car Parking'],
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return apiClient.post('/properties', payload);
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries(['admin-listings']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
      setTimeout(() => {
        navigate('/listings');
      }, 1500);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to create property. Please verify your inputs.');
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      title: formData.title.trim(),
      purpose: formData.purpose,
      category: formData.category,
      subtype: formData.subtype,
      description: formData.description.trim(),
      price: Number(formData.price),
      priceUnit: 'Total',
      priceNegotiable: formData.priceNegotiable,
      areaSqFt: Number(formData.areaSqFt),
      areaUnit: 'Sq.Ft',
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      balconies: Number(formData.balconies),
      floor: Number(formData.floor),
      totalFloors: Number(formData.totalFloors),
      furnishing: formData.furnishing,
      possessionStatus: formData.possessionStatus,
      propertyAge: 'New',
      facing: 'EAST',
      amenities: formData.amenities,
      reraNumber: formData.reraNumber.trim(),
      address: formData.address.trim(),
      localityName: formData.localityName,
      pincode: formData.pincode.trim(),
      latitude: Number(formData.latitude) || 21.1458,
      longitude: Number(formData.longitude) || 79.0882,
      images: formData.coverImageUrl
        ? [{ url: formData.coverImageUrl.trim(), isCover: true, caption: 'Main Facade' }]
        : [],
    };

    mutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Create Verified Listing"
        subtitle="Staff property onboarding with instant Nagpur RERA verification and coordinate tagging"
        icon={PlusCircle}
        breadcrumbs={[{ label: 'Listings', href: '/listings' }, { label: 'New Listing' }]}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Property created successfully! Redirecting to listings...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Property Identity */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Home className="w-4 h-4 text-brand-teal" />
            <span>Basic Property Information</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Property Title *
              </label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Luxurious 3 BHK Apartment with Lake View in Dharampeth"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-teal outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Purpose *
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="BUY">BUY / SALE</option>
                  <option value="RENT">RENT / LEASE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="RESIDENTIAL">RESIDENTIAL</option>
                  <option value="COMMERCIAL">COMMERCIAL</option>
                  <option value="PLOT">PLOT / LAND</option>
                  <option value="AGRICULTURAL">AGRICULTURAL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Subtype *
                </label>
                <select
                  name="subtype"
                  value={formData.subtype}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="FLAT">Flat / Apartment</option>
                  <option value="HOUSE_VILLA">Independent House / Villa</option>
                  <option value="PLOT">Residential Plot</option>
                  <option value="COMMERCIAL_SHOP">Commercial Shop</option>
                  <option value="COMMERCIAL_OFFICE">Office Space</option>
                  <option value="PENTHOUSE">Penthouse</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Detailed Description * (min 20 characters)
              </label>
              <textarea
                required
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe key highlights, floor layout, ventilation, parking, nearby schools, metro station, etc..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-teal outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Dimensions */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <IndianRupee className="w-4 h-4 text-brand-orange" />
            <span>Pricing & Area Specifications</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Total Price (INR ₹) *
              </label>
              <input
                type="number"
                required
                min={1000}
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 7500000 (75 Lac)"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-brand-orange focus:ring-2 focus:ring-brand-teal outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Area in Square Feet (Sq.Ft) *
              </label>
              <input
                type="number"
                required
                min={10}
                name="areaSqFt"
                value={formData.areaSqFt}
                onChange={handleChange}
                placeholder="e.g. 1450"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-teal outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Bedrooms</label>
                <input
                  type="number"
                  min={0}
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Bathrooms</label>
                <input
                  type="number"
                  min={0}
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Balconies</label>
                <input
                  type="number"
                  min={0}
                  name="balconies"
                  value={formData.balconies}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Furnishing</label>
                <select
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="SEMI_FURNISHED">Semi-Furnished</option>
                  <option value="FULLY_FURNISHED">Fully-Furnished</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Possession</label>
                <select
                  name="possessionStatus"
                  value={formData.possessionStatus}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="READY_TO_MOVE">Ready to Move</option>
                  <option value="UNDER_CONSTRUCTION">Under Construction</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Nagpur Locality & Address */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-brand-teal" />
            <span>Nagpur Location & MahaRERA</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Nagpur Locality *
              </label>
              <select
                name="localityName"
                value={formData.localityName}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
              >
                {NAGPUR_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Nagpur Pincode *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="440010"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Exact Street Address / Landmark *
              </label>
              <input
                type="text"
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Flat 402, Royal Palms, West High Court Road"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                MahaRERA Registration Number (Optional)
              </label>
              <input
                type="text"
                name="reraNumber"
                value={formData.reraNumber}
                onChange={handleChange}
                placeholder="P50500012345"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono text-brand-teal font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Cover Photo Image URL
              </label>
              <input
                type="url"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="py-3 px-5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="py-3 px-8 rounded-2xl bg-brand-orange hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            {mutation.isPending ? <span>Creating Listing...</span> : <span>Publish Listing</span>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPropertyPage;
