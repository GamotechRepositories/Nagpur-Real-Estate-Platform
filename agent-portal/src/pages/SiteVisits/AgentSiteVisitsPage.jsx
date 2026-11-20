import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Clock,
  MapPin,
  Check,
  X,
  Phone,
  User,
  Eye,
  MessageCircle,
  Search,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

export const AgentSiteVisitsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updateModalVisit, setUpdateModalVisit] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');

  // Fetch site visits
  const { data: visitsResponse, isLoading } = useQuery({
    queryKey: ['agent-site-visits', statusFilter],
    queryFn: async () => {
      const url = statusFilter ? `/site-visits?status=${statusFilter}` : '/site-visits';
      const res = await apiClient.get(url);
      const list = res?.data !== undefined ? (Array.isArray(res.data) ? res.data : res.data?.data) : (Array.isArray(res) ? res : res?.data);
      return Array.isArray(list) ? list : [];
    },
  });

  const visits = Array.isArray(visitsResponse) ? visitsResponse : [];

  // Filter and sort visits
  const filteredVisits = useMemo(() => {
    if (!visits) return [];
    return visits.filter((v) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const custName = (v.customerName || v.user?.name || '').toLowerCase();
      const custPhone = (v.phoneNumber || v.user?.phone || '');
      const propTitle = (v.property?.title || '').toLowerCase();
      const locality = (v.property?.localityName || '').toLowerCase();
      return custName.includes(q) || custPhone.includes(q) || propTitle.includes(q) || locality.includes(q);
    });
  }, [visits, search]);

  // Ensure latest site visits are strictly shown at the top
  const sortedVisits = useMemo(() => {
    return [...filteredVisits].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.preferredDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.preferredDate || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredVisits]);

  // Update Status / Feedback Mutation
  const mutation = useMutation({
    mutationFn: async ({ id, status, feedback }) => {
      return apiClient.patch(`/site-visits/${id}`, { status, feedbackNotes: feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-site-visits']);
      queryClient.invalidateQueries(['agent-stats']);
      setUpdateModalVisit(null);
      setFeedbackNotes('');
    },
  });

  const handleOpenUpdate = (visit, targetStatus) => {
    setUpdateModalVisit(visit);
    setNewStatus(targetStatus);
    setFeedbackNotes(visit.feedbackNotes || '');
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!updateModalVisit || !newStatus) return;
    mutation.mutate({
      id: updateModalVisit._id,
      status: newStatus,
      feedback: feedbackNotes.trim(),
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header with Breadcrumb and Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs text-slate-500 mb-1">
            <span>Agent Workspace &bull; {user?.name || 'Sharma Real Estate Consultants'}</span>
            <span className="mx-2">&gt;</span>
            <span className="text-slate-800 font-medium">Site Visits</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Site Visits
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage scheduled property inspections
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 max-w-full">
          {/* Status Filters Capsule */}
          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-medium shadow-2xs overflow-x-auto max-w-full scrollbar-none">
            {['', 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`py-1 px-2.5 rounded-md transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === '' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search property, buyer, or locality..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:border-teal-600 outline-none bg-white shadow-2xs"
          />
        </div>
      </div>

      {/* Site Visits Row-based Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-14 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : sortedVisits && sortedVisits.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Property & Locality</th>
                  <th className="py-3 px-3">Preferred Date & Slot</th>
                  <th className="py-3 px-3">Buyer Details</th>
                  <th className="py-3 px-3">Assigned Agent</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Notes / Feedback</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedVisits.map((visit) => {
                  const custPhone = visit.phoneNumber || visit.user?.phone || '';
                  const cleanPhone = custPhone.replace(/[^0-9]/g, '');
                  const buyerName = visit.customerName || visit.user?.name || 'Customer';
                  const propTitle = visit.property?.title || 'Property';

                  return (
                    <tr
                      key={visit._id}
                      onClick={() => navigate(`/site-visits/view/${visit._id}`)}
                      className="hover:bg-slate-50/80 transition group cursor-pointer"
                    >
                      {/* Property & Locality */}
                      <td className="py-3 px-4">
                        <div className="min-w-0 max-w-xs">
                          <h4 className="font-bold text-slate-900 group-hover:text-teal-700 transition truncate text-xs">
                            {propTitle}
                          </h4>
                          <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{visit.property?.localityName || 'Nagpur'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Preferred Date & Slot */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100/80 border border-slate-200/60 font-medium text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                          <span>{formatDate(visit.preferredDate)} &bull; {visit.preferredTimeSlot}</span>
                        </div>
                      </td>

                      {/* Buyer Details */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">
                          {buyerName}
                        </div>
                        {custPhone && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            +91 {custPhone}
                          </div>
                        )}
                      </td>

                      {/* Assigned Agent */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {visit.assignedAgent ? (
                          <div className="font-medium text-slate-800">
                            {visit.assignedAgent.name}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Assigned to You</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={visit.status}
                          onChange={(e) => {
                            const targetStatus = e.target.value;
                            mutation.mutate({
                              id: visit._id,
                              status: targetStatus,
                              feedback: visit.feedbackNotes,
                            });
                          }}
                          disabled={mutation.isPending}
                          className={`text-[11px] font-bold px-2 py-1 rounded-md border outline-none cursor-pointer transition-colors shadow-2xs ${
                            visit.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : visit.status === 'COMPLETED'
                              ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                              : visit.status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          <option value="REQUESTED">REQUESTED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <div className="text-[10px] text-slate-400 mt-1 pl-0.5">
                          {formatDate(visit.createdAt)}
                        </div>
                      </td>

                      {/* Notes / Feedback */}
                      <td className="py-3 px-3 max-w-[200px]">
                        {visit.feedbackNotes ? (
                          <span className="text-[11px] text-slate-600 line-clamp-2 italic" title={visit.feedbackNotes}>
                            "{visit.feedbackNotes}"
                          </span>
                        ) : visit.cancellationReason ? (
                          <span className="text-[11px] text-rose-600 line-clamp-2 italic" title={visit.cancellationReason}>
                            Reason: "{visit.cancellationReason}"
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                                `Hello ${buyerName}, regarding your site visit scheduled for "${propTitle}" on Nagpur Real Estate:`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenUpdate(visit, visit.status)}
                            className="py-1 px-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium"
                            title="Add / Edit Feedback Notes"
                          >
                            Notes
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/site-visits/view/${visit._id}`)}
                            className="py-1 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center space-x-1"
                            title="View Inspection Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs">
          <CalendarDays size={42} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No site visits found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {statusFilter
              ? `No site visits found in ${statusFilter.toLowerCase()} status.`
              : 'No scheduled property site visits yet.'}
          </p>
        </div>
      )}

      {/* Update Visit Modal */}
      {updateModalVisit && (
        <Modal
          isOpen={Boolean(updateModalVisit)}
          onClose={() => setUpdateModalVisit(null)}
          title="Update Visit Status"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-3">
                Property: <strong className="text-slate-800">{updateModalVisit.property?.title || 'Inspection'}</strong>
              </p>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium bg-white outline-none focus:border-slate-400"
              >
                <option value="REQUESTED">Requested</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspection Feedback / Notes
              </label>
              <textarea
                rows={3}
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Enter feedback or outcome of visit..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUpdateModalVisit(null)}
                className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="py-1.5 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {mutation.isPending ? 'Updating...' : 'Save Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AgentSiteVisitsPage;
