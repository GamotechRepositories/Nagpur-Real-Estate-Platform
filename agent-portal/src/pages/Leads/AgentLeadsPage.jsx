import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users2,
  MessageCircle,
  PhoneCall,
  Search,
  Filter,
  CheckCircle,
  Calendar,
  Building2,
  ExternalLink,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatRelativeTime, formatDate } from '../../utils/formatters';

const LEAD_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Inquiries' },
  { value: 'NEW', label: 'New / Uncontacted' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'SITE_VISIT_SCHEDULED', label: 'Visit Scheduled' },
  { value: 'NEGOTIATION', label: 'In Negotiation' },
  { value: 'CLOSED_WON', label: 'Closed / Deal Won 🎉' },
  { value: 'LOST', label: 'Archived / Lost' },
];

export const AgentLeadsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['agent-leads', selectedStatus],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
      return apiClient.get(`/agents/me/leads?${params.toString()}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }) =>
      apiClient.patch(`/agents/me/leads/${id}/status`, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-leads']);
      queryClient.invalidateQueries(['agent-stats']);
    },
  });

  const leads = Array.isArray(data?.data?.leads)
    ? data.data.leads
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const filteredLeads = leads.filter((lead) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const leadName = (lead.customerName || lead.name || '').toLowerCase();
    const leadPhone = (lead.phoneNumber || lead.phone || '');
    const propTitle = (lead.property?.title || lead.propertyTitle || '').toLowerCase();
    return leadName.includes(q) || leadPhone.includes(q) || propTitle.includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Buyer Leads & Inquiries CRM
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct buyer contacts and callback requests received for your Nagpur property listings.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none pb-1">
          {LEAD_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex-shrink-0 cursor-pointer ${
                selectedStatus === opt.value
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 min-w-0 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by buyer name or phone..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-teal-600 transition shadow-2xs"
          />
        </div>
      </div>

      {/* Leads Table / Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading buyer inquiries...</div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-2xs">
          <Users2 size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No inquiries found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {selectedStatus === 'ALL'
              ? 'When buyers click "Contact Agent" or request a site tour for your properties, their inquiries will appear here.'
              : `No leads currently in status "${selectedStatus}".`}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Buyer Contact</th>
                  <th className="px-4 py-3">Inquired Property</th>
                  <th className="px-4 py-3">Message / Inquiry</th>
                  <th className="px-4 py-3">Lead Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => {
                  const leadPhone = lead.phoneNumber || lead.phone || '';
                  const rawPhone = leadPhone.replace(/[^0-9]/g, '');
                  const buyerName = lead.customerName || lead.name || 'Prospective Buyer';
                  const currentStatus = lead.leadStatus || lead.status || 'NEW';
                  const propertyTitle = lead.property?.title || lead.propertyTitle || 'Property';
                  const waUrl = rawPhone
                    ? `https://wa.me/91${rawPhone}?text=${encodeURIComponent(
                        `Hello ${buyerName}, I am ${user?.name || 'your real estate advisor'} following up on your inquiry about ${propertyTitle} on Nagpur Real Estate.`
                      )}`
                    : '#';

                  return (
                    <tr
                      key={lead._id}
                      onClick={() => navigate(`/leads/${lead._id}`)}
                      className="hover:bg-slate-50 transition cursor-pointer"
                    >
                      {/* Buyer */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 hover:text-teal-700 transition">{buyerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{leadPhone}</div>
                        {lead.email && <div className="text-[11px] text-slate-400">{lead.email}</div>}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Received {formatRelativeTime(lead.createdAt)}
                        </div>
                      </td>

                      {/* Property */}
                      <td className="px-4 py-3 max-w-xs">
                        {lead.property ? (
                          <div>
                            <div className="font-semibold text-slate-800 truncate">
                              {lead.property.title}
                            </div>
                            <div className="text-[11px] text-teal-700 font-mono font-bold mt-0.5">
                              {formatCurrency(lead.property.price)}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {lead.property.localityName || 'Nagpur'}
                            </div>
                          </div>
                        ) : lead.propertyTitle ? (
                          <div>
                            <div className="font-semibold text-slate-800 truncate">
                              {lead.propertyTitle}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {lead.locality || 'Nagpur'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">General Consultation</span>
                        )}
                      </td>

                      {/* Message */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded border border-slate-100">
                          "{lead.message || 'Customer requested phone callback / site visit.'}"
                        </p>
                      </td>

                      {/* Pipeline Status Selector */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            updateStatusMutation.mutate({ id: lead._id, status: e.target.value })
                          }
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-none focus:border-teal-600"
                        >
                          <option value="NEW">🟢 New Lead</option>
                          <option value="CONTACTED">💬 Contacted</option>
                          <option value="SITE_VISIT_SCHEDULED">📅 Visit Scheduled</option>
                          <option value="NEGOTIATION">🤝 Negotiation</option>
                          <option value="CLOSED_WON">🎉 Closed / Won</option>
                          <option value="LOST">⚪ Archived / Lost</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Dossier */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/leads/${lead._id}`);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                            title="View Full Lead Dossier"
                          >
                            <Eye size={13} className="text-teal-700" />
                            <span>Dossier</span>
                          </button>

                          {/* Direct WhatsApp */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={13} className="text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>

                          {/* Direct Phone Call */}
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                            title="Call Buyer"
                          >
                            <PhoneCall size={13} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
