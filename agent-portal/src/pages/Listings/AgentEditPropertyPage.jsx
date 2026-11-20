import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Layers,
  MapPin,
  IndianRupee,
  Home,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowLeft,
  Info,
  Shield,
  Compass,
  UserCheck,
  Lock,
  Save,
  ExternalLink,
  Check,
  Eye,
  UploadCloud,
  Loader2,
  FileCheck,
  FileText,
  Video,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const backendOrigin = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
};

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
  'Jaripatka',
  'Katol Road',
  'Medical Square',
  'Ghat Road',
  'Ayodhya Nagar',
  'Hudkeshwar',
  'Godhani',
  'Kamptee Road',
];

const BASIC_AMENITIES = [
  '24/7 Water Supply',
  'Power Backup',
  'Lift / Elevator',
  'Reserved Car Parking',
  'Visitor Parking',
  'Gated Community',
  'Security Personnel',
  'CCTV Surveillance',
  'Fire Safety Equipment',
  'Rainwater Harvesting',
];

const LIFESTYLE_AMENITIES = [
  'Swimming Pool',
  'Gymnasium',
  'Clubhouse',
  'Landscaped Garden',
  "Children's Play Area",
  'Jogging Track',
  'Indoor Games Room',
  'Sports Facilities / Badminton Court',
  'Community Hall',
  'Yoga / Meditation Area',
];

const INTERIOR_FEATURES = [
  'Modular Kitchen',
  'Built-in Wardrobes',
  'Air Conditioning',
  'Balcony with City View',
  'Attached Bathrooms',
  'Pooja Room',
  'Servant Room',
  'Store Room',
  'False Ceiling with LED Lights',
  'Vastu Compliant',
  'Piped Gas Connection',
  'Wifi / Broadband',
];

const SUITABLE_FOR_OPTIONS = [
  'Families',
  'Bachelors / Students',
  'Working Professionals',
  'Doctors / Clinics',
  'IT / Software Offices',
  'Investors',
  'Retail Businesses',
];

