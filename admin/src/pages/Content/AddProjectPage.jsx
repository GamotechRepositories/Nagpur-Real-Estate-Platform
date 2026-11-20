import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Compass,
  Building2,
  Building,
  MapPin,
  ShieldCheck,
  Calendar,
  IndianRupee,
  Layers,
  Sparkles,
  TreePine,
  Phone,
  MessageSquare,
  FileText,
  Video,
  UploadCloud,
  Loader2,
  Trash2,
  Plus,
  Save,
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { getFullImageUrl } from '../../components/common/PhotoUploader';

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

export const AddProjectPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Custom inputs for dynamic options
  const [customConfigInput, setCustomConfigInput] = useState('');
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [customApprovalInput, setCustomApprovalInput] = useState('');
  const [customBankInput, setCustomBankInput] = useState('');

  // Fetch builders for linkage dropdown
  const { data: builders = [] } = useQuery({
    queryKey: ['admin-builders-list-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get('/builders');
      return res.data?.data || [];
    },
  });

  // Fetch localities
  const { data: remoteLocalitiesData } = useQuery({
    queryKey: ['admin-localities-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get('/localities');
      return res.data?.data || [];
    },
  });

  const remoteLocalities = remoteLocalitiesData || [];
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
    builder: '',
    builderName: '',
    localityName: 'Wardha Road',
    address: 'Wardha Road, Nagpur',
    landmark: '',
    pincode: '440025',
    reraNumber: '',
    reraWebsite: '',
    projectStatus: 'UNDER_CONSTRUCTION',
    startingPrice: '',
    maxPrice: '',
    pricePerSqFt: '',
    totalLandArea: '4.5 Acres',
    totalTowers: '3 Towers (G+14 Floors)',
    openSpacePercentage: '70%',
    carpetAreaRange: '850 - 1,850 Sq.Ft',
    totalUnits: 90,
    possessionDate: '',
    availableConfigurations: ['2 BHK Luxury Flat', '3 BHK High-Rise Flat'],
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
    contactPhone: '+91 9823012345',
    contactEmail: 'sales@nagpurproperties.com',
    contactWhatsApp: '+91 9823012345',
    siteOfficeTimings: '10:00 AM - 7:00 PM (All 7 Days)',
    description: '',
    coverPhoto: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        caption: 'Main Elevation View',
        isCover: true,
      },
    ],
    masterPlanUrl: '',
    brochureUrl: '',
    videoUrl: '',
    virtualTourUrl: '',
    isFeatured: false,
    isPublished: true,
    customFields: [
      { label: 'Water Supply', value: '24x7 NMC Water Supply + Borewell' },
      { label: 'Elevators', value: 'High-Speed Automatic Lifts with ARD & Power Backup' },
    ],
  });

  // Load project if edit mode
  const { data: existingProject, isLoading: isFetchingProject } = useQuery({
    queryKey: ['admin-project-to-edit', id],
    queryFn: async () => {
      const res = await apiClient.get(`/projects/${id}`);
      return res.data?.data || res.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingProject) {
      const p = existingProject;
      const images = p.images || [];
      const cover = images.find((i) => i.isCover)?.url || p.coverPhoto || images[0]?.url || '';

      setFormData({
        name: p.name || '',
        tagline: p.tagline || '',
        projectType: p.projectType || 'RESIDENTIAL',
        builder: p.builder?._id || p.builder || '',
        builderName: p.builderName || p.builder?.name || '',
        localityName: p.localityName || 'Wardha Road',
        address: p.address || 'Wardha Road, Nagpur',
        landmark: p.landmark || '',
        pincode: p.pincode || '440025',
        reraNumber: p.reraNumber || '',
        reraWebsite: p.reraWebsite || '',
        projectStatus: p.projectStatus || 'UNDER_CONSTRUCTION',
        startingPrice: p.startingPrice || '',
        maxPrice: p.maxPrice || '',
        pricePerSqFt: p.pricePerSqFt || '',
        totalLandArea: p.totalLandArea || '',
        totalTowers: p.totalTowers || '',
        openSpacePercentage: p.openSpacePercentage || '',
        carpetAreaRange: p.carpetAreaRange || '',
        totalUnits: p.totalUnits || 0,
        possessionDate: p.possessionDate ? p.possessionDate.split('T')[0] : '',
        availableConfigurations: p.availableConfigurations || [],
        amenities: p.amenities || [],
        approvals: p.approvals || [],
        approvedBanks: p.approvedBanks || [],
        contactPhone: p.contactPhone || '',
        contactEmail: p.contactEmail || '',
        contactWhatsApp: p.contactWhatsApp || '',
        siteOfficeTimings: p.siteOfficeTimings || '',
        description: p.description || '',
        coverPhoto: cover,
        photos: images.length > 0 ? images : cover ? [{ url: cover, isCover: true }] : [],
        masterPlanUrl: p.masterPlanUrl || '',
        brochureUrl: p.brochureUrl || '',
        videoUrl: p.videoUrl || '',
        virtualTourUrl: p.virtualTourUrl || '',
        isFeatured: Boolean(p.isFeatured),
        isPublished: p.isPublished !== false,
        customFields: p.customFields && p.customFields.length > 0 ? p.customFields : [],
      });
    }
  }, [existingProject]);

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

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploadError('');
    setIsUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('folder', 'projects');
      Array.from(files).forEach((f) => {
        uploadFormData.append('files', f);
      });

      const res = await apiClient.post('/upload/multiple', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploaded = res.data?.data || [];
      const newItems = uploaded.map((item, idx) => ({
        url: item.url,
        caption: '',
        isCover: formData.photos.length === 0 && idx === 0,
      }));

      setFormData((prev) => {
        const combined = [...prev.photos, ...newItems];
        if (combined.length > 0 && !combined.some((p) => p.isCover)) {
          combined[0].isCover = true;
        }
        return {
          ...prev,
          photos: combined,
          coverPhoto: combined.find((p) => p.isCover)?.url || combined[0]?.url || prev.coverPhoto,
        };
      });
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload photo(s). Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    const isFirst = formData.photos.length === 0;
    setFormData((prev) => {
      const nextPhotos = [
        ...prev.photos,
        { url: newImageUrl.trim(), caption: '', isCover: isFirst },
      ];
      return {
        ...prev,
        photos: nextPhotos,
        coverPhoto: isFirst ? newImageUrl.trim() : prev.coverPhoto,
      };
    });
    setNewImageUrl('');
  };

  const handleRemovePhoto = (indexToRemove) => {
    setFormData((prev) => {
      const updated = prev.photos.filter((_, idx) => idx !== indexToRemove);
      if (updated.length > 0 && !updated.some((p) => p.isCover)) {
        updated[0].isCover = true;
      }
      return {
        ...prev,
        photos: updated,
        coverPhoto: updated.find((p) => p.isCover)?.url || updated[0]?.url || '',
      };
    });
  };

  const handleSetCoverPhoto = (idx) => {
    setFormData((prev) => {
      const updated = prev.photos.map((p, i) => ({
        ...p,
        isCover: i === idx,
      }));
      return {
        ...prev,
        photos: updated,
        coverPhoto: updated[idx]?.url || prev.coverPhoto,
      };
    });
  };

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (isEdit) {
        return apiClient.put(`/projects/${id}`, payload);
      }
      return apiClient.post('/projects', payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(['admin-projects-list']);
      const projectId = res.data?.data?._id || res.data?._id || id;
      setModalState({
        isOpen: true,
        title: 'Project Saved Successfully',
        message: isEdit
          ? 'Project specifications and assets updated.'
          : 'New development project successfully published to the marketplace.',
        type: 'success',
        onConfirm: () => navigate(`/projects/${projectId}`),
      });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to save project.';
      setModalState({
        isOpen: true,
        title: 'Validation Error',
        message: msg,
        type: 'danger',
      });
    },
  });

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.name.trim()) {
      setModalState({
        isOpen: true,
        title: 'Validation Error',
        message: 'Project name / title is required.',
        type: 'danger',
      });
      return;
    }

    if (!formData.address.trim()) {
      setModalState({
        isOpen: true,
        title: 'Validation Error',
        message: 'Site address is required.',
        type: 'danger',
      });
      return;
    }

    // Build payload
    const images = formData.photos.map((p, idx) => ({
      url: p.url,
      caption: p.caption || (p.isCover ? 'Main Elevation' : `Site Photo ${idx + 1}`),
      isCover: Boolean(p.isCover),
    }));

    if (images.length === 0 && formData.coverPhoto) {
      images.push({ url: formData.coverPhoto, caption: 'Main Elevation', isCover: true });
    }

    const customFields = (formData.customFields || []).filter((f) => f.label && f.label.trim());

    const payload = {
      ...formData,
      startingPrice: Number(formData.startingPrice) || 0,
      maxPrice: Number(formData.maxPrice) || 0,
      pricePerSqFt: Number(formData.pricePerSqFt) || 0,
      totalUnits: Number(formData.totalUnits) || 0,
      images,
      coverPhoto: images.find((i) => i.isCover)?.url || formData.coverPhoto || '',
      customFields,
    };

    mutation.mutate(payload);
  };

  if (isEdit && isFetchingProject) {
    return (
      <div className="w-full space-y-4 p-8">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Page Header */}
      <PageHeader
        title={isEdit ? 'Edit Development Project' : 'Post New Development Project'}
        subtitle="Comprehensive project registration with MahaRERA verification, typologies, scale, amenities and visual media"
        icon={Compass}
        breadcrumbs={[
          { label: 'Projects', link: '/projects' },
          { label: isEdit ? `Edit: ${formData.name || 'Project'}` : 'Add New Project' },
        ]}
        actions={
          <div className="flex items-center space-x-2">
            <Link
              to="/projects"
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
            >
              <Save size={14} />
              <span>{mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Project'}</span>
            </button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: BASIC PROJECT IDENTITY & DEVELOPER */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">1. Basic Project Identity & Developer</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Project Name / Title *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="e.g. Godrej Forest Grove / Pyramid City Besa Enclave"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Project Type / Category *
              </label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              >
                {PROJECT_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Marketing Tagline / Project USP
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="e.g. Ultra-Luxury 2, 3 & 4 BHK High-Rise Residences with 40+ Lifestyle Amenities on Wardha Road"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Developer / Builder Linkage
              </label>
              <select
                value={formData.builder}
                onChange={(e) => {
                  const bId = e.target.value;
                  const bObj = builders.find((b) => (b._id || b.id) === bId);
                  setFormData({
                    ...formData,
                    builder: bId,
                    builderName: bObj?.name || formData.builderName,
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              >
                <option value="">-- Independent / Custom Developer --</option>
                {builders.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    {b.name} ({b.companyName || 'Developer'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Developer Name (Display Brand)
              </label>
              <input
                type="text"
                value={formData.builderName}
                onChange={(e) => setFormData({ ...formData, builderName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="e.g. Godrej Properties / Pyramid Developers"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Project Development Stage / Status *
              </label>
              <select
                value={formData.projectStatus}
                onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white font-semibold"
              >
                <option value="NEW_LAUNCH">NEW LAUNCH (Booking Open)</option>
                <option value="UNDER_CONSTRUCTION">UNDER CONSTRUCTION</option>
                <option value="READY_TO_MOVE">READY TO MOVE</option>
                <option value="COMPLETED">COMPLETED (Handover Done)</option>
                <option value="UPCOMING">UPCOMING</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Nagpur Locality *
              </label>
              <select
                value={formData.localityName}
                onChange={(e) => setFormData({ ...formData, localityName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              >
                {localities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Full Site Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="e.g. Besa Square, Near Podar International School, Besa, Nagpur"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Landmark / Proximity
              </label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="e.g. 5 Mins from Metro Station / MIHAN Flyover"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-mono"
                placeholder="440025"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Target Possession Date
              </label>
              <input
                type="date"
                value={formData.possessionDate}
                onChange={(e) => setFormData({ ...formData, possessionDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Project Overview & Specifications
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs resize-none"
                placeholder="Detailed overview covering architecture, construction grade (Mivan shuttering), green spaces, lifestyle and transit connectivity..."
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: SCALE, DIMENSIONS & PRICING STRUCTURE */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <IndianRupee className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">2. Scale, Dimensions & Pricing Structure</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Starting Price (₹) *
              </label>
              <input
                type="number"
                min={100000}
                value={formData.startingPrice}
                onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-mono font-semibold"
                placeholder="e.g. 4500000 (45 Lakh)"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Maximum Price (₹)
              </label>
              <input
                type="number"
                min={100000}
                value={formData.maxPrice}
                onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-mono font-semibold"
                placeholder="e.g. 12500000 (1.25 Cr)"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Avg. Price per Sq.Ft (₹)
              </label>
              <input
                type="number"
                value={formData.pricePerSqFt}
                onChange={(e) => setFormData({ ...formData, pricePerSqFt: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-mono"
                placeholder="e.g. 4200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Total Units Planned *
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={formData.totalUnits}
                onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-semibold"
                placeholder="e.g. 120"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Total Land Area
              </label>
              <input
                type="text"
                value={formData.totalLandArea}
                onChange={(e) => setFormData({ ...formData, totalLandArea: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="e.g. 4.5 Acres / 2 Acres"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Total Towers & Floors
              </label>
              <input
                type="text"
                value={formData.totalTowers}
                onChange={(e) => setFormData({ ...formData, totalTowers: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="e.g. 3 Towers (G+14 Floors)"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Open Space Percentage
              </label>
              <input
                type="text"
                value={formData.openSpacePercentage}
                onChange={(e) => setFormData({ ...formData, openSpacePercentage: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="e.g. 70% Open Space"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Carpet Area Range
              </label>
              <input
                type="text"
                value={formData.carpetAreaRange}
                onChange={(e) => setFormData({ ...formData, carpetAreaRange: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="e.g. 850 Sq.Ft - 1,850 Sq.Ft"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: AVAILABLE TYPOLOGIES & CONFIGURATIONS */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700" />
              <h2 className="text-sm font-bold text-slate-900">3. Available Typologies & Configurations</h2>
            </div>
            <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full">
              {formData.availableConfigurations.length} Selected
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Select the unit configurations planned and offered for booking in this development project:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {CONFIG_OPTIONS.map((cfg) => {
              const selected = formData.availableConfigurations.includes(cfg);
              return (
                <button
                  type="button"
                  key={cfg}
                  onClick={() => toggleArrayItem('availableConfigurations', cfg)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
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

            {/* Custom configurations that are not in CONFIG_OPTIONS */}
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
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              value={customConfigInput}
              onChange={(e) => setCustomConfigInput(e.target.value)}
              placeholder="Add custom typology (e.g. 3.5 BHK Luxury, Penthouse Duplex, Studio Flat)..."
              className="flex-1 max-w-md px-3 py-1.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
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
              className="px-3.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Typology</span>
            </button>
          </div>
        </div>

        {/* SECTION 4: PROJECT AMENITIES & LIFESTYLE FACILITIES */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TreePine className="w-4 h-4 text-teal-700" />
              <h2 className="text-sm font-bold text-slate-900">4. Project Amenities & Lifestyle Facilities</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amenities: AMENITY_OPTIONS })}
                className="text-[11px] text-teal-700 hover:underline font-semibold"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amenities: [] })}
                className="text-[11px] text-slate-500 hover:underline font-semibold"
              >
                Clear All
              </button>
              <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full ml-1">
                {formData.amenities.length} Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {AMENITY_OPTIONS.map((amenity) => {
              const selected = formData.amenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleArrayItem('amenities', amenity)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                    selected
                      ? 'bg-teal-50 border-teal-300 text-teal-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate pr-1">{amenity}</span>
                  {selected && <CheckCircle2 size={14} className="text-teal-700 flex-shrink-0" />}
                </button>
              );
            })}

            {/* Custom amenities not in AMENITY_OPTIONS */}
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
              placeholder="Type custom amenity (e.g. Pet Park, Mini Golf, Infinity Pool, Helipad, Creche)..."
              className="flex-1 max-w-md px-3 py-1.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
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
              className="px-3.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Custom Amenity</span>
            </button>
          </div>
        </div>

        {/* SECTION 5: LEGAL SANCTIONS & BANKING PARTNERS */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">5. Legal Sanctions & Approved Banking Partners</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                MahaRERA Registration Number
              </label>
              <input
                type="text"
                value={formData.reraNumber}
                onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-mono font-semibold"
                placeholder="e.g. P50500021345"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                MahaRERA Verification URL
              </label>
              <input
                type="url"
                value={formData.reraWebsite}
                onChange={(e) => setFormData({ ...formData, reraWebsite: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="https://maharera.mahaonline.gov.in/..."
              />
            </div>

            {/* Sanctions Multiselect */}
            <div className="md:col-span-2 pt-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-2">
                Government Sanctions & Regulatory Approvals
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {APPROVAL_OPTIONS.map((appr) => {
                  const selected = formData.approvals.includes(appr);
                  return (
                    <button
                      type="button"
                      key={appr}
                      onClick={() => toggleArrayItem('approvals', appr)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
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
                  placeholder="Add custom clearance (e.g. Aviation NOC, Forest Dept NOC, Gram Panchayat Sanction)..."
                  className="flex-1 max-w-md px-3 py-1.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
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
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Sanction</span>
                </button>
              </div>
            </div>

            {/* Bank Partners Multiselect */}
            <div className="md:col-span-2 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-2">
                Approved Banking Partners for Home Loans
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {BANK_OPTIONS.map((bank) => {
                  const selected = formData.approvedBanks.includes(bank);
                  return (
                    <button
                      type="button"
                      key={bank}
                      onClick={() => toggleArrayItem('approvedBanks', bank)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition truncate cursor-pointer ${
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
                  placeholder="Add custom approved bank (e.g. Canara Bank, Union Bank, Bajaj Housing Finance)..."
                  className="flex-1 max-w-md px-3 py-1.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
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
                  className="px-3.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Bank</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: VISUAL MEDIA, MASTER PLAN & DIGITAL WALKTHROUGH */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ImageIcon className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">6. Visual Media, Master Plan & Digital Walkthrough</h2>
          </div>

          {/* Photo Upload Area */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-2">
              Project Elevation & Site Photos
            </label>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />

            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isUploading
                  ? 'border-teal-400 bg-teal-50/50 cursor-wait'
                  : 'border-teal-300 bg-teal-50/20 hover:border-teal-500 hover:bg-teal-50/40'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <div className="text-xs">
                  <span className="font-bold text-teal-800">Click to upload photos</span>
                  <span className="text-slate-500"> or drag and drop here</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  JPEG, PNG, WebP up to 10MB each. High-resolution elevations recommended.
                </p>
              </div>
            </div>

            {uploadError && (
              <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Direct URL input */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste an image URL (https://...)"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                + Add URL
              </button>
            </div>

            {/* Uploaded Photos Grid */}
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
                {formData.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video shadow-2xs"
                  >
                    <img
                      src={getFullImageUrl(photo.url)}
                      alt={`Project photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {photo.isCover && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-teal-700 text-white text-[9px] font-bold shadow-xs">
                        Main Cover
                      </span>
                    )}

                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      {!photo.isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCoverPhoto(idx)}
                          className="px-2 py-1 rounded bg-white text-slate-800 text-[10px] font-bold shadow-xs hover:bg-teal-50"
                        >
                          Make Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="p-1 rounded bg-rose-600 text-white shadow-xs hover:bg-rose-700"
                        title="Remove photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collateral & Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Master Plan Blueprint Layout URL
              </label>
              <input
                type="url"
                value={formData.masterPlanUrl}
                onChange={(e) => setFormData({ ...formData, masterPlanUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="https://example.com/master-plan-layout.jpg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Official E-Brochure PDF Link
              </label>
              <input
                type="url"
                value={formData.brochureUrl}
                onChange={(e) => setFormData({ ...formData, brochureUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="https://example.com/project-brochure.pdf"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Walkthrough Video URL (YouTube / Vimeo / MP4)
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                3D Virtual Tour URL (Matterport / 360 View)
              </label>
              <input
                type="url"
                value={formData.virtualTourUrl}
                onChange={(e) => setFormData({ ...formData, virtualTourUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="https://my.matterport.com/show/?m=..."
              />
            </div>
          </div>
        </div>

        {/* SECTION 7: SALES DESK, SITE OFFICE & INSPECTION HOURS */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">7. Sales Desk, Site Office & Inspection Hours</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Sales Desk Phone
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-mono"
                placeholder="+91 9823012345"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                WhatsApp Inquiry Number
              </label>
              <input
                type="text"
                value={formData.contactWhatsApp}
                onChange={(e) => setFormData({ ...formData, contactWhatsApp: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-mono"
                placeholder="+91 9823012345"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Sales Email Address
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="sales@nagpurproperties.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Site Office Inspection Timings
              </label>
              <input
                type="text"
                value={formData.siteOfficeTimings}
                onChange={(e) => setFormData({ ...formData, siteOfficeTimings: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="10:00 AM - 7:00 PM (All 7 Days)"
              />
            </div>
          </div>
        </div>

        {/* SECTION 8: CUSTOM SPECIFICATIONS & KEY-VALUE ATTRIBUTES */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <h2 className="text-sm font-bold text-slate-900">8. Custom Project Specifications & Attributes</h2>
            </div>
            <button
              type="button"
              onClick={handleAddCustomField}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus size={13} />
              <span>+ Add Custom Field</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Need custom technical or marketing attributes for this project? Add any custom key-value details below (e.g. Structure, Flooring, Water Source, Distance to Airport/Metro, Elevator Brand).
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
                      placeholder="Field Name (e.g. Structure / Flooring)"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={cf.value}
                      onChange={(e) => handleCustomFieldChange(idx, 'value', e.target.value)}
                      placeholder="Field Value (e.g. Earthquake Resistant RCC / Italian Vitrified Tiles)"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-teal-500 focus:outline-none text-xs text-slate-700"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomField(idx)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove custom field"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 9: STATUS & PROMOTIONAL FLAGS */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">9. Visibility & Promotional Badges</h2>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span className="font-semibold text-slate-800">Publish Immediately on Marketplace</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span className="font-semibold text-slate-800">Mark as Featured Development</span>
            </label>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-4 pb-12">
          <Link
            to="/projects"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
          >
            Cancel / Back to Projects
          </Link>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition disabled:opacity-50 cursor-pointer"
          >
            <Save size={15} />
            <span>{mutation.isPending ? 'Saving Project...' : isEdit ? 'Save Changes' : 'Publish Project'}</span>
          </button>
        </div>
      </form>

      {/* Confirmation / Alert Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={() => {
          setModalState({ ...modalState, isOpen: false });
          if (modalState.onConfirm) modalState.onConfirm();
        }}
        onCancel={() => setModalState({ ...modalState, isOpen: false })}
      />
    </div>
  );
};

export default AddProjectPage;
