import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users2,
  TrendingUp,
  Plus,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Compass,
  Store,
  Home,
  Phone,
  Mail,
  Key,
  Search,
  Filter,
  Eye,
  Edit2,
  UserCheck,
  XCircle,
  MapPin,
  Calendar,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters';

// Property classification helpers
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

// Friendly type badge for table
const getTypeBadge = (prop) => {
  const title = (prop?.title || '').toUpperCase();
  const sub = (prop?.subtype || '').toUpperCase();

  if (sub.includes('PENTHOUSE') || title.includes('PENTHOUSE')) {
    return {
      label: 'Penthouse',
      className: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: Building2,
    };
  }
  if (isPlot(prop)) {
    return {
      label: 'Plot / Land',
      className: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Compass,
    };
  }
  if (isCommercial(prop)) {
    const isOffice = sub.includes('OFFICE') || title.includes('OFFICE');
    const isShop = sub.includes('SHOP') || title.includes('SHOP');
    return {
      label: isOffice ? 'Commercial Office' : isShop ? 'Commercial Shop' : 'Commercial',
      className: 'bg-teal-50 text-teal-800 border-teal-200',
      icon: Store,
    };
  }
  if (isVilla(prop)) {
    return {
      label: 'Villa / House',
      className: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: Home,
    };
  }
  return {
    label: 'Apartment / Flat',
    className: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: Building2,
  };
};

