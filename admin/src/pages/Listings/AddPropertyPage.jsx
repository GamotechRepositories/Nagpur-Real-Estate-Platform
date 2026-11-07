import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  AlertCircle,
  CheckCircle2,
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
    <div className="max-w-4xl mx-auto space-y-5">
      <PageHeader
        title="Add Property"
        subtitle="Create a new property listing"
        icon={Building2}
        breadcrumbs={[{ label: 'Listings', href: '/listings' }, { label: 'New' }]}
      />

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Property created successfully. Redirecting to listings...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Information */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Basic Information
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Title *
              </label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. 3 BHK Apartment in Dharampeth"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:border-slate-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purpose *
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value="BUY">Buy / Sale</option>
                  <option value="RENT">Rent / Lease</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="PLOT">Plot / Land</option>
                  <option value="AGRICULTURAL">Agricultural</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtype *
                </label>
                <select
                  name="subtype"
                  value={formData.subtype}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe key highlights, floor layout, amenities, nearby points..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:border-slate-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Dimensions */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Pricing & Specs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Price (INR ₹) *
              </label>
              <input
                type="number"
                required
                min={1000}
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 7500000"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:border-slate-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Super Built-up Area (Sq.Ft) *
              </label>
              <input
                type="number"
                required
                min={50}
                name="areaSqFt"
                value={formData.areaSqFt}
                onChange={handleChange}
                placeholder="e.g. 1450"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:border-slate-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  min={0}
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  min={0}
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Balconies</label>
                <input
                  type="number"
                  min={0}
                  name="balconies"
                  value={formData.balconies}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Furnishing</label>
                <select
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="SEMI_FURNISHED">Semi Furnished</option>
                  <option value="FURNISHED">Furnished</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Possession</label>
                <select
                  name="possessionStatus"
                  value={formData.possessionStatus}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="READY_TO_MOVE">Ready to Move</option>
                  <option value="UNDER_CONSTRUCTION">Under Construction</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Details */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Location & Verification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Locality *
              </label>
              <select
                name="localityName"
                value={formData.localityName}
                onChange={handleChange}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white"
              >
                {NAGPUR_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pincode *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="440010"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-mono font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Address / Landmark *
              </label>
              <input
                type="text"
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Flat 402, Royal Palms, West High Court Road"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                MahaRERA Number (Optional)
              </label>
              <input
                type="text"
                name="reraNumber"
                value={formData.reraNumber}
                onChange={handleChange}
                placeholder="P50500012345"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cover Photo URL
              </label>
              <input
                type="url"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-2 pt-1">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="py-2 px-4 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="py-2 px-5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPropertyPage;
