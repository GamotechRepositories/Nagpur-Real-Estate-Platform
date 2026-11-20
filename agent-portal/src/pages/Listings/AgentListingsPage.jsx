import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Search,
  Plus,
  ExternalLink,
  MapPin,
  Clock,
  Layers,
  AlertCircle,
  Eye,
  Edit2,
  CheckCircle,
  Phone,
  MessageSquare,
  UserCheck,
  Lock,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../store/useAuthStore';

const STATUS_TABS = [
  { key: 'ALL', label: 'All Listings' },
  { key: 'LIVE', label: 'Live on Portal' },
  { key: 'PENDING_REVIEW', label: 'Under Review' },
  { key: 'REJECTED', label: 'Needs Revision' },
  { key: 'SOLD', label: 'Sold Out' },
  { key: 'EXPIRED', label: 'Expired' },
];

export const AgentListingsPage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get('status') || 'ALL';
  const [searchTerm, setSearchTerm] = useState('');

  // Selected property for Mark Sold modal
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isSoldModalOpen, setIsSoldModalOpen] = useState(false);
  const [inspectProperty, setInspectProperty] = useState(null);

  const { user } = useAuthStore();
  const isBuilder = user?.role === 'BUILDER';

  // Fetch all properties for this partner (cached for fast zero-latency instant tab switching)
  const { data, isLoading } = useQuery({
    queryKey: ['agent-properties-all', isBuilder],
    queryFn: () => {
      const url = isBuilder
        ? `/builders/me/properties`
        : `/agents/me/properties?limit=200`;
      return apiClient.get(url);
    },
    staleTime: 1000 * 30,
  });

  const markSoldMutation = useMutation({
    mutationFn: (propertyId) => apiClient.post(`/properties/${propertyId}/status`, { status: 'SOLD' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-properties-all']);
      queryClient.invalidateQueries(['agent-stats']);
      setIsSoldModalOpen(false);
      setSelectedProperty(null);
    },
    onError: (err) => {
      alert(err?.response?.data?.message || err?.message || 'Failed to mark property as sold');
    },
  });

  const rawProperties = useMemo(() => {
    if (Array.isArray(data?.data?.properties)) return data.data.properties;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  const currentUserId = user?._id?.toString();

  // Inventory source helper functions:
  // 1. Self Added: Property created/owned by this partner
  const isSelfAdded = (prop) => {
    const ownerId = (prop.owner?._id || prop.owner)?.toString();
    return Boolean(ownerId && currentUserId && ownerId === currentUserId);
  };

  // 2. Allocated by Admin: Property submitted by direct citizen/user, assigned to this partner
  const isAllocatedByAdmin = (prop) => {
    const ownerId = (prop.owner?._id || prop.owner)?.toString();
    return !ownerId || ownerId !== currentUserId;
  };

  // Source Filter state: 'ALL' | 'SELF' | 'ALLOCATED'
  const [sourceFilter, setSourceFilter] = useState('ALL');

  // Real-time counts across inventory sources
  const sourceCounts = useMemo(() => {
    let selfCount = 0;
    let allocatedCount = 0;
    for (const prop of rawProperties) {
      if (isSelfAdded(prop)) {
        selfCount++;
      } else {
        allocatedCount++;
      }
    }
    return {
      ALL: rawProperties.length,
      SELF: selfCount,
      ALLOCATED: allocatedCount,
    };
  }, [rawProperties, currentUserId]);

  // Intermediate list filtered by inventory source
  const sourceFilteredProperties = useMemo(() => {
    if (sourceFilter === 'SELF') {
      return rawProperties.filter(isSelfAdded);
    }
    if (sourceFilter === 'ALLOCATED') {
      return rawProperties.filter(isAllocatedByAdmin);
    }
    return rawProperties;
  }, [rawProperties, sourceFilter, currentUserId]);

  // Real-time status counts across listings matching the active source
  const statusCounts = useMemo(() => {
    const counts = {
      ALL: sourceFilteredProperties.length,
      LIVE: 0,
      PENDING_REVIEW: 0,
      REJECTED: 0,
      SOLD: 0,
      EXPIRED: 0,
    };
    for (const prop of sourceFilteredProperties) {
      if (counts[prop.status] !== undefined) {
        counts[prop.status]++;
      }
    }
    return counts;
  }, [sourceFilteredProperties]);

  // Filter properties by status and search keyword
  const properties = useMemo(() => {
    return sourceFilteredProperties.filter((prop) => {
      // 1. Status Filter
      if (activeStatus !== 'ALL') {
        if (prop.status !== activeStatus) return false;
      }
      // 2. Search Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const titleMatch = prop.title?.toLowerCase().includes(q);
        const locMatch =
          prop.localityName?.toLowerCase().includes(q) ||
          prop.locality?.name?.toLowerCase().includes(q);
        const addressMatch = prop.address?.toLowerCase().includes(q);
        const slugMatch =
          prop.slug?.toLowerCase().includes(q) || prop._id?.toLowerCase().includes(q);
        const projectMatch = prop.project?.name?.toLowerCase().includes(q);
        if (!titleMatch && !locMatch && !addressMatch && !slugMatch && !projectMatch) {
          return false;
        }
      }
      return true;
    });
  }, [sourceFilteredProperties, activeStatus, searchTerm]);

  const totalCount = properties.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Listings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track approval status, moderation notes, self-added listings, and direct homeowner properties allocated to you by Admin.
          </p>
        </div>
        <Link
          to="/listings/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-2xs transition"
        >
          <Plus size={16} />
          <span>Post New Property</span>
        </Link>
      </div>

      {/* Inventory Source Segmented Filter Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-full sm:w-fit border border-slate-200 overflow-x-auto max-w-full scrollbar-none">
        <button
          type="button"
          onClick={() => setSourceFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap flex-shrink-0 ${
            sourceFilter === 'ALL'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 size={14} className={sourceFilter === 'ALL' ? 'text-teal-600' : 'text-slate-400'} />
          <span>All Listings</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              sourceFilter === 'ALL' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {sourceCounts.ALL}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSourceFilter('SELF')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            sourceFilter === 'SELF'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck size={14} className={sourceFilter === 'SELF' ? 'text-blue-600' : 'text-slate-400'} />
          <span>Self-Added / My Own</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              sourceFilter === 'SELF' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {sourceCounts.SELF}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSourceFilter('ALLOCATED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            sourceFilter === 'ALLOCATED'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck size={14} className={sourceFilter === 'ALLOCATED' ? 'text-emerald-600' : 'text-slate-400'} />
          <span>Allocated by Admin (User Postings)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              sourceFilter === 'ALLOCATED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {sourceCounts.ALLOCATED}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none pb-1">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.key;
            const count = statusCounts[tab.key] ?? 0;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams);
                  if (tab.key === 'ALL') {
                    nextParams.delete('status');
                  } else {
                    nextParams.set('status', tab.key);
                  }
                  setSearchParams(nextParams);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition inline-flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, locality or ID..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-teal-600 transition shadow-2xs"
          />
        </div>
      </div>

      {/* Property List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading property inventory...</div>
      ) : properties.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No properties found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {sourceFilter === 'ALLOCATED'
              ? 'No properties have been allocated to you by Admin yet. When direct users submit listings, Admin assigns certified partners to handle them.'
              : sourceFilter === 'SELF'
              ? 'You have not self-added any properties yet. Click "Post New Property" to add your first listing.'
              : activeStatus === 'ALL'
              ? 'You have no properties matching your current filter.'
              : `You have no properties matching status "${activeStatus}".`}
          </p>
          <div className="mt-4">
            <Link
              to="/listings/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition"
            >
              <Plus size={15} />
              <span>Post New Property</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((prop) => {
            const isLive = prop.status === 'LIVE';
            const isRejected = prop.status === 'REJECTED';
            const isPending = prop.status === 'PENDING_REVIEW';

            return (
              <div
                key={prop._id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition space-y-3"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Property Info */}
                  <div className="flex items-start gap-3.5">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 relative border border-slate-200">
                      {prop.coverImage ? (
                        <img
                          src={prop.coverImage}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Building2 size={22} />
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 bg-slate-900/80 text-[9px] text-white font-bold px-1 rounded uppercase">
                        {prop.purpose}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge status={prop.status} size="sm" />
                        {isAllocatedByAdmin(prop) ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 shadow-2xs">
                            <ShieldCheck size={11} className="text-emerald-600" />
                            <span>Allocated by Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            <Briefcase size={11} className="text-slate-500" />
                            <span>Self Added</span>
                          </span>
                        )}
                        {prop.project && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            <Layers size={11} className="text-teal-600" />
                            <span>{prop.project.name || 'Township'}</span>
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-mono">
                          ID: {prop.slug?.slice(-6) || prop._id?.slice(-6)}
                        </span>
                      </div>

                      <Link
                        to={`/listings/view/${prop._id}`}
                        className="text-sm font-bold text-slate-900 hover:text-teal-700 transition block"
                      >
                        {prop.title}
                      </Link>

                      <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
                        <span className="text-slate-900 font-bold font-mono text-sm">
                          {formatCurrency(prop.price)}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-700">
                          {prop.bedrooms ? `${prop.bedrooms} BHK` : prop.subtype || prop.category}
                        </span>
                        <span>•</span>
                        <span>{prop.areaSqFt} sq.ft</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {prop.localityName || 'Nagpur'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start lg:self-center flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <Link
                      to={`/listings/view/${prop._id}`}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="View Details"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </Link>

                    <Link
                      to={`/listings/edit/${prop._id}`}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Edit Listing"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </Link>

                    {/* Mark Sold Button */}
                    {isLive && (
                      <button
                        onClick={() => {
                          setSelectedProperty(prop);
                          setIsSoldModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition"
                      >
                        Mark as Sold
                      </button>
                    )}
                  </div>
                </div>

                {/* Homeowner / Client Details Box (Confidential) */}
                {(prop.clientSellerDetails?.name || prop.owner) && (
                  <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-2.5 space-y-2 text-xs">
                    {isAllocatedByAdmin(prop) && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        <ShieldCheck size={13} className="text-emerald-600 flex-shrink-0" />
                        <span>Direct Citizen / Homeowner Listing • Allocated to you by Admin to handle buyer calls & site visits</span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0">
                          <UserCheck size={14} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">
                              {prop.clientSellerDetails?.name || prop.owner?.name || 'Homeowner'}
                            </span>
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-semibold">
                              {isAllocatedByAdmin(prop) ? 'Allocated Mandate' : (prop.clientSellerDetails?.name ? 'Private Client' : 'Self Added')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                            <span>Phone: {prop.clientSellerDetails?.phone || prop.owner?.phone || 'N/A'}</span>
                            {prop.clientSellerDetails?.notes && (
                              <span className="text-slate-600 italic truncate max-w-xs">
                                • Note: {prop.clientSellerDetails.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {(prop.clientSellerDetails?.phone || prop.owner?.phone) && (
                        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end sm:justify-start pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                          <a
                            href={`tel:+91${prop.clientSellerDetails?.phone || prop.owner?.phone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition"
                          >
                            <Phone size={12} className="text-teal-600" />
                            <span>Call Owner</span>
                          </a>
                          <a
                            href={`https://wa.me/91${prop.clientSellerDetails?.phone || prop.owner?.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition"
                          >
                            <MessageSquare size={12} className="text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rejection Feedback Alert */}
                {isRejected && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                    <AlertCircle size={16} className="text-rose-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-rose-950">
                        Reviewer Feedback / Revision Reason:
                      </p>
                      <p className="text-rose-800 mt-0.5">
                        {prop.rejectionReason ||
                          'The listing requires updates before approval. Please contact admin desk or revise listing details.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Pending Verification Notice */}
                {isPending && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <Clock size={14} className="text-amber-600 flex-shrink-0" />
                    <span>
                      Submitted on {formatDate(prop.createdAt)}. Under review by Nagpur Real Estate verification team.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Property Details Modal (Disabled in favor of dedicated edit page) */}
      {false && (
        <Modal
          isOpen={Boolean(inspectProperty)}
          onClose={() => setInspectProperty(null)}
          title={inspectProperty.title}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Price</span>
                <span className="font-bold text-slate-900 font-mono">
                  {formatCurrency(inspectProperty.price)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Area</span>
                <span className="font-semibold text-slate-800">
                  {inspectProperty.areaSqFt} Sq.Ft
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Config</span>
                <span className="font-semibold text-slate-800">
                  {inspectProperty.bedrooms ? `${inspectProperty.bedrooms} BHK` : inspectProperty.subtype}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Status</span>
                <Badge status={inspectProperty.status} size="sm" />
              </div>
            </div>

            {/* Confidential Homeowner / Client Card for Agent */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                  <UserCheck size={16} className="text-amber-700" />
                  <span>Property Owner / Client Contact (Confidential)</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock size={10} className="text-amber-700" />
                  <span>Internal to You</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Client / Owner Name</span>
                  <span className="font-bold text-slate-900">
                    {inspectProperty.clientSellerDetails?.name || inspectProperty.owner?.name || 'Homeowner'}
                  </span>
                  {inspectProperty.owner?.role && (
                    <span className="text-[10px] text-slate-500 block">
                      Account Type: {inspectProperty.owner.role}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Mobile Number</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-slate-900">
                      {inspectProperty.clientSellerDetails?.phone || inspectProperty.owner?.phone || 'N/A'}
                    </span>
                    {(inspectProperty.clientSellerDetails?.phone || inspectProperty.owner?.phone) && (
                      <div className="flex items-center gap-1">
                        <a
                          href={`tel:+91${inspectProperty.clientSellerDetails?.phone || inspectProperty.owner?.phone}`}
                          className="p-1 rounded bg-teal-100 hover:bg-teal-200 text-teal-800"
                          title="Call Client"
                        >
                          <Phone size={12} />
                        </a>
                        <a
                          href={`https://wa.me/91${inspectProperty.clientSellerDetails?.phone || inspectProperty.owner?.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded bg-green-100 hover:bg-green-200 text-green-800"
                          title="WhatsApp Client"
                        >
                          <MessageSquare size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {inspectProperty.clientSellerDetails?.email && (
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">Email</span>
                    <span className="text-slate-800">{inspectProperty.clientSellerDetails.email}</span>
                  </div>
                )}

                {inspectProperty.clientSellerDetails?.notes && (
                  <div className="sm:col-span-2 bg-white/80 p-2 rounded border border-amber-200/60">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">Internal Client Terms / Notes</span>
                    <p className="text-slate-700 italic text-xs">{inspectProperty.clientSellerDetails.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address & Locality */}
            <div className="text-xs space-y-1">
              <div>
                <span className="font-semibold text-slate-700">Locality: </span>
                <span className="text-slate-600">{inspectProperty.localityName || 'Nagpur'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Address: </span>
                <span className="text-slate-600">{inspectProperty.address || `${inspectProperty.localityName}, Nagpur`}</span>
              </div>
              {inspectProperty.description && (
                <div>
                  <span className="font-semibold text-slate-700">Description: </span>
                  <p className="text-slate-600 mt-1 p-2 bg-slate-50 rounded border border-slate-200 leading-relaxed">
                    {inspectProperty.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setInspectProperty(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Mark Sold Modal */}
      <Modal
        isOpen={isSoldModalOpen}
        onClose={() => setIsSoldModalOpen(false)}
        title="Mark Property as Sold"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to mark{' '}
            <span className="font-bold text-slate-900">"{selectedProperty?.title}"</span> as Sold?
          </p>
          <p className="text-xs text-slate-500">
            This will update its public status to "Sold Out" and register the transaction in your closed deals.
          </p>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              onClick={() => setIsSoldModalOpen(false)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition text-center"
            >
              Cancel
            </button>
            <button
              onClick={() => markSoldMutation.mutate(selectedProperty._id)}
              disabled={markSoldMutation.isPending}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition disabled:opacity-50 text-center"
            >
              {markSoldMutation.isPending ? 'Updating...' : 'Confirm Marked as Sold'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
