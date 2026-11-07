import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Banknote,
  Search,
  Phone,
  MessageCircle,
  Building,
  User,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  Eye,
  Send,
  Building2,
  FileCheck,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatIndianPrice } from '../../utils/formatters';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Requests' },
  { id: 'NEW', label: 'New', dotColor: 'bg-sky-500' },
  { id: 'DOCUMENTS_REQUESTED', label: 'Docs Requested', dotColor: 'bg-amber-500' },
  { id: 'SUBMITTED_TO_BANK', label: 'Submitted to Bank', dotColor: 'bg-purple-500' },
  { id: 'APPROVED', label: 'Approved', dotColor: 'bg-emerald-500' },
  { id: 'REJECTED', label: 'Rejected', dotColor: 'bg-slate-400' },
];

const PARTNER_BANKS = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Bank of Maharashtra',
  'Punjab National Bank (PNB)',
  'Tata Capital Home Loans',
];

export const LoanRequestsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [partnerBank, setPartnerBank] = useState('');
  const [internalNote, setInternalNote] = useState('');

  const { data: loanRequests, isLoading } = useQuery({
    queryKey: ['admin-loan-requests'],
    queryFn: async () => {
      const res = await apiClient.get('/tools/admin/loan-requests');
      return res.data?.data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }) => {
      return apiClient.patch(`/tools/admin/loan-requests/${id}`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-loan-requests']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
      if (selectedRequest) {
        setSelectedRequest(null);
      }
    },
  });

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const counts = { ALL: loanRequests?.length || 0 };
    STATUS_TABS.forEach((t) => {
      if (t.id !== 'ALL') counts[t.id] = 0;
    });

    loanRequests?.forEach((item) => {
      const st = item.status || 'NEW';
      if (counts[st] !== undefined) counts[st]++;
    });

    return counts;
  }, [loanRequests]);

  // Filter list
  const filteredRequests = useMemo(() => {
    let list = loanRequests || [];

    if (activeTab !== 'ALL') {
      list = list.filter((r) => (r.status || 'NEW') === activeTab);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const nameMatch = r.applicantName?.toLowerCase().includes(q);
        const phoneMatch = r.phoneNumber?.toLowerCase().includes(q);
        const emailMatch = r.email?.toLowerCase().includes(q);
        const propMatch = r.selectedProperty?.title?.toLowerCase().includes(q);
        return nameMatch || phoneMatch || emailMatch || propMatch;
      });
    }

    return list;
  }, [loanRequests, activeTab, search]);

  const handleExportCsv = () => {
    if (!loanRequests?.length) return;
    const headers = ['Applicant Name,Phone,Email,Employment,Monthly Income,Loan Required,Status,Created At'];
    const rows = loanRequests.map((r) =>
      `"${r.applicantName}","${r.phoneNumber}","${r.email || ''}","${r.employmentType || ''}","${r.monthlyIncome}","${r.loanAmountRequired}","${r.status}","${r.createdAt}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nagpur-loan-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Home Loan Requests"
        subtitle="Manage EMI calculator inquiries, collect KYC documents, and hand off to partner banks"
        icon={Banknote}
        breadcrumbs={[{ label: 'Loan Requests' }]}
        actions={
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        }
      />

      {/* Top Status Tabs */}
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

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by applicant name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>

        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid of Loan Requests */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              onClick={() => setSelectedRequest(req)}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                      {req.applicantName}
                    </h3>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Applied {formatDate(req.createdAt)}
                    </span>
                  </div>
                  <Badge status={req.status || 'NEW'} size="xs" />
                </div>

                {/* Financial Metrics */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      Loan Required
                    </span>
                    <span className="font-bold text-teal-800 text-sm">
                      {formatIndianPrice(req.loanAmountRequired)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      Monthly Income
                    </span>
                    <span className="font-semibold text-slate-700">
                      ₹ {Number(req.monthlyIncome || 0).toLocaleString('en-IN')} / mo
                    </span>
                  </div>
                </div>

                {/* Employment & Property */}
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Employment:</span>
                    <span className="font-medium text-slate-800">
                      {req.employmentType?.replace(/_/g, ' ') || 'Salaried'}
                    </span>
                  </div>

                  {req.selectedProperty && (
                    <div className="flex items-center space-x-1.5 text-slate-500 pt-0.5 truncate">
                      <Building className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{req.selectedProperty.title}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-700 font-medium">
                    +91 {req.phoneNumber}
                  </span>

                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`https://wa.me/91${req.phoneNumber}?text=${encodeURIComponent(
                        `Hello ${req.applicantName}, regarding your home loan inquiry for ${formatIndianPrice(
                          req.loanAmountRequired
                        )} on Nagpur Real Estate:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 py-1 px-2 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                      title="WhatsApp applicant"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`tel:+91${req.phoneNumber}`}
                      className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Call Applicant"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Stage Action */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[11px] text-slate-500 truncate">
                    {req.notes ? `Note: ${req.notes}` : 'No bank assigned'}
                  </span>

                  {req.status === 'NEW' && (
                    <button
                      onClick={() => updateMutation.mutate({ id: req._id, status: 'DOCUMENTS_REQUESTED' })}
                      className="py-1 px-2 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors"
                    >
                      Request Docs →
                    </button>
                  )}

                  {req.status === 'DOCUMENTS_REQUESTED' && (
                    <button
                      onClick={() => updateMutation.mutate({ id: req._id, status: 'SUBMITTED_TO_BANK' })}
                      className="py-1 px-2 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold border border-purple-200 transition-colors"
                    >
                      Submit to Bank →
                    </button>
                  )}

                  {req.status === 'SUBMITTED_TO_BANK' && (
                    <button
                      onClick={() => updateMutation.mutate({ id: req._id, status: 'APPROVED' })}
                      className="py-1 px-2 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
                    >
                      Mark Approved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Banknote}
          title="No loan requests found"
          description={
            activeTab !== 'ALL'
              ? `No inquiries currently in "${
                  STATUS_TABS.find((t) => t.id === activeTab)?.label
                }" stage.`
              : 'No applicants match your search criteria.'
          }
        />
      )}

      {/* Loan Details Modal & Bank Hand-off */}
      {selectedRequest && (
        <Modal
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          title={`Loan Application: ${selectedRequest.applicantName}`}
          subtitle={`Registered on ${formatDate(selectedRequest.createdAt)}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            {/* Quick Details Bar */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Loan Required
                </span>
                <span className="text-base font-bold text-teal-800">
                  {formatIndianPrice(selectedRequest.loanAmountRequired)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Applicant Contact
                </span>
                <span className="font-mono font-bold text-slate-800">
                  +91 {selectedRequest.phoneNumber}
                </span>
              </div>
              <Badge status={selectedRequest.status || 'NEW'} />
            </div>

            {/* Application Overview */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 bg-white">
              <div>
                <span className="text-slate-400 text-[11px] block">Monthly Income:</span>
                <span className="font-semibold text-slate-800">
                  ₹ {Number(selectedRequest.monthlyIncome || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Employment:</span>
                <span className="font-semibold text-slate-800">
                  {selectedRequest.employmentType?.replace(/_/g, ' ') || 'Salaried'}
                </span>
              </div>
              {selectedRequest.email && (
                <div className="col-span-2">
                  <span className="text-slate-400 text-[11px] block">Email:</span>
                  <span className="font-semibold text-slate-800">{selectedRequest.email}</span>
                </div>
              )}
            </div>

            {/* Hand-off to Banking Partner Form */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                Partner Bank Routing & Follow-up
              </h4>

              <div className="space-y-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select Partner Bank for Hand-off:
                  </label>
                  <select
                    value={partnerBank}
                    onChange={(e) => setPartnerBank(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 outline-none"
                  >
                    <option value="">-- Choose Partner Bank --</option>
                    {PARTNER_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Internal Follow-up Remark / Lead Note:
                  </label>
                  <textarea
                    rows={2}
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Enter banker name, application file number or verification note..."
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedRequest.status || 'NEW'}
                    onChange={(e) => {
                      updateMutation.mutate({
                        id: selectedRequest._id,
                        status: e.target.value,
                        notes: internalNote || selectedRequest.notes,
                      });
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                  >
                    {STATUS_TABS.filter((t) => t.id !== 'ALL').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    const combinedNote = [partnerBank ? `Handed off to ${partnerBank}` : '', internalNote]
                      .filter(Boolean)
                      .join(' - ');
                    updateMutation.mutate({
                      id: selectedRequest._id,
                      status: 'SUBMITTED_TO_BANK',
                      notes: combinedNote || 'Submitted to partner bank',
                    });
                  }}
                  disabled={updateMutation.isPending}
                  className="py-2 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors shadow-2xs"
                >
                  Forward to Bank →
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LoanRequestsPage;
