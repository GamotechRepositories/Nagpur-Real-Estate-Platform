import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Check,
  X,
  Eye,
  MapPin,
  Phone,
  Home,
  Shield,
  User,
  UserCheck,
  Building2,
  AlertCircle,
  Users,
  Trash2,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { formatIndianPrice, formatDate } from '../../utils/formatters';

const REJECTION_PRESETS = [
  'Missing or invalid MahaRERA registration number',
  'Property 7/12 (Satbara) extract or title deed unverified',
  'Watermarked or low quality photographs uploaded',
  'Price or area deviates drastically from market rate',
  'Duplicate listing already active on platform',
  'Owner contact phone number unverified',
];

export const ModerationQueuePage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING | APPROVED | REJECTED
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [ticketToReject, setTicketToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  // Approve & Agent Allocation State
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [ticketToApprove, setTicketToApprove] = useState(null);
  const [selectedAgentIds, setSelectedAgentIds] = useState([]);
  const [approveReviewNotes, setApproveReviewNotes] = useState('Property documents and details verified.');

  // Fetch Verification tickets
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-moderation-queue', activeTab],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/moderation?status=${activeTab}`);
      return res.data?.data || [];
    },
  });

  const tickets = response || [];

  // Fetch Available Certified Agents for Allocation
  const { data: agents = [] } = useQuery({
    queryKey: ['admin-agents-available'],
    queryFn: async () => {
      const res = await apiClient.get('/agents');
      return res.data?.data || [];
    },
  });

  // Fetch Available Staff Members
  const { data: staffMembers = [] } = useQuery({
    queryKey: ['admin-staff-available'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/staff?limit=100');
      return res.data?.data || [];
    },
  });

  const getRepDetails = (repId) => {
    const id = repId?.toString();
    const agentMatch = agents.find((a) => (a.user?._id || a.user)?.toString() === id);
    if (agentMatch) {
      return {
        id,
        name: agentMatch.user?.name || agentMatch.agencyName || 'Certified Agent',
        phone: agentMatch.user?.phone || agentMatch.contactPhone || '',
        label: agentMatch.agencyName ? `Agent • ${agentMatch.agencyName}` : 'Certified Broker',
      };
    }
    const staffMatch = staffMembers.find((s) => s._id?.toString() === id);
    if (staffMatch) {
      return {
        id,
        name: staffMatch.name || 'Staff Member',
        phone: staffMatch.phone || '',
        label: staffMatch.designation || staffMatch.role || 'Staff',
      };
    }
    return {
      id,
      name: 'Representative',
      phone: '',
      label: 'Staff Member',
    };
  };

  // Approve Mutation with Agent Allocation
  const approveMutation = useMutation({
    mutationFn: async ({ id, notes, assignedAgents, assignedAgent }) => {
      return apiClient.post(`/admin/moderation/${id}/approve`, {
        reviewNotes: notes,
        assignedAgents: assignedAgents || undefined,
        assignedAgent: assignedAgent || (assignedAgents && assignedAgents[0]) || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-moderation-queue']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
      queryClient.invalidateQueries(['admin-stats-badge-sync']);
      setApproveModalOpen(false);
      setTicketToApprove(null);
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

  const handleOpenApprove = (ticket) => {
    setTicketToApprove(ticket);
    const existingAgents = ticket.property?.assignedAgents?.map((a) => (a._id || a)?.toString()) || [];
    const existingAgent = (ticket.property?.assignedAgent?._id || ticket.property?.assignedAgent)?.toString() || '';
    let initial = existingAgents.length > 0 ? existingAgents : existingAgent ? [existingAgent] : [];
    if (!initial.length) {
      const defaultAgent =
        (agents.length > 0 ? (agents[0].user?._id || agents[0].user)?.toString() : '') ||
        (staffMembers.length > 0 ? staffMembers[0]._id?.toString() : '');
      if (defaultAgent) initial = [defaultAgent];
    }

    setSelectedAgentIds(initial);
    setApproveReviewNotes('Property documents and details verified. Assigned to partner.');
    setApproveModalOpen(true);
  };

  const handleApproveSubmit = (e) => {
    e.preventDefault();
    if (!ticketToApprove?.property?._id && !ticketToApprove?.property) return;
    const propId = ticketToApprove.property?._id || ticketToApprove.property;
    approveMutation.mutate({
      id: propId,
      notes: approveReviewNotes.trim() || 'Verified by administrator.',
      assignedAgents: selectedAgentIds,
      assignedAgent: selectedAgentIds[0],
    });
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
      alert('Please select or specify a rejection reason.');
      return;
    }
    rejectMutation.mutate({
      id: ticketToReject.property?._id || ticketToReject.property,
      reason: rejectionReason.trim(),
      notes: reviewNotes.trim(),
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Moderation Queue"
        subtitle="Review and verify property submissions before publishing"
        icon={ShieldCheck}
        breadcrumbs={[{ label: 'Moderation' }]}
        actions={
          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-medium">
            {['PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-1 px-3 rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        }
      />

      {/* Tickets List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const prop = ticket.property || {};
            const owner = prop.owner || {};

            return (
              <div
                key={ticket._id}
                className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col lg:flex-row gap-4 justify-between"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-full sm:w-36 h-28 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                    {prop.coverImage || prop.images?.[0]?.url ? (
                      <img
                        src={prop.coverImage || prop.images[0].url}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Home className="w-6 h-6" />
                      </div>
                    )}
                    <span className="absolute top-1.5 left-1.5">
                      <Badge status={prop.purpose || 'BUY'} size="xs" />
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Badge status={ticket.status} />
                      <span className="text-xs text-slate-400">
                        Submitted {formatDate(ticket.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {prop.title || 'Untitled Property'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="font-bold text-slate-900">
                        {formatIndianPrice(prop.price)}
                      </span>
                      <span>&bull;</span>
                      <span>{prop.areaSqFt} Sq.Ft</span>
                      {prop.bedrooms > 0 && (
                        <>
                          <span>&bull;</span>
                          <span>{prop.bedrooms} BHK</span>
                        </>
                      )}
                      <span>&bull;</span>
                      <span className="inline-flex items-center text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {prop.localityName || 'Nagpur'}
                      </span>
                    </div>

                    {/* Owner summary */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{owner.name || 'Owner'}</span>
                      </div>

                      {owner.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono text-slate-600">+91 {owner.phone}</span>
                        </div>
                      )}

                      {prop.reraNumber && (
                        <div className="flex items-center space-x-1 text-emerald-700 font-medium">
                          <Shield className="w-3.5 h-3.5" />
                          <span>RERA: {prop.reraNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex lg:flex-col items-center justify-end gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-4 min-w-[140px]">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex-1 lg:w-full inline-flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Inspect</span>
                  </button>

                  {ticket.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleOpenApprove(ticket)}
                        disabled={approveMutation.isPending}
                        className="flex-1 lg:w-full inline-flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleOpenReject(ticket)}
                        disabled={rejectMutation.isPending}
                        className="flex-1 lg:w-full inline-flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
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
              ? 'All property listings have been reviewed.'
              : `No properties found in ${activeTab.toLowerCase()} status.`
          }
        />
      )}

      {/* Inspect Ticket Details Modal */}
      {selectedTicket && (
        <Modal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title={selectedTicket.property?.title || 'Property Details'}
          subtitle={`Ticket ID: ${selectedTicket._id}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Gallery */}
            {selectedTicket.property?.images?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-600 mb-2">
                  Photos ({selectedTicket.property.images.length})
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedTicket.property.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-video rounded-lg bg-slate-100 overflow-hidden border border-slate-200 hover:opacity-90"
                    >
                      <img src={img.url} alt={`img-${idx}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Price</span>
                <span className="font-bold text-slate-900">
                  {formatIndianPrice(selectedTicket.property?.price)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Area</span>
                <span className="font-semibold text-slate-800">
                  {selectedTicket.property?.areaSqFt} Sq.Ft
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Type</span>
                <span className="font-semibold text-slate-800">
                  {selectedTicket.property?.subtype}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Locality</span>
                <span className="font-semibold text-slate-800">
                  {selectedTicket.property?.localityName}
                </span>
              </div>
            </div>

            {/* Address & RERA */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-semibold text-slate-700">Address: </span>
                <span className="text-slate-600">{selectedTicket.property?.address}, Nagpur - {selectedTicket.property?.pincode}</span>
              </div>
              {selectedTicket.property?.reraNumber && (
                <div>
                  <span className="font-semibold text-slate-700">RERA Number: </span>
                  <span className="font-mono text-teal-700 font-semibold">
                    {selectedTicket.property?.reraNumber}
                  </span>
                </div>
              )}
              {selectedTicket.property?.description && (
                <div>
                  <span className="font-semibold text-slate-700">Description: </span>
                  <p className="text-slate-600 mt-1 p-2.5 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed text-xs">
                    {selectedTicket.property?.description}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons inside modal */}
            {selectedTicket.status === 'PENDING' && (
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenReject(selectedTicket);
                  }}
                  className="py-1.5 px-3 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const t = selectedTicket;
                    setSelectedTicket(null);
                    handleOpenApprove(t);
                  }}
                  disabled={approveMutation.isPending}
                  className="py-1.5 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
                >
                  Approve & Allocate Agent
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Approve & Allocate Agent / Staff Modal */}
      {approveModalOpen && ticketToApprove && (
        <Modal
          isOpen={approveModalOpen}
          onClose={() => {
            setApproveModalOpen(false);
            setTicketToApprove(null);
          }}
          title="Approve & Allocate Agent to Listing"
          subtitle="Assign a verified broker or staff member to handle buyer calls & inquiries"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleApproveSubmit} className="space-y-4 text-xs">
            {/* Target Property Summary */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                  Target Property
                </span>
                <span className="font-bold text-slate-900 font-mono text-xs">
                  {formatIndianPrice(ticketToApprove.property?.price)}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm truncate">
                {ticketToApprove.property?.title}
              </h4>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>{ticketToApprove.property?.localityName || 'Nagpur'}</span>
                <span>&bull;</span>
                <span>{ticketToApprove.property?.areaSqFt} Sq.Ft</span>
                {ticketToApprove.property?.bedrooms > 0 && (
                  <>
                    <span>&bull;</span>
                    <span>{ticketToApprove.property?.bedrooms} BHK</span>
                  </>
                )}
              </div>
            </div>

            {/* Owner Privacy Shield Notice */}
            <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl text-amber-900">
              <div className="flex items-center gap-2 font-bold text-xs mb-1 text-amber-950">
                <UserCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>Submitted by End-User (Owner Details Kept Private)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Owner: <strong>{ticketToApprove.property?.owner?.name || 'User'}</strong> (+91 {ticketToApprove.property?.owner?.phone || 'N/A'}).
                The public website will <strong>NOT</strong> expose this user's phone number. All incoming buyer calls and WhatsApp inquiries will route directly to the allocated agent below.
              </p>
            </div>

            {/* Agent / Staff Allocation Field (Multi-Rep Supported) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Allocate Representatives (Agents / Staff) *</span>
                <span className="text-[10px] text-teal-700 font-semibold font-mono">
                  Primary shows on Public Marketplace
                </span>
              </label>

              {/* Selected List */}
              <div className="space-y-1.5">
                {selectedAgentIds.map((repId, idx) => {
                  const details = getRepDetails(repId);
                  const isPrimary = idx === 0;
                  return (
                    <div
                      key={repId}
                      className={`p-2 rounded-lg flex items-center justify-between border ${
                        isPrimary ? 'bg-teal-50/80 border-teal-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 truncate block">{details.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {details.label} {details.phone ? `• +91 ${details.phone}` : ''}
                          </span>
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
                              setSelectedAgentIds((prev) => [repId, ...prev.filter((id) => id !== repId)]);
                            }}
                            className="text-[10px] font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                          >
                            Set Primary
                          </button>
                        )}
                        {selectedAgentIds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAgentIds((prev) => prev.filter((id) => id !== repId));
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Co-assigned Rep Dropdown */}
              <div className="pt-1">
                <select
                  value=""
                  onChange={(e) => {
                    const newId = e.target.value;
                    if (newId && !selectedAgentIds.includes(newId)) {
                      setSelectedAgentIds((prev) => [...prev, newId]);
                    }
                  }}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:border-teal-600 outline-none"
                >
                  <option value="">-- Add another representative (Agent or Staff) --</option>
                  <optgroup label="🏢 Certified Real Estate Agents">
                    {agents
                      .filter((agent) => {
                        const uId = (agent.user?._id || agent.user)?.toString();
                        return !selectedAgentIds.includes(uId);
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
                      .filter((staff) => !selectedAgentIds.includes(staff._id?.toString()))
                      .map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name} ({staff.designation || staff.role}) — {staff.phone || staff.email}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Review Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Moderation Verification Notes
              </label>
              <input
                type="text"
                value={approveReviewNotes}
                onChange={(e) => setApproveReviewNotes(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600"
                placeholder="e.g. 7/12 extract verified, documents compliant."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setApproveModalOpen(false);
                  setTicketToApprove(null);
                }}
                className="py-2 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={approveMutation.isPending || !selectedAgentId}
                className="py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {approveMutation.isPending ? (
                  <span>Publishing Listing...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Approve & Publish Live</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject Listing Modal */}
      {rejectModalOpen && ticketToReject && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Listing"
          subtitle={`Property: ${ticketToReject.property?.title || 'Listing'}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Reason *
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {REJECTION_PRESETS.map((preset, idx) => (
                  <label
                    key={idx}
                    className="flex items-start space-x-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs"
                  >
                    <input
                      type="radio"
                      name="rejectionPreset"
                      checked={rejectionReason === preset}
                      onChange={() => setRejectionReason(preset)}
                      className="mt-0.5 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-slate-700">{preset}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Reason / Notes
              </label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify rejection details..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
                className="py-1.5 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ModerationQueuePage;
