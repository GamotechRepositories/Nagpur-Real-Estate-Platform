import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Building2,
  Star,
  ShieldCheck,
  Search,
  Plus,
  Eye,
  RefreshCw,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { formatIndianPrice, formatDate } from '../../utils/formatters';

export const ListingsManagementPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [inspectProperty, setInspectProperty] = useState(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-listings', search, statusFilter, purposeFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('status', statusFilter);
      if (purposeFilter) params.append('purpose', purposeFilter);
      params.append('page', page.toString());
      params.append('limit', '15');

      const res = await apiClient.get(`/admin/listings?${params.toString()}`);
      return res.data;
    },
  });

  const listings = response?.data || [];
  const meta = response?.meta || { totalPages: 1, totalCount: 0, page: 1 };

  // Badges Toggle Mutation
  const toggleBadgesMutation = useMutation({
    mutationFn: async ({ id, isFeatured, isVerified }) => {
      return apiClient.patch(`/admin/listings/${id}/badges`, { isFeatured, isVerified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-listings']);
    },
  });

  // Renew Listing Mutation
  const renewMutation = useMutation({
    mutationFn: async (id) => apiClient.post(`/admin/listings/${id}/renew`),
    onSuccess: () => {
      alert('Listing renewed for 90 days.');
      queryClient.invalidateQueries(['admin-listings']);
    },
  });

  // Status Change Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => apiClient.post(`/properties/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-listings']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
    },
  });

  const publicUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173';

  return (
    <div className="space-y-5">
      <PageHeader
        title="Listings"
        subtitle="Manage inventory, verification badges, and status"
        icon={Building2}
        breadcrumbs={[{ label: 'Listings' }]}
        actions={
          <Link
            to="/listings/new"
            className="inline-flex items-center space-x-1.5 py-1.5 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, locality, or RERA..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white outline-none"
          >
            <option value="">All Statuses</option>
            <option value="LIVE">Live</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
            <option value="SOLD">Sold</option>
            <option value="RENTED">Rented</option>
            <option value="DRAFT">Draft</option>
          </select>

          {/* Purpose Filter */}
          <select
            value={purposeFilter}
            onChange={(e) => {
              setPurposeFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white outline-none"
          >
            <option value="">Buy & Rent</option>
            <option value="BUY">Buy</option>
            <option value="RENT">Rent</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 sm:px-4">Property</th>
                <th className="py-3 px-3">Locality</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Badges</th>
                <th className="py-3 px-3">Expires</th>
                <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Loading properties...
                  </td>
                </tr>
              ) : listings.length > 0 ? (
                listings.map((prop) => (
                  <tr key={prop._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Property Thumbnail & Title */}
                    <td className="py-2.5 px-3 sm:px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                          {prop.coverImage || prop.images?.[0]?.url ? (
                            <img
                              src={prop.coverImage || prop.images[0].url}
                              alt={prop.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                              No pic
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-slate-900 truncate">{prop.title}</p>
                          <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                            <span>{prop.purpose}</span>
                            <span>&bull;</span>
                            <span>{prop.subtype}</span>
                            {prop.bedrooms > 0 && <span>&bull; {prop.bedrooms} BHK</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Locality */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{prop.localityName || 'Nagpur'}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {formatIndianPrice(prop.price)}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <Badge status={prop.status} />
                    </td>

                    {/* Badges Toggles */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* Verified Badge */}
                        <button
                          onClick={() =>
                            toggleBadgesMutation.mutate({
                              id: prop._id,
                              isVerified: !prop.isVerified,
                            })
                          }
                          title={prop.isVerified ? 'Remove Verified' : 'Mark Verified'}
                          className={`p-1 rounded-md border transition-colors ${
                            prop.isVerified
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-slate-50 text-slate-300 border-slate-200 hover:text-slate-500'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>

                        {/* Featured Badge */}
                        <button
                          onClick={() =>
                            toggleBadgesMutation.mutate({
                              id: prop._id,
                              isFeatured: !prop.isFeatured,
                            })
                          }
                          title={prop.isFeatured ? 'Remove Featured' : 'Mark Featured'}
                          className={`p-1 rounded-md border transition-colors ${
                            prop.isFeatured
                              ? 'bg-amber-50 text-amber-600 border-amber-300'
                              : 'bg-slate-50 text-slate-300 border-slate-200 hover:text-slate-500'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Expires */}
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(prop.expiresAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setInspectProperty(prop)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {prop.status === 'EXPIRED' && (
                          <button
                            onClick={() => renewMutation.mutate(prop._id)}
                            className="p-1 rounded hover:bg-slate-100 text-teal-600 hover:text-teal-800"
                            title="Renew 90 Days"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <a
                          href={`${publicUrl}/property/${prop.slug || prop._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                          title="View on site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Building2}
                      title="No listings found"
                      description="No properties match your current filter settings."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page <strong className="text-slate-800">{meta.page}</strong> of{' '}
              <strong className="text-slate-800">{meta.totalPages}</strong> ({meta.totalCount} total)
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="py-1 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-medium flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="py-1 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-medium flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Property Details Modal */}
      {inspectProperty && (
        <Modal
          isOpen={Boolean(inspectProperty)}
          onClose={() => setInspectProperty(null)}
          title={inspectProperty.title}
          subtitle={`${inspectProperty.localityName || 'Nagpur'} · ID: ${inspectProperty._id}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Price</span>
                <span className="font-bold text-slate-900">
                  {formatIndianPrice(inspectProperty.price)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Area</span>
                <span className="font-semibold text-slate-800">
                  {inspectProperty.areaSqFt} Sq.Ft
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Type</span>
                <span className="font-semibold text-slate-800">
                  {inspectProperty.subtype}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Status</span>
                <span className="font-semibold text-slate-800">
                  {inspectProperty.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="font-semibold text-slate-700">Address: </span>
                <span className="text-slate-600">{inspectProperty.address}, Nagpur - {inspectProperty.pincode}</span>
              </div>
              {inspectProperty.reraNumber && (
                <div>
                  <span className="font-semibold text-slate-700">RERA: </span>
                  <span className="font-mono text-teal-700 font-semibold">{inspectProperty.reraNumber}</span>
                </div>
              )}
              {inspectProperty.description && (
                <div>
                  <span className="font-semibold text-slate-700">Description: </span>
                  <p className="text-slate-600 mt-1 p-2.5 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                    {inspectProperty.description}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Status Change */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Change Status:</span>
              <div className="flex items-center space-x-1.5">
                {['LIVE', 'EXPIRED', 'SOLD', 'DRAFT'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      statusMutation.mutate({ id: inspectProperty._id, status: st });
                      setInspectProperty(null);
                    }}
                    className={`py-1 px-2.5 rounded text-[11px] font-semibold border transition-colors ${
                      inspectProperty.status === st
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ListingsManagementPage;
