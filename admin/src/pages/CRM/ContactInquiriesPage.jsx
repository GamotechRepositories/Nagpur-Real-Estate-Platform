import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquareText,
  Search,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  Eye,
  Trash2,
  Table as TableIcon,
  LayoutGrid,
  Send,
  MessageCircle,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Inquiries' },
  { id: 'NEW', label: 'New', dotColor: 'bg-sky-500' },
  { id: 'CONTACTED', label: 'Contacted', dotColor: 'bg-amber-500' },
  { id: 'IN_PROGRESS', label: 'In Progress', dotColor: 'bg-indigo-500' },
  { id: 'RESOLVED', label: 'Resolved', dotColor: 'bg-emerald-500' },
  { id: 'CLOSED', label: 'Closed', dotColor: 'bg-slate-400' },
];

const INTEREST_LABELS = {
  BUYING: 'Buy Property / खरेदी',
  SELLING: 'Sell Property / विक्री',
  RENTING: 'Rent / भाड्याने',
  PLOT_LAND: 'Plot / Land / जमीन',
  COMMERCIAL: 'Commercial / व्यावसायिक',
  GENERAL_ADVICE: 'General Consultation / सल्ला',
  OTHER: 'General Inquiry',
};

export const ContactInquiriesPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusDraft, setStatusDraft] = useState('NEW');

  // Fetch inquiries from backend
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['admin-contact-inquiries'],
    queryFn: async () => {
      const res = await apiClient.get('/contact/admin');
      return res.data;
    },
  });

  const inquiries = responseData?.data || [];
  const statusCounts = responseData?.meta?.counts || {};

  // Status/Notes Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }) => {
      return apiClient.patch(`/contact/admin/${id}`, { status, adminNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-contact-inquiries']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
      if (selectedInquiry) {
        setSelectedInquiry(null);
      }
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return apiClient.delete(`/contact/admin/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-contact-inquiries']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
      if (selectedInquiry) {
        setSelectedInquiry(null);
      }
    },
  });

  // Filter list
  const filteredInquiries = useMemo(() => {
    let list = inquiries;

    if (activeTab !== 'ALL') {
      list = list.filter((item) => (item.status || 'NEW') === activeTab);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => {
        const nameMatch = item.fullName?.toLowerCase().includes(q);
        const phoneMatch = item.phoneNumber?.toLowerCase().includes(q);
        const emailMatch = item.email?.toLowerCase().includes(q);
        const locMatch = item.locality?.toLowerCase().includes(q);
        const msgMatch = item.message?.toLowerCase().includes(q);
        const intMatch = item.interestType?.toLowerCase().includes(q);
        return nameMatch || phoneMatch || emailMatch || locMatch || msgMatch || intMatch;
      });
    }

    return list;
  }, [inquiries, activeTab, search]);

  const handleExportCsv = () => {
    if (!inquiries.length) return;
    const headers = ['Full Name,Phone,Email,Interest Type,Locality,Message,Status,Date'];
    const rows = inquiries.map((r) =>
      `"${r.fullName}","${r.phoneNumber}","${r.email || ''}","${r.interestType || ''}","${r.locality || ''}","${(r.message || '').replace(/"/g, '""')}","${r.status}","${r.createdAt}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openDetailsModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setStatusDraft(inquiry.status || 'NEW');
    setAdminNotes(inquiry.adminNotes || '');
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Contact Form Inquiries"
        subtitle="Manage leads, inquiries, and customer feedback submitted from Flutter App & Website"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Contact Inquiries' }]}
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-medium shadow-2xs">
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
            </div>
          </div>
        }
      />

      {/* Status Filter Tabs */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max">
          {STATUS_TABS.map((tab) => {
            const count = statusCounts[tab.id] ?? (tab.id === 'ALL' ? inquiries.length : 0);
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
            placeholder="Search by customer name, phone, message, locality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>

        {search && (
          <button
            onClick={() => setSearch('')}
            className="py-1 px-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Content: Cards or Table */}
      {viewMode === 'cards' ? (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse p-4" />
            ))}
          </div>
        ) : filteredInquiries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInquiries.map((item) => (
              <div
                key={item._id}
                onClick={() => openDetailsModal(item)}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                        {item.fullName}
                      </h3>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <Badge status={item.status || 'NEW'} size="xs" />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="py-0.5 px-2 rounded-md bg-amber-50 text-amber-800 font-semibold text-[11px] border border-amber-200">
                      {INTEREST_LABELS[item.interestType] || item.interestType}
                    </span>
                    {item.locality && (
                      <span className="flex items-center text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                        {item.locality}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic leading-relaxed">
                    "{item.message}"
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center space-x-1.5">
                    <a
                      href={`https://wa.me/91${item.phoneNumber}?text=${encodeURIComponent(
                        `Hello ${item.fullName}, thank you for contacting ZAMEEN Nagpur regarding: "${item.message.slice(0, 50)}..."`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 py-1 px-2 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`tel:+91${item.phoneNumber}`}
                      className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                      title="Call Phone"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    {item.email && (
                      <a
                        href={`mailto:${item.email}`}
                        className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                        title="Send Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => openDetailsModal(item)}
                    className="p-1 text-slate-400 hover:text-slate-800"
                    title="View & Update"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={MessageSquareText}
            title="No contact inquiries found"
            description="Inquiries submitted from the home screen contact form will appear here."
          />
        )
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Interest / Topic</th>
                  <th className="py-3 px-3">Locality</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Message Preview</th>
                  <th className="py-3 px-3">Received</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                      Loading contact inquiries...
                    </td>
                  </tr>
                ) : filteredInquiries.length > 0 ? (
                  filteredInquiries.map((item) => (
                    <tr
                      key={item._id}
                      onClick={() => openDetailsModal(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {item.fullName}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        +91 {item.phoneNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span className="py-0.5 px-2 rounded-md bg-amber-50 text-amber-800 font-medium text-[11px] border border-amber-200 whitespace-nowrap">
                          {INTEREST_LABELS[item.interestType] || item.interestType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.locality || 'Nagpur'}
                      </td>
                      <td className="py-3 px-3">
                        <Badge status={item.status || 'NEW'} />
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate italic">
                        "{item.message}"
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`https://wa.me/91${item.phoneNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-emerald-50 text-emerald-600"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <a
                            href={`tel:+91${item.phoneNumber}`}
                            className="p-1 rounded hover:bg-slate-100 text-slate-600"
                            title="Call Phone"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => openDetailsModal(item)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-600"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                      No inquiries match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details & Status Modal */}
      {selectedInquiry && (
        <Modal
          isOpen={!!selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          title="Contact Form Inquiry Details"
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{selectedInquiry.fullName}</h4>
                <div className="mt-1 space-y-0.5 text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-700">Phone:</span> +91 {selectedInquiry.phoneNumber}
                  </p>
                  {selectedInquiry.email && (
                    <p>
                      <span className="font-semibold text-slate-700">Email:</span> {selectedInquiry.email}
                    </p>
                  )}
                  {selectedInquiry.locality && (
                    <p>
                      <span className="font-semibold text-slate-700">Locality:</span> {selectedInquiry.locality}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold text-slate-700">Category:</span>{' '}
                    {INTEREST_LABELS[selectedInquiry.interestType] || selectedInquiry.interestType}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Submitted: {new Date(selectedInquiry.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <Badge status={selectedInquiry.status || 'NEW'} />
            </div>

            {/* Message Body */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer Message / Requirement:</label>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Update Status:</label>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400"
              >
                <option value="NEW">NEW - Newly Received</option>
                <option value="CONTACTED">CONTACTED - Customer Called / Messaged</option>
                <option value="IN_PROGRESS">IN_PROGRESS - Requirements Being Processed</option>
                <option value="RESOLVED">RESOLVED - Query Answered / Deal Started</option>
                <option value="CLOSED">CLOSED - Completed / Archived</option>
              </select>
            </div>

            {/* Internal Staff Notes */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Staff / Follow-up Notes:</label>
              <textarea
                rows={3}
                placeholder="Add any agent or admin notes regarding this inquiry..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            {/* Direct Contact Buttons */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
              <a
                href={`https://wa.me/91${selectedInquiry.phoneNumber}?text=${encodeURIComponent(
                  `Hello ${selectedInquiry.fullName}, regarding your message on ZAMEEN:`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={`tel:+91${selectedInquiry.phoneNumber}`}
                className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Phone</span>
              </a>
            </div>

            {/* Save / Cancel Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this contact submission?')) {
                    deleteMutation.mutate(selectedInquiry._id);
                  }
                }}
                className="text-red-600 hover:text-red-700 text-xs font-semibold inline-flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      id: selectedInquiry._id,
                      status: statusDraft,
                      adminNotes,
                    })
                  }
                  className="py-1.5 px-4 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ContactInquiriesPage;
