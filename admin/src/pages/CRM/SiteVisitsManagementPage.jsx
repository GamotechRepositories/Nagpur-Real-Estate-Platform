import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Clock,
  MapPin,
  Check,
  X,
  Phone,
  User,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

export const SiteVisitsManagementPage = () => {
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

      {/* Grid of Visits */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : visits && visits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visits.map((visit) => (
            <div
              key={visit._id}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                {/* Status + Date */}
                <div className="flex items-center justify-between">
                  <Badge status={visit.status} />
                  <span className="text-[11px] text-slate-400">
                    {formatDate(visit.createdAt)}
                  </span>
                </div>

                {/* Property Title */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {visit.property?.title || 'Property'}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{visit.property?.localityName || 'Nagpur'}</span>
                  </div>
                </div>

                {/* Visit Preferred Slot Card */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5 text-xs">
                  <Clock className="w-4 h-4 text-teal-700 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {formatDate(visit.preferredDate)} &bull; {visit.preferredTimeSlot}
                    </span>
                  </div>
                </div>

                {/* Contacts */}
                <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Buyer:</span>
                    <span className="font-medium text-slate-800">
                      {visit.buyer?.name || 'Buyer'} {visit.buyer?.phone ? `(${visit.buyer.phone})` : ''}
                    </span>
                  </div>

                  {visit.assignedAgent && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Agent:</span>
                      <span className="font-medium text-slate-800">
                        {visit.assignedAgent.name}
                      </span>
                    </div>
                  )}

                  {visit.feedbackNotes && (
                    <div className="pt-1 text-[11px] text-slate-500 italic">
                      Notes: {visit.feedbackNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5 pt-2 border-t border-slate-100">
                {visit.status === 'REQUESTED' && (
                  <>
                    <button
                      onClick={() => handleOpenUpdate(visit, 'CONFIRMED')}
                      className="flex-1 py-1 px-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleOpenUpdate(visit, 'CANCELLED')}
                      className="py-1 px-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {visit.status === 'CONFIRMED' && (
                  <>
                    <button
                      onClick={() => handleOpenUpdate(visit, 'COMPLETED')}
                      className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleOpenUpdate(visit, 'CANCELLED')}
                      className="py-1 px-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {(visit.status === 'COMPLETED' || visit.status === 'CANCELLED') && (
                  <button
                    onClick={() => handleOpenUpdate(visit, visit.status)}
                    className="w-full py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                  >
                    Edit Feedback
                  </button>
                )}
              </div>
            </div>
          ))}
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
