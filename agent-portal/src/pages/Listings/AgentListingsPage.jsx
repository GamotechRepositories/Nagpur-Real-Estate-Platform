import React, { useState } from 'react';
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
  CheckCircle,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';

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

  const { data, isLoading } = useQuery({
    queryKey: ['agent-properties', activeStatus, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (activeStatus !== 'ALL') params.set('status', activeStatus);
      if (searchTerm) params.set('search', searchTerm);
      return apiClient.get(`/agents/me/properties?${params.toString()}`);
    },
  });

  const markSoldMutation = useMutation({
    mutationFn: (propertyId) => apiClient.patch(`/properties/${propertyId}/status`, { status: 'SOLD' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-properties']);
      queryClient.invalidateQueries(['agent-stats']);
      setIsSoldModalOpen(false);
      setSelectedProperty(null);
    },
  });

  const properties = Array.isArray(data?.data?.properties)
    ? data.data.properties
    : Array.isArray(data?.data)
    ? data.data
    : [];
  const totalCount = data?.data?.totalCount || data?.meta?.totalCount || properties.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Property Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track approval status, moderation notes, and buyer visibility across your Nagpur properties.
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.key;
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
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
            {activeStatus === 'ALL'
              ? 'You have not added any properties yet. Click "Post New Property" to add your first listing.'
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

                      <h3 className="text-sm font-bold text-slate-900 hover:text-teal-700 transition">
                        {prop.title}
                      </h3>

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
                  <div className="flex items-center gap-2.5 self-end lg:self-center flex-wrap">
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
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              onClick={() => setIsSoldModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={() => markSoldMutation.mutate(selectedProperty._id)}
              disabled={markSoldMutation.isPending}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition"
            >
              {markSoldMutation.isPending ? 'Updating...' : 'Confirm Marked as Sold'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
