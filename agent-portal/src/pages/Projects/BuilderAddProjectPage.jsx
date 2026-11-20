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
  Sparkles,
  TreePine,
  Layers,
  Phone,
  MessageSquare,
  Video,
  Check,
  Building,
} from 'lucide-react';
import { apiClient } from '../../api/client';

const PROJECT_TYPES = [
  { value: 'RESIDENTIAL', label: 'Residential Apartments / High-Rise' },
  { value: 'VILLA_TOWNSHIP', label: 'Gated Villa / Row House Community' },
  { value: 'PLOTTED', label: 'Plotted Layout / NA Plots' },
  { value: 'COMMERCIAL', label: 'Commercial Complex / Retail / Offices' },
  { value: 'MIXED_USE', label: 'Mixed-Use Integrated Township' },
  { value: 'INDUSTRIAL', label: 'Industrial / Warehousing Park' },
];

const NAGPUR_LOCALITIES = [
  'Wardha Road',
  'Besa',
  'Dharampeth',
  'Ramdaspeth',
  'Civil Lines',
  'Manish Nagar',
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
  'Jaripatka',
  'Katol Road',
  'Medical Square',
  'Ayodhya Nagar',
  'Hudkeshwar',
  'Godhani',
  'Kamptee Road',
];

const AMENITY_OPTIONS = [
  'Grand Lifestyle Clubhouse',
  'Swimming Pool & Kids Pool',
  'Fully Equipped Gymnasium',
  'Yoga & Meditation Pavilion',
  'Jogging & Cycling Track',
  'Children Play Zone & Park',
  '24x7 Multi-tier CCTV & Gated Security',
  '100% DG Power Backup',
  'Landscaped Gardens & Gazebos',
  'Senior Citizen Sit-out Kiosks',
  'Badminton & Tennis Courts',
  'Indoor Games Arena',
  'EV Charging Stations',
  'Rainwater Harvesting Plant',
  'Solar Lighting System',
  'Covered Multi-level Car Parking',
  'Fire Fighting Systems (NMC Approved)',
  'Vastu Compliant Layout',
  'Piped Gas Connection',
  'Commercial / Grocery High-Street',
];

const APPROVAL_OPTIONS = [
  'MahaRERA Registered',
  'NMRDA Sanctioned Layout',
  'NIT Sanctioned Plan',
  'NMC Water & Fire Compliant',
  'Clear Title & 7/12 Verified',
  'Environmental Clearance Received',
];

const BANK_OPTIONS = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Bank of Maharashtra',
  'Punjab National Bank (PNB)',
  'Bank of Baroda',
  'Kotak Mahindra Bank',
];

const CONFIG_OPTIONS = [
  '1 BHK Apartment',
  '2 BHK Luxury Flat',
  '3 BHK High-Rise Flat',
  '4 BHK Penthouse',
  '5 BHK Duplex',
  'Independent Villa / Bungalow',
  'Residential NA Plot',
  'Commercial Retail Shop',
  'Commercial Office Space',
];

