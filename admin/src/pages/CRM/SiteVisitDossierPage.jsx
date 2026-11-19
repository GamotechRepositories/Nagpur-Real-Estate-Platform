import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  MessageCircle,
  Building2,
  UserCheck,
  AlertCircle,
  ExternalLink,
  Save,
  Check,
  X,
  FileText,
} from 'lucide-react';
import apiClient from '../../api/client';
import Badge from '../../components/common/Badge';

export const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const backendOrigin = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatIndianPrice = (price) => {
  if (!price && price !== 0) return 'Price on Request';
  const num = Number(price);
  if (num >= 10000000) {
    const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹ ${cr} Cr`;
  }
  if (num >= 100000) {
    const lac = (num / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹ ${lac} Lac`;
  }
  return `₹ ${num.toLocaleString('en-IN')}`;
};

export const SiteVisitDossierPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  // 1. Fetch Site Visit Details
  const {
    data: visit,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-site-visit-detail', id],
    queryFn: async () => {
      const res = await apiClient.get(`/site-visits/${id}`);
      return res.data?.data;
    },
    enabled: !!id,
    onSuccess: (data) => {
      if (data?.feedbackNotes) setFeedbackNotes(data.feedbackNotes);
      if (data?.cancellationReason) setCancellationReason(data.cancellationReason);
    },
  });

  // 2. Update Status / Feedback Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ status, feedback, reason }) => {
      return apiClient.patch(`/site-visits/${id}`, {
        status,
        feedbackNotes: feedback,
        cancellationReason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-site-visit-detail', id]);
      queryClient.invalidateQueries(['admin-site-visits']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
    },
  });

  const handleStatusChange = (newStatus) => {
    updateMutation.mutate({
      status: newStatus,
      feedback: feedbackNotes,
      reason: cancellationReason,
    });
  };

  const handleSaveNotes = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      status: visit.status,
      feedback: feedbackNotes,
      reason: cancellationReason,
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Generating Site Inspection Dossier...</span>
      </div>
    );
  }

  if (isError || !visit) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">Inspection Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          {error?.response?.data?.message || 'Unable to retrieve site visit dossier.'}
        </p>
        <Link
          to="/site-visits"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold"
        >
          <ArrowLeft size={14} /> Back to Site Visits
        </Link>
      </div>
    );
  }

  const prop = visit.property;
  const customerName = visit.customerName || visit.user?.name || 'Customer';
  const customerPhone = visit.phoneNumber || visit.user?.phone || '9823012345';
  const customerEmail = visit.email || visit.user?.email || '';

  const rawPhotos = Array.isArray(prop?.photos) && prop.photos.length > 0
    ? prop.photos
    : (prop?.images || []);
  const photos = rawPhotos.map((p) => {
    if (typeof p === 'string') return { url: getFullImageUrl(p) };
    return { ...p, url: getFullImageUrl(p.url) };
  });

  const coverUrl = photos.find((p) => p.isCover)?.url || photos[0]?.url || getFullImageUrl(prop?.coverImage);

  return (
    <div className="w-full space-y-5 pb-20">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => navigate('/site-visits')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Site Visits</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/91${customerPhone}?text=${encodeURIComponent(
              `Hello ${customerName}, regarding your site visit scheduled on ${new Date(visit.preferredDate).toLocaleDateString()} for "${prop?.title || 'Property'}" in Nagpur:`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <MessageCircle size={14} />
            <span>WhatsApp Buyer</span>
          </a>

          {/* Call Direct */}
          <a
            href={`tel:+91${customerPhone}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <Phone size={14} />
            <span>Call (+91 {customerPhone})</span>
          </a>

          {/* Status Action Buttons */}
          {visit.status === 'REQUESTED' && (
            <>
              <button
                type="button"
                onClick={() => handleStatusChange('CONFIRMED')}
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
              >
                <Check size={14} />
                <span>Confirm Slot</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition disabled:opacity-50"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
            </>
          )}

          {visit.status === 'CONFIRMED' && (
            <>
              <button
                type="button"
                onClick={() => handleStatusChange('COMPLETED')}
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                <span>Mark as Completed</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition disabled:opacity-50"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
            </>
          )}

          {visit.status === 'COMPLETED' && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 size={14} />
              <span>Inspection Completed</span>
            </span>
          )}

          {visit.status === 'CANCELLED' && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
              <X size={14} />
              <span>Visit Cancelled</span>
            </span>
          )}
        </div>
      </div>

      {/* FORMAL PDF-STYLE DOSSIER SHEET */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-sm p-6 sm:p-10 space-y-8 font-sans text-slate-800">
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 pb-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-teal-800 uppercase font-mono">
              NAGPUR REAL ESTATE PLATFORM • SITE VISIT & INSPECTION DOSSIER
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Site Visit: {customerName}
            </h1>
            <p className="text-xs text-slate-600">
              📞 Contact: <strong className="font-mono text-slate-900">+91 {customerPhone}</strong>
              {customerEmail && <span> &bull; ✉️ {customerEmail}</span>}
            </p>
          </div>

          <div className="flex md:flex-col items-end justify-between md:justify-center gap-2">
            <div className="text-right">
              <span className="text-lg font-black text-slate-900 font-mono">
                {new Date(visit.preferredDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="text-[11px] font-bold text-teal-800 block">
                Slot: {visit.preferredTimeSlot}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge status={visit.status} />
            </div>
          </div>
        </div>

        {/* Inspection Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] font-mono text-slate-600">
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Visit ID:</strong> <span className="truncate block">{visit._id}</span></div>
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Booked On:</strong> <span className="block">{new Date(visit.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Escort Broker:</strong> <span className="block text-slate-800 font-bold">{visit.assignedAgent?.name || 'Central Desk'}</span></div>
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Inspection Status:</strong> <span className="block font-bold text-teal-800">{visit.status}</span></div>
        </div>

        {/* SECTION 1: INSPECTED PROPERTY & FLAT DETAILS WITH IMAGES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1">
            <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono flex items-center gap-1.5">
              <Building2 size={13} className="text-teal-700" />
              <span>1. INSPECTED PROPERTY & FLAT DOSSIER</span>
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
                        {formatIndianPrice(prop.price)}
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
              <p className="font-semibold text-slate-800">
                Property record linked to ID: {visit.property?._id || visit.property}
              </p>
            </div>
          )}
        </div>

        {/* SECTION 2: SCHEDULE & ESCORT BROKER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Schedule Card */}
          <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/70 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <CalendarDays size={13} className="text-teal-700" />
              <span>Inspection Schedule Slot</span>
            </span>
            <div className="space-y-1">
              <p><span className="text-slate-500">Date:</span> <strong className="text-slate-900 text-sm font-mono">{new Date(visit.preferredDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
              <p><span className="text-slate-500">Time Slot:</span> <strong className="text-teal-800 font-bold">{visit.preferredTimeSlot}</strong></p>
              <p><span className="text-slate-500">Reminder Sent:</span> <span className="font-medium text-slate-700">{visit.reminderSent ? 'Yes' : 'Queued automatically'}</span></p>
            </div>
          </div>

          {/* Escort Agent Card */}
          <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/70 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <UserCheck size={13} className="text-teal-700" />
              <span>Escort Partner / Assigned Broker</span>
            </span>
            <div className="space-y-1">
              <p><span className="text-slate-500">Broker:</span> <strong className="text-slate-900 text-sm">{visit.assignedAgent?.name || 'Central Nagpur Real Estate Desk'}</strong></p>
              <p><span className="text-slate-500">Phone:</span> <strong className="font-mono text-slate-800">{visit.assignedAgent?.phone ? `+91 ${visit.assignedAgent.phone}` : 'Desk Routing'}</strong></p>
              {visit.assignedAgent?.phone && (
                <div className="pt-1">
                  <a
                    href={`tel:+91${visit.assignedAgent.phone}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold"
                  >
                    <Phone size={12} />
                    <span>Call Broker</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: INSPECTION OBSERVATIONS & FEEDBACK NOTES */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1">
            <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono flex items-center gap-1.5">
              <FileText size={13} className="text-teal-700" />
              <span>2. INSPECTION OBSERVATIONS & FEEDBACK NOTES</span>
            </span>
          </div>

          <form onSubmit={handleSaveNotes} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Inspection / Feedback Notes
              </label>
              <textarea
                rows={3}
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Record customer observations, price discussions, next visit schedule, or closing readiness..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:outline-none text-xs bg-white"
              />
            </div>

            {visit.status === 'CANCELLED' && (
              <div>
                <label className="block text-[11px] font-bold text-rose-700 uppercase mb-1">
                  Cancellation Reason
                </label>
                <input
                  type="text"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="e.g. Customer out of station, rescheduled for next weekend..."
                  className="w-full px-3 py-2 rounded-lg border border-rose-300 focus:border-rose-500 focus:outline-none text-xs bg-rose-50/40"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
            >
              <Save size={14} />
              <span>{updateMutation.isPending ? 'Saving Notes...' : 'Save Feedback Notes'}</span>
            </button>
          </form>
        </div>

        {/* Document Footer (PDF Stamp / Signature line) */}
        <div className="border-t-2 border-slate-800 pt-4 mt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono gap-2">
          <span>NAGPUR REAL ESTATE PLATFORM • SITE INSPECTION DOSSIER</span>
          <span>AUTHENTICATED RECORD • VERIFIED AUDIT TRAIL</span>
        </div>
      </div>
    </div>
  );
};

export default SiteVisitDossierPage;
