import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Kanban,
  Table as TableIcon,
  Download,
  Search,
  Phone,
  MessageSquare,
  UserCheck,
  Clock,
  Plus,
  AlertCircle,
  ArrowRight,
  X,
} from 'lucide-react';
import apiClient from '../../api/client';
import { formatDate, formatIndianPrice } from '../../utils/formatters';

const STATUS_COLUMNS = [
  { id: 'NEW', label: 'New Enquiries', color: 'border-blue-500 bg-blue-50/40' },
  { id: 'CONTACTED', label: 'Contacted', color: 'border-amber-500 bg-amber-50/40' },
  { id: 'VISIT_SCHEDULED', label: 'Visit Scheduled', color: 'border-purple-500 bg-purple-50/40' },
  { id: 'CLOSED_WON', label: 'Deal Won', color: 'border-emerald-500 bg-emerald-50/40' },
  { id: 'CLOSED_LOST', label: 'Closed / Lost', color: 'border-slate-400 bg-slate-50/40' },
];

const LeadManagementPage = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [selectedLead, setSelectedLead] = useState(null);
  const [activityNote, setActivityNote] = useState('');
  const [reassignAgentId, setReassignAgentId] = useState('');

  // Fetch Kanban Grouped Leads
  const { data: kanbanData, isLoading } = useQuery({
    queryKey: ['admin-crm-kanban'],
    queryFn: async () => {
      const res = await apiClient.get('/enquiries/admin/leads/kanban');
      return res.data?.data || {};
    },
  });

  // Fetch Available Agents for reassignment
  const { data: agents } = useQuery({
    queryKey: ['available-agents'],
    queryFn: async () => {
      const res = await apiClient.get('/agents');
      return res.data?.data || [];
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return apiClient.patch(`/enquiries/admin/leads/${id}`, { leadStatus: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-crm-kanban']);
    },
  });

  // Add Activity Note Mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ id, note }) => {
      return apiClient.post(`/enquiries/admin/leads/${id}/activity`, {
        activityType: 'NOTE_ADDED',
        details: note,
      });
    },
    onSuccess: () => {
      setActivityNote('');
      queryClient.invalidateQueries(['admin-crm-kanban']);
      if (selectedLead) {
        // Refresh selected lead details
        apiClient.get(`/enquiries/admin/leads/${selectedLead._id}`).then((res) => {
          setSelectedLead(res.data?.data?.lead);
        });
      }
    },
  });

  // Reassign Lead Mutation
  const reassignMutation = useMutation({
    mutationFn: async ({ leadId, agentId }) => {
      return apiClient.post(`/enquiries/admin/leads/${leadId}/assign`, { agentId });
    },
    onSuccess: () => {
      setReassignAgentId('');
      setSelectedLead(null);
      queryClient.invalidateQueries(['admin-crm-kanban']);
    },
  });

  const exportCsv = () => {
    window.open(`${apiClient.defaults.baseURL}/enquiries/admin/leads/export`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center space-x-2">
            <Kanban className="w-6 h-6 text-brand-orange" />
            <span>Real Estate CRM & Lead Pipeline</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track inquiries, automate agent routing, and manage site visit conversions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportCsv}
            className="flex items-center space-x-1.5 py-2 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((col) => {
          const leadsInCol = kanbanData?.[col.id] || [];

          return (
            <div
              key={col.id}
              className={`rounded-2xl border-t-4 p-4 bg-slate-50/70 border border-slate-200 min-w-[260px] flex flex-col justify-between ${col.color}`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {col.label}
                  </h3>
                  <span className="w-6 h-6 rounded-full bg-white text-slate-800 text-xs font-black flex items-center justify-center shadow-sm">
                    {leadsInCol.length}
                  </span>
                </div>

                {/* Lead Cards List */}
                <div className="space-y-3">
                  {leadsInCol.map((lead) => (
                    <div
                      key={lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-brand-orange">
                          {lead.customerName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {formatDate(lead.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {lead.propertyTitle || 'General Nagpur Property Inquiry'}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-brand-teal font-medium">
                          Agent: <strong>{lead.assignedAgent?.name || 'Unassigned'}</strong>
                        </span>
                        {lead.budget && (
                          <span className="font-bold text-slate-800">
                            {formatIndianPrice(lead.budget)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {leadsInCol.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 font-medium">
                      No leads in this stage
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Lead Details & CRM Drawer Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] uppercase font-bold text-brand-orange tracking-wider">
                CRM Lead Card
              </span>
              <h2 className="text-lg font-black text-brand-navy mt-0.5">{selectedLead.customerName}</h2>
              <p className="text-xs text-slate-500">Source: {selectedLead.leadSource} &middot; Received {formatDate(selectedLead.createdAt)}</p>
            </div>

            {/* Quick Contact Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <a
                href={`tel:+91${selectedLead.phoneNumber}`}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100"
              >
                <Phone className="w-3.5 h-3.5 text-brand-teal" />
                <span>Call +91 {selectedLead.phoneNumber}</span>
              </a>

              <a
                href={`https://wa.me/91${selectedLead.phoneNumber}?text=Hello%20${encodeURIComponent(selectedLead.customerName)},%20reaching%20out%20from%20Nagpur%20Real%20Estate%20regarding%20your%20inquiry.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Move Status Dropdown */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Update Pipeline Stage</label>
              <select
                value={selectedLead.leadStatus}
                onChange={(e) => {
                  updateStatusMutation.mutate({ id: selectedLead._id, status: e.target.value });
                  setSelectedLead({ ...selectedLead, leadStatus: e.target.value });
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              >
                {STATUS_COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reassign Agent Dropdown */}
            {agents && agents.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Reassign to Agent</label>
                <div className="flex gap-2">
                  <select
                    value={reassignAgentId}
                    onChange={(e) => setReassignAgentId(e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="">Select Agent...</option>
                    {agents.map((ag) => (
                      <option key={ag.user?._id} value={ag.user?._id}>
                        {ag.user?.name} ({ag.agencyName || 'Agent'})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!reassignAgentId || reassignMutation.isPending}
                    onClick={() => reassignMutation.mutate({ leadId: selectedLead._id, agentId: reassignAgentId })}
                    className="bg-brand-teal text-white text-xs font-bold px-3 py-2 rounded-xl disabled:opacity-40"
                  >
                    Reassign
                  </button>
                </div>
              </div>
            )}

            {/* Add Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Add CRM Note / Call Log</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Spoke to customer, visit scheduled for Saturday..."
                  value={activityNote}
                  onChange={(e) => setActivityNote(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  disabled={!activityNote.trim() || addNoteMutation.isPending}
                  onClick={() => addNoteMutation.mutate({ id: selectedLead._id, note: activityNote })}
                  className="bg-brand-orange text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagementPage;
