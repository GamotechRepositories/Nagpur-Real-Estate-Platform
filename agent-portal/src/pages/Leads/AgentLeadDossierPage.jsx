import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Send,
  AlertCircle,
  FileText,
  UserCheck,
  Tag,
  IndianRupee,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const backendOrigin = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
};

const STATUS_OPTIONS = [
  { id: 'NEW', label: 'New / Uncontacted' },
  { id: 'CONTACTED', label: 'Contacted' },
  { id: 'SITE_VISIT_SCHEDULED', label: 'Visit Scheduled' },
  { id: 'NEGOTIATION', label: 'In Negotiation' },
  { id: 'CLOSED_WON', label: 'Closed / Deal Won 🎉' },
  { id: 'LOST', label: 'Archived / Lost' },
];

export const AgentLeadDossierPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [newNote, setNewNote] = useState('');

  // 1. Fetch Lead Details
  const {
    data: leadData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['agent-lead-detail', id],
    queryFn: async () => {
      const res = await apiClient.get(`/enquiries/admin/leads/${id}`);
      return res.data?.data;
    },
    enabled: !!id,
  });

  // 2. Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status) => {
      return apiClient.patch(`/enquiries/admin/leads/${id}`, { leadStatus: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-lead-detail', id]);
      queryClient.invalidateQueries(['agent-leads']);
      queryClient.invalidateQueries(['agent-stats']);
    },
  });

  // 3. Add Note Mutation
  const addNoteMutation = useMutation({
    mutationFn: async (note) => {
      return apiClient.post(`/enquiries/admin/leads/${id}/activity`, {
        activityType: 'NOTE_ADDED',
        details: note,
      });
    },
    onSuccess: () => {
      setNewNote('');
      queryClient.invalidateQueries(['agent-lead-detail', id]);
    },
  });

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addNoteMutation.mutate(newNote.trim());
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Loading Lead Dossier & Buyer History...</span>
      </div>
    );
  }

  if (isError || !leadData?.lead) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">Lead Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          {error?.response?.data?.message || 'Unable to retrieve lead dossier. You may not have permission to view this inquiry.'}
        </p>
        <Link
          to="/leads"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <ArrowLeft size={14} /> Back to Leads
        </Link>
      </div>
    );
  }

  const { lead, activities = [] } = leadData;
  const prop = lead.property;

  const rawPhotos = Array.isArray(prop?.photos) && prop.photos.length > 0
    ? prop.photos
    : (prop?.images || []);
  const photos = rawPhotos.map((p) => {
    if (typeof p === 'string') return { url: getFullImageUrl(p) };
    return { ...p, url: getFullImageUrl(p.url) };
  });

  const coverUrl = photos.find((p) => p.isCover)?.url || photos[0]?.url || getFullImageUrl(prop?.coverImage);
  const cleanPhone = (lead.phoneNumber || '').replace(/[^0-9]/g, '');

  return (
    <div className="w-full space-y-5 pb-20 animate-in fade-in duration-150">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Leads</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp Direct */}
          {cleanPhone && (
            <a
              href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                `Hello ${lead.customerName || 'Customer'}, I am ${user?.name || 'your assigned real estate advisor'} regarding your inquiry for "${prop?.title || lead.propertyTitle || 'Property'}" on Nagpur Real Estate:`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Buyer</span>
            </a>
          )}

          {/* Call Direct */}
          {cleanPhone && (
            <a
              href={`tel:+91${cleanPhone}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <Phone size={14} />
              <span>Call (+91 {lead.phoneNumber})</span>
            </a>
          )}

          {/* Status Dropdown */}
          <select
            value={lead.leadStatus || 'NEW'}
            onChange={(e) => updateStatusMutation.mutate(e.target.value)}
            disabled={updateStatusMutation.isPending}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-teal-500 shadow-2xs"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st.id} value={st.id}>
                Status: {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FORMAL PDF-STYLE DOSSIER SHEET */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-sm p-6 sm:p-10 space-y-8 font-sans text-slate-800">
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 pb-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-teal-800 uppercase font-mono">
              NAGPUR REAL ESTATE PLATFORM • CRM BUYER LEAD DOSSIER
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Lead: {lead.customerName || 'Prospective Buyer'}
            </h1>
            <p className="text-xs text-slate-600">
              📞 Phone: <strong className="font-mono text-slate-900">+91 {lead.phoneNumber}</strong>
              {lead.email && <span> &bull; ✉️ {lead.email}</span>}
              {lead.locality && <span> &bull; 📍 Preferred Locality: {lead.locality}</span>}
            </p>
          </div>

          <div className="flex md:flex-col items-end justify-between md:justify-center gap-2">
            <div className="text-right">
              <span className="text-lg font-black text-slate-900 font-mono">
                {lead.budget ? formatCurrency(lead.budget) : 'Budget on Discussion'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                Lead Source: {lead.leadSource?.replace(/_/g, ' ') || 'Direct Portal'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge status={lead.leadStatus || 'NEW'} />
            </div>
          </div>
        </div>

        {/* Lead Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] font-mono text-slate-600">
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Lead ID:</strong> <span className="truncate block">{lead._id}</span></div>
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Received Date:</strong> <span className="block">{formatDate(lead.createdAt)}</span></div>
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Handler Agent:</strong> <span className="block text-slate-800 font-bold">{lead.assignedAgent?.name || user?.name || 'Assigned Representative'}</span></div>
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Pipeline Stage:</strong> <span className="block font-bold text-teal-800">{lead.leadStatus || 'New'}</span></div>
        </div>

        {/* SECTION 1: INQUIRED PROPERTY & FLAT DETAILS WITH IMAGES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1">
            <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono flex items-center gap-1.5">
              <Building2 size={13} className="text-teal-700" />
              <span>1. INQUIRED PROPERTY & FLAT DOSSIER</span>
            </span>
            {prop?._id && (
              <Link
                to={`/listings/view/${prop._id}`}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
              >
                <span>View Complete Property File</span>
                <ExternalLink size={12} />
              </Link>
            )}
          </div>

          {prop ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              {/* Photo Showcase of the Flat */}
              <div className="md:col-span-5 space-y-2">
                <div className="aspect-[4/3] w-full rounded-lg border border-slate-300 overflow-hidden bg-slate-100 relative">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                      <Building2 size={32} className="mb-1 text-slate-300" />
                      <span>No Photo Attached</span>
                    </div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-[10px] text-white font-mono px-1.5 py-0.5 rounded">
                    {prop.purpose || 'FOR SALE'}
                  </span>
                  {prop.condition && (
                    <span className="absolute top-1.5 right-1.5 bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      {prop.condition}
                    </span>
                  )}
                </div>

                {/* Thumbnails of the flat */}
                {photos.length > 1 && (
                  <div className="grid grid-cols-4 gap-1.5">
                    {photos.slice(0, 4).map((p, idx) => (
                      <div key={idx} className="aspect-[4/3] rounded border border-slate-200 overflow-hidden bg-slate-100">
                        <img src={p.url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {photos.length > 4 && (
                  <p className="text-[10px] text-slate-500 text-center font-mono">
                    + {photos.length - 4} more photos in catalog
                  </p>
                )}
              </div>

              {/* Property Fact Grid */}
              <div className="md:col-span-7 space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    <span>{prop.address ? `${prop.address}, ` : ''}{prop.localityName || 'Nagpur'} - {prop.pincode || '440010'}</span>
                  </p>
                </div>

                <table className="w-full text-xs border border-slate-300 divide-y divide-slate-200 bg-white">
                  <tbody>
                    <tr className="divide-x divide-slate-200">
                      <td className="p-2 font-semibold text-slate-500 w-1/3 text-[10px] uppercase">Valuation / Price</td>
                      <td className="p-2 font-bold text-teal-800 font-mono text-sm">
                        {formatCurrency(prop.price)}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-200 bg-slate-50/50">
                      <td className="p-2 font-semibold text-slate-500 text-[10px] uppercase">Type & Configuration</td>
                      <td className="p-2 font-bold text-slate-900">
                        {prop.category} &bull; {prop.subtype || 'Flat'} {prop.bedrooms ? `(${prop.bedrooms} BHK)` : ''}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-200">
                      <td className="p-2 font-semibold text-slate-500 text-[10px] uppercase">Super / Carpet Area</td>
                      <td className="p-2 font-bold text-slate-900 font-mono">
                        {prop.areaSqFt ? `${prop.areaSqFt} Sq.Ft` : 'N/A'} {prop.carpetAreaSqFt ? `(Carpet: ${prop.carpetAreaSqFt} Sq.Ft)` : ''}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-200 bg-slate-50/50">
                      <td className="p-2 font-semibold text-slate-500 text-[10px] uppercase">Floor & Facing</td>
                      <td className="p-2 font-bold text-slate-900">
                        Floor {prop.floor || 0} of {prop.totalFloors || 0} &bull; Facing: {prop.facing || 'East'}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-200">
                      <td className="p-2 font-semibold text-slate-500 text-[10px] uppercase">Possession & Furnishing</td>
                      <td className="p-2 font-bold text-slate-900">
                        {prop.possessionStatus?.replace(/_/g, ' ') || 'Ready to Move'} &bull; {prop.furnishing?.replace(/_/g, ' ') || 'Unfurnished'}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-200 bg-slate-50/50">
                      <td className="p-2 font-semibold text-slate-500 text-[10px] uppercase">MahaRERA Reg No</td>
                      <td className="p-2 font-bold text-teal-800 font-mono">
                        {prop.reraNumber || 'Not Applicable / Resale'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {prop.propertyUsp && (
                  <p className="text-[11px] font-semibold text-teal-800 bg-teal-50/60 p-2 rounded border border-teal-200">
                    ⭐ Property USP: {prop.propertyUsp}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">
                Property Mentioned: {lead.propertyTitle || 'General Marketplace Inquiry'}
              </p>
              <p>Inquirer has expressed interest in properties located in <strong>{lead.locality || 'Nagpur'}</strong> with an estimated budget of <strong>{lead.budget ? formatCurrency(lead.budget) : 'Negotiable'}</strong>.</p>
            </div>
          )}
        </div>

        {/* SECTION 2: BUYER MESSAGE & REQUIREMENTS */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1">
            <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono flex items-center gap-1.5">
              <FileText size={13} className="text-teal-700" />
              <span>2. BUYER MESSAGE & INQUIRY NOTE</span>
            </span>
          </div>

          <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200/80 text-xs text-slate-800 leading-relaxed">
            {lead.message ? (
              <p className="whitespace-pre-line font-medium italic">"{lead.message}"</p>
            ) : (
              <p className="italic text-slate-500">No custom message included by the customer.</p>
            )}
          </div>
        </div>

        {/* SECTION 3: ASSIGNED REPRESENTATIVE & LEAD ROUTING */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1">
            <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono flex items-center gap-1.5">
              <UserCheck size={13} className="text-teal-700" />
              <span>3. ASSIGNED BROKER & ESCORT REPRESENTATIVE</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Dedicated Handler</span>
              <h4 className="font-bold text-slate-900 text-sm">
                {lead.assignedAgent?.name || user?.name || 'Central Nagpur Real Estate Desk'}
              </h4>
              <p className="text-slate-600 font-mono text-[11px]">
                {lead.assignedAgent?.phone ? `Contact: +91 ${lead.assignedAgent.phone}` : (user?.phone ? `Contact: +91 ${user.phone}` : 'Desk Routing')}
                {lead.assignedAgent?.email && ` &bull; ${lead.assignedAgent.email}`}
              </p>
            </div>

            {(lead.assignedAgent?.phone || user?.phone) && (
              <a
                href={`tel:+91${lead.assignedAgent?.phone || user?.phone}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                <Phone size={13} />
                <span>Call Representative</span>
              </a>
            )}
          </div>
        </div>

        {/* SECTION 4: ACTIVITY LOG & CALL NOTES HISTORY */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1">
            <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono flex items-center gap-1.5">
              <Clock size={13} className="text-teal-700" />
              <span>4. ACTIVITY, CALL LOGS & TIMELINE REMARKS</span>
            </span>
          </div>

          {/* Add Remark Input */}
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Record a call remark, customer feedback, next follow-up date..."
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:outline-none text-xs bg-white"
            />
            <button
              type="submit"
              disabled={addNoteMutation.isPending || !newNote.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
            >
              <Send size={13} />
              <span>{addNoteMutation.isPending ? 'Saving...' : 'Add Note'}</span>
            </button>
          </form>

          {/* Timeline List */}
          <div className="space-y-2 pt-2">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div
                  key={act._id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-slate-800 font-medium">{act.details || act.activityType}</p>
                    <span className="text-[10px] text-slate-500">
                      By {act.performedBy?.name || 'Partner'} &bull; {new Date(act.createdAt).toLocaleString('en-GB')}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700 uppercase">
                    {act.activityType?.replace(/_/g, ' ')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No activity remarks recorded yet for this inquiry.</p>
            )}
          </div>
        </div>

        {/* Document Footer (PDF Stamp / Signature line) */}
        <div className="border-t-2 border-slate-800 pt-4 mt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono gap-2">
          <span>NAGPUR REAL ESTATE PLATFORM • CRM BUYER LEAD DOSSIER</span>
          <span>AUTHENTICATED RECORD • VERIFIED AUDIT TRAIL</span>
        </div>
      </div>
    </div>
  );
};

export default AgentLeadDossierPage;
