import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table as TableIcon,
  LayoutGrid,
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
  Eye,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Leads' },
  { id: 'NEW', label: 'New', dotColor: 'bg-sky-500' },
  { id: 'CONTACTED', label: 'Contacted', dotColor: 'bg-amber-500' },
  { id: 'VISIT_SCHEDULED', label: 'Visit Scheduled', dotColor: 'bg-purple-500' },
  { id: 'CLOSED_WON', label: 'Deal Won', dotColor: 'bg-emerald-500' },
  { id: 'CLOSED_LOST', label: 'Closed / Lost', dotColor: 'bg-slate-400' },
];

export const LeadManagementPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [selectedLead, setSelectedLead] = useState(null);
  const [activityNote, setActivityNote] = useState('');
  const [reassignAgentId, setReassignAgentId] = useState('');
  const [search, setSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState('');

  // Fetch Grouped Leads
  const { data: kanbanData, isLoading } = useQuery({
    queryKey: ['admin-crm-kanban'],
    queryFn: async () => {
      const res = await apiClient.get('/enquiries/admin/leads/kanban');
      return res.data?.data || {};
    },
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
    },
  });

  const exportCsv = () => {
    window.open(`${apiClient.defaults.baseURL}/enquiries/admin/leads/export`, '_blank');
  };

  // Flatten all leads & compute tab counts
  const { allLeads, tabCounts } = useMemo(() => {
    if (!kanbanData) return { allLeads: [], tabCounts: {} };
    const list = [];
    const counts = { ALL: 0 };

    STATUS_TABS.forEach((tab) => {
      if (tab.id !== 'ALL') {
        const items = kanbanData[tab.id] || [];
        counts[tab.id] = items.length;
        counts.ALL += items.length;
        list.push(...items);
      }
    });

    return { allLeads: list, tabCounts: counts };
  }, [kanbanData]);

  // Filter leads by activeTab, search, and agentFilter
  const filteredLeads = useMemo(() => {
    let list = allLeads;

    // Status Tab Filter
    if (activeTab !== 'ALL') {
      list = list.filter((l) => (l.leadStatus || 'NEW') === activeTab);
    }

    // Agent Filter
    if (agentFilter) {
      if (agentFilter === 'unassigned') {
        list = list.filter((l) => !l.assignedAgent);
      } else {
        list = list.filter((l) => {
          const agId = l.assignedAgent?._id || l.assignedAgent;
          return agId === agentFilter;
        });
      }
    }

    // Search query
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((l) => {
        const nameMatch = l.customerName?.toLowerCase().includes(q);
        const phoneMatch = l.phoneNumber?.toLowerCase().includes(q);
        const propMatch = l.property?.title?.toLowerCase().includes(q);
        const locMatch = l.property?.localityName?.toLowerCase().includes(q);
        return nameMatch || phoneMatch || propMatch || locMatch;
      });
    }

    return list;
  }, [allLeads, activeTab, agentFilter, search]);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="CRM Leads Pipeline"
        subtitle="Manage prospective buyers, follow-ups, and conversion stages"
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
                onClick={() => setViewMode('cards')}
                className={`flex items-center space-x-1 py-1 px-3 rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
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

      {/* Top Status Filter Tabs (Replaces crowded 5-column layout) */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max">
          {STATUS_TABS.map((tab) => {
            const count = tabCounts[tab.id] ?? 0;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {tab.dotColor && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-white' : tab.dotColor
                    }`}
                  />
                )}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Agent Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
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
          {/* Filter by Agent */}
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

      {/* Content View: Spacious Cards Grid OR Table View */}
      {viewMode === 'cards' ? (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse p-4"
              />
            ))}
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead._id}
                onClick={() => setSelectedLead(lead)}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2.5">
                  {/* Card Header: Name, Status Badge & Date */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                        {lead.customerName}
                      </h3>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Received {formatDate(lead.createdAt)}
                      </span>
                    </div>
                    <Badge status={lead.leadStatus || 'NEW'} size="xs" />
                  </div>

                  {/* Inquired Property */}
                  {lead.property && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center space-x-2 text-xs">
                      <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1 truncate">
                        <span className="font-semibold text-slate-800 block truncate">
                          {lead.property.title}
                        </span>
                        {lead.property.localityName && (
                          <span className="text-[10px] text-slate-500 block truncate">
                            {lead.property.localityName}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message Preview */}
                  {lead.message && (
                    <p className="text-xs text-slate-600 line-clamp-2 italic leading-relaxed">
                      "{lead.message}"
                    </p>
                  )}
                </div>

                {/* Footer Controls: Phone + WhatsApp + Call + Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-700 font-medium">
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
                        className="inline-flex items-center space-x-1 py-1 px-2 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Phone Call */}
                      <a
                        href={`tel:+91${lead.phoneNumber}`}
                        className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Call Buyer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Agent assignment & Stage advance */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs">
                    <div className="min-w-0">
                      {lead.assignedAgent ? (
                        <span className="text-[11px] font-medium text-teal-800 truncate block max-w-[130px]">
                          Agent: {lead.assignedAgent.name}
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-medium">
                          Unassigned
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* Quick stage transitions */}
                      {(lead.leadStatus === 'NEW' || !lead.leadStatus) && (
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({ id: lead._id, status: 'CONTACTED' })
                          }
                          className="py-1 px-2.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors"
                        >
                          Mark Contacted →
                        </button>
                      )}

                      {lead.leadStatus === 'CONTACTED' && (
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: lead._id,
                              status: 'VISIT_SCHEDULED',
                            })
                          }
                          className="py-1 px-2.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold border border-purple-200 transition-colors"
                        >
                          Schedule Visit →
                        </button>
                      )}

                      {lead.leadStatus === 'VISIT_SCHEDULED' && (
                        <>
                          <button
                            onClick={() =>
                              updateStatusMutation.mutate({ id: lead._id, status: 'CLOSED_WON' })
                            }
                            className="py-1 px-2 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
                          >
                            Won
                          </button>
                          <button
                            onClick={() =>
                              updateStatusMutation.mutate({ id: lead._id, status: 'CLOSED_LOST' })
                            }
                            className="py-1 px-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                          >
                            Lost
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building}
            title="No leads found"
            description={
              activeTab !== 'ALL'
                ? `No leads currently in "${
                    STATUS_TABS.find((t) => t.id === activeTab)?.label
                  }" stage.`
                : 'No inquiries match your current search criteria.'
            }
          />
        )
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Buyer Name</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Property</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Assigned Agent</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Loading leads...
                    </td>
                  </tr>
                ) : filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {lead.customerName}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        +91 {lead.phoneNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-xs truncate">
                        {lead.property?.title || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <Badge status={lead.leadStatus || 'NEW'} />
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {lead.assignedAgent?.name ? (
                          <span className="font-medium text-slate-800">{lead.assignedAgent.name}</span>
                        ) : (
                          <span className="text-amber-700 font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
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
                        icon={Building}
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
                    {STATUS_TABS.filter((t) => t.id !== 'ALL').map((col) => (
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
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
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
