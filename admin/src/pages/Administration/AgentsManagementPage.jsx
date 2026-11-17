import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserCheck,
  Star,
  Phone,
  Mail,
  Search,
  Shield,
  Plus,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  Clock,
  Edit2,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import PhotoUploader, { getFullImageUrl } from '../../components/common/PhotoUploader';

export const AgentsManagementPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordWasUpdated, setPasswordWasUpdated] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    avatar: '',
    agencyName: '',
    reraNumber: '',
    experienceYears: 5,
    areasServed: 'Besa, Wardha Road, Manish Nagar',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    agencyName: '',
    reraNumber: '',
    experienceYears: 5,
    areasServed: '',
    bio: '',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    isAvailable: true,
  });

  const { data: agents, isLoading } = useQuery({
    queryKey: ['admin-agents-list'],
    queryFn: async () => {
      const res = await apiClient.get('/agents');
      return res.data?.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return apiClient.post('/agents/admin', {
        ...payload,
        areasServed: payload.areasServed.split(',').map((a) => a.trim()).filter(Boolean),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-agents-list']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
      setModalOpen(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        avatar: '',
        agencyName: '',
        reraNumber: '',
        experienceYears: 5,
        areasServed: 'Besa, Wardha Road, Manish Nagar',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return apiClient.put(`/agents/${id}`, payload);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['admin-agents-list']);
      queryClient.invalidateQueries(['admin-agent-details', variables.id]);
      setEditModalOpen(false);
      setEditingAgent(null);
      setErrorMessage('');
      setPasswordWasUpdated(Boolean(variables?.payload?.password && variables.payload.password.trim()));
      setShowSuccessModal(true);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to update agent profile.';
      setErrorMessage(msg);
    },
  });

  const openEditModal = (agent) => {
    setErrorMessage('');
    setEditingAgent(agent);
    setEditFormData({
      name: agent.user?.name || '',
      phone: agent.user?.phone || agent.contactPhone || '',
      email: agent.user?.email || '',
      password: '',
      agencyName: agent.agencyName || '',
      reraNumber: agent.reraNumber || '',
      experienceYears: agent.experienceYears || 5,
      areasServed: Array.isArray(agent.areasServed)
        ? agent.areasServed.join(', ')
        : agent.areasServed || '',
      bio: agent.bio || '',
      status: agent.user?.status || 'ACTIVE',
      verificationStatus: agent.verificationStatus || 'VERIFIED',
      isAvailable: agent.isAvailable !== false,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingAgent) return;
    setErrorMessage('');

    const payload = {
      ...editFormData,
      experienceYears: Number(editFormData.experienceYears) || 1,
      areasServed: Array.isArray(editFormData.areasServed)
        ? editFormData.areasServed
        : editFormData.areasServed.split(',').map((s) => s.trim()).filter(Boolean),
    };

    if (!payload.password || !payload.password.trim()) {
      delete payload.password;
    } else {
      payload.password = payload.password.trim();
    }

    updateMutation.mutate({
      id: editingAgent._id,
      payload,
    });
  };

  const verifyMutation = useMutation({
    mutationFn: async ({ id, verificationStatus, isAvailable }) => {
      return apiClient.patch(`/agents/${id}/verify`, { verificationStatus, isAvailable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-agents-list']);
    },
  });

  const filteredAgents = agents?.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.user?.name?.toLowerCase().includes(q) ||
      a.agencyName?.toLowerCase().includes(q) ||
      a.reraNumber?.toLowerCase().includes(q) ||
      a.areasServed?.some((area) => area.toLowerCase().includes(q))
    );
  }) || [];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Certified Agents"
        subtitle="Manage verified brokers, RERA registrations, and lead assignment routing"
        icon={UserCheck}
        breadcrumbs={[{ label: 'Agents' }]}
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Onboard Agent</span>
          </button>
        }
      />

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search agents by name, agency, RERA, or locality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Total Agents: <strong className="text-slate-800">{agents?.length || 0}</strong>
        </span>
      </div>

      {/* Agents Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-56 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <div
              key={agent._id}
              onClick={() => navigate(`/agents/${agent._id}`)}
              className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-500/60 transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
            >
              <div className="space-y-3">
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3 min-w-0">
                    {agent.user?.avatar ? (
                      <img
                        src={getFullImageUrl(agent.user.avatar)}
                        alt={agent.user.name || 'Agent'}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-2xs">
                        {agent.user?.name?.[0]?.toUpperCase() || 'A'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                        {agent.user?.name || 'Agent'}
                      </h3>
                      <p className="text-xs text-slate-500 truncate font-medium">
                        {agent.agencyName || 'Independent Consultant'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span
                      className={`inline-flex items-center space-x-1 py-0.5 px-2 rounded-md text-[10px] font-bold ${
                        agent.verificationStatus === 'VERIFIED'
                          ? 'bg-teal-50 border border-teal-200 text-teal-800'
                          : 'bg-amber-50 border border-amber-200 text-amber-800'
                      }`}
                    >
                      <Shield className="w-3 h-3 text-teal-600" />
                      <span>{agent.verificationStatus || 'VERIFIED'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(agent);
                      }}
                      className="p-1 rounded-md border border-slate-200 text-slate-500 hover:text-teal-700 hover:bg-slate-50 transition"
                      title="Edit Profile & Password"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Rating</span>
                    <span className="font-bold text-amber-600 inline-flex items-center">
                      <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                      {agent.rating || 4.8} / 5.0
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Experience</span>
                    <span className="font-bold text-slate-800">{agent.experienceYears || 5} Years</span>
                  </div>
                  {agent.reraNumber && (
                    <div className="col-span-2 pt-1 border-t border-slate-200/60 font-mono text-[11px] text-slate-700">
                      RERA: <span className="font-semibold text-slate-900">{agent.reraNumber}</span>
                    </div>
                  )}
                </div>

                {/* Localities Served */}
                <div className="text-xs text-slate-600">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase block mb-1">
                    Coverage Areas:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {agent.areasServed?.map((area, idx) => (
                      <span
                        key={idx}
                        className="py-0.5 px-1.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                      >
                        {area}
                      </span>
                    )) || <span className="text-slate-400">Nagpur</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons: WhatsApp + Call + Status Toggle */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/91${agent.contactPhone || agent.user?.phone}?text=${encodeURIComponent(
                      `Hello ${agent.user?.name || 'Agent'}, regarding Nagpur Real Estate client routing:`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Phone Call */}
                  <a
                    href={`tel:+91${agent.contactPhone || agent.user?.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Call Agent"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  {agent.user?.email && (
                    <a
                      href={`mailto:${agent.user.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Send Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                  <span>Routing status:</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      verifyMutation.mutate({
                        id: agent._id,
                        isAvailable: !agent.isAvailable,
                      });
                    }}
                    className={`font-semibold transition-colors ${
                      agent.isAvailable !== false
                        ? 'text-emerald-700 hover:underline'
                        : 'text-slate-400 hover:underline'
                    }`}
                  >
                    {agent.isAvailable !== false ? '● Available for Leads' : '○ Paused'}
                  </button>
                </div>

                {/* View Full Details Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/agents/${agent._id}`)}
                    className="w-full text-center py-1.5 px-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200/70 transition flex items-center justify-center gap-1.5"
                  >
                    <span>View Full Details & Inventory</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={UserCheck}
          title="No agents found"
          description="Click '+ Onboard Agent' to certify your first real estate consultant."
        />
      )}

      {/* Onboard Agent Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Onboard Certified Agent"
          subtitle="Add an authorized real estate agent for CRM lead distribution"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <PhotoUploader
                  multiple={false}
                  folder="agents"
                  value={formData.avatar}
                  onChange={(url) => setFormData((prev) => ({ ...prev, avatar: url }))}
                  label="Agent Profile Photo"
                  helperText="Upload official headshot or passport photo"
                  aspect="avatar"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Agent Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Rajesh Sharma"
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9823001234"
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rajesh@nagpurestate.com"
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Portal Login Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Defaults to Nagpur@Agent2026!"
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                />
                <span className="text-xs text-slate-400 mt-0.5 block">Used by agent to log into Agent Profolio Portal</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Agency Name
                </label>
                <input
                  type="text"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  placeholder="e.g., Sharma Realtors Besa"
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  MahaRERA Number
                </label>
                <input
                  type="text"
                  value={formData.reraNumber}
                  onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                  placeholder="e.g., A50500012345"
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Areas Served (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.areasServed}
                  onChange={(e) => setFormData({ ...formData, areasServed: e.target.value })}
                  placeholder="Besa, Wardha Road, Manish Nagar, Dharampeth"
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="py-2 px-3.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
              >
                {createMutation.isPending ? 'Onboarding...' : 'Onboard Agent'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {/* Edit Agent Modal */}
      {editModalOpen && editingAgent && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingAgent(null);
          }}
          title={`Edit Agent Profile: ${editingAgent.user?.name || 'Agent'}`}
          subtitle="Update contact details, MahaRERA registration, and portal login password"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Agent Full Name *
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
                />
              </div>

              {/* Password Reset Field */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-teal-600" />
                  <span>Set / Reset Portal Password</span>
                </label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="Leave blank to keep unchanged"
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  New password for agent's Profolio portal login
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Agency Name
                </label>
                <input
                  type="text"
                  value={editFormData.agencyName}
                  onChange={(e) => setEditFormData({ ...editFormData, agencyName: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  MahaRERA Number
                </label>
                <input
                  type="text"
                  value={editFormData.reraNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, reraNumber: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={editFormData.experienceYears}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, experienceYears: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Account Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Can log into Profolio)</option>
                  <option value="SUSPENDED">SUSPENDED (Access blocked)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Areas Served (Comma separated)
                </label>
                <input
                  type="text"
                  value={editFormData.areasServed}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, areasServed: e.target.value })
                  }
                  placeholder="e.g. Besa, Manish Nagar, Wardha Road, Dharampeth"
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Professional Bio
                </label>
                <textarea
                  rows={2}
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium outline-none resize-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-800 block">Available for Buyer Leads</span>
                  <span className="text-[11px] text-slate-500">
                    When active, public property leads route to this agent
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={editFormData.isAvailable}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, isAvailable: e.target.checked })
                  }
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingAgent(null);
                }}
                className="py-2 px-3.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs transition disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving Changes...' : 'Save Agent Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Success Confirmation Modal */}
      {showSuccessModal && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Changes Saved Successfully! 🎉"
          maxWidth="max-w-md"
        >
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Agent Profile & Password Updated!
              </h3>
              <p className="text-xs text-slate-600">
                All changes have been successfully saved to the system and database.
              </p>
            </div>

            {passwordWasUpdated && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-left space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>New Login Password Active:</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  The agent can now log into the Profolio Portal (port 5175) using their phone/email and this new password.
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-2xs"
              >
                Done / Continue
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AgentsManagementPage;