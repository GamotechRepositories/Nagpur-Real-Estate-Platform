import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  ArrowLeft,
  Save,
  ExternalLink,
  ShieldCheck,
  Star,
  Users,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  Home,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  FileText,
  KeyRound,
  UploadCloud,
  Loader2,
  FileCheck,
  Compass,
  Video,
  FileSpreadsheet,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
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

export const PropertyEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Modal feedback state
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedAgentToAdd, setSelectedAgentToAdd] = useState('');

  // 1. Fetch Property Details
  const {
    data: property,
    isLoading: isPropLoading,
    isError: isPropError,
    error: propError,
  } = useQuery({
    queryKey: ['admin-property-details', id],
    queryFn: async () => {
      const res = await apiClient.get(`/properties/${id}`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });

  // 2. Fetch Projects for dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['admin-projects-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get('/projects?limit=100');
      return res.data?.data || [];
    },
  });

  // 3. Fetch Certified Representatives (agents & builders) for allocation
  const { data: repData } = useQuery({
    queryKey: ['admin-representatives-dropdown'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/admin/representatives');
        if (res.data?.data?.all) return res.data.data;
      } catch (e) {
        // fallback below
      }
      const [agentsRes, buildersRes] = await Promise.all([
        apiClient.get('/agents').catch(() => ({ data: { data: [] } })),
        apiClient.get('/builders').catch(() => ({ data: { data: [] } })),
      ]);
      const agents = (agentsRes.data?.data || []).map((ag) => ({
        _id: (ag.user?._id || ag.user || ag._id)?.toString(),
        userId: (ag.user?._id || ag.user || ag._id)?.toString(),
        profileId: ag._id?.toString(),
        type: 'AGENT',
        name: ag.user?.name || ag.name || ag.agencyName || 'Certified Agent',
        organization: ag.agencyName || '',
        phone: ag.user?.phone || ag.phone || '',
        label: `[Agent] ${ag.user?.name || ag.name || 'Agent'}${ag.agencyName ? ` (${ag.agencyName})` : ''} • ${ag.user?.phone || ag.phone || ''}`,
      }));
      const builders = (buildersRes.data?.data || []).map((b) => ({
        _id: (b.user?._id || b.user || b._id)?.toString(),
        userId: (b.user?._id || b.user || b._id)?.toString(),
        builderId: b._id?.toString(),
        type: 'BUILDER',
        name: b.contactPerson || b.name || 'Builder',
        organization: b.name || '',
        phone: b.contactPhone || b.phone || '',
        label: `[Builder] ${b.name}${b.contactPerson && b.contactPerson !== b.name ? ` (${b.contactPerson})` : ''} • ${b.contactPhone || b.phone || ''}`,
      }));
      return { agents, builders, all: [...agents, ...builders] };
    },
  });

  const representatives = repData?.all || [];
  const agentReps = repData?.agents || [];
  const builderReps = repData?.builders || [];

  // Populated representations from property loaded by backend
  const loadedAssignedReps = useMemo(() => {
    const list = [];
    if (Array.isArray(property?.assignedAgents)) {
      property.assignedAgents.forEach((a) => {
        if (a && typeof a === 'object') list.push(a);
      });
    }
    if (property?.assignedAgent && typeof property.assignedAgent === 'object') {
      list.push(property.assignedAgent);
    }
    return list;
  }, [property]);

  // 4. Form State
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
    photos: [],
    floorPlanUrl: '',
    videoUrl: '',
    virtualTourUrl: '',
    brochureUrl: '',
    amenities: [],
    otherAmenities: '',
    reraRegistered: 'Yes',
    reraNumber: '',
    occupancyCertificate: 'Available',
    completionCertificate: 'Available',
    propertyTaxStatus: 'Paid',
    approvedBy: 'NMC (Nagpur Municipal Corporation)',
    bankLoanApprovedBy: 'SBI, HDFC, ICICI, Axis Bank',
    status: 'LIVE',
    isVerified: false,
    isFeatured: false,
    isDealOfTheDay: false,
    isExclusive: false,
    sellerName: '',
    sellerPhone: '',
    sellerWhatsapp: '',
    sellerEmail: '',
    sellerNotes: '',
    listedBy: 'Owner',
    assignedAgents: [],
  });

  // Pre-populate form once property data is loaded
  useEffect(() => {
    if (property) {
      const assignedIds = [];
      if (Array.isArray(property.assignedAgents)) {
        property.assignedAgents.forEach((a) => {
          const repId = a?._id || a;
          if (repId) assignedIds.push(repId.toString());
        });
      } else if (property.assignedAgent) {
        const repId = property.assignedAgent?._id || property.assignedAgent;
        if (repId) assignedIds.push(repId.toString());
      }

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
        photos: normalizedPhotos,
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
        status: property.status || 'LIVE',
        isVerified: !!property.isVerified,
        isFeatured: !!property.isFeatured,
        isDealOfTheDay: !!property.isDealOfTheDay,
        isExclusive: !!property.isExclusive,
        sellerName: property.clientSellerDetails?.name || property.sellerName || '',
        sellerPhone: property.clientSellerDetails?.phone || property.sellerPhone || '',
        sellerWhatsapp: property.clientSellerDetails?.whatsapp || '',
        sellerEmail: property.clientSellerDetails?.email || property.sellerEmail || '',
        sellerNotes: property.clientSellerDetails?.notes || property.sellerNotes || '',
        listedBy: property.clientSellerDetails?.listedBy || 'Owner',
        assignedAgents: assignedIds,
      });
    }
  }, [property]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.patch(`/properties/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-property-details', id]);
      queryClient.invalidateQueries(['admin-property-view', id]);
      queryClient.invalidateQueries(['admin-listings']);
      setModalState({
        isOpen: true,
        title: 'Listing Updated',
        message: 'All property listing details, media, specifications, and client records have been saved.',
        type: 'success',
      });
    },
    onError: (err) => {
      setModalState({
        isOpen: true,
        title: 'Update Failed',
        message: err.response?.data?.message || err.message || 'Failed to update property.',
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
      // Auto compute price per sq.ft if price or area changes
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
        caption: '',
        isCover: formData.photos.length === 0 && idx === 0,
      }));

      setFormData((prev) => {
        const combined = [...prev.photos, ...newItems];
        if (combined.length > 0 && !combined.some((p) => p.isCover)) {
          combined[0].isCover = true;
        }
        return { ...prev, photos: combined };
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
    if (!newImageUrl.trim()) return;
    const isFirst = formData.photos.length === 0;
    setFormData((prev) => ({
      ...prev,
      photos: [
        ...prev.photos,
        { url: newImageUrl.trim(), caption: '', isCover: isFirst },
      ],
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => {
      const updated = prev.photos.filter((_, idx) => idx !== indexToRemove);
      if (updated.length > 0 && !updated.some((p) => p.isCover)) {
        updated[0].isCover = true;
      }
      return { ...prev, photos: updated };
    });
  };

  const handleSetCover = (indexToCover) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.map((p, idx) => ({
        ...p,
        isCover: idx === indexToCover,
      })),
    }));
  };

  const handleAddRepresentative = () => {
    if (!selectedAgentToAdd) return;
    if (!formData.assignedAgents.includes(selectedAgentToAdd)) {
      setFormData((prev) => ({
        ...prev,
        assignedAgents: [...prev.assignedAgents, selectedAgentToAdd],
      }));
    }
    setSelectedAgentToAdd('');
  };

  const handleRemoveRepresentative = (agentId) => {
    setFormData((prev) => ({
      ...prev,
      assignedAgents: prev.assignedAgents.filter((id) => id !== agentId),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setModalState({
        isOpen: true,
        title: 'Validation Error',
        message: 'Property title is required.',
        type: 'danger',
      });
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setModalState({
        isOpen: true,
        title: 'Validation Error',
        message: 'A valid property price is required.',
        type: 'danger',
      });
      return;
    }

    const payload = {
      ...formData,
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

  const isCommercial = formData.category === 'COMMERCIAL' || formData.category === 'INDUSTRIAL';
  const isPlot = formData.subtype === 'PLOT' || formData.category === 'AGRICULTURAL';

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Back to Listings"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 truncate">
                {formData.title || 'Edit Property Listing'}
              </h1>
              <Badge status={formData.status} />
              {formData.isVerified && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ID: <span className="font-mono text-slate-700">{property._id}</span> • Locality:{' '}
              <span className="font-medium text-slate-700">{formData.localityName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
          >
            <Save size={14} />
            <span>{updateMutation.isPending ? 'Saving All Changes...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* =========================================================================
            SECTION 1: BASIC PROPERTY DETAILS
           ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">1. Basic Property Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                placeholder="e.g. 3 BHK Luxury Apartment in Dharampeth, Nagpur"
              />
            </div>

            {/* Purpose / Listing Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Listing Type (Purpose) *
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              >
                <option value="BUY">For Sale (Buy)</option>
                <option value="RENT">For Rent</option>
                <option value="LEASE">For Lease</option>
                <option value="PG">PG / Co-Living</option>
              </select>
            </div>

            {/* Property Type / Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Type / Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              >
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="INDUSTRIAL">Industrial</option>
                <option value="AGRICULTURAL">Agricultural Land</option>
              </select>
            </div>

            {/* Subtype */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Category / Subtype *
              </label>
              <select
                name="subtype"
                value={formData.subtype}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              >
                <option value="FLAT">Apartment / Flat</option>
                <option value="HOUSE_VILLA">Independent House / Villa</option>
                <option value="PENTHOUSE">Penthouse</option>
                <option value="PLOT">Residential / Commercial Plot</option>
                <option value="COMMERCIAL_SHOP">Shop / Retail Showroom</option>
                <option value="OFFICE">Office Space</option>
                <option value="WAREHOUSE">Warehouse / Godown</option>
                <option value="INDUSTRIAL_SHED">Industrial Shed / Factory</option>
                <option value="FARM_HOUSE">Farm House</option>
                <option value="AGRICULTURAL_LAND">Agricultural Land</option>
              </select>
            </div>

            {/* Property Condition */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              >
                <option value="Brand New">Brand New / New Launch</option>
                <option value="Ready to Move">Ready to Move</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Resale">Resale</option>
                <option value="Renovated">Renovated</option>
              </select>
            </div>

            {/* Ownership Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Ownership Type
              </label>
              <select
                name="ownershipType"
                value={formData.ownershipType}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              >
                <option value="Freehold">Freehold</option>
                <option value="Leasehold">Leasehold</option>
                <option value="Co-operative Society">Co-operative Society</option>
                <option value="Power of Attorney">Power of Attorney</option>
              </select>
            </div>

            {/* Township / Project Linkage */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Township / Project Linkage
              </label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              >
                <option value="">-- Standalone / Individual Listing --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.localityName || 'Nagpur'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: PRICING & FINANCIAL DETAILS
           ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <IndianRupee className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">2. Pricing & Financial Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Total Price */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Total Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="e.g. 7500000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-mono font-bold"
              />
            </div>

            {/* Price Per Sq.Ft (Auto / Manual) */}
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
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-mono"
              />
            </div>

            {/* Booking Amount */}
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
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-mono"
              />
            </div>

            {/* Maintenance Charges */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Maintenance (₹ / Frequency)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  name="maintenanceCharges"
                  value={formData.maintenanceCharges}
                  onChange={handleChange}
                  placeholder="e.g. 2500"
                  className="w-2/3 px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                />
                <select
                  name="maintenanceFrequency"
                  value={formData.maintenanceFrequency}
                  onChange={handleChange}
                  className="w-1/3 px-2 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="Monthly">/ Mo</option>
                  <option value="Quarterly">/ Qtr</option>
                  <option value="Yearly">/ Yr</option>
                </select>
              </div>
            </div>

            {/* Security Deposit (for Rent/Lease) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleChange}
                placeholder="For Rent / Lease"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-mono"
              />
            </div>

            {/* Brokerage */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Brokerage Terms
              </label>
              <select
                name="brokerage"
                value={formData.brokerage}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              >
                <option value="Zero Brokerage">Zero Brokerage (0%)</option>
                <option value="1% Brokerage">1% Brokerage</option>
                <option value="2% Brokerage">2% Brokerage</option>
                <option value="15 Days Rent">15 Days Rent (Rental)</option>
                <option value="1 Month Rent">1 Month Rent (Rental)</option>
                <option value="Fixed Amount">Fixed Amount</option>
              </select>
            </div>

            {/* Tax & Registration Charges */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Govt Tax & Registration
              </label>
              <select
                name="taxAndGovtCharges"
                value={formData.taxAndGovtCharges}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white"
              >
                <option value="Excluded">Excluded (Extra Charges)</option>
                <option value="Included in Price">Included in Price</option>
                <option value="To be confirmed">To be confirmed</option>
              </select>
            </div>

            {/* Checkboxes: Negotiable & Loan Available */}
            <div className="flex items-center gap-4 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="priceNegotiable"
                  checked={formData.priceNegotiable}
                  onChange={handleChange}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300"
                />
                <span className="font-semibold text-slate-700">Negotiable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="loanAvailable"
                  checked={formData.loanAvailable}
                  onChange={handleChange}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300"
                />
                <span className="font-semibold text-slate-700">Bank Loan Available</span>
              </label>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: PROPERTY SPECIFICATIONS & DIMENSIONS
           ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Compass className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">3. Specifications, Dimensions & Age</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Super Built-up Area */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Super Built-up Area *
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  name="areaSqFt"
                  value={formData.areaSqFt}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 1450"
                  className="w-2/3 px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                />
                <select
                  name="areaUnit"
                  value={formData.areaUnit}
                  onChange={handleChange}
                  className="w-1/3 px-2 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="Sq.Ft">Sq.Ft</option>
                  <option value="Sq.Yd">Sq.Yd</option>
                  <option value="Sq.Mtr">Sq.Mtr</option>
                  <option value="Acre">Acre</option>
                  <option value="Hectare">Hectare</option>
                </select>
              </div>
            </div>

            {/* Carpet Area */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Carpet Area (Sq.Ft)
              </label>
              <input
                type="number"
                name="carpetAreaSqFt"
                value={formData.carpetAreaSqFt}
                onChange={handleChange}
                placeholder="e.g. 1200"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
              />
            </div>

            {/* Built-up Area */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Built-up Area (Sq.Ft)
              </label>
              <input
                type="number"
                name="builtUpAreaSqFt"
                value={formData.builtUpAreaSqFt}
                onChange={handleChange}
                placeholder="e.g. 1320"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
              />
            </div>

            {/* Plot Area */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Plot / Land Area (Sq.Ft)
              </label>
              <input
                type="number"
                name="plotAreaSqFt"
                value={formData.plotAreaSqFt}
                onChange={handleChange}
                placeholder="e.g. 2000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
              />
            </div>

            {/* Bedrooms (BHK) */}
            {!isPlot && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Bedrooms (BHK)
                </label>
                <select
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value={0}>0 (Studio / Shop / Plot)</option>
                  <option value={1}>1 BHK</option>
                  <option value={2}>2 BHK</option>
                  <option value={3}>3 BHK</option>
                  <option value={4}>4 BHK</option>
                  <option value={5}>5 BHK</option>
                  <option value={6}>6+ BHK</option>
                </select>
              </div>
            )}

            {/* Bathrooms */}
            {!isPlot && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            )}

            {/* Balconies */}
            {!isPlot && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Balconies
                </label>
                <input
                  type="number"
                  name="balconies"
                  value={formData.balconies}
                  onChange={handleChange}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            )}

            {/* Floor Level */}
            {!isPlot && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Floor / Total Floors
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    placeholder="Floor"
                    className="w-1/2 px-2 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="number"
                    name="totalFloors"
                    value={formData.totalFloors}
                    onChange={handleChange}
                    placeholder="Total"
                    className="w-1/2 px-2 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Furnishing Status */}
            {!isPlot && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Furnishing Status
                </label>
                <select
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="FULLY_FURNISHED">Fully Furnished</option>
                  <option value="SEMI_FURNISHED">Semi-Furnished</option>
                  <option value="UNFURNISHED">Unfurnished</option>
                </select>
              </div>
            )}

            {/* Possession Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Possession Status
              </label>
              <select
                name="possessionStatus"
                value={formData.possessionStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="READY_TO_MOVE">Ready to Move</option>
                <option value="UNDER_CONSTRUCTION">Under Construction</option>
                <option value="UPCOMING">Upcoming / New Launch</option>
              </select>
            </div>

            {/* Facing Direction */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Facing Direction
              </label>
              <select
                name="facing"
                value={formData.facing}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="EAST">East</option>
                <option value="WEST">West</option>
                <option value="NORTH">North</option>
                <option value="SOUTH">South</option>
                <option value="NORTH_EAST">North-East</option>
                <option value="NORTH_WEST">North-West</option>
                <option value="SOUTH_EAST">South-East</option>
                <option value="SOUTH_WEST">South-West</option>
              </select>
            </div>

            {/* Property Age */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Age
              </label>
              <select
                name="propertyAge"
                value={formData.propertyAge}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="0-1 year">0–1 year (Brand New)</option>
                <option value="1-5 years">1–5 years</option>
                <option value="5-10 years">5–10 years</option>
                <option value="10-20 years">10–20 years</option>
                <option value="20+ years">20+ years</option>
              </select>
            </div>

            {/* Facing Road Width */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Facing Road Width (Feet)
              </label>
              <input
                type="number"
                name="roadWidthFt"
                value={formData.roadWidthFt}
                onChange={handleChange}
                placeholder="e.g. 40"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
              />
            </div>

            {/* Commercial Cabins & Workstations */}
            {isCommercial && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Private Cabins
                  </label>
                  <input
                    type="number"
                    name="cabins"
                    value={formData.cabins}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: LOCATION & ADDRESS DETAILS (NAGPUR)
           ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">4. Location & Address Details (Nagpur)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Locality Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Locality / Area in Nagpur *
              </label>
              <select
                name="localityName"
                value={formData.localityName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
              >
                {NAGPUR_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-locality */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Sub-locality / Sector / Layout
              </label>
              <input
                type="text"
                name="subLocality"
                value={formData.subLocality}
                onChange={handleChange}
                placeholder="e.g. Shivaji Nagar Layout"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Prominent Landmark
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="e.g. Near Coffee House, Opposite Metro"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            {/* Full Street Address */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Full Street Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Plot/Flat No, Wing, Building Name, Street..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                maxLength={6}
                placeholder="e.g. 440010"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 5: AMENITIES & FACILITIES (CATEGORIZED CHECKBOXES)
           ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Home className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">5. Amenities, Facilities & Interior Features</h2>
          </div>

          {/* Basic Amenities */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
              Basic & Infrastructure Amenities
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {BASIC_AMENITIES.map((amenity) => {
                const isSelected = formData.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? <Check size={13} className="text-teal-600" /> : <Plus size={13} />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lifestyle Amenities */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
              Lifestyle & Clubhouse Amenities
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {LIFESTYLE_AMENITIES.map((amenity) => {
                const isSelected = formData.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? <Check size={13} className="text-teal-600" /> : <Plus size={13} />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interior Features */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
              Interior & Architectural Features
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {INTERIOR_FEATURES.map((amenity) => {
                const isSelected = formData.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? <Check size={13} className="text-teal-600" /> : <Plus size={13} />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Other Amenities */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Other Custom Amenities (Comma Separated)
            </label>
            <input
              type="text"
              name="otherAmenities"
              value={formData.otherAmenities}
              onChange={handleChange}
              placeholder="e.g. Electric Vehicle Charging Station, Terrace Lounge"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
          </div>
        </div>

        {/* =========================================================================
            SECTION 6: LEGAL & DOCUMENTATION DETAILS
           ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileCheck className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">6. Legal Approvals & Documentation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* RERA Registered & Number */}
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
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
              />
            </div>

            {/* Approved Authority */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Sanctioned / Approved By
              </label>
              <select
                name="approvedBy"
                value={formData.approvedBy}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="NMC (Nagpur Municipal Corporation)">NMC (Nagpur Municipal Corporation)</option>
                <option value="NIT (Nagpur Improvement Trust)">NIT (Nagpur Improvement Trust)</option>
                <option value="NMRDA (Nagpur Metropolitan Area)">NMRDA (Nagpur Metropolitan)</option>
                <option value="Gram Panchayat Sanctioned">Gram Panchayat Sanctioned</option>
                <option value="Other Authority">Other Authority</option>
              </select>
            </div>

            {/* Occupancy Certificate */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Occupancy Certificate (OC)
              </label>
              <select
                name="occupancyCertificate"
                value={formData.occupancyCertificate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="Available">Available (Received)</option>
                <option value="Not Available">Not Available</option>
                <option value="In Progress">Applied / In Progress</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>

            {/* Completion Certificate */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Completion Certificate (CC)
              </label>
              <select
                name="completionCertificate"
                value={formData.completionCertificate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="Available">Available (Received)</option>
                <option value="Not Available">Not Available</option>
                <option value="In Progress">Applied / In Progress</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>

            {/* Property Tax Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Tax Status
              </label>
              <select
                name="propertyTaxStatus"
                value={formData.propertyTaxStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="Paid">All Taxes Paid Up to Date</option>
                <option value="Pending">Pending</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>

            {/* Bank Loan Approval List */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Bank Loans Approved By
              </label>
              <input
                type="text"
                name="bankLoanApprovedBy"
                value={formData.bankLoanApprovedBy}
                onChange={handleChange}
                placeholder="e.g. SBI, HDFC, ICICI, Axis Bank"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 7: PHOTOS, MEDIA & DIGITAL ASSETS
           ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-teal-700" />
              <h2 className="text-sm font-bold text-slate-900">7. Property Photos & Digital Media</h2>
            </div>
            <span className="text-xs text-slate-500">
              Total: <strong>{formData.photos.length}</strong> photo(s)
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />

          {/* Primary Upload Dropzone */}
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all ${
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
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {isUploading ? (
                    'Uploading selected photos to server...'
                  ) : (
                    <>
                      <span className="text-teal-700 underline font-extrabold">Click to upload photos from device</span> or drag and drop here
                    </>
                  )}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports JPG, PNG, WEBP (Multiple files supported • Max 10MB per image)
                </p>
              </div>
            </div>
          </div>

          {uploadError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Secondary: Paste Image URL */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Or paste direct image URL (Optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 transition flex-shrink-0"
              >
                <Plus size={14} /> Add URL
              </button>
            </div>
          </div>

          {/* Photos Grid */}
          {formData.photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
              {formData.photos.map((photo, idx) => {
                const rawUrl = typeof photo === 'string' ? photo : photo.url;
                const fullUrl = getFullImageUrl(rawUrl);
                const isCover = typeof photo === 'object' ? photo.isCover : idx === 0;
                return (
                  <div
                    key={idx}
                    className={`relative rounded-xl border overflow-hidden group bg-slate-100 aspect-video ${
                      isCover ? 'ring-2 ring-teal-500 border-teal-500' : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={fullUrl}
                      alt={`Listing ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/600x400?text=Photo';
                      }}
                    />
                    {isCover && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-teal-600 text-white text-[10px] font-bold shadow-xs">
                        Cover Photo
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          className="px-2 py-1 rounded bg-white text-slate-800 text-[10px] font-bold shadow hover:bg-slate-50"
                        >
                          Make Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 rounded bg-rose-600 text-white hover:bg-rose-700 shadow"
                        title="Remove Image"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-xl border-2 border-dashed border-slate-200 text-center text-xs text-slate-400">
              No photos added yet. Use the upload box above to select photos from your device.
            </div>
          )}

          {/* Media Links Grid (Floor Plan, Video Tour, Virtual Tour, Brochure) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                2D / 3D Floor Plan URL / PDF Link
              </label>
              <input
                type="url"
                name="floorPlanUrl"
                value={formData.floorPlanUrl}
                onChange={handleChange}
                placeholder="https://.../floorplan.pdf"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Video Tour URL (YouTube / Vimeo)
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                360° Virtual Tour URL
              </label>
              <input
                type="url"
                name="virtualTourUrl"
                value={formData.virtualTourUrl}
                onChange={handleChange}
                placeholder="https://my.matterport.com/show/?m=..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Project / Property Brochure PDF URL
              </label>
              <input
                type="url"
                name="brochureUrl"
                value={formData.brochureUrl}
                onChange={handleChange}
                placeholder="https://.../brochure.pdf"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 8: DESCRIPTION, USP & TARGET BUYERS
           ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">8. Property Description, USP & Suitability</h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Property USP */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property USP (Unique Selling Proposition)
              </label>
              <input
                type="text"
                name="propertyUsp"
                value={formData.propertyUsp}
                onChange={handleChange}
                placeholder="e.g. Corner plot duplex villa with private garden near airport metro"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Detailed Property Description *
              </label>
              <textarea
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs leading-relaxed"
                placeholder="Describe key highlights, neighborhood benefits, connectivity, materials used, natural ventilation..."
              />
            </div>

            {/* Suitable For Checkboxes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
                Suitable For (Target Audience)
              </label>
              <div className="flex flex-wrap gap-2">
                {SUITABLE_FOR_OPTIONS.map((item) => {
                  const isChecked = formData.suitableFor.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSuitableForToggle(item)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        isChecked
                          ? 'bg-teal-50 border-teal-500 text-teal-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 9: CONFIDENTIAL OWNER / CLIENT DETAILS
           ========================================================================= */}
        <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-800" />
              <h2 className="text-sm font-bold text-amber-950">9. Confidential Homeowner / Client Details (Internal)</h2>
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              Hidden from Public
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Listed By */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Listed By
              </label>
              <select
                name="listedBy"
                value={formData.listedBy}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="Owner">Direct Owner</option>
                <option value="Agent">Certified Agent</option>
                <option value="Builder">Builder / Developer</option>
              </select>
            </div>

            {/* Seller Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Seller / Homeowner Name
              </label>
              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Contact Mobile Number
              </label>
              <input
                type="text"
                name="sellerPhone"
                value={formData.sellerPhone}
                onChange={handleChange}
                placeholder="e.g. 9822112233"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                name="sellerWhatsapp"
                value={formData.sellerWhatsapp}
                onChange={handleChange}
                placeholder="e.g. 9822112233"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white"
              />
            </div>

            {/* Email Address */}
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
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
              />
            </div>

            {/* Internal Notes */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Internal Confidential Notes
              </label>
              <textarea
                name="sellerNotes"
                rows={2}
                value={formData.sellerNotes}
                onChange={handleChange}
                placeholder="Key negotiations, client timeline, urgency, key location to pick keys..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 10: ALLOCATED CERTIFIED REPRESENTATIVES (MULTI-AGENT / BUILDER ROUTING)
           ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-700" />
              <h2 className="text-sm font-bold text-slate-900">
                10. Allocated Certified Representatives ({formData.assignedAgents.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Inquiries and buyer leads route directly to these partners (Agents / Builders).
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={selectedAgentToAdd}
              onChange={(e) => setSelectedAgentToAdd(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white font-medium"
            >
              <option value="">-- Select Certified Agent / Builder to Allocate --</option>
              {agentReps.length > 0 && (
                <optgroup label="🏢 Certified Real Estate Agents">
                  {agentReps
                    .filter((ag) => !formData.assignedAgents.includes(ag._id))
                    .map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.label}
                      </option>
                    ))}
                </optgroup>
              )}
              {builderReps.length > 0 && (
                <optgroup label="🏗️ Registered Builders & Developers">
                  {builderReps
                    .filter((b) => !formData.assignedAgents.includes(b._id))
                    .map((builder) => (
                      <option key={builder._id} value={builder._id}>
                        {builder.label}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
            <button
              type="button"
              onClick={handleAddRepresentative}
              disabled={!selectedAgentToAdd}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus size={14} /> Allocate Partner
            </button>
          </div>

          {/* Allocated List */}
          {formData.assignedAgents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {formData.assignedAgents.map((agentId, idx) => {
                const repObj =
                  representatives.find(
                    (r) => r._id === agentId || r.userId === agentId || r.profileId === agentId || r.builderId === agentId
                  ) ||
                  loadedAssignedReps.find((u) => u._id?.toString() === agentId);
                const isPrimary = idx === 0;
                const isBuilder = repObj?.type === 'BUILDER' || repObj?.role === 'BUILDER';
                const displayName = repObj?.name || (repObj?.role === 'BUILDER' ? 'Registered Builder' : (repObj?.role === 'AGENT' ? 'Certified Agent' : `Partner ${agentId.slice(-6)}`));
                const displayOrg = repObj?.organization || repObj?.agencyName || repObj?.companyName || '';
                const displayPhone = repObj?.phone || '';
                return (
                  <div
                    key={agentId}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs hover:border-slate-300 transition"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 truncate">
                          {displayName}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isBuilder
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-teal-100 text-teal-800 border border-teal-200'
                          }`}
                        >
                          {isBuilder ? 'Builder' : 'Agent'}
                        </span>
                        {isPrimary && (
                          <span className="text-[9px] font-bold text-blue-800 bg-blue-100 px-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                        {displayOrg ? `${displayOrg} • ` : ''}
                        {displayPhone || agentId}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRepresentative(agentId)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                      title="Deallocate"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-xs">
              No specific representatives allocated. Buyer inquiries route to the Central Desk team by default.
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 11: STATUS & BADGES MANAGEMENT
           ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">11. Status & Trust Badges Management</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Property Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs bg-white font-semibold"
              >
                <option value="LIVE">LIVE - Published & Visible to Buyers</option>
                <option value="PENDING_REVIEW">PENDING_REVIEW - In Moderation Queue</option>
                <option value="DRAFT">DRAFT - Private Draft</option>
                <option value="REJECTED">REJECTED - Needs Revision</option>
                <option value="SOLD">SOLD - Marked as Sold</option>
                <option value="RENTED">RENTED - Marked as Rented</option>
                <option value="EXPIRED">EXPIRED - Delisted / Needs Renewal</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Promotional & Trust Badges
              </label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isVerified"
                    checked={formData.isVerified}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <span className="font-semibold text-slate-700">Verified Badge</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300"
                  />
                  <span className="font-semibold text-slate-700">Featured Listing</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isDealOfTheDay"
                    checked={formData.isDealOfTheDay}
                    onChange={handleChange}
                    className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                  />
                  <span className="font-semibold text-rose-700 flex items-center gap-1">
                    <span>Deal of the Day</span>
                    <span className="text-xs">🔥</span>
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isExclusive"
                    checked={formData.isExclusive}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300"
                  />
                  <span className="font-semibold text-slate-700">Exclusive Mandate</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
          >
            Cancel / Back to Listings
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow transition disabled:opacity-50"
          >
            <Save size={15} />
            <span>{updateMutation.isPending ? 'Saving All Changes...' : 'Save All Changes'}</span>
          </button>
        </div>
      </form>

      {/* Confirmation / Alert Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          setModalState((prev) => ({ ...prev, isOpen: false }));
          if (modalState.type === 'success') {
            navigate('/listings');
          }
        }}
        title={modalState.title}
        message={modalState.message}
        confirmText="OK"
        type={modalState.type}
        hideCancel
      />
    </div>
  );
};

export default PropertyEditPage;