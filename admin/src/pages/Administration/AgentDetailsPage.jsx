import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserCheck,
  Building2,
  Phone,
  Mail,
  MessageCircle,
  Shield,
  Star,
  MapPin,
  Clock,
  ArrowLeft,
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
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import PhotoUploader from '../../components/common/PhotoUploader';
import { formatIndianPrice, formatDate } from '../../utils/formatters';

export const AgentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'leads' | 'details'
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('ALL'); // 'ALL' | 'APARTMENT' | 'COMMERCIAL' | 'PLOT' | 'VILLA'
  const [purposeFilter, setPurposeFilter] = useState('ALL'); // 'ALL' | 'SALE' | 'RENT'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'LIVE' | 'PENDING_REVIEW' | 'REJECTED' | 'SOLD'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordWasUpdated, setPasswordWasUpdated] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    avatar: '',
    agencyName: '',
    reraNumber: '',
    experienceYears: 5,
    areasServed: '',
    bio: '',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    isAvailable: true,
  });

  const { data: agentData, isLoading, error } = useQuery({
    queryKey: ['admin-agent-details', id],
    queryFn: async () => {
      const res = await apiClient.get(`/agents/${id}`);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.put(`/agents/${id}`, payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['admin-agent-details', id]);
      queryClient.invalidateQueries(['admin-agents-list']);
      setIsEditModalOpen(false);
      setErrorMessage('');
      setPasswordWasUpdated(Boolean(variables?.password && variables.password.trim()));
      setShowSuccessModal(true);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to update agent profile.';
      setErrorMessage(msg);
    },
  });

  const agent = agentData?.data?.profile;
  const listings = agentData?.data?.listings || [];
  const leads = agentData?.data?.leads || [];

  // Robust classification helpers
  const isRent = (l) => {
    const p = (l.purpose || '').toUpperCase();
    return p.includes('RENT') || p.includes('LEASE');
  };

  const isBuySale = (l) => {
    const p = (l.purpose || '').toUpperCase();
    return p.includes('BUY') || p.includes('SALE') || (!p.includes('RENT') && !p.includes('LEASE'));
  };

  const isPlot = (l) => {
    const cat = (l.category || '').toUpperCase();
    const sub = (l.subtype || '').toUpperCase();
    const title = (l.title || '').toUpperCase();
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
    const cat = (l.category || '').toUpperCase();
    const sub = (l.subtype || '').toUpperCase();
    const title = (l.title || '').toUpperCase();
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
    const sub = (l.subtype || '').toUpperCase();
    const title = (l.title || '').toUpperCase();
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
    const cat = (l.category || '').toUpperCase();
    const sub = (l.subtype || '').toUpperCase();
    const title = (l.title || '').toUpperCase();
    return (
      sub.includes('FLAT') ||
      sub.includes('APARTMENT') ||
      sub.includes('PENTHOUSE') ||
      cat === 'RESIDENTIAL' ||
      title.includes('FLAT') ||
      title.includes('APARTMENT') ||
      title.includes('PENTHOUSE') ||
      title.includes('BHK') ||
      Number(l.bedrooms) > 0
    );
  };

  // Friendly type badge metadata for inventory table
  const getTypeBadge = (prop) => {
    const title = (prop.title || '').toUpperCase();
    const sub = (prop.subtype || '').toUpperCase();

    if (sub.includes('PENTHOUSE') || title.includes('PENTHOUSE')) {
      return {
        label: 'Penthouse',
        badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
        icon: Building2,
      };
    }
    if (isPlot(prop)) {
      return {
        label: 'Plot / Land',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: Compass,
      };
    }
    if (isCommercial(prop)) {
      const isOffice = sub.includes('OFFICE') || title.includes('OFFICE');
      const isShop = sub.includes('SHOP') || title.includes('SHOP');
      return {
        label: isOffice ? 'Commercial Office' : isShop ? 'Commercial Shop' : 'Commercial',
        badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
        icon: Store,
      };
    }
    if (isVilla(prop)) {
      return {
        label: 'Villa / House',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        icon: Home,
      };
    }
    return {
      label: 'Apartment / Flat',
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: Building2,
    };
  };

  const summary = {
    total: listings.length,
    buySale: listings.filter(isBuySale).length,
    rent: listings.filter(isRent).length,
    plots: listings.filter(isPlot).length,
    apartments: listings.filter(isApartment).length,
    villas: listings.filter(isVilla).length,
    commercial: listings.filter(isCommercial).length,
    live: listings.filter((l) => {
      const s = (l.status || '').toUpperCase();
      return s === 'LIVE' || s === 'APPROVED' || s === 'ACTIVE' || !s;
    }).length,
    pending: listings.filter((l) => {
      const s = (l.status || '').toUpperCase();
      return s === 'PENDING_REVIEW' || s === 'PENDING' || s === 'DRAFT' || s === 'UNDER_MODERATION';
    }).length,
    rejected: listings.filter((l) => (l.status || '').toUpperCase() === 'REJECTED').length,
    sold: listings.filter((l) => {
      const s = (l.status || '').toUpperCase();
      return s === 'SOLD' || s === 'RENTED';
    }).length,
    totalValuation: listings.reduce((sum, l) => sum + (Number(l.price) || 0), 0),
    totalViews: listings.reduce((sum, l) => sum + (Number(l.viewsCount) || 0), 0),
    totalLeads: leads.length,
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const payload = {
      ...editFormData,
      avatar: editFormData.avatar || '',
      experienceYears: Number(editFormData.experienceYears) || 1,
      areasServed: Array.isArray(editFormData.areasServed)
        ? editFormData.areasServed
        : editFormData.areasServed.split(',').map((s) => s.trim()).filter(Boolean),
    };

    // If password is blank or only spaces, delete from payload so existing password remains untouched
    if (!payload.password || !payload.password.trim()) {
      delete payload.password;
    } else {
      payload.password = payload.password.trim();
    }

    updateMutation.mutate(payload);
  };

  const openEditModal = () => {
    setErrorMessage('');
    if (agent) {
      setEditFormData({
        name: agent.user?.name || '',
        phone: agent.user?.phone || agent.contactPhone || '',
        email: agent.user?.email || '',
        password: '',
        avatar: agent.user?.avatar || agent.avatar || '',
        agencyName: agent.agencyName || '',
        reraNumber: agent.reraNumber || '',
        experienceYears: agent.experienceYears || 5,
        areasServed: Array.isArray(agent.areasServed)
          ? agent.areasServed.join(', ')
          : agent.areasServed || '',
        bio: agent.bio || '',
        status: agent.user?.status || 'ACTIVE',
        verificationStatus: agent.verificationStatus || 'VERIFIED',
        isAvailable: agent.isAvailable !== false,
      });
    }
    setIsEditModalOpen(true);
  };

  // Filter listings based on category, purpose & status tabs
  const filteredListings = listings.filter((item) => {
    // 1. Property Type filter
    if (propertyTypeFilter === 'APARTMENT' && !isApartment(item)) return false;
    if (propertyTypeFilter === 'COMMERCIAL' && !isCommercial(item)) return false;
    if (propertyTypeFilter === 'PLOT' && !isPlot(item)) return false;
    if (propertyTypeFilter === 'VILLA' && !isVilla(item)) return false;

    // 2. Transaction Purpose filter
    if (purposeFilter === 'SALE' && !isBuySale(item)) return false;
    if (purposeFilter === 'RENT' && !isRent(item)) return false;

    // 3. Status filter
    if (statusFilter !== 'ALL') {
      const s = (item.status || 'LIVE').toUpperCase();
      if (statusFilter === 'LIVE' && s !== 'LIVE' && s !== 'APPROVED' && s !== 'ACTIVE') return false;
      if (statusFilter === 'PENDING_REVIEW' && s !== 'PENDING_REVIEW' && s !== 'PENDING' && s !== 'DRAFT') return false;
      if (statusFilter === 'REJECTED' && s !== 'REJECTED') return false;
      if (statusFilter === 'SOLD' && s !== 'SOLD' && s !== 'RENTED') return false;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading agent details & full inventory...
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-center">
        <h3 className="text-base font-bold text-slate-800">Agent Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          The requested agent profile does not exist or may have been removed.
        </p>
        <button
          onClick={() => navigate('/agents')}
          className="mt-4 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold"
        >
          Back to Agents List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/agents')}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Back to all agents"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Administration / Agents /</span>
              <span className="text-xs font-bold text-slate-700">{agent.user?.name}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              Agent Profile & Complete Inventory Breakdown
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={openEditModal}
            className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile & Password</span>
          </button>
        </div>
      </div>

      {/* Main Agent Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Identity */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold text-xl shadow-xs overflow-hidden flex-shrink-0">
              {agent.user?.avatar ? (
                <img
                  src={agent.user.avatar}
                  alt={agent.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                agent.user?.name?.[0]?.toUpperCase() || 'A'
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-lg font-bold text-slate-900">{agent.user?.name}</h2>
                <span
                  className={`inline-flex items-center space-x-1 py-0.5 px-2 rounded-md text-[10px] font-bold ${
                    agent.verificationStatus === 'VERIFIED'
                      ? 'bg-teal-50 border border-teal-200 text-teal-800'
                      : 'bg-amber-50 border border-amber-200 text-amber-800'
                  }`}
                >
                  <Shield className="w-3 h-3 text-teal-600" />
                  <span>{agent.verificationStatus || 'VERIFIED'}</span>
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    agent.user?.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {agent.user?.status || 'ACTIVE'}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{agent.agencyName || 'Independent Real Estate Consultant'}</span>
                {agent.reraNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-500">MahaRERA: {agent.reraNumber}</span>
                  </>
                )}
              </p>

              <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1 flex-wrap gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono font-medium text-slate-800">
                    {agent.contactPhone || agent.user?.phone}
                  </span>
                </span>
                {agent.user?.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{agent.user.email}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{agent.isAvailable !== false ? 'Available for Leads' : 'Leads Paused'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="flex items-center space-x-2 self-start lg:self-center">
            <a
              href={`https://wa.me/91${(agent.contactPhone || agent.user?.phone || '').replace(
                /[^0-9]/g,
                ''
              )}?text=${encodeURIComponent(
                `Hello ${agent.user?.name || 'Agent'}, contacting from Nagpur Real Estate administration:`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`tel:+91${agent.contactPhone || agent.user?.phone}`}
              className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
              title="Call Agent"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>

            {agent.user?.email && (
              <a
                href={`mailto:${agent.user.email}`}
                className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                title="Send Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Inventory Category Breakdown (Plots, Buy, Rent, Commercial) */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              <span>Agent Inventory Breakdown (Plot / Buy / Rent)</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Total Portfolio: {formatIndianPrice(summary.totalValuation)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Apartments / Flats */}
            <div
              onClick={() => {
                setActiveTab('listings');
                setPropertyTypeFilter('APARTMENT');
                setPurposeFilter('ALL');
              }}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                propertyTypeFilter === 'APARTMENT'
                  ? 'bg-purple-500/10 border-purple-500 text-purple-900 shadow-xs'
                  : 'bg-purple-50/50 border-purple-200/80 hover:bg-purple-50'
              }`}
            >
              <div className="flex items-center justify-between text-purple-700 mb-1">
                <Building2 className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Apartments</span>
              </div>
              <div className="text-xl font-extrabold text-purple-950 font-mono">
                {summary.apartments}
              </div>
              <span className="text-[10px] text-purple-700/80 font-medium block mt-0.5">
                Flats & Penthouse
              </span>
            </div>

            {/* Commercial */}
            <div
              onClick={() => {
                setActiveTab('listings');
                setPropertyTypeFilter('COMMERCIAL');
                setPurposeFilter('ALL');
              }}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                propertyTypeFilter === 'COMMERCIAL'
                  ? 'bg-teal-500/10 border-teal-500 text-teal-900 shadow-xs'
                  : 'bg-teal-50/50 border-teal-200/80 hover:bg-teal-50'
              }`}
            >
              <div className="flex items-center justify-between text-teal-700 mb-1">
                <Store className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Commercial</span>
              </div>
              <div className="text-xl font-extrabold text-teal-950 font-mono">
                {summary.commercial}
              </div>
              <span className="text-[10px] text-teal-700/80 font-medium block mt-0.5">
                Offices & Retail
              </span>
            </div>

            {/* Plots Added */}
            <div
              onClick={() => {
                setActiveTab('listings');
                setPropertyTypeFilter('PLOT');
                setPurposeFilter('ALL');
              }}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                propertyTypeFilter === 'PLOT'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-900 shadow-xs'
                  : 'bg-amber-50/50 border-amber-200/80 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <Compass className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Plots / Land</span>
              </div>
              <div className="text-xl font-extrabold text-amber-950 font-mono">
                {summary.plots}
              </div>
              <span className="text-[10px] text-amber-700/80 font-medium block mt-0.5">
                Layout / Ag plots
              </span>
            </div>

            {/* Villas / Houses */}
            <div
              onClick={() => {
                setActiveTab('listings');
                setPropertyTypeFilter('VILLA');
                setPurposeFilter('ALL');
              }}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                propertyTypeFilter === 'VILLA'
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-900 shadow-xs'
                  : 'bg-indigo-50/50 border-indigo-200/80 hover:bg-indigo-50'
              }`}
            >
              <div className="flex items-center justify-between text-indigo-700 mb-1">
                <Home className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Villas / House</span>
              </div>
              <div className="text-xl font-extrabold text-indigo-950 font-mono">
                {summary.villas}
              </div>
              <span className="text-[10px] text-indigo-700/80 font-medium block mt-0.5">
                Bungalow & Row house
              </span>
            </div>

            {/* For Sale Properties */}
            <div
              onClick={() => {
                setActiveTab('listings');
                setPurposeFilter('SALE');
                setPropertyTypeFilter('ALL');
              }}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                purposeFilter === 'SALE'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 shadow-xs'
                  : 'bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-50'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-700 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">For Sale</span>
              </div>
              <div className="text-xl font-extrabold text-emerald-950 font-mono">
                {summary.buySale}
              </div>
              <span className="text-[10px] text-emerald-700/80 font-medium block mt-0.5">
                Outright purchase
              </span>
            </div>

            {/* For Rent */}
            <div
              onClick={() => {
                setActiveTab('listings');
                setPurposeFilter('RENT');
                setPropertyTypeFilter('ALL');
              }}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                purposeFilter === 'RENT'
                  ? 'bg-blue-500/10 border-blue-500 text-blue-900 shadow-xs'
                  : 'bg-blue-50/50 border-blue-200/80 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between text-blue-700 mb-1">
                <Key className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">For Rent</span>
              </div>
              <div className="text-xl font-extrabold text-blue-950 font-mono">
                {summary.rent}
              </div>
              <span className="text-[10px] text-blue-700/80 font-medium block mt-0.5">
                Monthly lease units
              </span>
            </div>
          </div>
        </div>

        {/* Moderation Status Chips */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 flex-wrap text-xs">
          <span className="text-[11px] font-bold text-slate-500">Live Status:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{summary.live} Live on Website</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{summary.pending} Under Moderation</span>
          </span>
          {summary.rejected > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-xs">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{summary.rejected} Needs Revision</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-xs">
            <span>🎉 {summary.sold} Closed / Sold Deals</span>
          </span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('listings')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'listings'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Property Inventory ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'leads'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Customer Leads & Inquiries ({leads.length})
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'details'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Agency & Background Details
        </button>
      </div>

      {/* Tab 1: Listings Inventory */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-3 p-4">
          {/* Sub-Filters: Property Type Pills on Left, Purpose & Status on Right */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            {/* Category Filter Pills (Property Type) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { key: 'ALL', label: `All Properties (${listings.length})` },
                { key: 'APARTMENT', label: `🏢 Flats & Apartments (${summary.apartments})` },
                { key: 'COMMERCIAL', label: `🏬 Commercial (${summary.commercial})` },
                { key: 'PLOT', label: `📐 Plots / Land (${summary.plots})` },
                { key: 'VILLA', label: `🏡 Villas (${summary.villas})` },
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setPropertyTypeFilter(pill.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    propertyTypeFilter === pill.key
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Purpose & Status Dropdowns */}
            <div className="flex items-center space-x-2.5 flex-shrink-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-slate-400 font-semibold">Purpose:</span>
                <select
                  value={purposeFilter}
                  onChange={(e) => setPurposeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-none focus:border-teal-600"
                >
                  <option value="ALL">All Purpose ({listings.length})</option>
                  <option value="SALE">🏡 For Sale ({summary.buySale})</option>
                  <option value="RENT">🔑 For Rent ({summary.rent})</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-slate-400 font-semibold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-none focus:border-teal-600"
                >
                  <option value="ALL">All Status</option>
                  <option value="LIVE">Live on Website</option>
                  <option value="PENDING_REVIEW">Pending Moderation</option>
                  <option value="REJECTED">Needs Revision</option>
                  <option value="SOLD">Sold Out</option>
                </select>
              </div>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No listings found matching Type: "{propertyTypeFilter}", Purpose: "{purposeFilter}" and Status: "{statusFilter}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Property Name & Details</th>
                    <th className="px-4 py-3">Type / Category</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Township Project</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Locality</th>
                    <th className="px-4 py-3">Moderation Status</th>
                    <th className="px-4 py-3">Views</th>
                    <th className="px-4 py-3">Posted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredListings.map((prop) => {
                    const itemIsRent = isRent(prop);
                    const typeInfo = getTypeBadge(prop);
                    const IconComp = typeInfo.icon;

                    return (
                      <tr key={prop._id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2.5">
                            {prop.coverImage ? (
                              <img
                                src={prop.coverImage}
                                alt={prop.title}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                <IconComp className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0 max-w-xs">
                              <span className="font-bold text-slate-900 truncate block">
                                {prop.title}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {prop.bedrooms ? `${prop.bedrooms} BHK • ` : ''}
                                {prop.areaSqFt ? `${prop.areaSqFt} sq.ft` : ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Type / Category */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border ${typeInfo.badgeClass}`}
                          >
                            <IconComp className="w-3 h-3" />
                            <span>{typeInfo.label}</span>
                          </span>
                        </td>

                        {/* Purpose: Sale vs Rent */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                              itemIsRent
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {itemIsRent ? 'FOR RENT' : 'FOR SALE'}
                          </span>
                        </td>

                        {/* Township Project Link */}
                        <td className="px-4 py-3">
                          {prop.project ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Layers className="w-3 h-3 text-emerald-600" />
                              <span>{prop.project.name}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 font-mono text-xs block">
                            {formatIndianPrice(prop.price)}
                          </span>
                          {prop.pricePerSqFt && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ₹{prop.pricePerSqFt}/sq.ft
                            </span>
                          )}
                        </td>

                        {/* Locality */}
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          {prop.localityName || 'Nagpur'}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <Badge status={prop.status || 'LIVE'} />
                        </td>

                        {/* Views */}
                        <td className="px-4 py-3 font-mono font-bold text-slate-700">
                          {prop.viewsCount || 0}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {formatDate(prop.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Leads & Inquiries */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Customer Leads & Direct Inquiries
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Total {leads.length} Inquiries
            </span>
          </div>

          {leads.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No buyer inquiries recorded for this agent yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Buyer Contact</th>
                    <th className="px-4 py-3">Interested Property</th>
                    <th className="px-4 py-3">Customer Message</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Received</th>
                    <th className="px-4 py-3 text-right">Connect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{lead.customerName || lead.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {lead.phoneNumber || lead.phone}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        {lead.property ? (
                          <span className="font-medium text-slate-800 truncate block">
                            {lead.property.title}
                          </span>
                        ) : (
                          <span className="text-slate-400">General Consultation</span>
                        )}
                      </td>

                      <td className="px-4 py-3 max-w-xs text-slate-600 italic">
                        "{lead.message || 'Customer requested phone callback'}"
                      </td>

                      <td className="px-4 py-3">
                        <Badge status={lead.leadStatus || lead.status || 'NEW'} />
                      </td>

                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {formatDate(lead.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <a
                          href={`https://wa.me/91${(lead.phoneNumber || lead.phone || '').replace(
                            /[^0-9]/g,
                            ''
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Detailed Agency Profile & Bio */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Areas of Operation in Nagpur
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {agent.areasServed?.map((area, idx) => (
                <span
                  key={idx}
                  className="py-1 px-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-medium text-xs flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-teal-600" />
                  <span>{area}</span>
                </span>
              )) || <span className="text-slate-400 text-xs">All Nagpur regions</span>}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Professional Biography
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
              {agent.bio ||
                'Certified real estate consultant registered on Nagpur Real Estate Platform.'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">MahaRERA Registration</span>
              <span className="font-mono font-bold text-slate-800">
                {agent.reraNumber || 'Not Specified'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Account Onboarded Date</span>
              <span className="font-mono text-slate-800">{formatDate(agent.createdAt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Profile & Password Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Agent Profile: ${agent.user?.name}`}
          subtitle="Update contact details, MahaRERA registration, and portal login password"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs" autoComplete="off">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <PhotoUploader
                  multiple={false}
                  folder="agents"
                  value={editFormData.avatar}
                  onChange={(url) => setEditFormData((prev) => ({ ...prev, avatar: url }))}
                  label="Agent Profile Photo"
                  helperText="Upload official headshot or passport photo (JPG, PNG, WEBP)"
                  aspect="avatar"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Agent Full Name *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Number *</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
                />
              </div>

              {/* Password Reset Field */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-teal-600" />
                  <span>Set / Reset Portal Password</span>
                </label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="Leave blank to keep unchanged"
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  New password for agent's Profolio portal login
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Agency Name</label>
                <input
                  type="text"
                  value={editFormData.agencyName}
                  onChange={(e) => setEditFormData({ ...editFormData, agencyName: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">MahaRERA Number</label>
                <input
                  type="text"
                  value={editFormData.reraNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, reraNumber: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Experience (Years)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={editFormData.experienceYears}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, experienceYears: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Account Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Can log into Profolio)</option>
                  <option value="SUSPENDED">SUSPENDED (Access blocked)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Coverage Areas in Nagpur (Comma separated)
                </label>
                <input
                  type="text"
                  value={editFormData.areasServed}
                  onChange={(e) => setEditFormData({ ...editFormData, areasServed: e.target.value })}
                  placeholder="e.g. Besa, Manish Nagar, Wardha Road, Dharampeth"
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Agent Bio</label>
                <textarea
                  rows={2}
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none resize-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-800 block">Available for Buyer Leads</span>
                  <span className="text-[11px] text-slate-500">
                    When active, public inquiry forms automatically route to this agent
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={editFormData.isAvailable}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, isAvailable: e.target.checked })
                  }
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="py-1.5 px-3.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Password & Profile...</span>
                  </>
                ) : (
                  <span>Save Agent Changes</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Success Confirmation Modal */}
      {showSuccessModal && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Changes Saved Successfully! 🎉"
          maxWidth="max-w-md"
        >
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Agent Profile & Password Updated!
              </h3>
              <p className="text-xs text-slate-600">
                All changes have been successfully saved to the system and database.
              </p>
            </div>

            {passwordWasUpdated && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-left space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>New Login Password Active:</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  The agent can now log into the Profolio Portal (port 5175) using their phone/email and this new password.
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-2xs"
              >
                Done / Continue
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AgentDetailsPage;
