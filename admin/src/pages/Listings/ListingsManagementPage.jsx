import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Building2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  MoreVertical,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Tag,
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
      alert('Listing successfully renewed for 90 days validity.');
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nagpur Property Listings"
        subtitle="Manage inventory, toggle verified & featured badges, renew expirations, and audit specifications"
        icon={Building2}
        breadcrumbs={[{ label: 'Listings' }]}
        actions={
          <Link
            to="/listings/new"
            className="inline-flex items-center space-x-1.5 py-2 px-4 rounded-xl bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, locality name, or RERA number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:bg-white transition-all"
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
            className="py-2.5 px-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none"
          >
            <option value="">All Statuses</option>
            <option value="LIVE">LIVE</option>
            <option value="PENDING_REVIEW">PENDING_REVIEW</option>
            <option value="REJECTED">REJECTED</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="SOLD">SOLD</option>
            <option value="RENTED">RENTED</option>
            <option value="DRAFT">DRAFT</option>
          </select>

          {/* Purpose Filter */}
          <select
            value={purposeFilter}
            onChange={(e) => {
              setPurposeFilter(e.target.value);
              setPage(1);
            }}
            className="py-2.5 px-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none"
          >
            <option value="">Buy & Rent</option>
            <option value="BUY">BUY Only</option>
            <option value="RENT">RENT Only</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
              <tr>
                <th className="py-4 px-4">Property</th>
                <th className="py-4 px-4">Locality</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Badges</th>
                <th className="py-4 px-4">Owner / Agent</th>
                <th className="py-4 px-4">Expires</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    Loading property listings...
                  </td>
                </tr>
              ) : listings.length > 0 ? (
                listings.map((prop) => (
                  <tr key={prop._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Property Thumbnail & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
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
                          <p className="font-bold text-slate-900 truncate">{prop.title}</p>
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-semibold">{prop.purpose}</span>
                            <span>&bull;</span>
                            <span>{prop.subtype}</span>
                            {prop.bedrooms > 0 && <span>&bull; {prop.bedrooms} BHK</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Locality */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 text-slate-700 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{prop.localityName || 'Nagpur'}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-black text-brand-orange whitespace-nowrap">
                      {formatIndianPrice(prop.price)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <Badge status={prop.status} />
                    </td>

                    {/* Badges Toggles */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Verified Badge */}
                        <button
                          onClick={() =>
                            toggleBadgesMutation.mutate({
                              id: prop._id,
                              isVerified: !prop.isVerified,
                            })
                          }
                          title={prop.isVerified ? 'Remove Verified Badge' : 'Grant Verified Badge'}
                          className={`p-1.5 rounded-xl border transition-all ${
                            prop.isVerified
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                              : 'bg-slate-50 text-slate-300 border-slate-200 hover:text-slate-500'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>

                        {/* Featured Badge */}
                        <button
                          onClick={() =>
                            toggleBadgesMutation.mutate({
                              id: prop._id,
                              isFeatured: !prop.isFeatured,
                            })
                          }
                          title={prop.isFeatured ? 'Remove Featured Status' : 'Feature for 30 Days'}
                          className={`p-1.5 rounded-xl border transition-all ${
                            prop.isFeatured
                              ? 'bg-amber-50 text-amber-600 border-amber-300 shadow-xs'
                              : 'bg-slate-50 text-slate-300 border-slate-200 hover:text-slate-500'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Owner / Agent */}
                    <td className="py-3 px-4 text-xs">
                      <span className="font-bold text-slate-800 block truncate">
                        {prop.owner?.name || 'Owner'}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {prop.owner?.phone ? `+91 ${prop.owner.phone}` : '—'}
                      </span>
                    </td>

                    {/* Expiration date */}
                    <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                      {prop.expiresAt ? formatDate(prop.expiresAt) : '—'}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setInspectProperty(prop)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-teal hover:bg-teal-50 transition-colors"
                          title="View Specs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => renewMutation.mutate(prop._id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-orange hover:bg-orange-50 transition-colors"
                          title="Renew 90 Days"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        {prop.status === 'LIVE' && (
                          <button
                            onClick={() => {
                              if (window.confirm('Mark this listing as SOLD?')) {
                                statusMutation.mutate({ id: prop._id, status: 'SOLD' });
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Mark Sold"
                          >
                            <Tag className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Building2}
                      title="No listings matched"
                      description="Try clearing your search query or changing status filters."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing page <strong className="text-slate-800">{meta.page}</strong> of{' '}
              <strong className="text-slate-800">{meta.totalPages}</strong> ({meta.totalCount} total listings)
            </span>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-bold flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-bold flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Property Specs Modal */}
      {inspectProperty && (
        <Modal
          isOpen={Boolean(inspectProperty)}
          onClose={() => setInspectProperty(null)}
          title={inspectProperty.title}
          subtitle={`Property ID: ${inspectProperty._id} · Locality: ${inspectProperty.localityName}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Price</span>
                <span className="text-sm font-black text-brand-orange">
                  {formatIndianPrice(inspectProperty.price)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Area</span>
                <span className="font-bold text-slate-800">{inspectProperty.areaSqFt} Sq.Ft</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Bedrooms</span>
                <span className="font-bold text-slate-800">{inspectProperty.bedrooms || 0} BHK</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Furnishing</span>
                <span className="font-bold text-slate-800">{inspectProperty.furnishing}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p>
                <strong className="text-slate-700">Full Address: </strong>
                <span className="text-slate-600">{inspectProperty.address}, Nagpur - {inspectProperty.pincode}</span>
              </p>
              <p>
                <strong className="text-slate-700">MahaRERA: </strong>
                <span className="font-mono text-brand-teal font-bold">{inspectProperty.reraNumber || 'None'}</span>
              </p>
              <p>
                <strong className="text-slate-700">Status: </strong>
                <Badge status={inspectProperty.status} />
              </p>
              <div>
                <strong className="text-slate-700">Description: </strong>
                <p className="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 leading-relaxed">
                  {inspectProperty.description}
                </p>
              </div>
            </div>

            {inspectProperty.images?.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Photos ({inspectProperty.images.length})
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {inspectProperty.images.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={`img-${i}`}
                      className="w-full h-20 object-cover rounded-xl border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ListingsManagementPage;
