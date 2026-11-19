import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Compass,
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  Plus,
  CheckCircle,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { apiClient } from '../../api/client';

const AMENITY_OPTIONS = [
  'Grand Clubhouse',
  'Swimming Pool',
  'Fully-equipped Gymnasium',
  'Children Play Zone & Park',
  '24x7 CCTV & Security Guard',
  '100% DG Power Backup',
  'Landscaped Gardens & Walkways',
  'Indoor Games & Badminton Court',
  'Senior Citizen Seating Kiosks',
  'Rainwater Harvesting Plant',
  'Solar Water Heating',
  'Covered Multi-level Parking',
  'Fire Fighting Systems (NMC Approved)',
  'Vastu Compliant Master Layout',
];

export const BuilderAddProjectPage = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch localities for dropdown
  const { data: localitiesData } = useQuery({
    queryKey: ['localities-dropdown'],
    queryFn: () => apiClient.get('/localities'),
  });

  const localities = localitiesData?.data || [];

  const [formData, setFormData] = useState({
    name: '',
    reraNumber: '',
    localityName: 'Wardha Road',
    address: '',
    pincode: '440025',
    projectStatus: 'UNDER_CONSTRUCTION',
    totalUnits: 60,
    startingPrice: '',
    possessionDate: '',
    description: '',
    amenities: [
      'Grand Clubhouse',
      '24x7 CCTV & Security Guard',
      'Children Play Zone & Park',
      'Landscaped Gardens & Walkways',
    ],
    coverPhoto: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    brochureUrl: '',
  });

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

  const createProjectMutation = useMutation({
    mutationFn: (payload) => {
      const body = {
        ...payload,
        totalUnits: Number(payload.totalUnits) || 0,
        startingPrice: Number(payload.startingPrice) || 0,
        images: payload.coverPhoto
          ? [{ url: payload.coverPhoto, isCover: true, caption: 'Main Elevation' }]
          : [],
      };
      return apiClient.post('/builders/me/projects', body);
    },
    onSuccess: () => {
      navigate('/projects');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to create project.';
      setErrorMessage(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Please enter project name.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Please enter project site address.');
      return;
    }

    createProjectMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Back */}
      <div className="flex items-center space-x-3">
        <Link
          to="/projects"
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Add New Township Project
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register your development layout or high-rise building with MahaRERA credentials.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Project Identity & Location */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Compass size={18} className="text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">Project Identity & Location</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Shiv Elite Township, Godrej Anandam, Green City"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                MahaRERA Project Registration Number *
              </label>
              <input
                type="text"
                placeholder="e.g. P50500001234"
                value={formData.reraNumber}
                onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                required
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                MahaRERA certificate number verified by administration
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Locality / Hub in Nagpur *
              </label>
              <select
                value={formData.localityName}
                onChange={(e) => setFormData({ ...formData, localityName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600 bg-white"
                required
              >
                {localities.length > 0 ? (
                  localities.map((loc) => (
                    <option key={loc._id || loc.name} value={loc.name}>
                      {loc.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Wardha Road">Wardha Road</option>
                    <option value="Besa">Besa</option>
                    <option value="Manish Nagar">Manish Nagar</option>
                    <option value="Dharampeth">Dharampeth</option>
                    <option value="Pratap Nagar">Pratap Nagar</option>
                    <option value="Civil Lines">Civil Lines</option>
                    <option value="Ramdaspeth">Ramdaspeth</option>
                    <option value="Hingna Road">Hingna Road</option>
                  </>
                )}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Exact Site Address *
              </label>
              <input
                type="text"
                placeholder="e.g. Near MIHAN Flyover, Wardha Road, Nagpur"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                placeholder="440025"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project Development Stage
              </label>
              <select
                value={formData.projectStatus}
                onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600 bg-white"
              >
                <option value="NEW_LAUNCH">NEW LAUNCH (Booking Open)</option>
                <option value="UNDER_CONSTRUCTION">UNDER CONSTRUCTION</option>
                <option value="READY_TO_MOVE">READY TO MOVE</option>
                <option value="COMPLETED">COMPLETED (Handover Done)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Scale, Units & Pricing */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 size={18} className="text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">Scale, Inventory & Pricing</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Units Planned *
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                placeholder="e.g. 120"
                value={formData.totalUnits}
                onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Starting Price (₹)
              </label>
              <input
                type="number"
                min={100000}
                placeholder="e.g. 4500000 (45 Lakh)"
                value={formData.startingPrice}
                onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Possession Date
              </label>
              <input
                type="date"
                value={formData.possessionDate}
                onChange={(e) => setFormData({ ...formData, possessionDate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Project Overview & Specifications
              </label>
              <textarea
                rows={3}
                placeholder="Describe project highlights, architectural features, connectivity to MIHAN/Metro, and construction grade..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none resize-none focus:border-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Amenities Selection */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Project Amenities & Facilities</h2>
            <span className="text-[11px] text-teal-700 font-semibold">
              {formData.amenities.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {AMENITY_OPTIONS.map((amenity) => {
              const selected = formData.amenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                    selected
                      ? 'bg-teal-50 border-teal-300 text-teal-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate pr-1">{amenity}</span>
                  {selected && <CheckCircle size={14} className="text-teal-700 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Project Media & Brochure */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ImageIcon size={18} className="text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">Project Media & Digital Assets</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Main Elevation Photo URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/project-elevation.jpg"
                value={formData.coverPhoto}
                onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Official E-Brochure Download Link (PDF)
              </label>
              <input
                type="url"
                placeholder="https://example.com/project-brochure.pdf"
                value={formData.brochureUrl}
                onChange={(e) => setFormData({ ...formData, brochureUrl: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link
            to="/projects"
            className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createProjectMutation.isPending}
            className="py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs hover:shadow-md disabled:opacity-50 transition"
          >
            {createProjectMutation.isPending ? 'Publishing Project...' : 'Register Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuilderAddProjectPage;
