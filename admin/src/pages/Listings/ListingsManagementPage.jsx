import React, { useState, useEffect } from 'react';
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
  Phone,
  MessageSquare,
  Lock,
  UserCheck,
  User,
  Users,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatIndianPrice, formatDate } from '../../utils/formatters';

export const ListingsManagementPage = () => {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [inspectProperty, setInspectProperty] = useState(null);
  const [isEditingReps, setIsEditingReps] = useState(false);
  const [selectedRepIds, setSelectedRepIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: 'Notice', message: '' });

  // Fetch Available Certified Agents for Allocation
  const { data: agents = [] } = useQuery({
    queryKey: ['admin-agents-reps-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get('/agents');
      return res.data?.data || [];
    },
  });

  // Fetch Available Staff Members
  const { data: staffMembers = [] } = useQuery({
    queryKey: ['admin-staff-reps-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/staff?limit=100');
      return res.data?.data || [];
    },
  });

  const handleOpenInspect = (prop) => {
    setInspectProperty(prop);
    setIsEditingReps(false);
    const repIds = [];
    if (prop.assignedAgents && prop.assignedAgents.length > 0) {
      prop.assignedAgents.forEach((a) => {
        const id = (a._id || a)?.toString();
        if (id && !repIds.includes(id)) repIds.push(id);
      });
    } else if (prop.assignedAgent) {
      const id = (prop.assignedAgent._id || prop.assignedAgent)?.toString();
      if (id) repIds.push(id);
    }
    setSelectedRepIds(repIds);
  };

  const getRepDetails = (rep) => {
    const id = (rep?._id || rep)?.toString();
    const agentMatch = agents.find((a) => (a.user?._id || a.user)?.toString() === id);
    if (agentMatch) {
      return {
        id,
        name: agentMatch.user?.name || agentMatch.agencyName || 'Certified Agent',
        phone: agentMatch.user?.phone || agentMatch.contactPhone || '',
        role: 'AGENT',
        label: agentMatch.agencyName ? `Agent • ${agentMatch.agencyName}` : 'Certified Broker',
      };
    }
    const staffMatch = staffMembers.find((s) => s._id?.toString() === id);
    if (staffMatch) {
      return {
        id,
        name: staffMatch.name || 'Operations Staff',
        phone: staffMatch.phone || '',
        role: 'STAFF',
        label: staffMatch.designation || staffMatch.role || 'Staff Member',
      };
    }
    if (typeof rep === 'object' && rep?.name) {
      return {
        id,
        name: rep.name,
        phone: rep.phone || '',
        role: rep.role || 'REPRESENTATIVE',
        label: rep.role === 'AGENT' ? 'Certified Agent' : (rep.role || 'Staff Member'),
      };
    }
    return {
      id,
      name: 'Operations Representative',
      phone: '',
      role: 'STAFF',
      label: 'Staff Member',
    };
  };

  const updateRepsMutation = useMutation({
    mutationFn: async ({ id, assignedAgents }) => {
      const res = await apiClient.patch(`/admin/listings/${id}/representatives`, { assignedAgents });
      return res.data?.data;
    },
    onSuccess: (updatedProperty) => {
      queryClient.invalidateQueries(['admin-listings']);
      setInspectProperty(updatedProperty);
      setIsEditingReps(false);
      setAlertModal({ isOpen: true, title: 'Success', message: 'Allocated representatives updated successfully!' });
    },
    onError: (err) => {
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: err.response?.data?.message || err.message || 'Failed to update allocated representatives.',
      });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (id) => {
      return apiClient.delete(`/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-listings']);
      setDeleteModal({ isOpen: false, item: null });
    },
    onError: (err) => {
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: err.response?.data?.message || err.message || 'Failed to delete listing.',
      });
    },
  });

  // 300ms Debounce search to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data: response, isLoading, isFetching } = useQuery({
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
    placeholderData: (previousData) => previousData,
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
                <th className="py-3 px-3">Owner / Client</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Badges</th>
                <th className="py-3 px-3">Expires</th>
                <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && !listings.length ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-2.5 px-3 sm:px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 flex-shrink-0" />
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="h-3.5 bg-slate-200 rounded w-44" />
                          <div className="h-2.5 bg-slate-100 rounded w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3"><div className="h-3 bg-slate-200 rounded w-20" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 bg-slate-200 rounded w-16" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 bg-slate-200 rounded w-24" /></td>
                    <td className="py-2.5 px-3"><div className="h-4 bg-slate-200 rounded-md w-14" /></td>
                    <td className="py-2.5 px-3"><div className="h-4 bg-slate-200 rounded w-12 mx-auto" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 bg-slate-200 rounded w-16" /></td>
                    <td className="py-2.5 px-3 sm:px-4 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                  </tr>
                ))
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
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                              No pic
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <Link
                            to={`/listings/view/${prop._id}`}
                            className="font-semibold text-slate-900 truncate hover:text-teal-700 block transition"
                            title="View Property Details"
                          >
                            {prop.title}
                          </Link>
                          <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                            <span>{prop.purpose}</span>
                            <span>&bull;</span>
                            <span>{prop.subtype}</span>
                            {prop.bedrooms > 0 && <span>&bull; {prop.bedrooms} BHK</span>}
                            {prop.project && (
                              <span className="text-teal-700 font-semibold bg-teal-50 px-1 rounded border border-teal-200">
                                {prop.project.name || 'Project'}
                              </span>
                            )}
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

                    {/* Owner / Client (Confidential) */}
                    <td className="py-2.5 px-3">
                      {prop.clientSellerDetails?.name ? (
                        <div className="max-w-[140px]">
                          <p className="font-semibold text-slate-900 truncate">
                            {prop.clientSellerDetails.name}
                          </p>
                          <p className="text-[11px] font-mono text-slate-500">
                            {prop.clientSellerDetails.phone || 'No phone'}
                          </p>
                          <span className="inline-block text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded">
                            Client Info
                          </span>
                        </div>
                      ) : prop.owner ? (
                        <div className="max-w-[140px]">
                          <p className="font-semibold text-slate-900 truncate">
                            {prop.owner.name}
                          </p>
                          <p className="text-[11px] font-mono text-slate-500">
                            {prop.owner.phone || 'No phone'}
                          </p>
                          <span className="inline-block text-[9px] font-semibold text-slate-600 bg-slate-100 px-1 rounded">
                            {prop.owner.role === 'USER' ? 'Citizen/Owner' : prop.owner.role || 'Owner'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">System / Admin</span>
                      )}
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
                        <Link
                          to={`/listings/view/${prop._id}`}
                          className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          to={`/listings/edit/${prop._id}`}
                          className="p-1 rounded hover:bg-teal-50 text-slate-500 hover:text-teal-700 transition"
                          title="Edit Listing"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => setDeleteModal({ isOpen: true, item: prop })}
                          className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Property"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Inspect Property Details Modal (Disabled in favor of /listings/edit/:id) */}
      {false && (
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
              {inspectProperty.project && (
                <div>
                  <span className="font-semibold text-slate-700">Project / Scheme: </span>
                  <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {inspectProperty.project.name || inspectProperty.project}
                  </span>
                </div>
              )}
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

            {/* Confidential Homeowner / Client Details */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs">
                  <UserCheck className="w-4 h-4 text-amber-700" />
                  <span>Property Owner / Client Details (Confidential)</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-amber-700" />
                  <span>Hidden from Public</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Seller / Owner Name</span>
                  <span className="font-semibold text-slate-900">
                    {inspectProperty.clientSellerDetails?.name || inspectProperty.owner?.name || 'Homeowner'}
                  </span>
                  {inspectProperty.owner?.role && (
                    <span className="text-[10px] text-slate-500 block">
                      Account Type: {inspectProperty.owner.role}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Contact Number</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-mono font-semibold text-slate-900">
                      {inspectProperty.clientSellerDetails?.phone || inspectProperty.owner?.phone || 'N/A'}
                    </span>
                    {(inspectProperty.clientSellerDetails?.phone || inspectProperty.owner?.phone) && (
                      <div className="flex items-center space-x-1">
                        <a
                          href={`tel:+91${inspectProperty.clientSellerDetails?.phone || inspectProperty.owner?.phone}`}
                          className="p-1 rounded bg-teal-100 hover:bg-teal-200 text-teal-800"
                          title="Call Owner"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://wa.me/91${inspectProperty.clientSellerDetails?.phone || inspectProperty.owner?.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded bg-green-100 hover:bg-green-200 text-green-800"
                          title="WhatsApp Owner"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {inspectProperty.clientSellerDetails?.email && (
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">Owner Email</span>
                    <span className="text-slate-800">{inspectProperty.clientSellerDetails.email}</span>
                  </div>
                )}

                {inspectProperty.clientSellerDetails?.notes && (
                  <div className="sm:col-span-2 bg-white/80 p-2 rounded border border-amber-200/60">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">Internal Seller Notes</span>
                    <p className="text-slate-700 italic text-xs">{inspectProperty.clientSellerDetails.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Allocated Representatives (Multi-Agent Support & Reallocation) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-teal-700" />
                  <span className="font-bold text-slate-900">
                    Allocated Representatives ({selectedRepIds.length || (inspectProperty.assignedAgents?.length || (inspectProperty.assignedAgent ? 1 : 0))})
                  </span>
                </div>
                {!isEditingReps ? (
                  <button
                    type="button"
                    onClick={() => {
                      const repIds = [];
                      if (inspectProperty.assignedAgents?.length > 0) {
                        inspectProperty.assignedAgents.forEach((a) => {
                          const id = (a._id || a)?.toString();
                          if (id && !repIds.includes(id)) repIds.push(id);
                        });
                      } else if (inspectProperty.assignedAgent) {
                        const id = (inspectProperty.assignedAgent._id || inspectProperty.assignedAgent)?.toString();
                        if (id) repIds.push(id);
                      }
                      setSelectedRepIds(repIds);
                      setIsEditingReps(true);
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold transition shadow-xs cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change / Add Multiple</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setIsEditingReps(false)}
                      className="px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-200/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={updateRepsMutation.isPending}
                      onClick={() => {
                        updateRepsMutation.mutate({
                          id: inspectProperty._id,
                          assignedAgents: selectedRepIds,
                        });
                      }}
                      className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>{updateRepsMutation.isPending ? 'Saving...' : 'Save Allocation'}</span>
                    </button>
                  </div>
                )}
              </div>

              {!isEditingReps ? (
                // View Mode
                <div className="space-y-2">
                  {(() => {
                    const activeReps =
                      inspectProperty.assignedAgents && inspectProperty.assignedAgents.length > 0
                        ? inspectProperty.assignedAgents
                        : inspectProperty.assignedAgent
                        ? [inspectProperty.assignedAgent]
                        : [];

                    if (!activeReps.length) {
                      return (
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
                          <span>Desk Team (Default) — No specific partner allocated yet.</span>
                          <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unallocated
                          </span>
                        </div>
                      );
                    }

                    return activeReps.map((rep, idx) => {
                      const details = getRepDetails(rep);
                      const isPrimary = idx === 0;
                      return (
                        <div
                          key={details.id || idx}
                          className={`p-2.5 rounded-lg flex items-center justify-between ${
                            isPrimary
                              ? 'bg-teal-50/80 border border-teal-200/90'
                              : 'bg-white border border-slate-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900 truncate">{details.name}</span>
                              <span className="text-[10px] text-slate-500">({details.label})</span>
                            </div>
                            {details.phone && (
                              <div className="text-[11px] font-mono text-slate-600">
                                📞 +91 {details.phone}
                              </div>
                            )}
                          </div>
                          <div>
                            {isPrimary ? (
                              <span className="text-[10px] font-semibold text-teal-800 bg-teal-100 border border-teal-300 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                Primary • Public Contact
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                Co-assigned Partner
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                // Edit Mode (Add Multiple, Reorder Primary, Remove)
                <div className="space-y-3 bg-white p-3 rounded-lg border border-teal-200">
                  {/* List of currently selected representatives */}
                  <div className="space-y-1.5">
                    {selectedRepIds.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-1">No representatives selected. Add one below.</p>
                    ) : (
                      selectedRepIds.map((repId, idx) => {
                        const details = getRepDetails(repId);
                        const isPrimary = idx === 0;
                        return (
                          <div
                            key={repId}
                            className={`p-2 rounded-lg flex items-center justify-between border ${
                              isPrimary
                                ? 'bg-teal-50/80 border-teal-300'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate">
                                  {details.name}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {details.label} {details.phone ? `• +91 ${details.phone}` : ''}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              {isPrimary ? (
                                <span className="text-[9px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                                  PRIMARY
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Move this rep to index 0
                                    setSelectedRepIds((prev) => [
                                      repId,
                                      ...prev.filter((id) => id !== repId),
                                    ]);
                                  }}
                                  className="text-[10px] font-semibold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                                  title="Make this representative primary"
                                >
                                  Make Primary
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRepIds((prev) => prev.filter((id) => id !== repId));
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Remove representative"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add New Representative Dropdown */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      + Add Representative (Choose Agent or Staff)
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        const newId = e.target.value;
                        if (newId && !selectedRepIds.includes(newId)) {
                          setSelectedRepIds((prev) => [...prev, newId]);
                        }
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-teal-600 outline-none"
                    >
                      <option value="">-- Choose to add an agent or staff member --</option>
                      <optgroup label="🏢 Certified Real Estate Agents">
                        {agents
                          .filter((agent) => {
                            const uId = (agent.user?._id || agent.user)?.toString();
                            return !selectedRepIds.includes(uId);
                          })
                          .map((agent) => {
                            const userId = (agent.user?._id || agent.user)?.toString();
                            const userName = agent.user?.name || agent.agencyName || 'Agent';
                            const userPhone = agent.user?.phone || agent.contactPhone || '';
                            return (
                              <option key={agent._id} value={userId}>
                                {userName} {agent.agencyName ? `(${agent.agencyName})` : ''} — {userPhone}
                              </option>
                            );
                          })}
                      </optgroup>
                      <optgroup label="🛡️ Administrative Staff Members">
                        {staffMembers
                          .filter((staff) => !selectedRepIds.includes(staff._id?.toString()))
                          .map((staff) => (
                            <option key={staff._id} value={staff._id}>
                              {staff.name} ({staff.designation || staff.role}) — {staff.phone || staff.email}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>
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

      {/* In-App Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={() => deletePropertyMutation.mutate(deleteModal.item?._id)}
        title="Delete Property Listing"
        message={`Are you sure you want to delete "${deleteModal.item?.title || 'this listing'}"?`}
        confirmText="Delete"
        isLoading={deletePropertyMutation.isPending}
      />

      {/* In-App Alert / Notice Modal */}
      <ConfirmModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
        title={alertModal.title}
        message={alertModal.message}
        type="info"
      />
    </div>
  );
};

export default ListingsManagementPage;
