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
  Send,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatIndianPrice } from '../../utils/formatters';

const STATUS_COLUMNS = [
  { id: 'NEW', label: 'New Enquiries', color: 'border-sky-500 bg-sky-50/40 text-sky-800' },
  { id: 'CONTACTED', label: 'Contacted', color: 'border-amber-500 bg-amber-50/40 text-amber-800' },
  { id: 'VISIT_SCHEDULED', label: 'Visit Scheduled', color: 'border-purple-500 bg-purple-50/40 text-purple-800' },
  { id: 'CLOSED_WON', label: 'Deal Won', color: 'border-emerald-500 bg-emerald-50/40 text-emerald-800' },
  { id: 'CLOSED_LOST', label: 'Closed / Lost', color: 'border-slate-400 bg-slate-50/40 text-slate-800' },
];

export const LeadManagementPage = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [selectedLead, setSelectedLead] = useState(null);
  const [activityNote, setActivityNote] = useState('');
  const [reassignAgentId, setReassignAgentId] = useState('');
  const [search, setSearch] = useState('');

  // Fetch Kanban Grouped Leads
  const { data: kanbanData, isLoading: kanbanLoading } = useQuery({
    queryKey: ['admin-crm-kanban'],
    queryFn: async () => {
      const res = await apiClient.get('/enquiries/admin/leads/kanban');
      return res.data?.data || {};
    },
  });

  // Fetch Table View Leads
  const { data: tableData, isLoading: tableLoading } = useQuery({
    queryKey: ['admin-crm-table', search],
    queryFn: async () => {
      const res = await apiClient.get(`/enquiries/admin/leads?search=${encodeURIComponent(search)}&limit=50`);
      return res.data?.data || [];
    },
    enabled: viewMode === 'table',
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
      queryClient.invalidateQueries(['admin-crm-table']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
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
        apiClient.get(`/enquiries/admin/leads/${selectedLead._id}`).then((res) => {
          setSelectedLead(res.data?.data?.lead || res.data?.data);
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
      queryClient.invalidateQueries(['admin-crm-table']);
    },
  });

  const exportCsv = () => {
    window.open(`${apiClient.defaults.baseURL}/enquiries/admin/leads/export`, '_blank');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM & Lead Management"
        subtitle="Manage prospective buyers, automate agent SLA routing, and track conversion stages"
        icon={Kanban}
        breadcrumbs={[{ label: 'CRM & Leads' }]}
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={exportCsv}
              className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <div className="flex bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-brand-orange'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-brand-orange'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        }
      />

      {/* Kanban Pipeline View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-6">
          {STATUS_COLUMNS.map((col) => {
            const leadsInCol = kanbanData?.[col.id] || [];

            return (
              <div
                key={col.id}
                className="bg-slate-200/50 rounded-3xl p-3 flex flex-col min-w-[260px] max-h-[calc(100vh-14rem)] border border-slate-200/80"
              >
                {/* Column Header */}
                <div className={`p-3 rounded-2xl bg-white border-l-4 ${col.color} shadow-xs mb-3 flex items-center justify-between`}>
                  <span className="text-xs font-black text-slate-800">{col.label}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">
                    {leadsInCol.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 overflow-y-auto flex-1 pr-1 dark-scroll">
                  {leadsInCol.length > 0 ? (
                    leadsInCol.map((lead) => (
                      <div
                        key={lead._id}
                        onClick={() => setSelectedLead(lead)}
                        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-brand-teal/50 transition-all cursor-pointer space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-slate-900 truncate">
                            {lead.customerName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>

                        {lead.property && (
                          <div className="text-[11px] font-semibold text-brand-teal truncate flex items-center space-x-1">
                            <Building className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{lead.property.title}</span>
                          </div>
                        )}

                        {lead.message && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 italic bg-slate-50 p-2 rounded-lg">
                            "{lead.message}"
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-600 font-semibold">
                            +91 {lead.phoneNumber}
                          </span>

                          {lead.assignedAgent ? (
                            <span className="text-[10px] font-bold text-emerald-600 truncate max-w-[90px]">
                              {lead.assignedAgent.name}
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-bold">Unassigned</span>
                          )}
                        </div>

                        {/* Quick stage advance buttons */}
                        <div className="pt-1 flex items-center justify-between gap-1">
                          {col.id === 'NEW' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatusMutation.mutate({ id: lead._id, status: 'CONTACTED' });
                              }}
                              className="w-full py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold transition-colors"
                            >
                              Mark Contacted →
                            </button>
                          )}
                          {col.id === 'CONTACTED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatusMutation.mutate({ id: lead._id, status: 'VISIT_SCHEDULED' });
                              }}
                              className="w-full py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold transition-colors"
                            >
                              Schedule Visit →
                            </button>
                          )}
                          {col.id === 'VISIT_SCHEDULED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatusMutation.mutate({ id: lead._id, status: 'CLOSED_WON' });
                              }}
                              className="w-full py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold transition-colors"
                            >
                              Won Deal ✓
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[11px] text-slate-400 font-medium">
                      No leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search leads by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Inquired Property</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Agent</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">Loading leads...</td>
                  </tr>
                ) : tableData && tableData.length > 0 ? (
                  tableData.map((lead) => (
                    <tr
                      key={lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">{lead.customerName}</td>
                      <td className="py-3.5 px-4 font-mono font-medium">+91 {lead.phoneNumber}</td>
                      <td className="py-3.5 px-4 max-w-xs truncate font-semibold text-brand-teal">
                        {lead.property?.title || 'General Marketplace Enquiry'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={lead.leadStatus} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {lead.assignedAgent?.name || <span className="text-amber-600 font-semibold">Unassigned</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="py-1 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">No leads recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Detail Slide-over / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedLead(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      CRM Lead Profile
                    </span>
                    <h3 className="text-lg font-black text-slate-900">{selectedLead.customerName}</h3>
                    <div className="mt-1">
                      <Badge status={selectedLead.leadStatus} />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Contact Bar */}
                <div className="flex items-center space-x-2">
                  <a
                    href={`tel:+91${selectedLead.phoneNumber}`}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call +91 {selectedLead.phoneNumber}</span>
                  </a>

                  <a
                    href={`https://wa.me/91${selectedLead.phoneNumber}?text=Hello%20${encodeURIComponent(selectedLead.customerName)},%20regarding%20your%20inquiry%20on%20Nagpur%20Real%20Estate`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-brand-teal text-xs font-bold flex items-center justify-center space-x-1 border border-teal-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* Property & Message details */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  {selectedLead.property && (
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Property</span>
                      <strong className="text-brand-teal text-sm">{selectedLead.property.title}</strong>
                    </div>
                  )}

                  {selectedLead.message && (
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Client Note</span>
                      <p className="text-slate-700 italic mt-0.5">"{selectedLead.message}"</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Source: {selectedLead.leadSource || 'WEBSITE'}</span>
                    <span>Received: {formatDate(selectedLead.createdAt)}</span>
                  </div>
                </div>

                {/* Stage Mover Buttons */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Move Pipeline Stage
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                    {STATUS_COLUMNS.map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => {
                          updateStatusMutation.mutate({ id: selectedLead._id, status: stage.id });
                          setSelectedLead((prev) => ({ ...prev, leadStatus: stage.id }));
                        }}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          selectedLead.leadStatus === stage.id
                            ? 'bg-brand-navy text-white border-brand-navy'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {stage.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agent Assignment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Assign Nagpur Agent
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={reassignAgentId || selectedLead.assignedAgent?._id || ''}
                      onChange={(e) => setReassignAgentId(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    >
                      <option value="">Select Agent...</option>
                      {agents?.map((a) => (
                        <option key={a._id} value={a.user?._id || a._id}>
                          {a.user?.name || a.agencyName || 'Nagpur Agent'}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!reassignAgentId}
                      onClick={() =>
                        reassignMutation.mutate({
                          leadId: selectedLead._id,
                          agentId: reassignAgentId,
                        })
                      }
                      className="py-2 px-3 rounded-xl bg-brand-teal text-white text-xs font-bold disabled:opacity-40"
                    >
                      Assign
                    </button>
                  </div>
                </div>

                {/* Add Activity Note */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Log Activity / Internal Note
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={activityNote}
                      onChange={(e) => setActivityNote(e.target.value)}
                      placeholder="e.g. Called buyer, requested site visit on Sunday..."
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                    />
                    <button
                      type="button"
                      disabled={!activityNote.trim() || addNoteMutation.isPending}
                      onClick={() =>
                        addNoteMutation.mutate({
                          id: selectedLead._id,
                          note: activityNote.trim(),
                        })
                      }
                      className="p-2.5 rounded-xl bg-brand-orange text-white text-xs font-bold disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Close Profile
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
