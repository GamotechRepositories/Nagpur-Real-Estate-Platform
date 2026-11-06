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
} from 'lucide-react';
import apiClient from '../../api/client';
import { formatIndianPrice, formatDate } from '../../utils/formatters';

const ModerationQueuePage = () => {
  const queryClient = useQueryClient();
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' | 'APPROVED' | 'REJECTED'

  // Fetch Moderation Queue
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-moderation-queue', activeTab],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/moderation?status=${activeTab}`);
      return res.data?.data || [];
    },
  });

  const verifications = response || [];

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      return apiClient.post(`/admin/moderation/${id}/approve`, { reviewNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-moderation-queue']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
      setSelectedVerification(null);
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
      setRejectModalOpen(false);
      setSelectedVerification(null);
      setRejectionReason('');
      setReviewNotes('');
    },
  });

  const handleApprove = (propId) => {
    if (window.confirm('Approve this listing? It will become LIVE on Nagpur Real Estate for 90 days.')) {
      approveMutation.mutate({ id: propId, notes: 'Approved after verification of details.' });
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please provide a specific rejection reason to the owner.');
      return;
    }
    rejectMutation.mutate({
      id: selectedVerification.property._id,
      reason: rejectionReason,
      notes: reviewNotes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-brand-teal" />
            <span>Listing Verification & Moderation Queue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted properties against Nagpur RERA, ownership, and photo guidelines
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex border border-slate-200 rounded-xl bg-white p-1 text-xs font-bold">
          {['PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 px-3.5 rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'text-slate-600 hover:text-brand-orange'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Moderation List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-28 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : verifications.length > 0 ? (
        <div className="space-y-4">
          {verifications.map((item) => {
            const property = item.property;
            if (!property) return null;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-card transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      property.coverImage ||
                      (property.images?.[0]?.url) ||
                      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={property.title}
                    className="w-24 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-brand-orange uppercase">
                        {property.purpose} &middot; {property.subtype}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {formatIndianPrice(property.price)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {property.title}
                    </h3>

                    <div className="flex items-center text-xs text-slate-500 space-x-3">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 text-brand-orange mr-1" />
                        {property.localityName}, Nagpur
                      </span>
                      <span className="flex items-center">
                        <User className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        Owner: {property.owner?.name || 'User'} ({property.owner?.phone})
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center space-x-3 pt-0.5">
                      <span>Submitted: {formatDate(item.createdAt)}</span>
                      {item.slaDeadline && (
                        <span className="text-amber-600 font-semibold flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          SLA: {formatDate(item.slaDeadline)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <button
                    onClick={() => setSelectedVerification(item)}
                    className="inline-flex items-center space-x-1.5 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Inspect</span>
                  </button>

                  {item.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(property._id)}
                        disabled={approveMutation.isPending}
                        className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedVerification(item);
                          setRejectModalOpen(true);
                        }}
                        className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <XCircle className="w-3.5 h-3.5" />
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
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Moderation Queue is Clean!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No listings currently in <strong>{activeTab}</strong> status. All submitted properties have been reviewed.
          </p>
        </div>
      )}

      {/* Inspection Modal */}
      {selectedVerification && !rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative">
            <button
              onClick={() => setSelectedVerification(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-brand-navy mb-4">
              Moderation Inspection: {selectedVerification.property?.title}
            </h2>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl">
                <div>Price: <strong>{formatIndianPrice(selectedVerification.property?.price)}</strong></div>
                <div>Area: <strong>{selectedVerification.property?.areaSqFt} Sq.Ft</strong></div>
                <div>Locality: <strong>{selectedVerification.property?.localityName}, Nagpur</strong></div>
                <div>RERA: <strong>{selectedVerification.property?.reraNumber || 'Not specified'}</strong></div>
                <div>Owner Phone: <strong>{selectedVerification.property?.owner?.phone}</strong></div>
                <div>Owner Name: <strong>{selectedVerification.property?.owner?.name}</strong></div>
              </div>

              <div>
                <span className="font-bold block text-slate-700 mb-1">Description:</span>
                <p className="text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedVerification.property?.description}
                </p>
              </div>

              {selectedVerification.property?.images?.length > 0 && (
                <div>
                  <span className="font-bold block text-slate-700 mb-2">Attached Photos:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedVerification.property.images.map((img, idx) => (
                      <a key={idx} href={img.url} target="_blank" rel="noreferrer">
                        <img src={img.url} alt="Listing inspection" className="h-24 w-full object-cover rounded-xl" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedVerification.status === 'PENDING' && (
                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                  <button
                    onClick={() => setRejectModalOpen(true)}
                    className="bg-red-600 text-white font-bold py-2.5 px-4 rounded-xl"
                  >
                    Reject Listing
                  </button>
                  <button
                    onClick={() => handleApprove(selectedVerification.property._id)}
                    className="bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl"
                  >
                    Approve Listing
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-brand-navy mb-2">Reject Property Listing</h3>
            <p className="text-xs text-slate-500 mb-4">
              Explain why this listing is rejected so the owner can correct the listing and resubmit.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Rejection Reason (Required)
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white mb-2"
                >
                  <option value="">Select a common reason...</option>
                  <option value="Unclear or watermarked photos. Please upload genuine high-resolution property pictures.">
                    Unclear or watermarked photos
                  </option>
                  <option value="Incomplete or inaccurate address details for Nagpur locality.">
                    Incomplete or inaccurate address
                  </option>
                  <option value="Price does not reflect current Nagpur real estate norms or appears fraudulent.">
                    Suspicious or unrealistic price
                  </option>
                  <option value="Duplicate listing detected on platform.">
                    Duplicate listing
                  </option>
                  <option value="Missing or unverified MahaRERA project registration details.">
                    MahaRERA registration issue
                  </option>
                </select>

                <textarea
                  rows={3}
                  required
                  placeholder="Or enter custom rejection instructions..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Internal Review Notes (Staff only)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified 7/12 land records mismatch"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationQueuePage;