export const AgentEditPropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isBuilder = user?.role === 'BUILDER';

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  // 1. Fetch Property Details
  const {
    data: property,
    isLoading: isPropLoading,
    isError: isPropError,
    error: propError,
  } = useQuery({
    queryKey: ['agent-property-edit', id],
    queryFn: async () => {
      const res = await apiClient.get(`/properties/${id}`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });

  // 2. Fetch Projects for township linkage
  const { data: projectsData } = useQuery({
    queryKey: ['projects-dropdown', isBuilder],
    queryFn: () => apiClient.get(isBuilder ? '/builders/me/projects' : '/projects'),
  });
  const projects = projectsData?.data || [];

  const [formData, setFormData] = useState({
    title: '',
    purpose: 'BUY',
    category: 'RESIDENTIAL',
    subtype: 'FLAT',
    condition: 'Ready to Move',
    ownershipType: 'Freehold',
    project: '',
    description: '',
    propertyUsp: '',
    suitableFor: ['Families'],
    price: '',
    priceNegotiable: false,
    pricePerSqFt: '',
    bookingAmount: '',
    maintenanceCharges: '',
    maintenanceFrequency: 'Monthly',
    securityDeposit: '',
    brokerage: 'Zero Brokerage',
    loanAvailable: true,
    taxAndGovtCharges: 'Excluded',
    additionalCharges: '',
    areaSqFt: '',
    carpetAreaSqFt: '',
    builtUpAreaSqFt: '',
    plotAreaSqFt: '',
    roadWidthFt: 30,
    areaUnit: 'Sq.Ft',
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    floor: 2,
    totalFloors: 5,
    furnishing: 'SEMI_FURNISHED',
    possessionStatus: 'READY_TO_MOVE',
    possessionDate: '',
    propertyAge: '0-1 year',
    facing: 'EAST',
    cabins: 0,
    workstations: 0,
    conferenceRooms: 0,
    address: '',
    localityName: 'Dharampeth',
    subLocality: '',
    landmark: '',
    pincode: '440010',
    latitude: 21.1458,
    longitude: 79.0882,
    images: [],
    floorPlanUrl: '',
    videoUrl: '',
    virtualTourUrl: '',
    brochureUrl: '',
    amenities: ['Power Backup', 'Lift / Elevator', 'Reserved Car Parking', '24/7 Water Supply'],
    otherAmenities: '',
    reraRegistered: 'Yes',
    reraNumber: '',
    occupancyCertificate: 'Available',
    completionCertificate: 'Available',
    propertyTaxStatus: 'Paid',
    approvedBy: 'NMC (Nagpur Municipal Corporation)',
    bankLoanApprovedBy: 'SBI, HDFC, ICICI, Axis Bank',
    sellerName: '',
    sellerPhone: '',
    sellerWhatsapp: '',
    sellerEmail: '',
    sellerNotes: '',
    listedBy: isBuilder ? 'Builder' : 'Agent',
    status: 'LIVE',
    customFields: [],
  });

  // Pre-populate when property loads
  useEffect(() => {
    if (property) {
      const rawPhotos = Array.isArray(property.photos) && property.photos.length > 0
        ? property.photos
        : (property.images || []);

      const normalizedPhotos = rawPhotos.map((p, idx) => {
        if (typeof p === 'string') return { url: p, caption: '', isCover: idx === 0 };
        return { url: p.url, caption: p.caption || '', isCover: !!p.isCover || idx === 0 };
      });

      setFormData({
        title: property.title || '',
        purpose: property.purpose || 'BUY',
        category: property.category || 'RESIDENTIAL',
        subtype: property.subtype || 'FLAT',
        condition: property.condition || 'Ready to Move',
        ownershipType: property.ownershipType || 'Freehold',
        project: property.project?._id || property.project || '',
        description: property.description || '',
        propertyUsp: property.propertyUsp || '',
        suitableFor: Array.isArray(property.suitableFor) && property.suitableFor.length > 0
          ? property.suitableFor
          : ['Families'],
        price: property.price || '',
        priceNegotiable: !!property.priceNegotiable,
        pricePerSqFt: property.pricePerSqFt || (property.price && property.areaSqFt ? Math.round(property.price / property.areaSqFt) : ''),
        bookingAmount: property.bookingAmount || '',
        maintenanceCharges: property.maintenanceCharges || '',
        maintenanceFrequency: property.maintenanceFrequency || 'Monthly',
        securityDeposit: property.securityDeposit || '',
        brokerage: property.brokerage || 'Zero Brokerage',
        loanAvailable: property.loanAvailable !== undefined ? !!property.loanAvailable : true,
        taxAndGovtCharges: property.taxAndGovtCharges || 'Excluded',
        additionalCharges: property.additionalCharges || '',
        areaSqFt: property.areaSqFt || '',
        carpetAreaSqFt: property.carpetAreaSqFt || '',
        builtUpAreaSqFt: property.builtUpAreaSqFt || '',
        plotAreaSqFt: property.plotAreaSqFt || '',
        roadWidthFt: property.roadWidthFt || 30,
        areaUnit: property.areaUnit || 'Sq.Ft',
        bedrooms: property.bedrooms ?? 2,
        bathrooms: property.bathrooms ?? 2,
        balconies: property.balconies ?? 1,
        floor: property.floor ?? 1,
        totalFloors: property.totalFloors ?? 4,
        furnishing: property.furnishing || 'SEMI_FURNISHED',
        possessionStatus: property.possessionStatus || 'READY_TO_MOVE',
        possessionDate: property.possessionDate || '',
        propertyAge: property.propertyAge || '0-1 year',
        facing: property.facing || 'EAST',
        cabins: property.cabins ?? 0,
        workstations: property.workstations ?? 0,
        conferenceRooms: property.conferenceRooms ?? 0,
        address: property.address || '',
        localityName: property.localityName || 'Dharampeth',
        subLocality: property.subLocality || '',
        landmark: property.landmark || '',
        pincode: property.pincode || '440010',
        latitude: property.location?.coordinates?.[1] || 21.1458,
        longitude: property.location?.coordinates?.[0] || 79.0882,
        images: normalizedPhotos,
        floorPlanUrl: property.floorPlanUrl || '',
        videoUrl: property.videoUrl || '',
        virtualTourUrl: property.virtualTourUrl || '',
        brochureUrl: property.brochureUrl || '',
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        otherAmenities: property.otherAmenities || '',
        reraRegistered: property.reraNumber ? 'Yes' : 'Not Applicable',
        reraNumber: property.reraNumber || '',
        occupancyCertificate: property.occupancyCertificate || 'Available',
        completionCertificate: property.completionCertificate || 'Available',
        propertyTaxStatus: property.propertyTaxStatus || 'Paid',
        approvedBy: property.approvedBy || 'NMC (Nagpur Municipal Corporation)',
        bankLoanApprovedBy: property.bankLoanApprovedBy || 'SBI, HDFC, ICICI, Axis Bank',
        sellerName: property.clientSellerDetails?.name || property.sellerName || '',
        sellerPhone: property.clientSellerDetails?.phone || property.sellerPhone || '',
        sellerWhatsapp: property.clientSellerDetails?.whatsapp || '',
        sellerEmail: property.clientSellerDetails?.email || property.sellerEmail || '',
        sellerNotes: property.clientSellerDetails?.notes || property.sellerNotes || '',
        listedBy: property.clientSellerDetails?.listedBy || (isBuilder ? 'Builder' : 'Agent'),
        status: property.status || 'LIVE',
        customFields: Array.isArray(property.customFields) && property.customFields.length > 0 ? property.customFields : [],
      });
    }
  }, [property, isBuilder]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload) => apiClient.patch(`/properties/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-property-edit', id]);
      queryClient.invalidateQueries(['agent-property-view', id]);
      queryClient.invalidateQueries(['agent-properties']);
      queryClient.invalidateQueries(['agent-dashboard']);
      setModalState({
        isOpen: true,
        title: 'Listing Updated',
        message: 'Your property listing changes have been saved successfully!',
        type: 'success',
      });
    },
    onError: (err) => {
      setModalState({
        isOpen: true,
        title: 'Update Error',
        message: err.response?.data?.message || err.message || 'Failed to update property listing.',
        type: 'danger',
      });
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      if (name === 'price' || name === 'areaSqFt') {
        const p = Number(name === 'price' ? value : updated.price);
        const a = Number(name === 'areaSqFt' ? value : updated.areaSqFt);
        if (p > 0 && a > 0) {
          updated.pricePerSqFt = Math.round(p / a);
        }
      }
      return updated;
    });
  };

  const handleAmenityToggle = (amenity) => {
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

  const handleSuitableForToggle = (item) => {
    setFormData((prev) => {
      const exists = prev.suitableFor.includes(item);
      return {
        ...prev,
        suitableFor: exists
          ? prev.suitableFor.filter((s) => s !== item)
          : [...prev.suitableFor, item],
      };
    });
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

  const handleAddCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customFields: [...(prev.customFields || []), { label: '', value: '' }],
    }));
  };

  const handleCustomFieldChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.customFields || [])];
      updated[index] = { ...updated[index], [field]: value };
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
      uploadFormData.append('folder', 'properties');
      Array.from(files).forEach((f) => {
        uploadFormData.append('files', f);
      });

      const res = await apiClient.post('/upload/multiple', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploaded = res.data?.data || [];
      const newItems = uploaded.map((item, idx) => ({
        url: item.url,
        caption: `Property Image ${formData.images.length + idx + 1}`,
        isCover: formData.images.length === 0 && idx === 0,
      }));

      setFormData((prev) => {
        const combined = [...prev.images, ...newItems];
        if (combined.length > 0 && !combined.some((p) => p.isCover)) {
          combined[0].isCover = true;
        }
        return { ...prev, images: combined };
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

  const handleAddImage = (e) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    const isFirst = formData.images.length === 0;
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        { url: imageUrlInput.trim(), caption: `Property Image ${prev.images.length + 1}`, isCover: isFirst },
      ],
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, idx) => idx !== indexToRemove);
      if (updated.length > 0 && !updated.some((p) => p.isCover)) {
        updated[0].isCover = true;
      }
      return { ...prev, images: updated };
    });
  };

  const handleSetCover = (indexToCover) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, idx) => ({
        ...img,
        isCover: idx === indexToCover,
      })),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setModalState({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please provide a Title for the property.',
        type: 'danger',
      });
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setModalState({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please provide a valid property price.',
        type: 'danger',
      });
      return;
    }

    const customFields = (formData.customFields || []).filter((f) => f.label && f.label.trim());

    const payload = {
      ...formData,
      customFields,
      price: Number(formData.price),
      areaSqFt: Number(formData.areaSqFt) || 0,
      carpetAreaSqFt: Number(formData.carpetAreaSqFt) || 0,
      builtUpAreaSqFt: Number(formData.builtUpAreaSqFt) || 0,
      plotAreaSqFt: Number(formData.plotAreaSqFt) || 0,
      roadWidthFt: Number(formData.roadWidthFt) || 30,
      pricePerSqFt: Number(formData.pricePerSqFt) || 0,
      bookingAmount: Number(formData.bookingAmount) || 0,
      maintenanceCharges: Number(formData.maintenanceCharges) || 0,
      securityDeposit: Number(formData.securityDeposit) || 0,
      bedrooms: Number(formData.bedrooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      balconies: Number(formData.balconies) || 0,
      floor: Number(formData.floor) || 0,
      totalFloors: Number(formData.totalFloors) || 0,
      cabins: Number(formData.cabins) || 0,
      workstations: Number(formData.workstations) || 0,
      conferenceRooms: Number(formData.conferenceRooms) || 0,
      project: formData.project || null,
      longitude: Number(formData.longitude) || 79.0882,
      latitude: Number(formData.latitude) || 21.1458,
      clientSellerDetails: {
        name: formData.sellerName,
        phone: formData.sellerPhone,
        whatsapp: formData.sellerWhatsapp,
        email: formData.sellerEmail,
        notes: formData.sellerNotes,
        listedBy: formData.listedBy,
      },
    };

    updateMutation.mutate(payload);
  };

  if (isPropLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Loading listing details...</span>
      </div>
    );
  }

  if (isPropError || !property) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">Property Listing Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          {propError?.response?.data?.message || 'The property listing you are trying to edit does not exist.'}
        </p>
        <Link
          to="/listings"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold"
        >
          <ArrowLeft size={14} /> Back to Listings
        </Link>
      </div>
    );
  }

  const isPlot = formData.category === 'PLOT' || formData.subtype === 'PLOT';
  const isCommercial = formData.category === 'COMMERCIAL' || ['COMMERCIAL_SHOP', 'COMMERCIAL_OFFICE'].includes(formData.subtype);
  const isRent = formData.purpose === 'RENT' || formData.purpose === 'LEASE';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                Edit Listing: {formData.title || 'Untitled Property'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                {formData.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ref ID: <span className="font-mono text-slate-700">{id}</span> • Locality: {formData.localityName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Link
            to={`/listings/view/${id}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition text-center"
          >
            <Eye size={14} />
            <span>View Dossier</span>
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 text-center"
          >
            <Save size={14} />
            <span>{updateMutation.isPending ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: BASIC INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
            <Building2 className="text-teal-600" size={18} />
            <div>
              <h2 className="text-sm font-bold">1. Basic Details & Classification</h2>
              <p className="text-[11px] text-slate-500">Core property title, category, structure type, and township association</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Luxurious 3 BHK Garden Facing Flat in Dharampeth"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Listing Purpose <span className="text-rose-500">*</span>
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="BUY">Buy / Sale</option>
                <option value="RENT">Rent / Lease</option>
                <option value="LEASE">Commercial Lease</option>
                <option value="PG">Paying Guest (PG)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="PLOT">Plot / Land</option>
                <option value="AGRICULTURAL">Agricultural</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Type / Subtype <span className="text-rose-500">*</span>
              </label>
              <select
                name="subtype"
                value={formData.subtype}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="FLAT">Apartment / Flat</option>
                <option value="HOUSE_VILLA">Independent House / Villa</option>
                <option value="PLOT">Residential / Commercial Plot</option>
                <option value="COMMERCIAL_OFFICE">Commercial Office</option>
                <option value="COMMERCIAL_SHOP">Commercial Shop / Showroom</option>
                <option value="ROW_HOUSE">Row House</option>
                <option value="PENTHOUSE">Penthouse</option>
                <option value="FARM_HOUSE">Farm House / Agricultural</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="New Launch">New Launch / Brand New</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Ready to Move">Ready to Move</option>
                <option value="Resale">Resale</option>
                <option value="Well Maintained">Well Maintained</option>
                <option value="Renovated">Recently Renovated</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Ownership Type
              </label>
              <select
                name="ownershipType"
                value={formData.ownershipType}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Freehold">Freehold (Clear Title)</option>
                <option value="Leasehold">Leasehold (Govt/NIT/NMC Lease)</option>
                <option value="Co-operative Society">Co-operative Society</option>
                <option value="Power of Attorney">Power of Attorney</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Township / Project Linkage (Optional)
              </label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="">-- Standalone / Individual Listing --</option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.name} ({proj.localityName || 'Nagpur'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: PRICING & FINANCIALS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
            <IndianRupee className="text-teal-600" size={18} />
            <div>
              <h2 className="text-sm font-bold">2. Pricing, Brokerage & Payment Structure</h2>
              <p className="text-[11px] text-slate-500">Expected valuation, deposit, per sq.ft rate, brokerage terms, and loan eligibility</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Total Expected Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 7500000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-bold text-slate-900 bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Price Per Sq.Ft (₹)
              </label>
              <input
                type="number"
                name="pricePerSqFt"
                value={formData.pricePerSqFt}
                onChange={handleChange}
                placeholder="Auto-calculated"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Booking / Token Amount (₹)
              </label>
              <input
                type="number"
                name="bookingAmount"
                value={formData.bookingAmount}
                onChange={handleChange}
                placeholder="e.g. 100000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white font-mono"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  name="priceNegotiable"
                  checked={formData.priceNegotiable}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">Price is Negotiable</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Maintenance Charges (₹)
              </label>
              <input
                type="number"
                name="maintenanceCharges"
                value={formData.maintenanceCharges}
                onChange={handleChange}
                placeholder="e.g. 2000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Maintenance Frequency
              </label>
              <select
                name="maintenanceFrequency"
                value={formData.maintenanceFrequency}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
                <option value="One Time">One Time Society Deposit</option>
              </select>
            </div>

            {isRent && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  placeholder="e.g. 50000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Brokerage / Commission Terms
              </label>
              <select
                name="brokerage"
                value={formData.brokerage}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Zero Brokerage">Zero Brokerage (Direct Deal)</option>
                <option value="1% of Sale Price">1% Brokerage</option>
                <option value="2% of Sale Price">2% Standard Brokerage</option>
                <option value="1 Month Rent">1 Month Rent (Rental Mandate)</option>
                <option value="Negotiable Brokerage">Negotiable</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Tax & Govt Charges
              </label>
              <select
                name="taxAndGovtCharges"
                value={formData.taxAndGovtCharges}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Excluded">Excluded (Stamp Duty & Reg Extra)</option>
                <option value="Included">All Inclusive Price</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Bank Loan Available
              </label>
              <select
                name="loanAvailable"
                value={formData.loanAvailable ? 'Yes' : 'No'}
                onChange={(e) => setFormData((p) => ({ ...p, loanAvailable: e.target.value === 'Yes' }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Yes">Yes - Approved with Major Banks</option>
                <option value="No">No / Self-funding Required</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Additional / Miscellaneous Charges (Optional)
              </label>
              <input
                type="text"
                name="additionalCharges"
                value={formData.additionalCharges}
                onChange={handleChange}
                placeholder="e.g. Club Membership ₹1L, Water Meter ₹25k, Parking ₹1.5L"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: AREA, DIMENSIONS & ROOM SPECIFICATIONS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
            <Layers className="text-teal-600" size={18} />
            <div>
              <h2 className="text-sm font-bold">3. Dimensions, Layout & Physical Specifications</h2>
              <p className="text-[11px] text-slate-500">Super built-up, carpet area, plot road width, BHK, floors, and orientation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Super Built-up Area <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="areaSqFt"
                required
                value={formData.areaSqFt}
                onChange={handleChange}
                placeholder="e.g. 1450"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Carpet Area (RERA)
              </label>
              <input
                type="number"
                name="carpetAreaSqFt"
                value={formData.carpetAreaSqFt}
                onChange={handleChange}
                placeholder="e.g. 1150"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Built-up Area
              </label>
              <input
                type="number"
                name="builtUpAreaSqFt"
                value={formData.builtUpAreaSqFt}
                onChange={handleChange}
                placeholder="e.g. 1300"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Area Unit
              </label>
              <select
                name="areaUnit"
                value={formData.areaUnit}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Sq.Ft">Sq.Ft (Square Feet)</option>
                <option value="Sq.Mt">Sq.Mt (Square Meter)</option>
                <option value="Sq.Yd">Sq.Yd (Gaj / Square Yard)</option>
                <option value="Acres">Acres</option>
                <option value="Guntha">Guntha</option>
              </select>
            </div>

            {isPlot && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Plot Area (Sq.Ft / Gaj)
                  </label>
                  <input
                    type="number"
                    name="plotAreaSqFt"
                    value={formData.plotAreaSqFt}
                    onChange={handleChange}
                    placeholder="e.g. 2000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Front Road Width (Feet)
                  </label>
                  <input
                    type="number"
                    name="roadWidthFt"
                    value={formData.roadWidthFt}
                    onChange={handleChange}
                    placeholder="e.g. 30 or 40 ft road"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white font-mono"
                  />
                </div>
              </>
            )}

            {!isPlot && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Bedrooms (BHK)
                  </label>
                  <select
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value={0}>None / Studio</option>
                    <option value={1}>1 BHK</option>
                    <option value={2}>2 BHK</option>
                    <option value={3}>3 BHK</option>
                    <option value={4}>4 BHK</option>
                    <option value={5}>5+ BHK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Bathrooms
                  </label>
                  <select
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value={1}>1 Bathroom</option>
                    <option value={2}>2 Bathrooms</option>
                    <option value={3}>3 Bathrooms</option>
                    <option value={4}>4 Bathrooms</option>
                    <option value={5}>5+ Bathrooms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Balconies
                  </label>
                  <select
                    name="balconies"
                    value={formData.balconies}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value={0}>No Balcony</option>
                    <option value={1}>1 Balcony</option>
                    <option value={2}>2 Balconies</option>
                    <option value={3}>3 Balconies</option>
                    <option value={4}>4+ Balconies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Property Floor
                  </label>
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    placeholder="Floor (e.g. 2)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Total Floors in Tower
                  </label>
                  <input
                    type="number"
                    name="totalFloors"
                    value={formData.totalFloors}
                    onChange={handleChange}
                    placeholder="Total (e.g. 7)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Furnishing Status
                  </label>
                  <select
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value="UNFURNISHED">Unfurnished</option>
                    <option value="SEMI_FURNISHED">Semi-Furnished</option>
                    <option value="FULLY_FURNISHED">Fully Furnished</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Possession Status
              </label>
              <select
                name="possessionStatus"
                value={formData.possessionStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="READY_TO_MOVE">Ready to Move</option>
                <option value="UNDER_CONSTRUCTION">Under Construction</option>
                <option value="IMMEDIATE">Immediate Possession</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Age
              </label>
              <select
                name="propertyAge"
                value={formData.propertyAge}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="0-1 year">0 to 1 Year (Brand New)</option>
                <option value="1-5 years">1 to 5 Years</option>
                <option value="5-10 years">5 to 10 Years</option>
                <option value="10+ years">10+ Years</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Facing / Direction
              </label>
              <select
                name="facing"
                value={formData.facing}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="EAST">East (Most Preferred)</option>
                <option value="NORTH">North (Kubera Vastu)</option>
                <option value="NORTH_EAST">North-East (Ishanya)</option>
                <option value="WEST">West</option>
                <option value="SOUTH">South</option>
                <option value="SOUTH_EAST">South-East</option>
                <option value="NORTH_WEST">North-West</option>
                <option value="SOUTH_WEST">South-West</option>
              </select>
            </div>

            {isCommercial && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Executive Cabins
                  </label>
                  <input
                    type="number"
                    name="cabins"
                    value={formData.cabins}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Workstations / Desks
                  </label>
                  <input
                    type="number"
                    name="workstations"
                    value={formData.workstations}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Conference Rooms
                  </label>
                  <input
                    type="number"
                    name="conferenceRooms"
                    value={formData.conferenceRooms}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 4: LOCATION & GEOGRAPHY */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
            <MapPin className="text-teal-600" size={18} />
            <div>
              <h2 className="text-sm font-bold">4. Geographic Location & Landmarks</h2>
              <p className="text-[11px] text-slate-500">Address, prime locality, sub-pocket, and landmark in Nagpur</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Nagpur Locality <span className="text-rose-500">*</span>
              </label>
              <select
                name="localityName"
                value={formData.localityName}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                {NAGPUR_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Sub-Locality / Sector / Layout
              </label>
              <input
                type="text"
                name="subLocality"
                value={formData.subLocality}
                onChange={handleChange}
                placeholder="e.g. Near Traffic Park, WHC Road"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Prominent Landmark
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="e.g. Opposite Coffee House, Near Metro Station"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Full Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Plot No 42, Shankar Nagar Square, West High Court Road"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                PIN Code
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="440010"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: AMENITIES & FEATURES */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
            <CheckCircle2 className="text-teal-600" size={18} />
            <div>
              <h2 className="text-sm font-bold">5. Amenities, Security & Community Features</h2>
              <p className="text-[11px] text-slate-500">Categorized amenities to attract genuine home buyers and tenants</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Essential & Infrastructure Amenities
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {BASIC_AMENITIES.map((item) => {
                  const active = formData.amenities.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleAmenityToggle(item)}
                      className={`px-3 py-2 rounded-lg text-left text-xs font-medium border transition flex items-center justify-between ${
                        active
                          ? 'border-teal-500 bg-teal-50 text-teal-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{item}</span>
                      {active && <Check size={14} className="text-teal-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Lifestyle & Wellness Amenities
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {LIFESTYLE_AMENITIES.map((item) => {
                  const active = formData.amenities.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleAmenityToggle(item)}
                      className={`px-3 py-2 rounded-lg text-left text-xs font-medium border transition flex items-center justify-between ${
                        active
                          ? 'border-teal-500 bg-teal-50 text-teal-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{item}</span>
                      {active && <Check size={14} className="text-teal-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Interior & Smart Living Features
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {INTERIOR_FEATURES.map((item) => {
                  const active = formData.amenities.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleAmenityToggle(item)}
                      className={`px-3 py-2 rounded-lg text-left text-xs font-medium border transition flex items-center justify-between ${
                        active
                          ? 'border-teal-500 bg-teal-50 text-teal-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{item}</span>
                      {active && <Check size={14} className="text-teal-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amenity Interactive Tag Adder */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                + Add Custom Amenity Tag
              </label>
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="e.g. Electric Vehicle Charging, Private Jacuzzi"
                  value={customAmenityInput}
                  onChange={(e) => setCustomAmenityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomAmenity();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-teal-600 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAmenity}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer"
                >
                  + Add Amenity
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Other Custom Amenities (Comma Separated)
              </label>
              <input
                type="text"
                name="otherAmenities"
                value={formData.otherAmenities}
                onChange={handleChange}
                placeholder="e.g. EV Charging Station, Terrace Garden, Solar Water Heater, Pet Friendly"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: LEGAL, RERA & STATUTORY APPROVALS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
            <FileCheck className="text-teal-600" size={18} />
            <div>
              <h2 className="text-sm font-bold">6. Legal Clearances, MahaRERA & Sanctions</h2>
              <p className="text-[11px] text-slate-500">MahaRERA registration, municipal layout sanction, OC/CC, and loan banks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                MahaRERA Registered?
              </label>
              <select
                name="reraRegistered"
                value={formData.reraRegistered}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Yes">Yes (MahaRERA Registered)</option>
                <option value="Not Applicable">Not Applicable / Resale / Standalone</option>
                <option value="Applied">Applied / Under Processing</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                MahaRERA Registration Number
              </label>
              <input
                type="text"
                name="reraNumber"
                value={formData.reraNumber}
                onChange={handleChange}
                placeholder="e.g. P50500012345"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-mono font-bold text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Sanctioning Authority
              </label>
              <select
                name="approvedBy"
                value={formData.approvedBy}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="NMC (Nagpur Municipal Corporation)">NMC (Nagpur Municipal Corporation)</option>
                <option value="NIT (Nagpur Improvement Trust)">NIT (Nagpur Improvement Trust)</option>
                <option value="NMRDA Sanctioned">NMRDA Sanctioned</option>
                <option value="RL Sanctioned (Regularized Layout)">RL Sanctioned (Regularized Layout)</option>
                <option value="Gram Panchayat / Collector NA">Gram Panchayat / Collector NA</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Occupancy Certificate (OC)
              </label>
              <select
                name="occupancyCertificate"
                value={formData.occupancyCertificate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Available">Available (OC Received)</option>
                <option value="Applied">Applied / Awaiting OC</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Completion Certificate (CC)
              </label>
              <select
                name="completionCertificate"
                value={formData.completionCertificate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Available">Available (CC Received)</option>
                <option value="Applied">Under Construction / Awaiting CC</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Tax Status
              </label>
              <select
                name="propertyTaxStatus"
                value={formData.propertyTaxStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Paid">All NMC/Gram Panchayat Taxes Paid up to date</option>
                <option value="Due">Dues Pending (To be cleared at sale)</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Bank Loan Approvals (Approved Banks)
              </label>
              <input
                type="text"
                name="bankLoanApprovedBy"
                value={formData.bankLoanApprovedBy}
                onChange={handleChange}
                placeholder="e.g. State Bank of India (SBI), HDFC Bank, ICICI Bank, Axis Bank, Bank of Maharashtra"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 7: PHOTOS, MEDIA & DIGITAL ASSETS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900">
              <UploadCloud className="text-teal-600" size={18} />
              <div>
                <h2 className="text-sm font-bold">7. Photos, Floor Plans & Digital Tours</h2>
                <p className="text-[11px] text-slate-500">Upload high-resolution property pictures from your device or paste web links</p>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Total: {formData.images.length} photo(s)
            </span>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/30 hover:bg-teal-50/60 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <div className="p-3 bg-teal-100/80 text-teal-700 rounded-full">
              {isUploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {isUploading ? 'Uploading Photos...' : 'Click to Browse Files or Drag & Drop Photos'}
              </p>
              <p className="text-[11px] text-slate-500">
                Supports JPG, PNG, WEBP (Select multiple photos at once)
              </p>
            </div>
          </div>

          {uploadError && (
            <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
          )}

          {/* Direct URL Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Or paste public image URL (https://...)"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add URL</span>
            </button>
          </div>

          {/* Photo Gallery Grid */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-xl border-2 overflow-hidden group bg-slate-50 ${
                    img.isCover ? 'border-teal-500 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={getFullImageUrl(img.url)}
                      alt={img.caption || `Property ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  {img.isCover && (
                    <span className="absolute top-2 left-2 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Cover Photo
                    </span>
                  )}

                  <div className="p-2 bg-white flex items-center justify-between gap-1 border-t border-slate-100">
                    {!img.isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        className="text-[10px] text-teal-600 hover:underline font-bold"
                      >
                        Set as Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="ml-auto p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Digital Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Floor Plan Image URL
              </label>
              <input
                type="text"
                name="floorPlanUrl"
                value={formData.floorPlanUrl}
                onChange={handleChange}
                placeholder="https://.../floor-plan.jpg"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                YouTube / Video Tour URL
              </label>
              <input
                type="text"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                360° Virtual Tour URL
              </label>
              <input
                type="text"
                name="virtualTourUrl"
                value={formData.virtualTourUrl}
                onChange={handleChange}
                placeholder="https://my.matterport.com/show/?m=..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Brochure PDF Download URL
              </label>
              <input
                type="text"
                name="brochureUrl"
                value={formData.brochureUrl}
                onChange={handleChange}
                placeholder="https://.../project-brochure.pdf"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 8: DESCRIPTION, USP & TARGET AUDIENCE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
            <FileText className="text-teal-600" size={18} />
            <div>
              <h2 className="text-sm font-bold">8. Property Description, USP & Buyer Profiling</h2>
              <p className="text-[11px] text-slate-500">Sell the unique value proposition and highlight target buyer categories</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property USP (Unique Selling Proposition)
              </label>
              <input
                type="text"
                name="propertyUsp"
                value={formData.propertyUsp}
                onChange={handleChange}
                placeholder="e.g. 5 Mins from Metro Station, 100% Vastu Compliant East Facing Flat with Unblocked City View"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-semibold text-teal-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Detailed Property Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe rooms, cross-ventilation, neighborhood, road connectivity, water availability, and builder brand..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-2">
                Ideal / Suitable For Buyers & Tenants
              </label>
              <div className="flex flex-wrap gap-2">
                {SUITABLE_FOR_OPTIONS.map((item) => {
                  const active = formData.suitableFor.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleSuitableForToggle(item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        active
                          ? 'border-teal-600 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: CUSTOM SPECIFICATIONS & ATTRIBUTES */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Sparkles className="text-teal-600" size={18} />
              <h2 className="text-sm font-bold">Custom Specifications & Key-Value Attributes</h2>
            </div>
            <button
              type="button"
              onClick={handleAddCustomField}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Plus size={13} />
              <span>+ Add Custom Field</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Add any unique specifications or custom attributes for this property (e.g. Flooring Material, Water Source, Distance to Metro, Power Load, Ceiling Height).
          </p>

          {(!formData.customFields || formData.customFields.length === 0) ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No custom fields added yet. Click &ldquo;+ Add Custom Field&rdquo; to add custom specifications.
            </div>
          ) : (
            <div className="space-y-2.5">
              {formData.customFields.map((cf, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="w-1/3 min-w-[150px]">
                    <input
                      type="text"
                      value={cf.label}
                      onChange={(e) => handleCustomFieldChange(idx, 'label', e.target.value)}
                      placeholder="Field Name (e.g. Flooring)"
                      className="w-full p-2 rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:outline-none text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={cf.value}
                      onChange={(e) => handleCustomFieldChange(idx, 'value', e.target.value)}
                      placeholder="Field Value (e.g. Italian Vitrified Tiles)"
                      className="w-full p-2 rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:outline-none text-xs text-slate-700"
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
        </div>

        {/* SECTION 9: CONFIDENTIAL OWNER / MANDATE DETAILS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
            <Lock className="text-amber-600" size={18} />
            <div>
              <h2 className="text-sm font-bold">9. Confidential Owner / Mandate Records</h2>
              <p className="text-[11px] text-slate-500">Internal records only — never displayed on public listing cards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Client / Seller Name
              </label>
              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleChange}
                placeholder="Owner / Seller Name"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Primary Phone Number
              </label>
              <input
                type="text"
                name="sellerPhone"
                value={formData.sellerPhone}
                onChange={handleChange}
                placeholder="9823012345"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                name="sellerWhatsapp"
                value={formData.sellerWhatsapp}
                onChange={handleChange}
                placeholder="9823012345"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="sellerEmail"
                value={formData.sellerEmail}
                onChange={handleChange}
                placeholder="client@gmail.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Listed By Role
              </label>
              <select
                name="listedBy"
                value={formData.listedBy}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Agent">Agent / Broker Mandate</option>
                <option value="Builder">Builder / Developer Direct</option>
                <option value="Owner">Direct Owner / Landlord</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Inventory Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-bold text-slate-800 bg-white"
              >
                <option value="LIVE">LIVE - Active in Marketplace</option>
                <option value="PENDING_REVIEW">Under Review / Verification</option>
                <option value="SOLD">SOLD OUT / Closed</option>
                <option value="RENTED">RENTED OUT</option>
                <option value="DRAFT">DRAFT - Internal Only</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Internal Mandate Notes / Minimum Acceptable Price
              </label>
              <textarea
                name="sellerNotes"
                rows={2}
                value={formData.sellerNotes}
                onChange={handleChange}
                placeholder="Notes on minimum expected price, commission agreement, key availability, showing timings..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              />
            </div>
          </div>
        </div>

        {/* STICKY BOTTOM SAVE ACTION BAR */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-xs p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-lg flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition text-center"
          >
            Cancel / Back to Listings
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50 text-center"
          >
            <Save size={15} />
            <span>{updateMutation.isPending ? 'Saving Property...' : 'Save All Changes'}</span>
          </button>
        </div>
      </form>

      {/* Confirmation / Notification Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, title: '', message: '', type: 'success' })}
        onConfirm={() => {
          setModalState({ isOpen: false, title: '', message: '', type: 'success' });
          if (modalState.type === 'success') {
            navigate('/listings');
          }
        }}
        title={modalState.title}
        message={modalState.message}
        confirmText="OK"
        cancelText=""
        type={modalState.type}
      />
    </div>
  );
};

export default AgentEditPropertyPage;
