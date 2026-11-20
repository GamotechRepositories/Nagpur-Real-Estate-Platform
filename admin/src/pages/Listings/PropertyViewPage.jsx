import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Edit2,
  Building2,
  CheckCircle2,
  Lock,
  AlertCircle,
  FileSpreadsheet,
  Video,
  Compass,
  FileCheck,
  ExternalLink,
  Flame,
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

export const PropertyViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: property,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-property-view', id],
    queryFn: async () => {
      const res = await apiClient.get(`/properties/${id}`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Generating Property Dossier...</span>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">Property Document Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          {error?.response?.data?.message || 'Unable to retrieve property record.'}
        </p>
        <Link
          to="/listings"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold"
        >
          <ArrowLeft size={14} /> Back to Listings
        </Link>
      </div>
    );
  }

  const rawPhotos = Array.isArray(property.photos) && property.photos.length > 0
    ? property.photos
    : (property.images || []);
  const photos = rawPhotos.map((p) => {
    if (typeof p === 'string') return { url: getFullImageUrl(p), isCover: false };
    return { ...p, url: getFullImageUrl(p.url) };
  });

  const coverPhoto = photos.find((p) => p.isCover) || photos[0];
  const coverUrl = coverPhoto ? coverPhoto.url : getFullImageUrl(property.coverImage);

  const activeReps = Array.isArray(property.assignedAgents) && property.assignedAgents.length > 0
    ? property.assignedAgents
    : (property.assignedAgent ? [property.assignedAgent] : []);

  const isPlot = property.category === 'PLOT' || property.subtype === 'PLOT';

  return (
    <div className="w-full space-y-5 pb-20">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => navigate('/listings')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Listings</span>
        </button>

        <div className="flex items-center gap-2">
          <Link
            to={`/listings/edit/${property._id}`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Edit2 size={13} />
            <span>Edit Property</span>
          </Link>
        </div>
      </div>

      {/* FORMAL PDF-STYLE DOCUMENT SHEET */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-sm p-6 sm:p-10 space-y-8 font-sans text-slate-800">
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 pb-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-teal-800 uppercase font-mono">
              Nagpur Real Estate Platform • Property Dossier
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {property.title}
            </h1>
            <p className="text-xs text-slate-600">
              📍 {property.address ? `${property.address}, ` : ''}{property.localityName || 'Nagpur'} - {property.pincode || '440010'}
            </p>
            {property.propertyUsp && (
              <p className="text-xs font-semibold text-teal-800 pt-1">
                ⭐ USP: {property.propertyUsp}
              </p>
            )}
          </div>

          <div className="flex md:flex-col items-end justify-between md:justify-center gap-2">
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {formatIndianPrice(property.price)}
              </span>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                {property.priceNegotiable ? 'Negotiable' : 'Fixed Price'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant={property.status === 'LIVE' ? 'success' : 'neutral'} size="sm">
                {property.status}
              </Badge>
              {property.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  <CheckCircle2 size={11} /> Verified
                </span>
              )}
              {property.isDealOfTheDay && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <Flame size={11} className="text-rose-600" /> Deal of the Day
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sub-Header Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] font-mono text-slate-600">
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Doc Ref ID:</strong> <span className="truncate block">{property._id}</span></div>
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Listing Date:</strong> <span className="block">{new Date(property.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">Condition:</strong> <span className="block text-slate-800 font-bold">{property.condition || 'Ready to Move'}</span></div>
          <div><strong className="text-slate-900 font-semibold uppercase text-[10px]">RERA Reg:</strong> <span className="block font-bold text-teal-800">{property.reraNumber || 'Not Applicable'}</span></div>
        </div>

        {/* Section 1: Visual Overview & Fast Facts */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Photo Showcase */}
          <div className="md:col-span-5 space-y-2">
            <div className="aspect-[4/3] w-full rounded border border-slate-300 overflow-hidden bg-slate-100 relative">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Building2 size={32} className="mb-1 text-slate-300" />
                  <span>No Photo Attached</span>
                </div>
              )}
              <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-[10px] text-white font-mono px-1.5 py-0.5 rounded">
                {property.purpose || 'FOR SALE'}
              </span>
            </div>

            {/* Thumbnail Gallery */}
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
                + {photos.length - 4} more photos on record
              </p>
            )}
          </div>

          {/* Quick Fact Table (Formal PDF Grid) */}
          <div className="md:col-span-7">
            <table className="w-full text-xs border border-slate-300 divide-y divide-slate-200">
              <tbody>
                <tr className="divide-x divide-slate-200 bg-slate-50/70">
                  <td className="p-2 font-semibold text-slate-500 w-1/3 text-[11px] uppercase">Property Type</td>
                  <td className="p-2 font-bold text-slate-900">
                    {property.category} • {property.subtype || 'Flat'}
                    {property.bedrooms ? ` (${property.bedrooms} BHK)` : ''}
                  </td>
                </tr>
                <tr className="divide-x divide-slate-200">
                  <td className="p-2 font-semibold text-slate-500 text-[11px] uppercase">Super Built-up Area</td>
                  <td className="p-2 font-bold text-slate-900 font-mono">
                    {property.areaSqFt ? `${property.areaSqFt.toLocaleString('en-IN')} ${property.areaUnit || 'Sq.Ft'}` : 'N/A'}
                  </td>
                </tr>
                <tr className="divide-x divide-slate-200 bg-slate-50/70">
                  <td className="p-2 font-semibold text-slate-500 text-[11px] uppercase">Carpet Area</td>
                  <td className="p-2 font-bold text-slate-900 font-mono">
                    {property.carpetAreaSqFt ? `${property.carpetAreaSqFt.toLocaleString('en-IN')} Sq.Ft` : 'N/A'}
                  </td>
                </tr>
                {property.builtUpAreaSqFt ? (
                  <tr className="divide-x divide-slate-200">
                    <td className="p-2 font-semibold text-slate-500 text-[11px] uppercase">Built-up Area</td>
                    <td className="p-2 font-bold text-slate-900 font-mono">
                      {property.builtUpAreaSqFt.toLocaleString('en-IN')} Sq.Ft
                    </td>
                  </tr>
                ) : null}
                {isPlot && property.plotAreaSqFt ? (
                  <tr className="divide-x divide-slate-200">
                    <td className="p-2 font-semibold text-slate-500 text-[11px] uppercase">Plot Area / Road</td>
                    <td className="p-2 font-bold text-slate-900 font-mono">
                      {property.plotAreaSqFt} Sq.Ft • Road Width: {property.roadWidthFt || 30} Ft
                    </td>
                  </tr>
                ) : null}
                <tr className="divide-x divide-slate-200 bg-slate-50/70">
                  <td className="p-2 font-semibold text-slate-500 text-[11px] uppercase">Possession Status</td>
                  <td className="p-2 font-bold text-slate-900">
                    {property.possessionStatus?.replace(/_/g, ' ') || 'Ready to Move'}
                  </td>
                </tr>
                <tr className="divide-x divide-slate-200">
                  <td className="p-2 font-semibold text-slate-500 text-[11px] uppercase">Furnishing</td>
                  <td className="p-2 font-bold text-slate-900">
                    {property.furnishing?.replace(/_/g, ' ') || 'Unfurnished'}
                  </td>
                </tr>
                <tr className="divide-x divide-slate-200 bg-slate-50/70">
                  <td className="p-2 font-semibold text-slate-500 text-[11px] uppercase">Floor Level</td>
                  <td className="p-2 font-bold text-slate-900">
                    {property.floor || '0'} of {property.totalFloors || '0'} Floors
                  </td>
                </tr>
                <tr className="divide-x divide-slate-200">
                  <td className="p-2 font-semibold text-slate-500 text-[11px] uppercase">Facing Direction</td>
                  <td className="p-2 font-bold text-slate-900">{property.facing || 'East'}</td>
                </tr>
                <tr className="divide-x divide-slate-200 bg-slate-50/70">
                  <td className="p-2 font-semibold text-slate-500 text-[11px] uppercase">Project / Township</td>
                  <td className="p-2 font-bold text-teal-800">
                    {property.project?.name || property.project || 'Standalone / Individual Property'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Financials & Commercial Terms */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1">
            <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono">
              1. FINANCIALS, CHARGES & COMMERCIAL TERMS
            </span>
          </div>

          <table className="w-full text-xs border border-slate-300 divide-y divide-slate-200">
            <tbody>
              <tr className="divide-x divide-slate-200 bg-slate-50/50">
                <td className="p-2.5 w-1/4">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Valuation</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">{formatIndianPrice(property.price)}</span>
                </td>
                <td className="p-2.5 w-1/4">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Price Per Sq.Ft</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {property.pricePerSqFt ? `₹ ${property.pricePerSqFt.toLocaleString('en-IN')}` : 'N/A'}
                  </span>
                </td>
                <td className="p-2.5 w-1/4">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Booking Amount</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {property.bookingAmount ? `₹ ${property.bookingAmount.toLocaleString('en-IN')}` : 'As Agreed'}
                  </span>
                </td>
                <td className="p-2.5 w-1/4">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Maintenance</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {property.maintenanceCharges ? `₹ ${property.maintenanceCharges.toLocaleString('en-IN')} (${property.maintenanceFrequency || 'Mo'})` : 'Included'}
                  </span>
                </td>
              </tr>
              <tr className="divide-x divide-slate-200">
                <td className="p-2.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Brokerage Terms</span>
                  <span className="font-bold text-slate-900">{property.brokerage || 'Zero Brokerage'}</span>
                </td>
                <td className="p-2.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Bank Loan Available</span>
                  <span className="font-bold text-teal-800">{property.loanAvailable !== false ? 'Yes (Bank Approved)' : 'No'}</span>
                </td>
                <td className="p-2.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Govt Taxes / Stamp Duty</span>
                  <span className="font-bold text-slate-900">{property.taxAndGovtCharges || 'Excluded'}</span>
                </td>
                <td className="p-2.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Ownership Type</span>
                  <span className="font-bold text-slate-900">{property.ownershipType || 'Freehold'}</span>
                </td>
              </tr>
              {property.additionalCharges && (
                <tr className="divide-x divide-slate-200 bg-slate-50/50">
                  <td colSpan={4} className="p-2.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Additional Charges / Notes</span>
                    <span className="font-medium text-slate-800">{property.additionalCharges}</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 3: Legal Approvals & MahaRERA Compliance */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1">
            <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono">
              2. STATUTORY CLEARANCES, SANCTION & BANK APPROVALS
            </span>
          </div>

          <table className="w-full text-xs border border-slate-300 divide-y divide-slate-200">
            <tbody>
              <tr className="divide-x divide-slate-200 bg-slate-50/50">
                <td className="p-2.5 w-1/4">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sanction Authority</span>
                  <span className="font-bold text-slate-900">{property.approvedBy || 'NMC (Nagpur)'}</span>
                </td>
                <td className="p-2.5 w-1/4">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">MahaRERA Number</span>
                  <span className="font-bold font-mono text-teal-800">{property.reraNumber || 'Not Applicable'}</span>
                </td>
                <td className="p-2.5 w-1/4">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Occupancy Cert (OC)</span>
                  <span className="font-bold text-slate-900">{property.occupancyCertificate || 'Available'}</span>
                </td>
                <td className="p-2.5 w-1/4">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Completion Cert (CC)</span>
                  <span className="font-bold text-slate-900">{property.completionCertificate || 'Available'}</span>
                </td>
              </tr>
              <tr className="divide-x divide-slate-200">
                <td className="p-2.5 w-1/4">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Property Tax Status</span>
                  <span className="font-bold text-slate-900">{property.propertyTaxStatus || 'Paid up to date'}</span>
                </td>
                <td colSpan={3} className="p-2.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Bank Loan Tie-ups</span>
                  <span className="font-medium text-slate-800">{property.bankLoanApprovedBy || 'SBI, HDFC, ICICI, Axis Bank'}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: Description & Target Audience */}
        {property.description && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 border-b border-slate-300 pb-1">
              <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono">
                3. PROPERTY DESCRIPTION & PARTICULARS
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line text-justify pt-1">
              {property.description}
            </p>
            {Array.isArray(property.suitableFor) && property.suitableFor.length > 0 && (
              <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Suitable For:</span>
                {property.suitableFor.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section 5: Verified Amenities */}
        {Array.isArray(property.amenities) && property.amenities.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-slate-300 pb-1">
              <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono">
                4. VERIFIED AMENITIES & FACILITIES
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1 text-xs">
              {property.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 p-1.5 rounded bg-slate-50 border border-slate-200 font-medium text-slate-800"
                >
                  <CheckCircle2 size={13} className="text-teal-700 flex-shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Custom Specifications & Attributes */}
        {Array.isArray(property.customFields) && property.customFields.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-slate-300 pb-1">
              <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono">
                CUSTOM SPECIFICATIONS & ATTRIBUTES
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-xs">
              {property.customFields.map((cf, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200"
                >
                  <span className="text-slate-500 font-medium truncate mr-2">{cf.label}:</span>
                  <span className="font-bold text-slate-900 truncate">{cf.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 6: Digital Assets & Virtual Links */}
        {(property.floorPlanUrl || property.videoUrl || property.virtualTourUrl || property.brochureUrl) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-slate-300 pb-1">
              <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono">
                5. DIGITAL ASSETS & MEDIA LINKS
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-xs">
              {property.floorPlanUrl && (
                <a
                  href={property.floorPlanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-teal-800 hover:bg-slate-100 font-semibold"
                >
                  <span>Floor Plan View</span>
                  <ExternalLink size={12} />
                </a>
              )}
              {property.videoUrl && (
                <a
                  href={property.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-teal-800 hover:bg-slate-100 font-semibold"
                >
                  <span>Video Tour</span>
                  <Video size={12} />
                </a>
              )}
              {property.virtualTourUrl && (
                <a
                  href={property.virtualTourUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-teal-800 hover:bg-slate-100 font-semibold"
                >
                  <span>360° Virtual Tour</span>
                  <Compass size={12} />
                </a>
              )}
              {property.brochureUrl && (
                <a
                  href={property.brochureUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-teal-800 hover:bg-slate-100 font-semibold"
                >
                  <span>Project Brochure PDF</span>
                  <FileSpreadsheet size={12} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Section 7: Confidential Internal Registry (Owner & Representatives) */}
        {(property.clientSellerDetails?.name || property.owner || activeReps.length > 0) && (
          <div className="space-y-2 pt-2 border-t-2 border-dashed border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1">
              <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase font-mono flex items-center gap-1.5">
                <Lock size={12} className="text-amber-700" />
                <span>6. CONFIDENTIAL MANDATE & LEAD ROUTING</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                Admin & Assigned Partner Access Only
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Homeowner / Client Record */}
              <div className="border border-slate-300 rounded p-3 bg-amber-50/40 text-xs space-y-1.5">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-1">
                  <span className="font-bold text-slate-900 uppercase text-[10px]">Client / Seller Record</span>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1 rounded">Hidden from Public</span>
                </div>
                <div className="space-y-1 pt-0.5">
                  <p><span className="text-slate-500 text-[11px]">Name:</span> <strong className="text-slate-900">{property.clientSellerDetails?.name || property.owner?.name || 'Homeowner'}</strong> ({property.clientSellerDetails?.listedBy || property.owner?.role || 'CLIENT'})</p>
                  <p><span className="text-slate-500 text-[11px]">Contact:</span> <strong className="font-mono text-slate-900">{property.clientSellerDetails?.phone || property.owner?.phone || 'N/A'}</strong></p>
                  {property.clientSellerDetails?.whatsapp && (
                    <p><span className="text-slate-500 text-[11px]">WhatsApp:</span> <strong className="font-mono text-teal-800">{property.clientSellerDetails.whatsapp}</strong></p>
                  )}
                  {property.clientSellerDetails?.email && (
                    <p><span className="text-slate-500 text-[11px]">Email:</span> <span className="font-mono text-slate-800">{property.clientSellerDetails.email}</span></p>
                  )}
                  {property.clientSellerDetails?.notes && (
                    <p className="italic text-slate-600 bg-white/70 p-1.5 rounded border border-amber-200 text-[11px]">
                      Mandate Notes: {property.clientSellerDetails.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Allocated Representatives */}
              <div className="border border-slate-300 rounded p-3 bg-teal-50/40 text-xs space-y-1.5">
                <div className="flex items-center justify-between border-b border-teal-200 pb-1">
                  <span className="font-bold text-slate-900 uppercase text-[10px]">Allocated Representative(s)</span>
                  <span className="text-[10px] font-mono text-teal-800 bg-teal-100 px-1 rounded">Lead Routing</span>
                </div>
                <div className="space-y-1.5 pt-0.5">
                  {activeReps.length > 0 ? (
                    activeReps.map((rep, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/80 p-1.5 rounded border border-teal-100 text-[11px]">
                        <div>
                          <strong className="text-slate-900">{rep.name || rep.agencyName}</strong>
                          <span className="text-slate-500 block font-mono">{rep.phone || rep.contactPhone}</span>
                        </div>
                        <span className="text-[9px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                          {rep.role || 'AGENT'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic text-[11px]">
                      Desk Team (Default) — Leads route to Central Admin Desk.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Footer (PDF Stamp / Signature line) */}
        <div className="border-t-2 border-slate-800 pt-4 mt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono gap-2">
          <span>NAGPUR REAL ESTATE PLATFORM • OFFICIAL PROPERTY DOSSIER</span>
          <span>SYSTEM GENERATED • VERIFIED AUDIT TRAIL</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyViewPage;
