import React, { useState, useMemo } from 'react';
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
  MessageCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const STATUS_COLUMNS = [
  {
    id: 'NEW',
    label: 'New Inquiries',
    dotColor: 'bg-sky-500',
    ringColor: 'ring-sky-100',
    badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  {
    id: 'CONTACTED',
    label: 'Contacted',
    dotColor: 'bg-amber-500',
    ringColor: 'ring-amber-100',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'VISIT_SCHEDULED',
    label: 'Visit Scheduled',
    dotColor: 'bg-purple-500',
    ringColor: 'ring-purple-100',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  {
    id: 'CLOSED_WON',
    label: 'Deal Won',
    dotColor: 'bg-emerald-500',
    ringColor: 'ring-emerald-100',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'CLOSED_LOST',
    label: 'Closed / Lost',
    dotColor: 'bg-slate-400',
    ringColor: 'ring-slate-100',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

export const LeadManagementPage = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [selectedLead, setSelectedLead] = useState(null);
  const [activityNote, setActivityNote] = useState('');
  const [reassignAgentId, setReassignAgentId] = useState('');
  const [search, setSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState('');

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
      const res = await apiClient.get(
        `/enquiries/admin/leads?search=${encodeURIComponent(search)}&limit=50`
      );
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

  // Pipeline metrics calculation
  const metrics = useMemo(() => {
    if (!kanbanData) return { total: 0, new: 0, inProgress: 0, won: 0 };
    const newCount = kanbanData.NEW?.length || 0;
    const contactedCount = kanbanData.CONTACTED?.length || 0;
    const visitCount = kanbanData.VISIT_SCHEDULED?.length || 0;
    const wonCount = kanbanData.CLOSED_WON?.length || 0;
    const lostCount = kanbanData.CLOSED_LOST?.length || 0;
    return {
      total: newCount + contactedCount + visitCount + wonCount + lostCount,
      new: newCount,
      inProgress: contactedCount + visitCount,
      won: wonCount,
    };
  }, [kanbanData]);

  // Filtered Kanban Leads based on search and agent filter
  const filteredKanbanData = useMemo(() => {
    if (!kanbanData) return {};
    const result = {};
    const query = search.trim().toLowerCase();

    STATUS_COLUMNS.forEach((col) => {
      const items = kanbanData[col.id] || [];
      result[col.id] = items.filter((lead) => {
        // Agent filter
        if (agentFilter) {
          if (agentFilter === 'unassigned') {
            if (lead.assignedAgent) return false;
          } else {
            const agId = lead.assignedAgent?._id || lead.assignedAgent;
            if (agId !== agentFilter) return false;
          }
        }

        // Search query
        if (!query) return true;
        const nameMatch = lead.customerName?.toLowerCase().includes(query);
        const phoneMatch = lead.phoneNumber?.toLowerCase().includes(query);
        const propMatch = lead.property?.title?.toLowerCase().includes(query);
        const localityMatch = lead.property?.localityName?.toLowerCase().includes(query);
        return nameMatch || phoneMatch || propMatch || localityMatch;
      });
    });

    return result;
  }, [kanbanData, search, agentFilter]);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="CRM Leads Pipeline"
        subtitle="Manage prospective buyers, agent routing, and deal conversion"
        icon={Kanban}
        breadcrumbs={[{ label: 'Leads' }]}
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={exportCsv}
              className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-medium shadow-2xs">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center space-x-1 py-1 px-3 rounded-md transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1 py-1 px-3 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        }
      />

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider block">
              Total Inquiries
            </span>
            <span className="text-xl font-bold text-slate-900">{metrics.total}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
            <Kanban className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider block">
              New Leads
            </span>
            <span className="text-xl font-bold text-sky-600">{metrics.new}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider block">
              In Follow-Up
            </span>
            <span className="text-xl font-bold text-amber-600">{metrics.inProgress}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider block">
              Deals Won
            </span>
            <span className="text-xl font-bold text-emerald-600">{metrics.won}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Universal Search & Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by buyer name, phone, property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Agent Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white outline-none"
            >
              <option value="">All Agents</option>
              <option value="unassigned">Unassigned Leads</option>
              {agents?.map((ag) => (
                <option key={ag._id} value={ag.user?._id || ag._id}>
                  {ag.user?.name || ag.agencyName}
                </option>
              ))}
            </select>
          </div>

          {(search || agentFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setAgentFilter('');
              }}
              className="py-1 px-2 text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Kanban Pipeline View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((col) => {
            const leadsInCol = filteredKanbanData[col.id] || [];

            return (
              <div
                key={col.id}
                className="bg-slate-100/70 rounded-xl p-2.5 flex flex-col min-w-[260px] max-h-[calc(100vh-16rem)] border border-slate-200/80 shadow-2xs"
              >
                {/* Clean Column Header */}
                <div className="p-2 mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${col.dotColor} ring-4 ${col.ringColor}`}
                    />
                    <span className="text-xs font-bold text-slate-800">{col.label}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-bold shadow-2xs">
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
                        className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-2 group"
                      >
                        {/* Header: Customer name & Date */}
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                            {lead.customerName}
                          </span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-1">
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>

                        {/* Inquired Property */}
                        {lead.property && (
                          <div className="text-[11px] font-medium text-slate-700 flex items-center space-x-1 truncate">
                            <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{lead.property.title}</span>
                          </div>
                        )}

                        {/* Message Preview */}
                        {lead.message && (
                          <p className="text-[11px] text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100 line-clamp-2 leading-relaxed italic">
                            "{lead.message}"
                          </p>
                        )}

                        {/* Contact details & Quick WhatsApp/Call */}
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-600 text-[11px]">
                            +91 {lead.phoneNumber}
                          </span>

                          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            {/* WhatsApp Button */}
                            <a
                              href={`https://wa.me/91${lead.phoneNumber}?text=${encodeURIComponent(
                                `Hello ${lead.customerName}, regarding your inquiry for ${
                                  lead.property?.title || 'property'
                                } on Nagpur Real Estate:`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            {/* Call Button */}
                            <a
                              href={`tel:+91${lead.phoneNumber}`}
                              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Call Buyer"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        {/* Footer: Assigned Agent & Action */}
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                          {lead.assignedAgent ? (
                            <span className="text-[10px] font-medium text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                              {lead.assignedAgent.name}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                              Unassigned
                            </span>
                          )}

                          {/* Quick stage advance */}
                          {col.id === 'NEW' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatusMutation.mutate({ id: lead._id, status: 'CONTACTED' });
                              }}
                              className="py-1 px-2 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-200 transition-colors"
                            >
                              Contacted →
                            </button>
                          )}

                          {col.id === 'CONTACTED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatusMutation.mutate({
                                  id: lead._id,
                                  status: 'VISIT_SCHEDULED',
                                });
                              }}
                              className="py-1 px-2 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-800 text-[10px] font-semibold border border-purple-200 transition-colors"
                            >
                              Visit →
                            </button>
                          )}

                          {col.id === 'VISIT_SCHEDULED' && (
                            <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() =>
                                  updateStatusMutation.mutate({ id: lead._id, status: 'CLOSED_WON' })
                                }
                                className="py-0.5 px-2 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200 transition-colors"
                              >
                                Won
                              </button>
                              <button
                                onClick={() =>
                                  updateStatusMutation.mutate({ id: lead._id, status: 'CLOSED_LOST' })
                                }
                                className="py-0.5 px-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold border border-slate-200 transition-colors"
                              >
                                Lost
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 px-4 text-center rounded-lg border border-dashed border-slate-300/70 bg-white/40 flex flex-col items-center justify-center">
                      <span className="text-xs text-slate-400 font-medium">No leads</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
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
                  <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
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
                      <td className="py-2.5 px-3 sm:px-4 font-bold text-slate-900">
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
                        {lead.assignedAgent?.name ? (
                          <span className="font-medium text-slate-800">{lead.assignedAgent.name}</span>
                        ) : (
                          <span className="text-amber-700 font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <a
                            href={`https://wa.me/91${lead.phoneNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-emerald-50 text-emerald-600"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="py-1 px-2.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        icon={Kanban}
                        title="No leads found"
                        description="No inquiries match your query."
                      />
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
          subtitle={`Received ${formatDate(selectedLead.createdAt)}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Quick Contact & Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center space-x-3">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  +91 {selectedLead.phoneNumber}
                </span>

                <a
                  href={`https://wa.me/91${selectedLead.phoneNumber}?text=${encodeURIComponent(
                    `Hello ${selectedLead.customerName}, regarding your inquiry on Nagpur Real Estate:`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:+91${selectedLead.phoneNumber}`}
                  className="inline-flex items-center space-x-1 py-1 px-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>

              {/* Status and Agent Selectors */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <select
                    value={selectedLead.leadStatus || 'NEW'}
                    onChange={(e) => {
                      updateStatusMutation.mutate({ id: selectedLead._id, status: e.target.value });
                      setSelectedLead({ ...selectedLead, leadStatus: e.target.value });
                    }}
                    className="py-1 px-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 outline-none"
                  >
                    {STATUS_COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-slate-500 font-medium">Agent:</span>
                  <select
                    value={selectedLead.assignedAgent?._id || reassignAgentId}
                    onChange={(e) => {
                      const agentId = e.target.value;
                      setReassignAgentId(agentId);
                      if (agentId) {
                        reassignMutation.mutate({ leadId: selectedLead._id, agentId });
                      }
                    }}
                    className="py-1 px-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 outline-none"
                  >
                    <option value="">Unassigned</option>
                    {agents?.map((ag) => (
                      <option key={ag._id} value={ag.user?._id || ag._id}>
                        {ag.user?.name || ag.agencyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Inquired Property */}
            {selectedLead.property && (
              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                  Inquired Property
                </span>
                <p className="font-bold text-slate-900 text-sm">{selectedLead.property.title}</p>
                <p className="text-slate-500 font-medium">
                  {selectedLead.property.localityName || 'Nagpur'}
                </p>
              </div>
            )}

            {/* Buyer Message */}
            {selectedLead.message && (
              <div className="space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                  Buyer Note
                </span>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed font-normal">
                  {selectedLead.message}
                </p>
              </div>
            )}

            {/* Activity History & Note Adding */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Activity & Notes History
              </h4>

              {selectedLead.activityLog?.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedLead.activityLog.map((act, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>{act.activityType}</span>
                        <span>{formatDate(act.timestamp)}</span>
                      </div>
                      <p className="text-slate-800 mt-1 font-medium">{act.details}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No notes recorded yet.</p>
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
                  placeholder="Type a call remark or follow-up note..."
                  className="flex-1 p-2 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
                />
                <button
                  type="submit"
                  disabled={addNoteMutation.isPending || !activityNote.trim()}
                  className="py-2 px-3.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center space-x-1"
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
