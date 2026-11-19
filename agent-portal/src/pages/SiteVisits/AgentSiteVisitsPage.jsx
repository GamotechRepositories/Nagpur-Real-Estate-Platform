import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Phone,
  MessageCircle,
  Search,
  Building2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { Badge } from '../../components/common/Badge';
import { formatDate, formatCurrency } from '../../utils/formatters';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Inspections' },
  { id: 'REQUESTED', label: 'Requested (Pending)', badgeColor: 'bg-amber-100 text-amber-800' },
  { id: 'CONFIRMED', label: 'Approved & Confirmed', badgeColor: 'bg-emerald-100 text-emerald-800' },
  { id: 'COMPLETED', label: 'Completed', badgeColor: 'bg-blue-100 text-blue-800' },
  { id: 'CANCELLED', label: 'Rejected / Cancelled', badgeColor: 'bg-rose-100 text-rose-800' },
];

export const AgentSiteVisitsPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  // Rejection / Feedback modal state
  const [activeModalVisit, setActiveModalVisit] = useState(null);
  const [modalAction, setModalAction] = useState(''); // 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  const [reasonNotes, setReasonNotes] = useState('');

  // Fetch site visits
  const { data: visitsResponse, isLoading } = useQuery({
    queryKey: ['agent-site-visits', selectedStatus],
    queryFn: async () => {
      const url = selectedStatus === 'ALL' ? '/site-visits' : `/site-visits?status=${selectedStatus}`;
      const res = await apiClient.get(url);
      return res.data?.data || [];
    },
  });

  const visits = Array.isArray(visitsResponse) ? visitsResponse : [];

  // Update Status Mutation (Approve / Reject / Complete)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, feedbackNotes, cancellationReason }) => {
      return apiClient.patch(`/site-visits/${id}`, {
        status,
        feedbackNotes,
        cancellationReason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-site-visits']);
      queryClient.invalidateQueries(['agent-stats']);
      setActiveModalVisit(null);
      setModalAction('');
      setReasonNotes('');
    },
  });

  const handleOpenActionModal = (visit, action) => {
    setActiveModalVisit(visit);
    setModalAction(action);
    setReasonNotes(action === 'CANCELLED' ? (visit.cancellationReason || '') : (visit.feedbackNotes || ''));
  };

  const handleConfirmAction = (e) => {
    e.preventDefault();
    if (!activeModalVisit || !modalAction) return;

    updateStatusMutation.mutate({
      id: activeModalVisit._id,
      status: modalAction,
      feedbackNotes: modalAction !== 'CANCELLED' ? reasonNotes : undefined,
      cancellationReason: modalAction === 'CANCELLED' ? reasonNotes : undefined,
    });
  };

  const filteredVisits = visits.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const custName = (v.customerName || '').toLowerCase();
    const custPhone = (v.phoneNumber || '');
    const propTitle = (v.property?.title || '').toLowerCase();
    return custName.includes(q) || custPhone.includes(q) || propTitle.includes(q);
  });

  const sortedVisits = React.useMemo(() => {
    return [...filteredVisits].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.preferredDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.preferredDate || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredVisits]);

  const getStatusBadge = (st) => {
    switch (st) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-700" />
            Approved & Confirmed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle size={12} className="text-rose-700" />
            Rejected / Cancelled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 size={12} className="text-blue-700" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            <Clock size={12} className="text-amber-700" />
            Requested (Pending)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Site Visits & Property Inspections
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage, approve, and coordinate buyer in-person viewing appointments for your assigned properties.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedStatus === tab.id
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search buyer or property..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:border-teal-600 outline-none bg-white"
          />
        </div>
      </div>

      {/* Visits Table */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading site visits...</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-2xs">
          <CalendarDays size={38} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No site visits found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {selectedStatus === 'ALL'
              ? 'When buyers request a site inspection for your Nagpur listings from the app, appointments will appear here.'
              : `No site visits in "${selectedStatus}" status.`}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Scheduled Date & Slot</th>
                  <th className="px-4 py-3">Buyer Contact</th>
                  <th className="px-4 py-3">Property Details</th>
                  <th className="px-4 py-3">Inspection Status</th>
                  <th className="px-4 py-3 text-right">Approve / Reject Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedVisits.map((visit) => {
                  const custPhone = visit.phoneNumber || '';
                  const cleanPhone = custPhone.replace(/[^0-9]/g, '');
                  const buyerName = visit.customerName || 'Valued Visitor';
                  const propTitle = visit.property?.title || 'Nagpur Property';
                  const waUrl = cleanPhone
                    ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                        `Hello ${buyerName}, I am ${user?.name || 'your property advisor'}. Regarding your scheduled site visit for "${propTitle}" on ${new Date(
                          visit.preferredDate
                        ).toLocaleDateString()} (${visit.preferredTimeSlot})...`
                      )}`
                    : '#';

                  return (
                    <tr key={visit._id} className="hover:bg-slate-50 transition">
                      {/* Date & Slot */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <CalendarDays size={14} className="text-teal-700 flex-shrink-0" />
                          <span>{formatDate(visit.preferredDate)}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                          <Clock size={12} className="text-slate-400 flex-shrink-0" />
                          <span>{visit.preferredTimeSlot}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Booked {formatDate(visit.createdAt)}
                        </div>
                      </td>

                      {/* Buyer */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{buyerName}</div>
                        <div className="text-[11px] text-slate-600 font-mono mt-0.5">{custPhone}</div>
                        {visit.email && (
                          <div className="text-[11px] text-slate-400">{visit.email}</div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {cleanPhone && (
                            <>
                              <a
                                href={`tel:+91${cleanPhone}`}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-teal-700 bg-slate-100 px-2 py-0.5 rounded"
                              >
                                <Phone size={11} />
                                <span>Call</span>
                              </a>
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                              >
                                <MessageCircle size={11} />
                                <span>WhatsApp</span>
                              </a>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Property */}
                      <td className="px-4 py-3 max-w-xs">
                        {visit.property ? (
                          <div>
                            <div className="font-semibold text-slate-800 truncate">
                              {visit.property.title}
                            </div>
                            <div className="text-[11px] text-teal-700 font-mono font-bold mt-0.5">
                              {formatCurrency(visit.property.price)}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                              <MapPin size={11} className="flex-shrink-0" />
                              <span>{visit.property.localityName || visit.property.address || 'Nagpur'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Property record removed</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div>{getStatusBadge(visit.status)}</div>
                        {visit.cancellationReason && (
                          <div className="text-[11px] text-rose-600 mt-1 italic">
                            Reason: {visit.cancellationReason}
                          </div>
                        )}
                        {visit.feedbackNotes && (
                          <div className="text-[11px] text-slate-500 mt-1 italic">
                            Note: {visit.feedbackNotes}
                          </div>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {visit.status === 'REQUESTED' && (
                            <>
                              <button
                                onClick={() => handleOpenActionModal(visit, 'CONFIRMED')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition"
                              >
                                <Check size={13} />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleOpenActionModal(visit, 'CANCELLED')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition"
                              >
                                <X size={13} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {visit.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => handleOpenActionModal(visit, 'COMPLETED')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition"
                              >
                                <CheckCircle2 size={13} />
                                <span>Complete</span>
                              </button>
                              <button
                                onClick={() => handleOpenActionModal(visit, 'CANCELLED')}
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition"
                              >
                                <X size={13} />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}

                          {(visit.status === 'COMPLETED' || visit.status === 'CANCELLED') && (
                            <button
                              onClick={() => handleOpenActionModal(visit, visit.status)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition"
                            >
                              Edit Note
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation & Note Modal */}
      {activeModalVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {modalAction === 'CONFIRMED' && (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>Approve & Confirm Site Visit</span>
                  </>
                )}
                {modalAction === 'CANCELLED' && (
                  <>
                    <XCircle size={18} className="text-rose-600" />
                    <span>Reject / Cancel Site Visit</span>
                  </>
                )}
                {modalAction === 'COMPLETED' && (
                  <>
                    <CheckCircle2 size={18} className="text-blue-600" />
                    <span>Mark Inspection Completed</span>
                  </>
                )}
                {modalAction !== 'CONFIRMED' && modalAction !== 'CANCELLED' && modalAction !== 'COMPLETED' && (
                  <span>Update Visit Feedback</span>
                )}
              </h3>
              <button
                onClick={() => setActiveModalVisit(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="font-semibold text-slate-800">{activeModalVisit.customerName}</div>
              <div className="text-slate-500">{activeModalVisit.property?.title}</div>
              <div className="text-slate-500 font-mono">
                {formatDate(activeModalVisit.preferredDate)} • {activeModalVisit.preferredTimeSlot}
              </div>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {modalAction === 'CANCELLED'
                    ? 'Reason for Rejection / Cancellation (Visible to customer)'
                    : 'Inspection Notes / Instructions (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={reasonNotes}
                  onChange={(e) => setReasonNotes(e.target.value)}
                  placeholder={
                    modalAction === 'CANCELLED'
                      ? 'e.g. Property owner not available at requested slot, please pick another time...'
                      : 'e.g. Confirmed with security gate, agent will meet at lobby...'
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:border-teal-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalVisit(null)}
                  className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updateStatusMutation.isPending}
                  className={`py-1.5 px-4 rounded-lg text-white text-xs font-bold transition shadow-2xs ${
                    modalAction === 'CANCELLED'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {updateStatusMutation.isPending
                    ? 'Saving...'
                    : modalAction === 'CONFIRMED'
                    ? 'Approve Visit'
                    : modalAction === 'CANCELLED'
                    ? 'Reject Visit'
                    : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSiteVisitsPage;
