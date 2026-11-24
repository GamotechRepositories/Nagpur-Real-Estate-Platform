import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Phone,
  Mail,
  MessageCircle,
  Shield,
  Star,
  MapPin,
  Clock,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Edit2,
  Lock,
  Layers,
  CheckCircle,
  AlertTriangle,
  Eye,
  ExternalLink,
  Users2,
  FileText,
  Home,
  Key,
  Compass,
  Store,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Globe,
  Plus,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatIndianPrice, formatDate } from '../../utils/formatters';
import PhotoUploader, { getFullImageUrl } from '../../components/common/PhotoUploader';

export const BuilderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'listings' | 'leads' | 'details'
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('ALL');
  const [purposeFilter, setPurposeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordWasUpdated, setPasswordWasUpdated] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    password: '',
    logo: '',
    reraNumber: '',
    establishedYear: '',
    experienceYears: 10,
    address: '',
    website: '',
    description: '',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    isActive: true,
    isAvailable: true,
  });

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['admin-builder-details', id],
    queryFn: async () => {
      const res = await apiClient.get(`/builders/${id}`);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.put(`/builders/${id}`, payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['admin-builder-details', id]);
      queryClient.invalidateQueries(['admin-builders-list']);
      setIsEditModalOpen(false);
      setErrorMessage('');
      setPasswordWasUpdated(Boolean(variables?.password && variables.password.trim()));
      setShowSuccessModal(true);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to update builder profile.';
      setErrorMessage(msg);
    },
  });

  const builder = responseData?.data?.profile;
  const projects = responseData?.data?.projects || [];
  const listings = responseData?.data?.listings || [];
  const leads = responseData?.data?.leads || [];
  const metrics = responseData?.data?.metrics || {};

  // Classification helpers
  const isRent = (l) => {
    const p = (l?.purpose || '').toUpperCase();
    return p.includes('RENT') || p.includes('LEASE');
  };

  const isBuySale = (l) => {
    const p = (l?.purpose || '').toUpperCase();
    return p.includes('BUY') || p.includes('SALE') || (!p.includes('RENT') && !p.includes('LEASE'));
  };

  const isPlot = (l) => {
    const cat = (l?.category || '').toUpperCase();
    const sub = (l?.subtype || '').toUpperCase();
    const title = (l?.title || '').toUpperCase();
    return (
      cat === 'PLOT' ||
      cat === 'AGRICULTURAL' ||
      cat.includes('LAND') ||
      sub.includes('PLOT') ||
      sub.includes('LAND') ||
      title.includes('PLOT') ||
      title.includes('LAND') ||
      title.includes('LAYOUT')
    );
  };

  const isCommercial = (l) => {
    const cat = (l?.category || '').toUpperCase();
    const sub = (l?.subtype || '').toUpperCase();
    const title = (l?.title || '').toUpperCase();
    return (
      cat.includes('COMMERCIAL') ||
      sub.includes('COMMERCIAL') ||
      sub.includes('OFFICE') ||
      sub.includes('SHOP') ||
      sub.includes('RETAIL') ||
      sub.includes('WAREHOUSE') ||
      title.includes('COMMERCIAL') ||
      title.includes('OFFICE') ||
      title.includes('SHOP')
    );
  };

  const isVilla = (l) => {
    const sub = (l?.subtype || '').toUpperCase();
    const title = (l?.title || '').toUpperCase();
    if (sub.includes('PENTHOUSE') || title.includes('PENTHOUSE')) return false;
    return (
      sub.includes('VILLA') ||
      sub.includes('HOUSE_VILLA') ||
      sub.includes('BUNGALOW') ||
      title.includes('VILLA') ||
      title.includes('BUNGALOW') ||
      title.includes('INDEPENDENT HOUSE') ||
      title.includes('ROW HOUSE')
    );
  };

  const isApartment = (l) => {
    if (isPlot(l) || isCommercial(l) || isVilla(l)) return false;
    const cat = (l?.category || '').toUpperCase();
    const sub = (l?.subtype || '').toUpperCase();
    const title = (l?.title || '').toUpperCase();
    return (
      sub.includes('FLAT') ||
      sub.includes('APARTMENT') ||
      sub.includes('PENTHOUSE') ||
      cat === 'RESIDENTIAL' ||
      title.includes('FLAT') ||
      title.includes('APARTMENT') ||
      title.includes('PENTHOUSE') ||
      title.includes('BHK') ||
      Number(l?.bedrooms) > 0
    );
  };

  const openEditModal = () => {
    if (!builder) return;
    setErrorMessage('');
    setEditFormData({
      name: builder.name || '',
      contactPerson: builder.contactPerson || builder.user?.name || '',
      phone: builder.contactPhone || builder.user?.phone || '',
      email: builder.contactEmail || builder.user?.email || '',
      password: '',
      logo: builder.logo || builder.user?.avatar || '',
      reraNumber: builder.reraNumber || '',
      establishedYear: builder.establishedYear || '',
      experienceYears: builder.experienceYears || 10,
      address: builder.address || '',
      website: builder.website || '',
      description: builder.description || '',
      status: builder.user?.status || 'ACTIVE',
      verificationStatus: builder.verificationStatus || 'VERIFIED',
      isActive: builder.isActive !== false,
      isAvailable: builder.isAvailable !== false,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const payload = {
      ...editFormData,
      logo: editFormData.logo || '',
    };
    if (!payload.password || !payload.password.trim()) {
      delete payload.password;
    }
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading builder profile & inventory...</p>
      </div>
    );
  }

  if (error || !builder) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto my-12 space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Builder Profile Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested real estate developer does not exist or may have been unlinked.
        </p>
        <button
          onClick={() => navigate('/builders')}
          className="inline-flex items-center space-x-2 py-2 px-4 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Builders List</span>
        </button>
      </div>
    );
  }

  const logoUrl = getFullImageUrl(builder.logo || builder.user?.avatar);

  // Filter listings
  const filteredListings = listings.filter((l) => {
    if (propertyTypeFilter === 'APARTMENT' && !isApartment(l)) return false;
    if (propertyTypeFilter === 'COMMERCIAL' && !isCommercial(l)) return false;
    if (propertyTypeFilter === 'PLOT' && !isPlot(l)) return false;
    if (propertyTypeFilter === 'VILLA' && !isVilla(l)) return false;

    if (purposeFilter === 'SALE' && !isBuySale(l)) return false;
    if (purposeFilter === 'RENT' && !isRent(l)) return false;

    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Link to="/builders" className="hover:text-teal-700 flex items-center gap-1 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Builders</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{builder.name}</span>
        </div>

        <button
          type="button"
          onClick={openEditModal}
          className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-2xs transition"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Profile & Password</span>
        </button>
      </div>

      {/* Builder Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center space-x-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={builder.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0 bg-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-xs">
                {builder.name?.[0]?.toUpperCase() || 'B'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{builder.name}</h1>
                <span className="inline-flex items-center space-x-1 py-0.5 px-2 rounded-md text-[10px] font-bold bg-teal-50 border border-teal-200 text-teal-800">
                  <Shield className="w-3 h-3 text-teal-600" />
                  <span>{builder.verificationStatus || 'VERIFIED'}</span>
                </span>
                <span className="inline-flex items-center py-0.5 px-2 rounded-md text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                  {builder.user?.status || 'ACTIVE'}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Contact: <strong className="text-slate-700">{builder.contactPerson || builder.user?.name || 'Authorized Promoter'}</strong>
                {builder.reraNumber && (
                  <span className="ml-2 font-mono text-[11px] text-slate-600">
                    • MahaRERA: <span className="font-semibold text-slate-900">{builder.reraNumber}</span>
                  </span>
                )}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2 font-mono">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                  <Phone className="w-3 h-3 text-slate-400" />
                  +91 {builder.contactPhone || builder.user?.phone}
                </span>

                {(builder.contactEmail || builder.user?.email) && (
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {builder.contactEmail || builder.user?.email}
                  </span>
                )}

                {builder.address && (
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {builder.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 self-start md:self-center">
            <a
              href={`https://wa.me/91${builder.contactPhone || builder.user?.phone}?text=${encodeURIComponent(
                `Hello ${builder.name}, regarding your projects on Nagpur Real Estate Platform:`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`tel:+91${builder.contactPhone || builder.user?.phone}`}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs transition"
              title="Call Developer"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>

            {(builder.contactEmail || builder.user?.email) && (
              <a
                href={`mailto:${builder.contactEmail || builder.user?.email}`}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs transition"
                title="Send Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            )}

            {builder.website && (
              <a
                href={builder.website.startsWith('http') ? builder.website : `https://${builder.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs transition"
                title="Website"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Builder Portfolio & Inventory Overview */}
        <div className="pt-4 border-t border-slate-100/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Developer Portfolio & Unit Inventory
                </h3>
                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-500 font-medium">
                  {projects.length} Townships • {listings.length} Units
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Overview of registered townships, posted inventory, and buyer inquiries
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 border border-slate-200/90 py-1.5 px-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Portfolio Value
              </span>
              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                {formatIndianPrice(metrics.totalPortfolioValue || 0)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {/* Township Projects */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 mb-1">
                <span className="text-xs font-semibold truncate">Projects</span>
                <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Compass className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-xl font-bold font-mono text-slate-900">{projects.length}</span>
                <span className="text-[10px] text-slate-400">Townships</span>
              </div>
            </div>

            {/* Total Units */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 mb-1">
                <span className="text-xs font-semibold truncate">Total Units</span>
                <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-xl font-bold font-mono text-slate-900">{listings.length}</span>
                <span className="text-[10px] text-slate-400">Posted</span>
              </div>
            </div>

            {/* Live on Website */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 mb-1">
                <span className="text-xs font-semibold truncate">Live on Web</span>
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-xl font-bold font-mono text-slate-900">{metrics.liveCount || 0}</span>
                <span className="text-[10px] text-emerald-600 font-medium">Active</span>
              </div>
            </div>

            {/* Under Moderation */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 mb-1">
                <span className="text-xs font-semibold truncate">Moderation</span>
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-xl font-bold font-mono text-slate-900">{metrics.pendingReviewCount || 0}</span>
                <span className="text-[10px] text-amber-600 font-medium">In Queue</span>
              </div>
            </div>

            {/* Flats & Apts */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 mb-1">
                <span className="text-xs font-semibold truncate">Flats & Apts</span>
                <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Home className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-xl font-bold font-mono text-slate-900">{metrics.apartmentsCount || 0}</span>
                <span className="text-[10px] text-slate-400">High-Rise</span>
              </div>
            </div>

            {/* Commercial */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 mb-1">
                <span className="text-xs font-semibold truncate">Commercial</span>
                <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Store className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-xl font-bold font-mono text-slate-900">{metrics.commercialCount || 0}</span>
                <span className="text-[10px] text-slate-400">Retail/Office</span>
              </div>
            </div>

            {/* Buyer Leads */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 mb-1">
                <span className="text-xs font-semibold truncate">Buyer Leads</span>
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Users2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-xl font-bold font-mono text-slate-900">{leads.length}</span>
                <span className="text-[10px] text-blue-600 font-medium">Inquiries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-3 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'projects'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Township Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'listings'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Property Units Inventory ({listings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'leads'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>Customer Inquiries ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'details'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Company & RERA Details</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Township Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Registered Township Developments in Nagpur
            </h3>
            <Link
              to="/projects"
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold inline-flex items-center gap-1"
            >
              <span>Manage all platform projects</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No township projects registered under this developer yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                The developer can add projects from the partner portal, or you can assign projects from the Admin Projects module.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => {
                const cover = proj.images?.find((img) => img.isCover)?.url || proj.images?.[0]?.url || proj.coverPhoto;
                return (
                  <div
                    key={proj._id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {cover ? (
                        <div className="h-36 w-full overflow-hidden bg-slate-100 relative">
                          <img
                            src={getFullImageUrl(cover)}
                            alt={proj.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 right-2 py-0.5 px-2 rounded-md text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-xs border border-slate-200">
                            {proj.projectStatus?.replace('_', ' ') || 'UNDER CONSTRUCTION'}
                          </span>
                        </div>
                      ) : (
                        <div className="h-28 w-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Compass className="w-8 h-8" />
                        </div>
                      )}

                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{proj.name}</h4>
                        <div className="flex items-center text-xs text-slate-500 gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{proj.localityName}, Nagpur</span>
                        </div>

                        {proj.reraNumber && (
                          <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-1.5 rounded-md border border-slate-100 flex items-center justify-between">
                            <span>MahaRERA:</span>
                            <span className="font-semibold text-slate-900">{proj.reraNumber}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Units Planned</span>
                            <span className="font-bold text-slate-800">{proj.totalUnits || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Starting Price</span>
                            <span className="font-bold text-teal-700">
                              {proj.priceRange?.minPrice
                                ? formatIndianPrice(proj.priceRange.minPrice)
                                : proj.startingPrice
                                ? formatIndianPrice(proj.startingPrice)
                                : 'Contact'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Units posted: <strong className="text-slate-800">{listings.filter((l) => String(l.project?._id || l.project) === String(proj._id)).length}</strong>
                      </span>
                      <Link
                        to={`/projects?edit=${proj._id}`}
                        className="text-teal-700 hover:text-teal-800 font-semibold text-[11px] inline-flex items-center gap-1"
                      >
                        <span>Edit Project</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Property Units Inventory */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* Sub Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
            {/* Category Filter */}
            <div className="flex items-center space-x-1 overflow-x-auto">
              {[
                { label: `All Units (${listings.length})`, value: 'ALL' },
                { label: `Flats (${metrics.apartmentsCount || 0})`, value: 'APARTMENT' },
                { label: `Commercial (${metrics.commercialCount || 0})`, value: 'COMMERCIAL' },
                { label: `Plots (${metrics.plotsCount || 0})`, value: 'PLOT' },
                { label: `Villas (${metrics.villasCount || 0})`, value: 'VILLA' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setPropertyTypeFilter(tab.value)}
                  className={`py-1 px-3 rounded-lg font-semibold transition whitespace-nowrap ${
                    propertyTypeFilter === tab.value
                      ? 'bg-teal-700 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Purpose & Status Dropdowns */}
            <div className="flex items-center space-x-2">
              <select
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium outline-none"
              >
                <option value="ALL">All Purpose</option>
                <option value="SALE">For Sale</option>
                <option value="RENT">For Rent</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="LIVE">Live on Portal</option>
                <option value="PENDING_REVIEW">Under Moderation</option>
                <option value="SOLD">Sold / Closed</option>
              </select>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No units found matching the selected filters.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Property Unit & Details</th>
                      <th className="py-3 px-3">Township Project</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Locality</th>
                      <th className="py-3 px-3">Moderation Status</th>
                      <th className="py-3 px-3">Views</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredListings.map((listing) => {
                      const img = getFullImageUrl(listing.coverImage || listing.images?.[0]?.url);
                      return (
                        <tr key={listing._id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              {img ? (
                                <img
                                  src={img}
                                  alt={listing.title}
                                  className="w-12 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                  <Home className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0 max-w-xs">
                                <span className="font-bold text-slate-900 block truncate hover:text-teal-700">
                                  {listing.title}
                                </span>
                                <span className="text-[11px] text-slate-400 block truncate">
                                  {listing.bedrooms ? `${listing.bedrooms} BHK • ` : ''}
                                  {listing.areaSqFt ? `${listing.areaSqFt} sq.ft` : ''}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 font-medium text-slate-800">
                            {listing.project?.name || (
                              <span className="text-slate-400 italic">Direct Unit</span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <span className="py-0.5 px-2 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {listing.subtype || listing.category}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                            {formatIndianPrice(listing.price)}
                          </td>

                          <td className="py-3 px-3 font-medium text-slate-700">
                            {listing.localityName || 'Nagpur'}
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center space-x-1 py-0.5 px-2 rounded-md text-[10px] font-bold ${
                                listing.status === 'LIVE'
                                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                                  : listing.status === 'PENDING_REVIEW'
                                  ? 'bg-amber-50 border border-amber-200 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <span>{listing.status === 'PENDING_REVIEW' ? 'Under Review' : listing.status}</span>
                            </span>
                          </td>

                          <td className="py-3 px-3 font-mono text-slate-600">
                            {listing.viewsCount || 0}
                          </td>

                          <td className="py-3 px-3 text-right">
                            {listing.status === 'PENDING_REVIEW' ? (
                              <Link
                                to="/moderation"
                                className="py-1 px-2.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-semibold text-[11px] inline-flex items-center gap-1"
                              >
                                <span>Verify in Queue</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            ) : (
                              <Link
                                to={`/listings`}
                                className="text-teal-700 hover:text-teal-800 font-semibold text-[11px]"
                              >
                                View Listing
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Customer Leads */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Buyer Leads for {builder.name} Properties
            </h3>
            <span className="text-xs text-slate-500 font-medium">Total: {leads.length} inquiries</span>
          </div>

          {leads.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <Users2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No buyer inquiries received for this builder's properties yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Buyer Name & Contact</th>
                      <th className="py-3 px-3">Interested Property</th>
                      <th className="py-3 px-3">Message / Note</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map((lead) => (
                      <tr key={lead._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{lead.name || 'Interested Buyer'}</span>
                          <span className="text-[11px] font-mono text-slate-500 block">
                            +91 {lead.phone} {lead.email ? `• ${lead.email}` : ''}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800 line-clamp-1">
                            {lead.property?.title || 'Direct Township Inquiry'}
                          </span>
                          <span className="text-[11px] text-teal-700 font-mono">
                            {lead.property?.price ? formatIndianPrice(lead.property.price) : ''}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-600 line-clamp-2 max-w-xs">
                          {lead.message || 'Expressed interest in scheduling site visit.'}
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                          {formatDate(lead.createdAt)}
                        </td>

                        <td className="py-3 px-3">
                          <span className="py-0.5 px-2 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {lead.status || 'NEW'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <a
                            href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(
                              `Hello ${lead.name}, thank you for your enquiry regarding ${lead.property?.title || 'our projects'} in Nagpur:`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold text-[11px] inline-flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Company Details */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Official Company Profile & MahaRERA Registration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Company Legal Entity</span>
              <span className="text-sm font-bold text-slate-800">{builder.name}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">MahaRERA Registration Number</span>
              <span className="text-sm font-mono font-bold text-teal-800">{builder.reraNumber || 'Registration Pending'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Person / Promoter</span>
              <span className="text-sm font-semibold text-slate-800">{builder.contactPerson || builder.user?.name || 'Authorized Director'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Experience in Real Estate</span>
              <span className="text-sm font-semibold text-slate-800">{builder.experienceYears || 10} Years</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Primary Contact Phone</span>
              <span className="text-sm font-mono font-semibold text-slate-800">+91 {builder.contactPhone || builder.user?.phone}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Email</span>
              <span className="text-sm font-semibold text-slate-800">{builder.contactEmail || builder.user?.email || 'N/A'}</span>
            </div>

            <div className="md:col-span-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Head Office Address</span>
              <span className="text-sm font-medium text-slate-800">{builder.address || 'Nagpur, Maharashtra'}</span>
            </div>

            {builder.website && (
              <div className="md:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Website</span>
                <a
                  href={builder.website.startsWith('http') ? builder.website : `https://${builder.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-700 hover:underline font-medium inline-flex items-center gap-1"
                >
                  <span>{builder.website}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-1">Company Description & Bio</h4>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {builder.description ||
                'Developer is a verified Nagpur real estate builder specializing in residential townships, gated communities, and commercial complexes.'}
            </p>
          </div>
        </div>
      )}

      {/* Edit Profile & Password Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Profile: ${builder.name}`}
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs" autoComplete="off">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <PhotoUploader
                multiple={false}
                folder="builders"
                value={editFormData.logo}
                onChange={(url) => setEditFormData((prev) => ({ ...prev, logo: url }))}
                label="Developer Logo / Brand Mark"
                helperText="Upload official company logo or developer emblem (JPG, PNG, WEBP)"
                aspect="avatar"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Company Name *</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contact Person Name</label>
              <input
                type="text"
                value={editFormData.contactPerson}
                onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mobile Number *</label>
              <input
                type="text"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-teal-600" />
                <span>Reset Partner Portal Password</span>
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep unchanged"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Set a new password for builder login on partner portal
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">MahaRERA Registration No.</label>
              <input
                type="text"
                value={editFormData.reraNumber}
                onChange={(e) => setEditFormData({ ...editFormData, reraNumber: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Experience (Years)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={editFormData.experienceYears}
                onChange={(e) => setEditFormData({ ...editFormData, experienceYears: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Portal Account Status</label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              >
                <option value="ACTIVE">ACTIVE (Can log into Partner Portal)</option>
                <option value="SUSPENDED">SUSPENDED (Access blocked)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Head Office Address</label>
              <input
                type="text"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Official Website</label>
              <input
                type="url"
                value={editFormData.website}
                onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Company Description</label>
              <textarea
                rows={3}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none resize-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="py-2 px-4 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="py-2 px-4 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Builder Profile Updated"
        size="sm"
      >
        <div className="text-center py-4 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Changes Saved Successfully</h4>
          <p className="text-xs text-slate-500">
            {passwordWasUpdated
              ? 'Builder profile details and partner portal login password were updated successfully.'
              : 'Builder profile details were updated successfully.'}
          </p>
          <button
            type="button"
            onClick={() => setShowSuccessModal(false)}
            className="w-full py-2 px-4 rounded-lg bg-teal-700 text-white font-semibold text-xs hover:bg-teal-800 transition"
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BuilderDetailsPage;