export const BuilderAddProjectPage = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'scale' | 'amenities' | 'legal' | 'specs' | 'media'

  // Custom inputs for dynamic options
  const [customConfigInput, setCustomConfigInput] = useState('');
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [customApprovalInput, setCustomApprovalInput] = useState('');
  const [customBankInput, setCustomBankInput] = useState('');

  // Fetch localities for dropdown
  const { data: localitiesData } = useQuery({
    queryKey: ['localities-dropdown'],
    queryFn: () => apiClient.get('/localities'),
  });

  const remoteLocalities = localitiesData?.data || [];
  const localities = Array.from(
    new Set([
      ...NAGPUR_LOCALITIES,
      ...remoteLocalities.map((l) => (typeof l === 'string' ? l : l.name)),
    ])
  );

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    projectType: 'RESIDENTIAL',
    localityName: 'Wardha Road',
    address: 'Wardha Road, Nagpur',
    landmark: '',
    pincode: '440025',
    reraNumber: '',
    reraWebsite: '',
    projectStatus: 'UNDER_CONSTRUCTION',
    totalUnits: 60,
    startingPrice: '',
    maxPrice: '',
    pricePerSqFt: '',
    totalLandArea: '3.5 Acres',
    totalTowers: '3 Towers (G+12)',
    openSpacePercentage: '65%',
    carpetAreaRange: '850 - 1850 Sq.Ft',
    possessionDate: '',
    availableConfigurations: ['2 BHK Luxury Flat', '3 BHK High-Rise Flat'],
    description: '',
    amenities: [
      'Grand Lifestyle Clubhouse',
      'Swimming Pool & Kids Pool',
      'Fully Equipped Gymnasium',
      'Children Play Zone & Park',
      '24x7 Multi-tier CCTV & Gated Security',
      'Landscaped Gardens & Gazebos',
    ],
    approvals: ['MahaRERA Registered', 'NMRDA Sanctioned Layout', 'Clear Title & 7/12 Verified'],
    approvedBanks: ['State Bank of India (SBI)', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'],
    coverPhoto: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    additionalImages: '',
    masterPlanUrl: '',
    videoUrl: '',
    virtualTourUrl: '',
    brochureUrl: '',
    contactPhone: '+91 9822000000',
    contactWhatsApp: '+91 9822000000',
    contactEmail: 'sales@nagpurprojects.com',
    siteOfficeTimings: 'Monday – Sunday: 10:00 AM – 7:00 PM',
    customFields: [
      { label: 'Water Supply', value: '24x7 NMC Water Supply + Borewell' },
      { label: 'Elevators', value: 'High-Speed Automatic Lifts with ARD & Power Backup' },
    ],
  });

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const arr = prev[field] || [];
      const exists = arr.includes(item);
      return {
        ...prev,
        [field]: exists ? arr.filter((x) => x !== item) : [...arr, item],
      };
    });
  };

  const handleAddCustomConfig = () => {
    const val = customConfigInput.trim();
    if (!val) return;
    if (!formData.availableConfigurations.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        availableConfigurations: [...prev.availableConfigurations, val],
      }));
    }
    setCustomConfigInput('');
  };

  const handleAddCustomAmenity = () => {
    const val = customAmenityInput.trim();
    if (!val) return;
    if (!formData.amenities.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, val],
      }));
    }
    setCustomAmenityInput('');
  };

  const handleAddCustomApproval = () => {
    const val = customApprovalInput.trim();
    if (!val) return;
    if (!formData.approvals.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        approvals: [...prev.approvals, val],
      }));
    }
    setCustomApprovalInput('');
  };

  const handleAddCustomBank = () => {
    const val = customBankInput.trim();
    if (!val) return;
    if (!formData.approvedBanks.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        approvedBanks: [...prev.approvedBanks, val],
      }));
    }
    setCustomBankInput('');
  };

  const handleAddCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customFields: [...(prev.customFields || []), { label: '', value: '' }],
    }));
  };

  const handleCustomFieldChange = (index, key, val) => {
    setFormData((prev) => {
      const updated = [...(prev.customFields || [])];
      updated[index] = { ...updated[index], [key]: val };
      return { ...prev, customFields: updated };
    });
  };

  const handleRemoveCustomField = (index) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  const createProjectMutation = useMutation({
    mutationFn: (payload) => {
      // Build images list
      const images = [];
      if (payload.coverPhoto) {
        images.push({ url: payload.coverPhoto, isCover: true, caption: 'Main Elevation' });
      }
      if (payload.additionalImages) {
        payload.additionalImages
          .split('\n')
          .map((u) => u.trim())
          .filter(Boolean)
          .forEach((u, idx) => {
            images.push({ url: u, isCover: false, caption: `Site Photo ${idx + 1}` });
          });
      }

      const customFields = (payload.customFields || []).filter((f) => f.label && f.label.trim());

      const body = {
        ...payload,
        totalUnits: Number(payload.totalUnits) || 0,
        startingPrice: Number(payload.startingPrice) || 0,
        maxPrice: Number(payload.maxPrice) || 0,
        pricePerSqFt: Number(payload.pricePerSqFt) || 0,
        images,
        customFields,
      };
      return apiClient.post('/builders/me/projects', body);
    },
    onSuccess: (res) => {
      const createdId = res.data?.data?._id || res.data?._id;
      if (createdId) {
        navigate(`/projects/${createdId}`);
      } else {
        navigate('/projects');
      }
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
      setActiveTab('basic');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Please enter project site address.');
      setActiveTab('basic');
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
            Register Real Estate Project
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add high-rise apartments, gated villa townships, commercial complexes, or plotted schemes.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1.5 border-b border-slate-200 text-xs font-semibold overflow-x-auto pb-1">
        {[
          { key: 'basic', label: '1. Basic Info & Type', icon: Compass },
          { key: 'scale', label: '2. Scale & Typologies', icon: Building2 },
          { key: 'amenities', label: '3. Amenities', icon: TreePine },
          { key: 'legal', label: '4. Legal & Banks', icon: ShieldCheck },
          { key: 'specs', label: '5. Custom Specs', icon: Sparkles },
          { key: 'media', label: '6. Media & Digital', icon: ImageIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2.5 px-3.5 rounded-t-xl border-b-2 whitespace-nowrap transition flex items-center space-x-2 ${
                isActive
                  ? 'border-teal-700 text-teal-800 font-bold bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: BASIC INFO & TYPE */}
        {activeTab === 'basic' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Compass size={18} className="text-teal-700" />
              <h2 className="text-sm font-bold text-slate-900">Project Identity & Location</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Project Title / Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Godrej Forest Grove / Pyramid City Besa Enclave"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Marketing Tagline / Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Premium 2 & 3 BHK High-Rise Residences with 40+ Lifestyle Amenities on Wardha Road"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Project Category / Type *
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600 bg-white"
                >
                  {PROJECT_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Development Stage / Status *
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
                  <option value="UPCOMING">UPCOMING</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Locality in Nagpur *
                </label>
                <select
                  value={formData.localityName}
                  onChange={(e) => setFormData({ ...formData, localityName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600 bg-white"
                >
                  {localities.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
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

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Site Address *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opp. MIHAN Flyover, Wardha Road, Besa Square, Nagpur"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Landmark / Proximity
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Metro Station / Behind Podar World School"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
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

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Project Overview & Architecture Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe development highlights, construction standards (Mivan shuttering, earthquake resistance), green spaces, and key lifestyle features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none resize-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('scale')}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition"
              >
                Next: Scale & Typologies →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SCALE, INVENTORY & PRICING */}
        {activeTab === 'scale' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 size={18} className="text-teal-700" />
              <h2 className="text-sm font-bold text-slate-900">Scale, Typologies & Pricing Structure</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Starting Price (₹) *
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
                  Max Price Range (₹)
                </label>
                <input
                  type="number"
                  min={100000}
                  placeholder="e.g. 12500000 (1.25 Cr)"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Avg. Price per Sq.Ft (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 4200"
                  value={formData.pricePerSqFt}
                  onChange={(e) => setFormData({ ...formData, pricePerSqFt: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                />
              </div>

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
                  Total Land Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5.5 Acres / 24,000 Sq.Ft"
                  value={formData.totalLandArea}
                  onChange={(e) => setFormData({ ...formData, totalLandArea: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Towers / Floors
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4 Towers (G+14 Floors)"
                  value={formData.totalTowers}
                  onChange={(e) => setFormData({ ...formData, totalTowers: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Open Space Percentage
                </label>
                <input
                  type="text"
                  placeholder="e.g. 70% Open & Green Landscape"
                  value={formData.openSpacePercentage}
                  onChange={(e) => setFormData({ ...formData, openSpacePercentage: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Carpet Area Range
                </label>
                <input
                  type="text"
                  placeholder="e.g. 850 Sq.Ft (2 BHK) - 1,850 Sq.Ft (3 BHK)"
                  value={formData.carpetAreaRange}
                  onChange={(e) => setFormData({ ...formData, carpetAreaRange: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                />
              </div>

              {/* Available Typologies Multiselect */}
              <div className="sm:col-span-3 pt-2">
                <label className="block font-semibold text-slate-700 mb-2">
                  Available Typologies / Configurations in this Project:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONFIG_OPTIONS.map((cfg) => {
                    const selected = formData.availableConfigurations.includes(cfg);
                    return (
                      <button
                        type="button"
                        key={cfg}
                        onClick={() => toggleArrayItem('availableConfigurations', cfg)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                          selected
                            ? 'bg-teal-50 border-teal-300 text-teal-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate pr-1">{cfg}</span>
                        {selected && <Check size={14} className="text-teal-700 flex-shrink-0" />}
                      </button>
                    );
                  })}

                  {/* Custom typologies */}
                  {formData.availableConfigurations
                    .filter((cfg) => !CONFIG_OPTIONS.includes(cfg))
                    .map((cfg) => (
                      <div
                        key={cfg}
                        className="p-2.5 rounded-xl border border-teal-300 bg-teal-50 text-teal-900 text-xs font-semibold shadow-2xs flex items-center justify-between"
                      >
                        <span className="truncate pr-1">{cfg}</span>
                        <button
                          type="button"
                          onClick={() => toggleArrayItem('availableConfigurations', cfg)}
                          className="p-0.5 text-teal-700 hover:text-rose-600 transition"
                          title="Remove custom typology"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Add Custom Typology Input */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                  <input
                    type="text"
                    value={customConfigInput}
                    onChange={(e) => setCustomConfigInput(e.target.value)}
                    placeholder="Add custom typology (e.g. 3.5 BHK, Penthouse, Duplex)..."
                    className="flex-1 max-w-md p-2 rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomConfig();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomConfig}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('amenities')}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition"
              >
                Next: Amenities →
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: AMENITIES SELECTION */}
        {activeTab === 'amenities' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Project Amenities & Facilities</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select the lifestyle amenities provided within the project boundary.
                </p>
              </div>
              <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg">
                {formData.amenities.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {AMENITY_OPTIONS.map((amenity) => {
                const selected = formData.amenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => toggleArrayItem('amenities', amenity)}
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

              {/* Custom Amenities */}
              {formData.amenities
                .filter((a) => !AMENITY_OPTIONS.includes(a))
                .map((amenity) => (
                  <div
                    key={amenity}
                    className="p-2.5 rounded-xl border border-teal-300 bg-teal-50 text-teal-900 text-xs font-semibold shadow-2xs flex items-center justify-between"
                  >
                    <span className="truncate pr-1">{amenity}</span>
                    <button
                      type="button"
                      onClick={() => toggleArrayItem('amenities', amenity)}
                      className="p-0.5 text-teal-700 hover:text-rose-600 transition"
                      title="Remove custom amenity"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
            </div>

            {/* Add Custom Amenity Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={customAmenityInput}
                onChange={(e) => setCustomAmenityInput(e.target.value)}
                placeholder="Type custom amenity (e.g. Pet Park, Infinity Pool, Creche)..."
                className="flex-1 max-w-md p-2 rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomAmenity();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomAmenity}
                className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Amenity</span>
              </button>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('scale')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('legal')}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition"
              >
                Next: Legal & Banks →
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: LEGAL SANCTIONS & BANK APPROVALS */}
        {activeTab === 'legal' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck size={18} className="text-teal-700" />
              <h2 className="text-sm font-bold text-slate-900">MahaRERA, Sanctions & Approved Banks</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  MahaRERA Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. P50500021345"
                  value={formData.reraNumber}
                  onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  MahaRERA Verification URL
                </label>
                <input
                  type="url"
                  placeholder="https://maharera.mahaonline.gov.in/..."
                  value={formData.reraWebsite}
                  onChange={(e) => setFormData({ ...formData, reraWebsite: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                />
              </div>

              {/* Sanctions & Approvals */}
              <div className="sm:col-span-2 pt-2">
                <label className="block font-semibold text-slate-700 mb-2">
                  Sanctions, Clearances & Regulatory Approvals:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {APPROVAL_OPTIONS.map((appr) => {
                    const selected = formData.approvals.includes(appr);
                    return (
                      <button
                        type="button"
                        key={appr}
                        onClick={() => toggleArrayItem('approvals', appr)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                          selected
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate pr-1">{appr}</span>
                        {selected && <Check size={14} className="text-emerald-700 flex-shrink-0" />}
                      </button>
                    );
                  })}

                  {/* Custom Approvals */}
                  {formData.approvals
                    .filter((a) => !APPROVAL_OPTIONS.includes(a))
                    .map((appr) => (
                      <div
                        key={appr}
                        className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-semibold shadow-2xs flex items-center justify-between"
                      >
                        <span className="truncate pr-1">{appr}</span>
                        <button
                          type="button"
                          onClick={() => toggleArrayItem('approvals', appr)}
                          className="p-0.5 text-emerald-700 hover:text-rose-600 transition"
                          title="Remove custom approval"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Add Custom Sanction Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={customApprovalInput}
                    onChange={(e) => setCustomApprovalInput(e.target.value)}
                    placeholder="Add custom clearance (e.g. Aviation NOC, Forest Dept NOC)..."
                    className="flex-1 max-w-md p-2 rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomApproval();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomApproval}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Approved Banking Partners */}
              <div className="sm:col-span-2 pt-2">
                <label className="block font-semibold text-slate-700 mb-2">
                  Approved Banking Partners for Home Loans:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BANK_OPTIONS.map((bank) => {
                    const selected = formData.approvedBanks.includes(bank);
                    return (
                      <button
                        type="button"
                        key={bank}
                        onClick={() => toggleArrayItem('approvedBanks', bank)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition truncate ${
                          selected
                            ? 'bg-teal-50 border-teal-300 text-teal-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {bank}
                      </button>
                    );
                  })}

                  {/* Custom Banks */}
                  {formData.approvedBanks
                    .filter((b) => !BANK_OPTIONS.includes(b))
                    .map((bank) => (
                      <div
                        key={bank}
                        className="p-2.5 rounded-xl border border-teal-300 bg-teal-50 text-teal-900 text-xs font-semibold shadow-2xs flex items-center justify-between"
                      >
                        <span className="truncate pr-1">{bank}</span>
                        <button
                          type="button"
                          onClick={() => toggleArrayItem('approvedBanks', bank)}
                          className="p-0.5 text-teal-700 hover:text-rose-600 transition"
                          title="Remove custom bank"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Add Custom Bank Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={customBankInput}
                    onChange={(e) => setCustomBankInput(e.target.value)}
                    placeholder="Add custom bank (e.g. Canara Bank, Union Bank, Bajaj Housing Finance)..."
                    className="flex-1 max-w-md p-2 rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomBank();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomBank}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('amenities')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition"
              >
                Next: Custom Specs →
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOM SPECIFICATIONS & KEY-VALUE ATTRIBUTES */}
        {activeTab === 'specs' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-teal-700" />
                <h2 className="text-sm font-bold text-slate-900">Custom Project Specifications & Attributes</h2>
              </div>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus size={13} />
                <span>+ Add Custom Field</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Add any custom technical or marketing attributes specific to this development (e.g. Structure, Flooring, Water Source, Distance to Airport/Metro, Elevator Brand).
            </p>

            {formData.customFields.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                No custom fields added yet. Click &ldquo;+ Add Custom Field&rdquo; to add custom specifications.
              </div>
            ) : (
              <div className="space-y-2.5">
                {formData.customFields.map((cf, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="w-1/3 min-w-[150px]">
                      <input
                        type="text"
                        value={cf.label}
                        onChange={(e) => handleCustomFieldChange(idx, 'label', e.target.value)}
                        placeholder="Field Name (e.g. Structure)"
                        className="w-full p-2 rounded-xl bg-white border border-slate-200 focus:border-teal-600 focus:outline-none text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={cf.value}
                        onChange={(e) => handleCustomFieldChange(idx, 'value', e.target.value)}
                        placeholder="Field Value (e.g. Earthquake Resistant RCC Zone-II)"
                        className="w-full p-2 rounded-xl bg-white border border-slate-200 focus:border-teal-600 focus:outline-none text-xs text-slate-700"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(idx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove field"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('legal')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition"
              >
                Next: Media & Digital Assets →
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: MEDIA & DIGITAL ASSETS + CONTACT */}
        {activeTab === 'media' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ImageIcon size={18} className="text-teal-700" />
              <h2 className="text-sm font-bold text-slate-900">Project Media, Plans & Sales Desk</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Main Elevation / Cover Photo URL *
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or uploaded CDN image"
                  value={formData.coverPhoto}
                  onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Master Plan Blueprint Layout URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/master-plan-layout.jpg"
                  value={formData.masterPlanUrl}
                  onChange={(e) => setFormData({ ...formData, masterPlanUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official E-Brochure PDF Link
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/project-brochure.pdf"
                  value={formData.brochureUrl}
                  onChange={(e) => setFormData({ ...formData, brochureUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Walkthrough Video URL (YouTube / MP4)
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3D Virtual Tour URL
                </label>
                <input
                  type="url"
                  placeholder="https://my.matterport.com/show/?m=..."
                  value={formData.virtualTourUrl}
                  onChange={(e) => setFormData({ ...formData, virtualTourUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Additional Site & Elevation Photos (One URL per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
                  value={formData.additionalImages}
                  onChange={(e) => setFormData({ ...formData, additionalImages: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] outline-none focus:border-teal-600"
                />
              </div>

              {/* Site Office Contact */}
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">Sales Desk & Site Office Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sales Phone</label>
                    <input
                      type="text"
                      placeholder="+91 9822000000"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      placeholder="+91 9822000000"
                      value={formData.contactWhatsApp}
                      onChange={(e) => setFormData({ ...formData, contactWhatsApp: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sales Email</label>
                    <input
                      type="email"
                      placeholder="sales@project.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Site Office Timings</label>
                    <input
                      type="text"
                      placeholder="Mon - Sun: 10:00 AM - 7:00 PM"
                      value={formData.siteOfficeTimings}
                      onChange={(e) => setFormData({ ...formData, siteOfficeTimings: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
              >
                ← Back
              </button>

              <div className="flex items-center space-x-2">
                <Link
                  to="/projects"
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
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
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BuilderAddProjectPage;
