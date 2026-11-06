import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  MoreVertical,
} from 'lucide-react';
import apiClient from '../../api/client';
import { formatIndianPrice, formatDate } from '../../utils/formatters';

const ListingsManagementPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-listings', statusFilter, search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('limit', '15');

      const res = await apiClient.get(`/admin/listings?${params.toString()}`);
      return res.data;
    },
  });

  const listings = response?.data || [];
  const meta = response?.meta || { totalPages: 1, totalCount: 0 };

  // Toggle Badges Mutation
  const toggleBadgesMutation = useMutation({
    mutationFn: async ({ id, isFeatured, isVerified }) => {
      return apiClient.patch(`/admin/listings/${id}/badges`, { isFeatured, isVerified });
    },
    onSuccess: () => queryClient.invalidateQueries(['admin-listings']),
  });

  // Renew Listing Mutation
  const renewMutation = useMutation({
    mutationFn: async (id) => apiClient.post(`/admin/listings/${id}/renew`),
    onSuccess: () => {
      alert('Listing renewed for 90 days.');
      queryClient.invalidateQueries(['admin-listings']);
    },
  });

  // Mark Sold / Rented Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => apiClient.post(`/properties/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries(['admin-listings']),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-brand-teal" />
            <span>Property Listings Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, moderate, feature, verify, or renew properties across Nagpur
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, locality..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal w-48 sm:w-60"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="p-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-slate-700"
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
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Property</th>
                <th className="py-3.5 px-4">Locality</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Owner / Agent</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Expires</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">Loading listings...</td>
                </tr>
              ) : listings.length > 0 ? (
                listings.map((prop) => (
                  <tr key={prop._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={prop.coverImage || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          className="w-12 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div className="max-w-xs truncate">
                          <span className="font-bold text-slate-900 block truncate">{prop.title}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {prop.purpose} &middot; {prop.subtype}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Locality */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {prop.localityName}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-brand-navy">
                      {formatIndianPrice(prop.price)}
                    </td>

                    {/* Owner / Agent */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-semibold">{prop.owner?.name || 'Owner'}</div>
                      <span className="text-[10px] text-slate-400">{prop.owner?.phone}</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          prop.status === 'LIVE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : prop.status === 'PENDING_REVIEW'
                            ? 'bg-amber-100 text-amber-700'
                            : prop.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {prop.status}
                      </span>
                    </td>

                    {/* Expiration date */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {prop.expiresAt ? formatDate(prop.expiresAt) : 'N/A'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Toggle Featured */}
                        <button
                          onClick={() => toggleBadgesMutation.mutate({ id: prop._id, isFeatured: !prop.isFeatured })}
                          title="Toggle Featured Badge"
                          className={`p-1.5 rounded-lg border ${prop.isFeatured ? 'bg-orange-50 border-orange-200 text-brand-orange' : 'border-slate-200 text-slate-400 hover:text-slate-700'}`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        {/* Renew 90 days */}
                        <button
                          onClick={() => renewMutation.mutate(prop._id)}
                          title="Renew for 90 days"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Mark Sold */}
                        {prop.status === 'LIVE' && (
                          <button
                            onClick={() => statusMutation.mutate({ id: prop._id, status: 'SOLD' })}
                            className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
                          >
                            Mark Sold
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">No properties found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListingsManagementPage;

