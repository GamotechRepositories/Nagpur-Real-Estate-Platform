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
  AlertCircle,
  ExternalLink,
  Save,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { Badge } from '../../components/common/Badge';

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

export const AgentSiteVisitDossierPage = () => {
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
    queryKey: ['agent-site-visit-detail', id],
    queryFn: async () => {
      const res = await apiClient.get(`/site-visits/${id}`);
      return res?.data?.data || res?.data || res;
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
      queryClient.invalidateQueries(['agent-site-visit-detail', id]);
      queryClient.invalidateQueries(['agent-site-visits']);
      queryClient.invalidateQueries(['agent-stats']);
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
  const customerPhone = visit.phoneNumber || visit.user?.phone || '';
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
          {customerPhone && (
            <a
              href={`https://wa.me/91${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Hello ${customerName}, regarding your site visit scheduled on ${new Date(visit.preferredDate).toLocaleDateString()} for "${prop?.title || 'Property'}" in Nagpur:`
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
          {customerPhone && (
            <a
              href={`tel:+91${customerPhone.replace(/[^0-9]/g, '')}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <Phone size={14} />
              <span>Call (+91 {customerPhone})</span>
            </a>
          )}

          {/* Status Dropdown */}
          <select
            value={visit.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updateMutation.isPending}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold outline-none cursor-pointer shadow-2xs transition-colors ${
              visit.status === 'CONFIRMED'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:border-emerald-500'
                : visit.status === 'COMPLETED'
                ? 'bg-blue-50 text-blue-800 border-blue-300 focus:border-blue-500'
                : visit.status === 'CANCELLED'
                ? 'bg-rose-50 text-rose-800 border-rose-300 focus:border-rose-500'
                : 'bg-amber-50 text-amber-800 border-amber-300 focus:border-amber-500'
            }`}
          >
            <option value="REQUESTED">Status: Requested</option>
            <option value="CONFIRMED">Status: Confirmed</option>
            <option value="COMPLETED">Status: Completed</option>
            <option value="CANCELLED">Status: Cancelled</option>
          </select>
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
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                  visit.status === 'CONFIRMED'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : visit.status === 'COMPLETED'
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : visit.status === 'CANCELLED'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {visit.status}
              </span>
            </div>
          </div>
        </div>

        {/* Inspection Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] font-mono text-slate-600">
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Visit ID:</strong> <span className="truncate block">{visit._id}</span></div>
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Booked On:</strong> <span className="block">{new Date(visit.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Assigned Agent:</strong> <span className="block text-slate-800 font-bold">{visit.assignedAgent?.name || 'Sharma Real Estate Consultants'}</span></div>
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
                    <span>{prop.localityName || prop.address || 'Nagpur'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Asking Price</span>
                    <strong className="text-slate-900 text-sm font-bold text-teal-700">
                      {formatIndianPrice(prop.price)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Configuration</span>
                    <strong className="text-slate-800">{prop.bedrooms ? `${prop.bedrooms} BHK` : prop.propertyType || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Super Built-Up Area</span>
                    <strong className="text-slate-800">{prop.builtUpArea || prop.carpetArea ? `${prop.builtUpArea || prop.carpetArea} sq.ft` : '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Furnishing</span>
                    <strong className="text-slate-800">{prop.furnishing || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Floor / Facing</span>
                    <strong className="text-slate-800">
                      {prop.floorNumber ? `Fl. ${prop.floorNumber}` : ''} {prop.facing ? `(${prop.facing})` : '-'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Possession Status</span>
                    <strong className="text-slate-800">{prop.possessionStatus || prop.availability || 'Ready'}</strong>
                  </div>
                </div>

                {prop.description && (
                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200 line-clamp-3">
                    {prop.description}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500">
              No linked property record found.
            </div>
          )}
        </div>

        {/* SECTION 2: BUYER / CUSTOMER PROFILE */}
        <div className="space-y-3">
          <div className="border-b border-slate-300 pb-1">
            <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono flex items-center gap-1.5">
              <FileText size={13} className="text-teal-700" />
              <span>2. PROSPECTIVE BUYER & APPOINTMENT SCHEDULE</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-500 uppercase font-bold">Buyer Details</div>
              <div className="font-bold text-slate-900 text-sm">{customerName}</div>
              <div className="font-mono text-slate-700">+91 {customerPhone}</div>
              {customerEmail && <div className="text-slate-500">{customerEmail}</div>}
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-500 uppercase font-bold">Scheduled Inspection Slot</div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <CalendarDays size={14} className="text-teal-700" />
                <span>{new Date(visit.preferredDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="font-medium text-slate-700 flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" />
                <span>{visit.preferredTimeSlot}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: INSPECTION OUTCOME & REMARKS */}
        <div className="space-y-3">
          <div className="border-b border-slate-300 pb-1">
            <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono flex items-center gap-1.5">
              <FileText size={13} className="text-teal-700" />
              <span>3. INSPECTION FEEDBACK & COORDINATION NOTES</span>
            </span>
          </div>

          <form onSubmit={handleSaveNotes} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Agent Notes / Inspection Feedback
              </label>
              <textarea
                rows={3}
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Enter private observations: buyer interested, budget expectations, next follow-up date..."
                className="w-full p-3 rounded-lg border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition"
              >
                <Save size={13} />
                <span>{updateMutation.isPending ? 'Saving Notes...' : 'Save Notes & Feedback'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentSiteVisitDossierPage;
