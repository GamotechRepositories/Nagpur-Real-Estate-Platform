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
  Eye,
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
  const [showEditPassword, setShowEditPassword] = useState(false);

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

      {/* Agents Row-based Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredAgents.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Certified Agent & Agency</th>
                  <th className="py-3 px-3">MahaRERA No.</th>
                  <th className="py-3 px-3">Coverage Areas</th>
                  <th className="py-3 px-3">Rating & Experience</th>
                  <th className="py-3 px-3">Contact & WhatsApp</th>
                  <th className="py-3 px-3">Lead Routing</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAgents.map((agent) => {
                  const avatarUrl = getFullImageUrl(agent.user?.avatar);
                  return (
                    <tr
                      key={agent._id}
                      onClick={() => navigate(`/agents/${agent._id}`)}
                      className="hover:bg-slate-50/80 transition cursor-pointer group"
                    >
                      {/* Agent Name & Agency */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={agent.user?.name || 'Agent'}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-2xs">
                              {agent.user?.name?.[0]?.toUpperCase() || 'A'}
                            </div>
                          )}
                          <div className="min-w-0 max-w-xs">
                            <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition truncate">
                              {agent.user?.name || 'Agent'}
                            </h3>
                            <p className="text-[11px] text-slate-500 truncate font-medium">
                              {agent.agencyName || 'Independent Consultant'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* MahaRERA Number */}
                      <td className="py-3 px-3 font-mono">
                        {agent.reraNumber ? (
                          <span className="font-semibold text-slate-800 bg-slate-100 py-0.5 px-2 rounded text-[11px] border border-slate-200">
                            {agent.reraNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not set</span>
                        )}
                      </td>

                      {/* Coverage Areas */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {agent.areasServed && agent.areasServed.length > 0 ? (
                            agent.areasServed.slice(0, 3).map((area, idx) => (
                              <span
                                key={idx}
                                className="py-0.5 px-1.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                              >
                                {area}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">Nagpur</span>
                          )}
                          {agent.areasServed && agent.areasServed.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              +{agent.areasServed.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rating & Experience */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-amber-600 inline-flex items-center text-[11px]">
                          <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                          <span>{agent.rating || 4.8} / 5.0</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block font-medium">
                          {agent.experienceYears || 5} Years Exp.
                        </span>
                      </td>

                      {/* Contact & WhatsApp */}
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-1.5">
                          <a
                            href={`https://wa.me/91${agent.contactPhone || agent.user?.phone}?text=${encodeURIComponent(
                              `Hello ${agent.user?.name || 'Agent'}, regarding Nagpur Real Estate client routing:`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={`tel:+91${agent.contactPhone || agent.user?.phone}`}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                            title="Call Agent"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {agent.user?.email && (
                            <a
                              href={`mailto:${agent.user.email}`}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                              title="Send Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          <div>📞 +91 {agent.contactPhone || agent.user?.phone}</div>
                          {agent.user?.email && (
                            <div className="text-teal-700 font-sans truncate max-w-[170px]" title={agent.user.email}>
                              ✉️ {agent.user.email}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Routing Status */}
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            verifyMutation.mutate({
                              id: agent._id,
                              isAvailable: !agent.isAvailable,
                            });
                          }}
                          className={`text-[11px] font-semibold py-1 px-2 rounded-md border transition ${
                            agent.isAvailable !== false
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {agent.isAvailable !== false ? '● Active' : '○ Paused'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(agent)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-slate-50 transition"
                            title="Edit Profile & Password"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/agents/${agent._id}`)}
                            className="p-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-900 transition"
                            title="View Agent Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-teal-600" />
                    <span>Set / Reset Portal Password</span>
                  </label>
                  {editFormData.password && (
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="text-[10px] text-teal-700 font-semibold hover:underline"
                    >
                      {showEditPassword ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
                <input
                  type={showEditPassword ? 'text' : 'password'}
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="Leave blank to keep unchanged"
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  New password for agent portal login (localhost:5175)
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