import React, { useState } from 'react';
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
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import PhotoUploader, { getFullImageUrl } from '../../components/common/PhotoUploader';

export const AgentsManagementPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    avatar: '',
    agencyName: '',
    reraNumber: '',
    experienceYears: 5,
    areasServed: 'Besa, Wardha Road, Manish Nagar',
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
        avatar: '',
        agencyName: '',
        reraNumber: '',
        experienceYears: 5,
        areasServed: 'Besa, Wardha Road, Manish Nagar',
      });
    },
  });

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
              className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
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
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {agent.user?.name || 'Agent'}
                      </h3>
                      <p className="text-xs text-slate-500 truncate font-medium">
                        {agent.agencyName || 'Independent Consultant'}
                      </p>
                    </div>
                  </div>

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
                    className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Phone Call */}
                  <a
                    href={`tel:+91${agent.contactPhone || agent.user?.phone}`}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Call Agent"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  {agent.user?.email && (
                    <a
                      href={`mailto:${agent.user.email}`}
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
                    onClick={() =>
                      verifyMutation.mutate({
                        id: agent._id,
                        isAvailable: !agent.isAvailable,
                      })
                    }
                    className={`font-semibold transition-colors ${
                      agent.isAvailable !== false
                        ? 'text-emerald-700 hover:underline'
                        : 'text-slate-400 hover:underline'
                    }`}
                  >
                    {agent.isAvailable !== false ? '● Available for Leads' : '○ Paused'}
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
    </div>
  );
};

export default AgentsManagementPage;