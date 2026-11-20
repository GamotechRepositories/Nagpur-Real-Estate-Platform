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
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

export const SiteVisitsManagementPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [updateModalVisit, setUpdateModalVisit] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const { data: visits, isLoading } = useQuery({
    queryKey: ['admin-site-visits', statusFilter],
    queryFn: async () => {
      const res = await apiClient.get(`/site-visits${statusFilter ? `?status=${statusFilter}` : ''}`);
      return res.data?.data || [];
    },
  });

  // Ensure latest site visits are strictly shown at the top
  const sortedVisits = useMemo(() => {
    if (!visits) return [];
    return [...visits].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.preferredDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.preferredDate || 0).getTime();
      return dateB - dateA;
    });
  }, [visits]);

  const mutation = useMutation({
    mutationFn: async ({ id, status, feedback }) => {
      return apiClient.patch(`/site-visits/${id}`, { status, feedbackNotes: feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-site-visits']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
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
    <div className="space-y-5">
      <PageHeader
        title="Site Visits"
        subtitle="Manage scheduled property inspections"
        icon={CalendarDays}
        breadcrumbs={[{ label: 'Site Visits' }]}
        actions={
          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-medium">
            {['', 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`py-1 px-2.5 rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === '' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        }
      />

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
            <table className="w-full text-left text-xs text-slate-700">
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
                {sortedVisits.map((visit) => (
                  <tr
                    key={visit._id}
                    onClick={() => navigate(`/site-visits/view/${visit._id}`)}
                    className="hover:bg-slate-50/80 transition group cursor-pointer"
                  >
                    {/* Property */}
                    <td className="py-3 px-4">
                      <div className="min-w-0 max-w-xs">
                        <h4 className="font-bold text-slate-900 group-hover:text-teal-700 transition truncate text-xs">
                          {visit.property?.title || 'Property'}
                        </h4>
                        <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{visit.property?.localityName || 'Nagpur'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Preferred Slot */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100/80 border border-slate-200/60 font-medium text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                        <span>{formatDate(visit.preferredDate)} &bull; {visit.preferredTimeSlot}</span>
                      </div>
                    </td>

                    {/* Buyer */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">
                        {visit.customerName || visit.user?.name || visit.buyer?.name || 'Customer'}
                      </div>
                      {(visit.phoneNumber || visit.user?.phone || visit.buyer?.phone) && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          +91 {visit.phoneNumber || visit.user?.phone || visit.buyer?.phone}
                        </div>
                      )}
                    </td>

                    {/* Agent */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {visit.assignedAgent ? (
                        <div className="font-medium text-slate-800">
                          {visit.assignedAgent.name}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Unassigned</span>
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

                    {/* Feedback / Notes */}
                    <td className="py-3 px-3 max-w-[200px]">
                      {visit.feedbackNotes ? (
                        <span className="text-[11px] text-slate-600 line-clamp-2 italic" title={visit.feedbackNotes}>
                          "{visit.feedbackNotes}"
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        {(visit.phoneNumber || visit.user?.phone || visit.buyer?.phone) && (
                          <a
                            href={`https://wa.me/91${visit.phoneNumber || visit.user?.phone || visit.buyer?.phone}?text=${encodeURIComponent(
                              `Hello ${visit.customerName || visit.user?.name || visit.buyer?.name || 'Customer'}, regarding your site visit scheduled for "${visit.property?.title || 'property'}" on Nagpur Real Estate:`
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
                          title="View Full Inspection Dossier"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="No site visits found"
          description={
            statusFilter
              ? `No site visits found in ${statusFilter.toLowerCase()} status.`
              : 'No scheduled property site visits yet.'
          }
        />
      )}

      {/* Update Visit Modal */}
      {updateModalVisit && (
        <Modal
          isOpen={Boolean(updateModalVisit)}
          onClose={() => setUpdateModalVisit(null)}
          title="Update Visit Status"
          subtitle={`Property: ${updateModalVisit.property?.title || 'Inspection'}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium bg-white"
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

export default SiteVisitsManagementPage;
