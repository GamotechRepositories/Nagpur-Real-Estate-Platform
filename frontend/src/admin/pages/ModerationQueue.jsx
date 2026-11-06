import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  MapPin,
  X,
  AlertTriangle,
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
    if (window.confirm('Approve this listing? It will become LIVE on Nagpur Estates for 90 days.')) {
      approveMutation.mutate({ id: propId, notes: 'Approved after verification of title and sanctions.' });
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please specify the rejection grounds.');
      return;
    }
    rejectMutation.mutate({
      id: selectedVerification.property._id,
      reason: rejectionReason,
      notes: reviewNotes,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-beige pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-gold font-semibold block mb-1">
            Compliance & Verification
          </span>
          <h1 className="font-serif text-3xl text-navy font-normal flex items-center space-x-2">
            <span>Listing Verification & Moderation Queue</span>
          </h1>
          <p className="text-xs text-charcoal-muted mt-1 font-sans">
            Validate submitted properties against MahaRERA sanctions, title abstracts, and photography standards
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex border border-beige bg-white p-1 text-xs">
          {['PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 px-4 text-[10px] uppercase tracking-luxury font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-navy text-gold shadow-subtle'
                  : 'text-charcoal-muted hover:text-navy'
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
            <div key={n} className="bg-white border border-beige h-32 animate-pulse"></div>
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
                className="bg-white p-6 border border-beige hover:border-gold transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-subtle"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start space-x-5">
                  <img
                    src={
                      property.coverImage ||
                      property.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=250&q=80'
                    }
                    alt={property.title}
                    className="w-28 h-20 object-cover border border-beige shrink-0"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-semibold uppercase tracking-luxury px-2 py-0.5 border border-gold/40 bg-ivory text-gold">
                        {property.purpose} &bull; {property.subtype}
                      </span>
                      <span className="text-xs font-semibold text-navy font-sans">
                        {formatIndianPrice(property.price)}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg text-navy font-normal line-clamp-1">
                      {property.title}
                    </h3>

                    <div className="flex items-center text-xs text-charcoal-muted space-x-4 font-sans">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 text-gold mr-1" />
                        {property.localityName}, Nagpur
                      </span>
                      <span className="flex items-center">
                        <User className="w-3.5 h-3.5 text-charcoal-muted mr-1" />
                        Owner: {property.owner?.name || 'User'} ({property.owner?.phone})
                      </span>
                    </div>

                    <div className="text-[11px] text-charcoal-muted flex items-center space-x-4 pt-1 font-sans">
                      <span>Submitted: {formatDate(item.createdAt)}</span>
                      {item.slaDeadline && (
                        <span className="text-navy font-medium flex items-center">
                          <Clock className="w-3 h-3 text-gold mr-1" />
                          SLA Window: {formatDate(item.slaDeadline)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-beige">
                  <button
                    onClick={() => setSelectedVerification(item)}
                    className="inline-flex items-center space-x-1.5 py-2.5 px-4 border border-beige bg-ivory text-navy hover:border-gold text-xs font-medium tracking-luxury uppercase transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-gold" />
                    <span>Inspect</span>
                  </button>

                  {item.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(property._id)}
                        disabled={approveMutation.isPending}
                        className="inline-flex items-center space-x-1.5 py-2.5 px-4 bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-gold" />
                        <span>Authorize</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedVerification(item);
                          setRejectModalOpen(true);
                        }}
                        className="inline-flex items-center space-x-1.5 py-2.5 px-4 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium tracking-luxury uppercase transition-colors"
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
        <div className="bg-white p-14 text-center border border-beige shadow-subtle space-y-3">
          <div className="w-14 h-14 border border-gold/40 text-gold flex items-center justify-center mx-auto bg-ivory">
            <CheckCircle className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-serif text-2xl text-navy font-normal">Moderation Queue Clear</h3>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto font-sans leading-relaxed">
            Zero submissions awaiting review under <strong>{activeTab}</strong> status. Compliance standards are current.
          </p>
        </div>
      )}

      {/* Inspection Modal */}
      {selectedVerification && !rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border border-beige shadow-card relative">
            <button
              onClick={() => setSelectedVerification(null)}
              className="absolute top-4 right-4 p-2 text-charcoal-muted hover:text-navy"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-semibold uppercase tracking-luxury text-gold block mb-1">
              Asset Validation Dossier
            </span>
            <h2 className="font-serif text-2xl text-navy font-normal mb-6">
              {selectedVerification.property?.title}
            </h2>

            <div className="space-y-5 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3 bg-ivory-light p-4 border border-beige">
                <div>Price: <strong className="text-navy">{formatIndianPrice(selectedVerification.property?.price)}</strong></div>
                <div>Area: <strong className="text-navy">{selectedVerification.property?.areaSqFt} Sq.Ft</strong></div>
                <div>Locality: <strong className="text-navy">{selectedVerification.property?.localityName}, Nagpur</strong></div>
                <div>RERA: <strong className="text-navy font-mono">{selectedVerification.property?.reraNumber || 'Not specified'}</strong></div>
                <div>Owner Phone: <strong className="text-navy">{selectedVerification.property?.owner?.phone}</strong></div>
                <div>Owner Name: <strong className="text-navy">{selectedVerification.property?.owner?.name}</strong></div>
              </div>

              <div>
                <span className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">Description:</span>
                <p className="text-charcoal-light whitespace-pre-line bg-ivory-light p-4 border border-beige leading-relaxed">
                  {selectedVerification.property?.description}
                </p>
              </div>

              {selectedVerification.property?.images?.length > 0 && (
                <div>
                  <span className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-2 font-medium">Photographs:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedVerification.property.images.map((img, idx) => (
                      <a key={idx} href={img.url} target="_blank" rel="noreferrer">
                        <img src={img.url} alt="Inspection" className="h-24 w-full object-cover border border-beige" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedVerification.status === 'PENDING' && (
                <div className="pt-6 border-t border-beige flex justify-end space-x-3">
                  <button
                    onClick={() => setRejectModalOpen(true)}
                    className="border border-red-200 bg-red-50 text-red-700 text-xs font-medium tracking-luxury uppercase py-3 px-5 hover:bg-red-100 transition-colors"
                  >
                    Reject Listing
                  </button>
                  <button
                    onClick={() => handleApprove(selectedVerification.property._id)}
                    className="bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase py-3 px-6 transition-colors"
                  >
                    Approve & Publish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full p-8 border border-beige shadow-card relative">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-charcoal-muted hover:text-navy"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-semibold uppercase tracking-luxury text-red-600 block mb-1">
              Compliance Rejection
            </span>
            <h3 className="font-serif text-2xl text-navy font-normal mb-2">Reject Property Listing</h3>
            <p className="text-xs text-charcoal-muted mb-5 font-sans">
              Provide formal feedback so the principal may remediate documentation and resubmit.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                  Standard Grounds
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  className="w-full p-2.5 border border-beige bg-ivory-light text-navy text-xs mb-2 font-sans"
                >
                  <option value="">Select standard grounds...</option>
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
                  placeholder="Or enter specific advisory guidance..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                  Internal Staff Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Satbara 7/12 survey mismatch"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-beige bg-ivory-light text-navy text-xs font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2.5 border border-beige bg-ivory text-xs font-medium tracking-luxury uppercase text-charcoal-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectMutation.isPending}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium tracking-luxury uppercase disabled:opacity-50"
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
