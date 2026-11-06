import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  AlertTriangle,
  User,
  MapPin,
  X,
  Phone,
  Calendar,
  Check,
  Shield,
  Home,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { formatIndianPrice, formatDate } from '../../utils/formatters';

const REJECTION_PRESETS = [
  'Missing or invalid MahaRERA registration certificate',
  'Property 7/12 (Satbara) extract or title deed unverified',
  'Watermarked or stock photographs uploaded',
  'Price or area specifications deviate drastically from locality rate',
  'Duplicate listing already active on Nagpur Real Estate',
  'Owner/Agent contact phone could not be verified via OTP',
];

export const ModerationQueuePage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING | APPROVED | REJECTED
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [ticketToReject, setTicketToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  // Fetch Verification tickets
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-moderation-queue', activeTab],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/moderation?status=${activeTab}`);
      return res.data?.data || [];
    },
  });

  const tickets = response || [];

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      return apiClient.post(`/admin/moderation/${id}/approve`, { reviewNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-moderation-queue']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
      queryClient.invalidateQueries(['admin-stats-badge-sync']);
      setSelectedTicket(null);
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason, notes }) => {
      return apiClient.post(`/admin/moderation/${id}/reject`, {
        rejectionReason: reason,
        reviewNotes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-moderation-queue']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
      queryClient.invalidateQueries(['admin-stats-badge-sync']);
      setRejectModalOpen(false);
      setTicketToReject(null);
      setSelectedTicket(null);
      setRejectionReason('');
      setReviewNotes('');
    },
  });

  const handleApprove = (propId) => {
    if (window.confirm('Approve this listing? It will become LIVE on the Nagpur marketplace for 90 days.')) {
      approveMutation.mutate({
        id: propId,
        notes: 'Verified against Nagpur RERA and land records guidelines.',
      });
    }
  };

  const handleOpenReject = (ticket) => {
    setTicketToReject(ticket);
    setRejectionReason('');
    setReviewNotes('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please select or specify a reason to inform the property owner.');
      return;
    }
    rejectMutation.mutate({
      id: ticketToReject.property?._id || ticketToReject.property,
      reason: rejectionReason.trim(),
      notes: reviewNotes.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listing Verification & Moderation Queue"
        subtitle="Validate seller ownership, MahaRERA compliance, and photo quality before publishing"
        icon={ShieldCheck}
        breadcrumbs={[{ label: 'Moderation Queue' }]}
        actions={
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold shadow-xs">
            {['PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-1.5 px-4 rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'text-slate-600 hover:text-brand-orange'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        }
      />

      {/* Tickets List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const prop = ticket.property || {};
            const owner = prop.owner || {};

            return (
              <div
                key={ticket._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-6 justify-between"
              >
                {/* Left: Thumbnail & Core Details */}
                <div className="flex flex-col sm:flex-row gap-5 flex-1">
                  {/* Thumbnail */}
                  <div className="w-full sm:w-44 h-36 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                    {prop.coverImage || prop.images?.[0]?.url ? (
                      <img
                        src={prop.coverImage || prop.images[0].url}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <Home className="w-8 h-8 mb-1" />
                        <span className="text-[10px]">No Photo</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2">
                      <Badge status={prop.purpose || 'BUY'} size="xs" />
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge status={ticket.status} />
                      <span className="text-[11px] text-slate-400 font-medium">
                        Submitted {formatDate(ticket.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 line-clamp-1">
                      {prop.title || 'Untitled Nagpur Property'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="font-extrabold text-brand-orange text-sm">
                        {formatIndianPrice(prop.price)}
                      </span>
                      <span>&bull;</span>
                      <span className="font-semibold">{prop.areaSqFt} Sq.Ft</span>
                      <span>&bull;</span>
                      <span className="font-semibold">{prop.bedrooms ? `${prop.bedrooms} BHK` : prop.subtype}</span>
                      <span>&bull;</span>
                      <span className="inline-flex items-center text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {prop.localityName || 'Nagpur'}
                      </span>
                    </div>

                    {/* Owner summary */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{owner.name || 'Owner'}</span>
                        <span className="text-[10px] text-slate-400">({owner.role || 'USER'})</span>
                      </div>

                      {owner.phone && (
                        <div className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono text-slate-600">+91 {owner.phone}</span>
                        </div>
                      )}

                      {prop.reraNumber && (
                        <div className="flex items-center space-x-1 text-emerald-600 font-bold">
                          <Shield className="w-3.5 h-3.5" />
                          <span>RERA: {prop.reraNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex lg:flex-col items-center justify-end gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 min-w-[180px]">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex-1 lg:w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
                  >
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span>Inspect Specs</span>
                  </button>

                  {ticket.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(prop._id)}
                        disabled={approveMutation.isPending}
                        className="flex-1 lg:w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Live</span>
                      </button>

                      <button
                        onClick={() => handleOpenReject(ticket)}
                        disabled={rejectMutation.isPending}
                        className="flex-1 lg:w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title={`No ${activeTab.toLowerCase()} moderation tickets`}
          description={
            activeTab === 'PENDING'
              ? 'Great job! All newly submitted property listings have been verified and processed.'
              : `There are currently no properties marked as ${activeTab.toLowerCase()}.`
          }
        />
      )}

      {/* Inspect Ticket Details Modal */}
      {selectedTicket && (
        <Modal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title={selectedTicket.property?.title || 'Property Verification Details'}
          subtitle={`Ticket ID: ${selectedTicket._id} · Status: ${selectedTicket.status}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Gallery */}
            {selectedTicket.property?.images?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Uploaded Photos ({selectedTicket.property.images.length})
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedTicket.property.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-200 hover:opacity-90"
                    >
                      <img src={img.url} alt={`img-${idx}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Price</span>
                <span className="font-extrabold text-brand-orange text-sm">
                  {formatIndianPrice(selectedTicket.property?.price)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Area</span>
                <span className="font-bold text-slate-800">
                  {selectedTicket.property?.areaSqFt} Sq.Ft
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Type</span>
                <span className="font-bold text-slate-800">
                  {selectedTicket.property?.subtype}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Locality</span>
                <span className="font-bold text-slate-800">
                  {selectedTicket.property?.localityName}
                </span>
              </div>
            </div>

            {/* Address & RERA */}
            <div className="space-y-2 text-xs">
              <div>
                <strong className="text-slate-700">Full Address: </strong>
                <span className="text-slate-600">{selectedTicket.property?.address}, Nagpur - {selectedTicket.property?.pincode}</span>
              </div>
              <div>
                <strong className="text-slate-700">MahaRERA Registration: </strong>
                <span className="font-mono text-brand-teal font-bold">
                  {selectedTicket.property?.reraNumber || 'Not provided'}
                </span>
              </div>
              <div>
                <strong className="text-slate-700">Description: </strong>
                <p className="text-slate-600 mt-1 p-3 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedTicket.property?.description}
                </p>
              </div>
            </div>

            {/* Action buttons inside modal */}
            {selectedTicket.status === 'PENDING' && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenReject(selectedTicket);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                >
                  Reject with Reason
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedTicket.property?._id)}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
                >
                  Approve for 90 Days
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reject Listing Modal */}
      {rejectModalOpen && ticketToReject && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Property Listing"
          subtitle="Provide a transparent reason. The owner will be notified to correct and resubmit."
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Select Common Reason
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {REJECTION_PRESETS.map((preset, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start space-x-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      rejectionReason === preset
                        ? 'border-rose-400 bg-rose-50/60 font-bold text-rose-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="presetReason"
                      checked={rejectionReason === preset}
                      onChange={() => setRejectionReason(preset)}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <span>{preset}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Or Custom Detailed Reason (Visible to Owner)
              </label>
              <textarea
                required
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain what needs rectification (e.g., upload valid 7/12 extract)..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Internal Staff Review Notes (Optional / Private)
              </label>
              <input
                type="text"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Internal audit remarks..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-brand-teal outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rejectMutation.isPending}
                className="py-2 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ModerationQueuePage;
