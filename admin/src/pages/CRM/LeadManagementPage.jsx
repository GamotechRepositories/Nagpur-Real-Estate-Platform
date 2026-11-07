import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Kanban,
  Table as TableIcon,
  Download,
  Search,
  Phone,
  Building,
  User,
  Send,
  X,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const STATUS_COLUMNS = [
  { id: 'NEW', label: 'New', color: 'border-l-sky-500' },
  { id: 'CONTACTED', label: 'Contacted', color: 'border-l-amber-500' },
  { id: 'VISIT_SCHEDULED', label: 'Visit Scheduled', color: 'border-l-purple-500' },
  { id: 'CLOSED_WON', label: 'Deal Won', color: 'border-l-emerald-500' },
  { id: 'CLOSED_LOST', label: 'Closed / Lost', color: 'border-l-slate-400' },
];

export const LeadManagementPage = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('kanban');
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

  // Fetch Available Agents
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

  // Add Note Mutation
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
    <div className="space-y-5">
      <PageHeader
        title="CRM Leads"
        subtitle="Track inquiries, lead stages, and agent follow-ups"
        icon={Kanban}
        breadcrumbs={[{ label: 'Leads' }]}
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={exportCsv}
              className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-medium">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center space-x-1 py-1 px-2.5 rounded-md transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1 py-1 px-2.5 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        }
      />

      {/* Kanban Pipeline View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((col) => {
            const leadsInCol = kanbanData?.[col.id] || [];

            return (
              <div
                key={col.id}
                className="bg-slate-50 rounded-xl p-3 flex flex-col min-w-[240px] max-h-[calc(100vh-13rem)] border border-slate-200"
              >
                {/* Column Header */}
                <div className={`p-2.5 rounded-lg bg-white border-l-4 ${col.color} border border-slate-200 shadow-2xs mb-2.5 flex items-center justify-between`}>
                  <span className="text-xs font-bold text-slate-800">{col.label}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                    {leadsInCol.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 overflow-y-auto flex-1 pr-0.5">
                  {leadsInCol.length > 0 ? (
                    leadsInCol.map((lead) => (
                      <div
                        key={lead._id}
                        onClick={() => setSelectedLead(lead)}
                        className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900 truncate">
                            {lead.customerName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>

                        {lead.property && (
                          <div className="text-[11px] text-slate-600 truncate flex items-center space-x-1">
                            <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{lead.property.title}</span>
                          </div>
                        )}

                        {lead.message && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                            {lead.message}
                          </p>
                        )}

                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-600">
                            +91 {lead.phoneNumber}
                          </span>

                          {lead.assignedAgent ? (
                            <span className="text-[10px] font-medium text-emerald-700 truncate max-w-[80px]">
                              {lead.assignedAgent.name}
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-medium">Unassigned</span>
                          )}
                        </div>

                        {/* Quick stage advance buttons */}
                        <div className="pt-1">
                          {col.id === 'NEW' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatusMutation.mutate({ id: lead._id, status: 'CONTACTED' });
                              }}
                              className="w-full py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-semibold transition-colors"
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
                              className="w-full py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 text-[10px] font-semibold transition-colors"
                            >
                              Schedule Visit →
                            </button>
                          )}
                          {col.id === 'VISIT_SCHEDULED' && (
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStatusMutation.mutate({ id: lead._id, status: 'CLOSED_WON' });
                                }}
                                className="flex-1 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-semibold transition-colors"
                              >
                                Won
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStatusMutation.mutate({ id: lead._id, status: 'CLOSED_LOST' });
                                }}
                                className="flex-1 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors"
                              >
                                Lost
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-[11px] text-slate-400">
                      No leads in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 sm:px-4">Buyer Name</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Property</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Assigned Agent</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Loading leads...
                    </td>
                  </tr>
                ) : tableData.length > 0 ? (
                  tableData.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 font-semibold text-slate-900">
                        {lead.customerName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        +91 {lead.phoneNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">
                        {lead.property?.title || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge status={lead.leadStatus || 'NEW'} />
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {lead.assignedAgent?.name || 'Unassigned'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="py-1 px-2.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState icon={Kanban} title="No leads found" description="No inquiries match your query." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Details & Activity Log Modal */}
      {selectedLead && (
        <Modal
          isOpen={Boolean(selectedLead)}
          onClose={() => setSelectedLead(null)}
          title={selectedLead.customerName}
          subtitle={`Phone: +91 ${selectedLead.phoneNumber} · Received ${formatDate(selectedLead.createdAt)}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Quick Actions & Reassign Agent */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-700">Status:</span>
                <select
                  value={selectedLead.leadStatus || 'NEW'}
                  onChange={(e) => {
                    updateStatusMutation.mutate({ id: selectedLead._id, status: e.target.value });
                    setSelectedLead({ ...selectedLead, leadStatus: e.target.value });
                  }}
                  className="py-1 px-2 rounded border border-slate-200 bg-white font-medium outline-none"
                >
                  {STATUS_COLUMNS.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-700">Agent:</span>
                <select
                  value={selectedLead.assignedAgent?._id || reassignAgentId}
                  onChange={(e) => {
                    const agentId = e.target.value;
                    setReassignAgentId(agentId);
                    if (agentId) {
                      reassignMutation.mutate({ leadId: selectedLead._id, agentId });
                    }
                  }}
                  className="py-1 px-2 rounded border border-slate-200 bg-white font-medium outline-none"
                >
                  <option value="">Unassigned</option>
                  {agents?.map((ag) => (
                    <option key={ag._id} value={ag._id}>
                      {ag.user?.name || ag.agencyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message & Property */}
            {selectedLead.property && (
              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1 text-xs">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Inquired Property</span>
                <p className="font-semibold text-slate-900">{selectedLead.property.title}</p>
                <p className="text-slate-500">{selectedLead.property.localityName || 'Nagpur'}</p>
              </div>
            )}

            {selectedLead.message && (
              <div className="space-y-1 text-xs">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Buyer Message</span>
                <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedLead.message}
                </p>
              </div>
            )}

            {/* Activity History & Note Adding */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800">Activity & Notes</h4>

              {selectedLead.activityLog?.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedLead.activityLog.map((act, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{act.activityType}</span>
                        <span>{formatDate(act.timestamp)}</span>
                      </div>
                      <p className="text-slate-700 mt-0.5">{act.details}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No activity logs recorded yet.</p>
              )}

              {/* Add Note Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!activityNote.trim()) return;
                  addNoteMutation.mutate({ id: selectedLead._id, note: activityNote.trim() });
                }}
                className="flex items-center space-x-2 pt-1"
              >
                <input
                  type="text"
                  value={activityNote}
                  onChange={(e) => setActivityNote(e.target.value)}
                  placeholder="Add a call remark or internal note..."
                  className="flex-1 p-2 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
                />
                <button
                  type="submit"
                  disabled={addNoteMutation.isPending || !activityNote.trim()}
                  className="py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LeadManagementPage;