export const AgentDashboardPage = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'leads' | 'details'

  // Sub-Filters for Inventory Tab
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('ALL'); // 'ALL' | 'APARTMENT' | 'COMMERCIAL' | 'PLOT' | 'VILLA'
  const [purposeFilter, setPurposeFilter] = useState('ALL'); // 'ALL' | 'SALE' | 'RENT'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'LIVE' | 'PENDING_REVIEW' | 'REJECTED' | 'SOLD'
  const [searchQuery, setSearchQuery] = useState('');

  // Check Role
  const isBuilder = user?.role === 'BUILDER';

  // 1. Fetch Stats
  const { data: statsRes, isLoading: isLoadingStats } = useQuery({
    queryKey: ['workspace-stats', isBuilder],
    queryFn: () => apiClient.get(isBuilder ? '/builders/me/stats' : '/agents/me/stats'),
  });

  // 2. Fetch All Properties
  const { data: propertiesRes, isLoading: isLoadingProperties } = useQuery({
    queryKey: ['workspace-properties-all', isBuilder],
    queryFn: () => apiClient.get(isBuilder ? '/builders/me/properties' : '/agents/me/properties?limit=100'),
  });

  // 3. Fetch Leads
  const { data: leadsRes, isLoading: isLoadingLeads } = useQuery({
    queryKey: ['workspace-leads-all', isBuilder],
    queryFn: () => apiClient.get('/agents/me/leads?limit=50'),
  });

  // 4. If Builder, fetch projects
  const { data: projectsRes } = useQuery({
    queryKey: ['builder-projects-dashboard'],
    queryFn: () => apiClient.get('/builders/me/projects'),
    enabled: isBuilder,
  });

  const builderProjects = projectsRes?.data || [];

  // Mutation to update lead status
  const updateLeadMutation = useMutation({
    mutationFn: ({ id, status }) => apiClient.patch(`/agents/me/leads/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspace-leads-all']);
      queryClient.invalidateQueries(['workspace-stats']);
    },
  });

  // Extract raw lists safely
  const rawProperties = useMemo(() => {
    const d = propertiesRes?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.properties)) return d.properties;
    return [];
  }, [propertiesRes]);

  const rawLeads = useMemo(() => {
    const d = leadsRes?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.leads)) return d.leads;
    return [];
  }, [leadsRes]);

  // Compute breakdown stats dynamically from real properties
  const stats = useMemo(() => {
    const s = statsRes?.data || {};

    const apartments = s.apartments !== undefined ? s.apartments : rawProperties.filter(isApartment).length;
    const commercial = s.commercial !== undefined ? s.commercial : rawProperties.filter(isCommercial).length;
    const plots = s.plots !== undefined ? s.plots : rawProperties.filter(isPlot).length;
    const villas = s.villas !== undefined ? s.villas : rawProperties.filter(isVilla).length;
    const buySale = s.buySale !== undefined ? s.buySale : rawProperties.filter(isBuySale).length;
    const rent = s.rent !== undefined ? s.rent : rawProperties.filter(isRent).length;

    const live = s.liveCount ?? s.liveListings ?? rawProperties.filter((p) => {
      const st = (p.status || 'LIVE').toUpperCase();
      return st === 'LIVE' || st === 'APPROVED' || st === 'ACTIVE';
    }).length;

    const pending = s.pendingCount ?? s.pendingReview ?? rawProperties.filter((p) => {
      const st = (p.status || '').toUpperCase();
      return st === 'PENDING_REVIEW' || st === 'PENDING' || st === 'DRAFT';
    }).length;

    const rejected = s.rejectedCount ?? s.rejectedListings ?? rawProperties.filter((p) => (p.status || '').toUpperCase() === 'REJECTED').length;
    const sold = s.soldCount ?? s.soldListings ?? rawProperties.filter((p) => {
      const st = (p.status || '').toUpperCase();
      return st === 'SOLD' || st === 'RENTED';
    }).length;

    const totalValuation = s.portfolioValuation ?? s.totalPortfolioValue ?? rawProperties.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    const totalViews = s.totalViews ?? rawProperties.reduce((sum, p) => sum + (Number(p.viewsCount) || 0), 0);
    const totalProperties = rawProperties.length > 0 ? rawProperties.length : (s.totalProperties ?? s.totalListings ?? 0);
    const totalLeads = rawLeads.length > 0 ? rawLeads.length : (s.totalLeads ?? 0);

    return {
      totalProperties,
      apartments,
      commercial,
      plots,
      villas,
      buySale,
      rent,
      live,
      pending,
      rejected,
      sold,
      totalValuation,
      totalViews,
      totalLeads,
    };
  }, [statsRes, rawProperties, rawLeads]);

  // Filter listings for Inventory tab
  const filteredProperties = useMemo(() => {
    return rawProperties.filter((p) => {
      // 1. Property Type filter
      if (propertyTypeFilter === 'APARTMENT' && !isApartment(p)) return false;
      if (propertyTypeFilter === 'COMMERCIAL' && !isCommercial(p)) return false;
      if (propertyTypeFilter === 'PLOT' && !isPlot(p)) return false;
      if (propertyTypeFilter === 'VILLA' && !isVilla(p)) return false;

      // 2. Transaction Purpose filter
      if (purposeFilter === 'SALE' && !isBuySale(p)) return false;
      if (purposeFilter === 'RENT' && !isRent(p)) return false;

      // 3. Status filter
      if (statusFilter !== 'ALL') {
        const s = (p.status || 'LIVE').toUpperCase();
        if (statusFilter === 'LIVE' && s !== 'LIVE' && s !== 'APPROVED' && s !== 'ACTIVE') return false;
        if (statusFilter === 'PENDING_REVIEW' && s !== 'PENDING_REVIEW' && s !== 'PENDING' && s !== 'DRAFT') return false;
        if (statusFilter === 'REJECTED' && s !== 'REJECTED') return false;
        if (statusFilter === 'SOLD' && s !== 'SOLD' && s !== 'RENTED') return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title?.toLowerCase().includes(q);
        const matchesLocality = p.localityName?.toLowerCase().includes(q);
        const matchesAddress = p.address?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocality && !matchesAddress) return false;
      }

      return true;
    });
  }, [rawProperties, propertyTypeFilter, purposeFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Main Agent Header Card (Exact Parity with Admin) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
          {/* Identity & Verification */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-xs overflow-hidden flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'Agent'}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'A'
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{user?.name || 'Verified Agent'}</h2>
                <span className="inline-flex items-center space-x-1 py-0.5 px-2 rounded-md text-[10px] font-bold bg-teal-50 border border-teal-200 text-teal-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>{profile?.verificationStatus === 'VERIFIED' ? 'VERIFIED' : 'ACTIVE'}</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {user?.status || 'ACTIVE'}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 flex-wrap">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.agencyName || 'Independent Real Estate Consultant'}</span>
                {profile?.reraNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-500">MahaRERA: {profile.reraNumber}</span>
                  </>
                )}
              </p>

              <div className="flex items-center space-x-3 sm:space-x-4 text-xs text-slate-500 pt-1 flex-wrap gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono font-medium text-slate-800">
                    {user?.phone || profile?.contactPhone || 'No phone set'}
                  </span>
                </span>
                {user?.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[180px] sm:max-w-none">{user.email}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{profile?.isAvailable !== false ? 'Available for Leads' : 'Leads Paused'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-start lg:self-center flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {isBuilder && (
              <Link
                to="/projects/new"
                className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold shadow-2xs transition flex-1 sm:flex-initial"
              >
                <Compass className="w-3.5 h-3.5 text-teal-700" />
                <span>+ Add Project</span>
              </Link>
            )}

            <Link
              to="/profile"
              className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition flex-1 sm:flex-initial"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </Link>

            <Link
              to="/listings/new"
              className="inline-flex items-center justify-center space-x-1.5 py-2 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition flex-1 sm:flex-initial"
            >
              <Plus className="w-4 h-4" />
              <span>{isBuilder ? '+ Post Unit' : '+ Post Property'}</span>
            </Link>
          </div>
        </div>

        {/* 2. PORTFOLIO & INVENTORY DISTRIBUTION */}
        <div className="mt-5 pt-5 border-t border-slate-100/90 space-y-3.5">
          {/* Header & Total Valuation KPI */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {isBuilder
                    ? 'Developer Portfolio & Unit Inventory'
                    : 'Portfolio & Inventory Distribution'}
                </h3>
                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-500 font-medium">
                  {isLoadingProperties ? 'Syncing...' : `${stats.totalProperties} Total Units Managed`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Distribution across property asset classes and listing transaction mandates
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 border border-slate-200/90 py-1.5 px-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Portfolio Valuation
              </span>
              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                {formatCurrency(stats.totalValuation)}
              </span>
            </div>
          </div>

          {/* Segmented Cards: Asset Classes (4) & Listing Mandate (2) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Property Asset Classes (8 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-0.5">
                <span className="uppercase tracking-wider text-[10px] font-bold text-slate-400">
                  Property Asset Class
                </span>
                {propertyTypeFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setPropertyTypeFilter('ALL')}
                    className="text-teal-700 hover:text-teal-800 text-[11px] font-semibold transition"
                  >
                    Reset Type
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Apartments */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inventory');
                    setPropertyTypeFilter((prev) => (prev === 'APARTMENT' ? 'ALL' : 'APARTMENT'));
                    setPurposeFilter('ALL');
                  }}
                  className={`group relative text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                    propertyTypeFilter === 'APARTMENT' && activeTab === 'inventory'
                      ? 'bg-teal-50/70 border-teal-600 ring-1 ring-teal-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 truncate">
                      Apartments
                    </span>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        propertyTypeFilter === 'APARTMENT' && activeTab === 'inventory'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-auto">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                      {isLoadingProperties ? '—' : stats.apartments}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Flats</span>
                  </div>
                </button>

                {/* Commercial */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inventory');
                    setPropertyTypeFilter((prev) => (prev === 'COMMERCIAL' ? 'ALL' : 'COMMERCIAL'));
                    setPurposeFilter('ALL');
                  }}
                  className={`group relative text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                    propertyTypeFilter === 'COMMERCIAL' && activeTab === 'inventory'
                      ? 'bg-teal-50/70 border-teal-600 ring-1 ring-teal-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 truncate">
                      Commercial
                    </span>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        propertyTypeFilter === 'COMMERCIAL' && activeTab === 'inventory'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-auto">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                      {isLoadingProperties ? '—' : stats.commercial}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Retail / Office</span>
                  </div>
                </button>

                {/* Plots / Land */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inventory');
                    setPropertyTypeFilter((prev) => (prev === 'PLOT' ? 'ALL' : 'PLOT'));
                    setPurposeFilter('ALL');
                  }}
                  className={`group relative text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                    propertyTypeFilter === 'PLOT' && activeTab === 'inventory'
                      ? 'bg-teal-50/70 border-teal-600 ring-1 ring-teal-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 truncate">
                      Plots / Land
                    </span>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        propertyTypeFilter === 'PLOT' && activeTab === 'inventory'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-auto">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                      {isLoadingProperties ? '—' : stats.plots}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Layouts</span>
                  </div>
                </button>

                {/* Villas / Houses */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inventory');
                    setPropertyTypeFilter((prev) => (prev === 'VILLA' ? 'ALL' : 'VILLA'));
                    setPurposeFilter('ALL');
                  }}
                  className={`group relative text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                    propertyTypeFilter === 'VILLA' && activeTab === 'inventory'
                      ? 'bg-teal-50/70 border-teal-600 ring-1 ring-teal-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 truncate">
                      Villas / Houses
                    </span>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        propertyTypeFilter === 'VILLA' && activeTab === 'inventory'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-auto">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                      {isLoadingProperties ? '—' : stats.villas}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Independent</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Listing Transaction Mandate (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-0.5">
                <span className="uppercase tracking-wider text-[10px] font-bold text-slate-400">
                  Listing Mandate
                </span>
                {purposeFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setPurposeFilter('ALL')}
                    className="text-teal-700 hover:text-teal-800 text-[11px] font-semibold transition"
                  >
                    Reset Purpose
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* For Sale */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inventory');
                    setPurposeFilter((prev) => (prev === 'SALE' ? 'ALL' : 'SALE'));
                    setPropertyTypeFilter('ALL');
                  }}
                  className={`group relative text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                    purposeFilter === 'SALE' && activeTab === 'inventory'
                      ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 truncate">
                      For Sale
                    </span>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        purposeFilter === 'SALE' && activeTab === 'inventory'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-auto">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                      {isLoadingProperties ? '—' : stats.buySale}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Purchase</span>
                  </div>
                </button>

                {/* For Rent */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inventory');
                    setPurposeFilter((prev) => (prev === 'RENT' ? 'ALL' : 'RENT'));
                    setPropertyTypeFilter('ALL');
                  }}
                  className={`group relative text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                    purposeFilter === 'RENT' && activeTab === 'inventory'
                      ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 truncate">
                      For Rent
                    </span>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        purposeFilter === 'RENT' && activeTab === 'inventory'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-700 group-hover:bg-blue-100'
                      }`}
                    >
                      <Key className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-auto">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                      {isLoadingProperties ? '—' : stats.rent}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Lease</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Live Moderation Status Strip */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100/90 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Live Status:
              </span>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('inventory');
                  setStatusFilter((prev) => (prev === 'LIVE' ? 'ALL' : 'LIVE'));
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  statusFilter === 'LIVE' && activeTab === 'inventory'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/80'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    statusFilter === 'LIVE' && activeTab === 'inventory' ? 'bg-white' : 'bg-emerald-500'
                  }`}
                />
                <span>{stats.live} Live on Website</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('inventory');
                  setStatusFilter((prev) => (prev === 'PENDING_REVIEW' ? 'ALL' : 'PENDING_REVIEW'));
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  statusFilter === 'PENDING_REVIEW' && activeTab === 'inventory'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50/70 hover:bg-amber-100/80 text-amber-800 border border-amber-200/80'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    statusFilter === 'PENDING_REVIEW' && activeTab === 'inventory' ? 'bg-white' : 'bg-amber-500'
                  }`}
                />
                <span>{stats.pending} Under Moderation</span>
              </button>

              {stats.rejected > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inventory');
                    setStatusFilter((prev) => (prev === 'REJECTED' ? 'ALL' : 'REJECTED'));
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    statusFilter === 'REJECTED' && activeTab === 'inventory'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-rose-50/70 hover:bg-rose-100/80 text-rose-800 border border-rose-200/80'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      statusFilter === 'REJECTED' && activeTab === 'inventory' ? 'bg-white' : 'bg-rose-500'
                    }`}
                  />
                  <span>{stats.rejected} Needs Revision</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveTab('inventory');
                  setStatusFilter((prev) => (prev === 'SOLD' ? 'ALL' : 'SOLD'));
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  statusFilter === 'SOLD' && activeTab === 'inventory'
                    ? 'bg-slate-700 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    statusFilter === 'SOLD' && activeTab === 'inventory' ? 'bg-white' : 'bg-slate-500'
                  }`}
                />
                <span>{stats.sold} Closed / Sold Deals</span>
              </button>
            </div>

            {(propertyTypeFilter !== 'ALL' || purposeFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setPropertyTypeFilter('ALL');
                  setPurposeFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline decoration-slate-300 underline-offset-2 transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Tab Header Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-2.5 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition flex-shrink-0 ${activeTab === 'inventory'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          Property Inventory ({rawProperties.length})
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`py-2.5 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition flex-shrink-0 ${activeTab === 'leads'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          Customer Leads & Inquiries ({rawLeads.length})
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`py-2.5 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition flex-shrink-0 ${activeTab === 'details'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          Agency & Background Details
        </button>
      </div>

      {/* TAB 1: PROPERTY INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-3.5 sm:p-4">
          {/* Sub-Filters: Category Pills on Left, Purpose & Status on Right */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            {/* Category Filter Pills (Property Type) */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none pb-1">
              {[
                { key: 'ALL', label: `All Properties (${rawProperties.length})` },
                { key: 'APARTMENT', label: `🏢 Flats & Apartments (${stats.apartments})` },
                { key: 'COMMERCIAL', label: `🏬 Commercial (${stats.commercial})` },
                { key: 'PLOT', label: `📐 Plots / Land (${stats.plots})` },
                { key: 'VILLA', label: `🏡 Villas (${stats.villas})` },
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setPropertyTypeFilter(pill.key)}
                  className={`py-1 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition ${propertyTypeFilter === pill.key
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Purpose & Status Dropdown Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-none focus:border-teal-600 transition"
              >
                <option value="ALL">Purpose: All Purpose ({rawProperties.length})</option>
                <option value="SALE">For Sale ({stats.buySale})</option>
                <option value="RENT">For Rent ({stats.rent})</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-none focus:border-teal-600 transition"
              >
                <option value="ALL">Status: All Status</option>
                <option value="LIVE">Live on Website ({stats.live})</option>
                <option value="PENDING_REVIEW">Under Moderation ({stats.pending})</option>
                <option value="REJECTED">Needs Revision ({stats.rejected})</option>
                <option value="SOLD">Sold Out ({stats.sold})</option>
              </select>

              {/* Reset Filters button */}
              {(propertyTypeFilter !== 'ALL' || purposeFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setPropertyTypeFilter('ALL');
                    setPurposeFilter('ALL');
                    setStatusFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties by title, locality or address..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-teal-600 focus:bg-white transition"
            />
          </div>

          {/* Table of Listings */}
          {isLoadingProperties ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading your property listings...
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No properties matching filters</p>
              <p className="text-xs text-slate-500 mt-1">
                Try selecting "All Properties" or post a new property listing.
              </p>
              <Link
                to="/listings/new"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition"
              >
                <Plus size={15} />
                <span>Post New Property</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider font-semibold border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Property Name & Details</th>
                    <th className="px-3 py-3">Type / Category</th>
                    <th className="px-3 py-3">Purpose</th>
                    <th className="px-3 py-3">Township / Project</th>
                    <th className="px-3 py-3">Price</th>
                    <th className="px-3 py-3">Locality</th>
                    <th className="px-3 py-3">Moderation Status</th>
                    <th className="px-4 py-3">Posted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProperties.map((prop) => {
                    const typeBadge = getTypeBadge(prop);
                    const TypeIcon = typeBadge.icon;
                    const isForSale = isBuySale(prop);

                    return (
                      <tr key={prop._id} className="hover:bg-slate-50 transition">
                        {/* Property Title & Thumbnail */}
                        <td className="px-4 py-3 max-w-xs">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                              <img
                                src={
                                  prop.coverImage ||
                                  (prop.images && prop.images[0]?.url) ||
                                  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80'
                                }
                                alt={prop.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 truncate" title={prop.title}>
                                {prop.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {prop.bedrooms ? `${prop.bedrooms} BHK • ` : ''}
                                {prop.areaSqFt ? `${prop.areaSqFt} sq.ft` : 'Area not specified'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center space-x-1 py-0.5 px-2 rounded text-[10px] font-bold border ${typeBadge.className}`}
                          >
                            <TypeIcon className="w-3 h-3" />
                            <span>{typeBadge.label}</span>
                          </span>
                        </td>

                        {/* Purpose Badge */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isForSale
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                              }`}
                          >
                            {isForSale ? 'FOR SALE' : 'FOR RENT'}
                          </span>
                        </td>

                        {/* Project / Township */}
                        <td className="px-3 py-3 whitespace-nowrap text-slate-600 font-medium text-[11px]">
                          {prop.project?.name || (
                            <span className="text-slate-400">Individual Listing</span>
                          )}
                        </td>

                        {/* Price */}
                        <td className="px-3 py-3 whitespace-nowrap font-mono font-bold text-slate-900">
                          {formatCurrency(prop.price)}
                        </td>

                        {/* Locality */}
                        <td className="px-3 py-3 whitespace-nowrap text-slate-700 font-medium">
                          {prop.localityName || prop.locality?.name || 'Nagpur'}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <Badge status={prop.status || 'LIVE'} size="sm" />
                        </td>

                        {/* Posted Date */}
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-[11px]">
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

      {/* TAB 2: CUSTOMER LEADS & INQUIRIES */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Customer Leads & Inquiries</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct buyer contacts and site tour requests received for your Nagpur properties.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              {rawLeads.length} Total Leads
            </span>
          </div>

          {isLoadingLeads ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading customer leads...
            </div>
          ) : rawLeads.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <Users2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No buyer inquiries yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                When buyers on Nagpur Real Estate submit inquiry forms or request callbacks for your listings, they appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider font-semibold border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Buyer Contact</th>
                    <th className="px-4 py-3">Inquired Property</th>
                    <th className="px-4 py-3">Message / Notes</th>
                    <th className="px-4 py-3">Received</th>
                    <th className="px-4 py-3">Lead Status</th>
                    <th className="px-4 py-3 text-right">Reachout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rawLeads.map((lead) => {
                    const rawPhone = (lead?.phone || '').replace(/[^0-9]/g, '');
                    const buyerName = lead?.name || 'Prospective Buyer';
                    const waUrl = rawPhone
                      ? `https://wa.me/91${rawPhone}?text=${encodeURIComponent(
                        `Hello ${buyerName}, I am ${user?.name || 'your agent'} following up on your inquiry about ${lead?.property?.title || 'the property'
                        } on Nagpur Real Estate.`
                      )}`
                      : '#';

                    return (
                      <tr key={lead._id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{buyerName}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {lead.phone || 'No phone provided'}
                          </div>
                          {lead.email && <div className="text-[11px] text-slate-400">{lead.email}</div>}
                        </td>

                        <td className="px-4 py-3 max-w-xs">
                          {lead.property ? (
                            <div>
                              <div className="font-semibold text-slate-800 truncate">
                                {lead.property.title}
                              </div>
                              <div className="text-[11px] text-teal-700 font-mono font-bold mt-0.5">
                                {formatCurrency(lead.property.price)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">General Consultation</span>
                          )}
                        </td>

                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded border border-slate-100">
                            "{lead.message || 'Customer requested phone callback / site visit.'}"
                          </p>
                        </td>

                        <td className="px-4 py-3 text-slate-500 text-[11px] whitespace-nowrap">
                          {formatRelativeTime(lead.createdAt)}
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={lead.status || 'NEW'}
                            onChange={(e) =>
                              updateLeadMutation.mutate({ id: lead._id, status: e.target.value })
                            }
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-none focus:border-teal-600"
                          >
                            <option value="NEW">🟢 New Lead</option>
                            <option value="CONTACTED">💬 Contacted</option>
                            <option value="SITE_VISIT_SCHEDULED">📅 Visit Scheduled</option>
                            <option value="NEGOTIATION">🤝 Negotiation</option>
                            <option value="CLOSED_WON">🎉 Closed / Won</option>
                            <option value="LOST">⚪ Archived / Lost</option>
                          </select>
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {rawPhone ? (
                              <>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageCircle size={13} className="text-emerald-600" />
                                  <span>WhatsApp</span>
                                </a>
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                                  title="Call Buyer"
                                >
                                  <Phone size={13} />
                                </a>
                              </>
                            ) : (
                              <span className="text-slate-400 text-xs">No phone</span>
                            )}
                          </div>
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

      {/* TAB 3: AGENCY & BACKGROUND DETAILS */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Agency & Professional Credentials</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Your registered brokerage license details, MahaRERA registration number, and operating regions in Nagpur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Brokerage Name</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {profile?.agencyName || 'Independent Real Estate Consultant'}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">MahaRERA Registration</span>
                <p className="text-sm font-mono font-bold text-teal-800 mt-0.5">
                  {profile?.reraNumber || 'Not submitted yet'}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Industry Experience</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {profile?.experienceYears || 5} Years in Nagpur Property Market
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Operating Coverage Localities</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {Array.isArray(profile?.areasServed)
                    ? profile.areasServed.join(', ')
                    : profile?.areasServed || 'Dharampeth, Ramdaspeth, Wardha Road, Manish Nagar, Besa'}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Lead Assignment Status</span>
                <p className="text-sm font-semibold text-emerald-700 mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{profile?.isAvailable !== false ? 'Active (Receiving Buyer Routing)' : 'Paused'}</span>
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Direct Contact</span>
                <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">
                  {user?.phone || profile?.contactPhone} • {user?.email}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Professional Bio</span>
            <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
              {profile?.bio ||
                'Certified Nagpur Real Estate professional specializing in residential apartments, luxury villas, commercial spaces, and vetted layout plots.'}
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition"
            >
              <Edit2 size={14} />
              <span>Update Agency Profile</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
