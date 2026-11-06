import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  User,
  Calendar,
  MessageSquare,
  Building,
  Check,
  X,
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
    <div className="space-y-6">
      <PageHeader
        title="Physical Site Visits Schedule"
        subtitle="Coordinate on-ground property inspections with buyers, owners, and assigned field agents"
        icon={CalendarDays}
        breadcrumbs={[{ label: 'Site Visits' }]}
        actions={
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold shadow-xs">
            {['', 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`py-1.5 px-3 rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-brand-orange'
                }`}
              >
                {st === '' ? 'All Visits' : st}
              </button>
            ))}
          </div>
        }
      />

      {/* Grid of Visits */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-56 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : visits && visits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visits.map((visit) => (
            <div
              key={visit._id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Status + Date */}
                <div className="flex items-center justify-between">
                  <Badge status={visit.status} />
                  <span className="text-[11px] text-slate-400 font-medium">
                    Requested {formatDate(visit.createdAt)}
                  </span>
                </div>

                {/* Property Title */}
                <div>
                  <h3 className="text-sm font-black text-slate-900 line-clamp-1">
                    {visit.property?.title || 'Nagpur Property'}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{visit.property?.localityName || 'Nagpur'}</span>
                  </div>
                </div>

                {/* Visit Preferred Slot Card */}
                <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-2xl flex items-center space-x-3 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">
                      Preferred Schedule
                    </span>
                    <strong className="text-brand-navy font-black">
                      {formatDate(visit.preferredDate)} &bull; {visit.preferredTimeSlot}
                    </strong>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Visitor:</span>
                    <strong className="text-slate-800">{visit.customerName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-mono font-semibold text-brand-orange">+91 {visit.phoneNumber}</span>
                  </div>
                  {visit.feedbackNotes && (
                    <div className="pt-1 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl">
                      "{visit.feedbackNotes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <a
                    href={`tel:+91${visit.phoneNumber}`}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold text-center flex items-center justify-center space-x-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`https://wa.me/91${visit.phoneNumber}?text=Hello%20${encodeURIComponent(visit.customerName)},%20confirming%20your%20site%20visit%20scheduled%20for%20${visit.preferredTimeSlot}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-center flex items-center justify-center space-x-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="flex items-center space-x-2">
                  {visit.status === 'REQUESTED' && (
                    <button
                      onClick={() => handleOpenUpdate(visit, 'CONFIRMED')}
                      className="w-full py-2 px-3 rounded-xl bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Visit</span>
                    </button>
                  )}

                  {visit.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleOpenUpdate(visit, 'COMPLETED')}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Completed</span>
                    </button>
                  )}

                  {visit.status !== 'CANCELLED' && visit.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleOpenUpdate(visit, 'CANCELLED')}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-rose-200 transition-colors"
                      title="Cancel Visit"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
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
              ? `There are currently no visits marked as ${statusFilter}.`
              : 'No prospective buyer visits have been requested yet.'
          }
        />
      )}

      {/* Update Visit Modal */}
      {updateModalVisit && (
        <Modal
          isOpen={Boolean(updateModalVisit)}
          onClose={() => setUpdateModalVisit(null)}
          title={`Update Visit Status: ${newStatus}`}
          subtitle={`Customer: ${updateModalVisit.customerName} · Property: ${updateModalVisit.property?.title || 'Nagpur'}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Feedback Notes & Inspection Remarks
              </label>
              <textarea
                rows={3}
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Buyer feedback, agent attendance, property key handover details..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUpdateModalVisit(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="py-2 px-5 rounded-xl bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold shadow-md"
              >
                {mutation.isPending ? 'Updating...' : `Save as ${newStatus}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SiteVisitsManagementPage;
