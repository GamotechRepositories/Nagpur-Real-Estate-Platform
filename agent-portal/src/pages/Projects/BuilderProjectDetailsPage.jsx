import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Compass,
  ArrowLeft,
  Building,
  MapPin,
  Shield,
  Plus,
  ExternalLink,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  FileText,
  Eye,
  Check,
  Video,
  Image as ImageIcon,
  Sparkles,
  TreePine,
  ShieldCheck,
  Building2,
  Search,
  IndianRupee,
  Edit2,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const formatArea = (sqft) => {
  if (!sqft) return '—';
  return `${Number(sqft).toLocaleString('en-IN')} sq.ft`;
};

export const BuilderProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'overview' | 'amenities' | 'gallery'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchInventory, setSearchInventory] = useState('');

  // Fetch Project Details with its associated properties
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['builder-project-details', id],
    queryFn: async () => {
      // Try builder project endpoint first, fallback to public project endpoint
      try {
        const res = await apiClient.get(`/builders/me/projects/${id}`);
        return res.data?.data || res.data;
      } catch (err) {
        const fallbackRes = await apiClient.get(`/projects/${id}`);
        return fallbackRes.data?.data || fallbackRes.data;
      }
    },
    enabled: !!id,
  });

  const project = response;
  const properties = project?.properties || [];

  // Filter properties in this project
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      if (statusFilter !== 'ALL' && prop.status !== statusFilter) return false;
      if (searchInventory.trim()) {
        const q = searchInventory.toLowerCase().trim();
        const titleMatch = prop.title?.toLowerCase().includes(q);
        const subtypeMatch = prop.subtype?.toLowerCase().includes(q);
        const bhkMatch = prop.bedrooms?.toString().includes(q);
        const slugMatch = prop.slug?.toLowerCase().includes(q) || prop._id?.toLowerCase().includes(q);
        return titleMatch || subtypeMatch || bhkMatch || slugMatch;
      }
      return true;
    });
  }, [properties, statusFilter, searchInventory]);

  const counts = useMemo(() => {
    return {
      ALL: properties.length,
      LIVE: properties.filter((p) => p.status === 'LIVE').length,
      PENDING_REVIEW: properties.filter((p) => p.status === 'PENDING_REVIEW').length,
      REJECTED: properties.filter((p) => p.status === 'REJECTED').length,
      SOLD: properties.filter((p) => p.status === 'SOLD').length,
    };
  }, [properties]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 w-40 bg-slate-100 rounded animate-pulse" />
        <div className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <Compass size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-900">Project Not Found</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The requested township or high-rise project could not be found or you do not have permission to view it.
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  const coverImage =
    project.images?.find((img) => img.isCover)?.url ||
    project.images?.[0]?.url ||
    project.coverPhoto ||
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80';

  const galleryImages = project.images || (coverImage ? [{ url: coverImage }] : []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs">
          <Link
            to="/projects"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={14} />
          </Link>
          <span className="text-slate-400">/</span>
          <Link to="/projects" className="text-slate-500 hover:text-teal-700 font-medium">
            Projects
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-bold truncate max-w-xs">{project.name}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/listings/new?projectId=${project._id}`}
            className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus size={15} />
            <span>+ Post Unit in this Project</span>
          </Link>
        </div>
      </div>

      {/* Hero Elevation Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/90 shadow-sm text-white min-h-[260px] sm:min-h-[280px] flex flex-col justify-end">
        <img
          src={coverImage}
          alt={project.name}
          className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        {/* Hero Content Overlay */}
        <div className="relative z-10 p-4 sm:p-7 flex flex-col justify-end">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="py-1 px-2.5 rounded-lg text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 uppercase tracking-wider">
              {project.projectType?.replace('_', ' ') || 'RESIDENTIAL TOWNSHIP'}
            </span>
            <span className="py-1 px-2.5 rounded-lg text-[10px] font-bold bg-white/20 text-white backdrop-blur-xs border border-white/20 uppercase tracking-wider">
              {project.projectStatus?.replace('_', ' ') || 'UNDER CONSTRUCTION'}
            </span>
            {project.reraNumber && (
              <span className="py-1 px-2.5 rounded-lg text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck size={12} />
                <span>MahaRERA: {project.reraNumber}</span>
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-xs">
            {project.name}
          </h1>

          {project.tagline && (
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 drop-shadow-xs max-w-3xl line-clamp-2">
              {project.tagline}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-teal-400 flex-shrink-0" />
              <span>{project.localityName || 'Nagpur'}, {project.address}</span>
            </div>
            {project.builderName && (
              <div className="flex items-center gap-1">
                <Building size={14} className="text-teal-400 flex-shrink-0" />
                <span>By {project.builderName}</span>
              </div>
            )}
            {project.reraWebsite && (
              <a
                href={project.reraWebsite}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-teal-300 hover:text-teal-200 underline"
              >
                <span>Verify RERA Certificate</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Fast Facts Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Units</span>
          <span className="text-base font-black text-slate-900 mt-0.5 block">
            {project.totalUnits || '—'} Units
          </span>
          <span className="text-[10px] text-slate-500 block">Master layout</span>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Units Listed</span>
          <span className="text-base font-black text-teal-700 mt-0.5 block">
            {properties.length} Units
          </span>
          <span className="text-[10px] text-teal-600 block">{counts.LIVE} Live on site</span>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Price Starts At</span>
          <span className="text-base font-black text-slate-900 mt-0.5 block">
            {project.startingPrice ? formatCurrency(project.startingPrice) : 'On Request'}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {project.pricePerSqFt ? `₹${project.pricePerSqFt}/sqft` : 'Base price'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Carpet Range</span>
          <span className="text-base font-black text-slate-900 mt-0.5 block truncate">
            {project.carpetAreaRange || '—'}
          </span>
          <span className="text-[10px] text-slate-500 block">Usable carpet area</span>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Land Area</span>
          <span className="text-base font-black text-slate-900 mt-0.5 block">
            {project.totalLandArea || '—'}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {project.openSpacePercentage || '65%'} Open Space
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Towers / Floors</span>
          <span className="text-base font-black text-slate-900 mt-0.5 block truncate">
            {project.totalTowers || '—'}
          </span>
          <span className="text-[10px] text-slate-500 block">Development scale</span>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Possession</span>
          <span className="text-base font-black text-slate-900 mt-0.5 block">
            {project.possessionDate ? formatDate(project.possessionDate) : 'Ready'}
          </span>
          <span className="text-[10px] text-slate-500 block">RERA timeline</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-semibold overflow-x-auto whitespace-nowrap scrollbar-none max-w-full pb-1">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-3 px-4 border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'inventory'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={15} />
          <span>Units & Inventory</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'inventory' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {properties.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'overview'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles size={15} />
          <span>Project Specifications</span>
        </button>

        <button
          onClick={() => setActiveTab('amenities')}
          className={`py-3 px-4 border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'amenities'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TreePine size={15} />
          <span>Amenities ({project.amenities?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`py-3 px-4 border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'gallery'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon size={15} />
          <span>Photos & Plans</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-mono">
            {galleryImages.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PROPERTIES IN THIS PROJECT */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none pb-1 sm:pb-0">
              {[
                { key: 'ALL', label: 'All Units' },
                { key: 'LIVE', label: 'Live' },
                { key: 'PENDING_REVIEW', label: 'Pending' },
                { key: 'SOLD', label: 'Sold Out' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setStatusFilter(t.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === t.key
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{t.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      statusFilter === t.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {counts[t.key] || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search unit by BHK, title, ID..."
                value={searchInventory}
                onChange={(e) => setSearchInventory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-teal-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Property Inventory List */}
          {filteredProperties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                <Layers size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {properties.length === 0
                  ? 'No property units listed under this project yet'
                  : 'No units matching your current filter'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {properties.length === 0
                  ? 'You can list apartment units, penthouses, commercial shops, or plots under this development project.'
                  : 'Try clearing the search query or switching status tabs.'}
              </p>
              <div className="pt-2">
                <Link
                  to={`/listings/new?projectId=${project._id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Plus size={15} />
                  <span>+ Post Unit in this Project</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Unit / Flat</th>
                      <th className="py-3 px-3">Configuration</th>
                      <th className="py-3 px-3">Carpet / Super Area</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProperties.map((prop) => {
                      const propCover = prop.coverImage || prop.images?.[0]?.url;
                      return (
                        <tr key={prop._id} className="hover:bg-slate-50/80 transition group">
                          {/* Unit Title & Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 relative">
                                {propCover ? (
                                  <img
                                    src={propCover}
                                    alt={prop.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Building2 size={16} />
                                  </div>
                                )}
                                <span className="absolute bottom-0 left-0 right-0 text-[8px] font-bold bg-slate-900/80 text-white text-center">
                                  {prop.purpose}
                                </span>
                              </div>
                              <div className="min-w-0 max-w-sm">
                                <Link
                                  to={`/listings/edit/${prop._id}`}
                                  className="font-bold text-slate-900 hover:text-teal-700 transition truncate block text-xs"
                                >
                                  {prop.title}
                                </Link>
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  ID: {prop.slug?.slice(-6) || prop._id?.slice(-6)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Configuration */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-semibold text-slate-800">
                              {prop.bedrooms ? `${prop.bedrooms} BHK` : prop.subtype || prop.category}
                            </span>
                            {prop.floor && (
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Floor {prop.floor} {prop.totalFloors ? `of ${prop.totalFloors}` : ''}
                              </span>
                            )}
                          </td>

                          {/* Carpet Area */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 block">
                              {formatArea(prop.carpetArea || prop.superBuiltUpArea || prop.plotArea)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {prop.carpetArea ? 'Carpet Area' : 'Total Area'}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-bold text-slate-900 block">
                              {formatCurrency(prop.price)}
                            </span>
                            {prop.pricePerSqFt && (
                              <span className="text-[10px] text-slate-400">
                                ₹{prop.pricePerSqFt}/sq.ft
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <Badge
                              variant={
                                prop.status === 'LIVE'
                                  ? 'success'
                                  : prop.status === 'PENDING_REVIEW'
                                  ? 'warning'
                                  : prop.status === 'SOLD'
                                  ? 'neutral'
                                  : 'danger'
                              }
                            >
                              {prop.status}
                            </Badge>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              <Link
                                to={`/listings/view/${prop._id}`}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-slate-50 transition"
                                title="View Unit Details"
                              >
                                <Eye size={13} />
                              </Link>
                              <Link
                                to={`/listings/edit/${prop._id}`}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-slate-50 transition"
                                title="Edit Unit"
                              >
                                <Edit2 size={13} />
                              </Link>
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
      )}

      {/* TAB 2: OVERVIEW & SPECIFICATIONS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText size={16} className="text-teal-700" />
                <span>Project Description & Highlights</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {project.description ||
                  'Nagpur premier residential development featuring premium construction quality, prime connectivity to Wardha Road / MIHAN, and modern lifestyle amenities.'}
              </p>
            </div>

            {/* Available Typologies */}
            {project.availableConfigurations && project.availableConfigurations.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers size={16} className="text-teal-700" />
                  <span>Available Typologies & Unit Options</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.availableConfigurations.map((cfg) => (
                    <div
                      key={cfg}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2"
                    >
                      <CheckCircle2 size={15} className="text-teal-700 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-800">{cfg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legal Sanctions & Approvals */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-teal-700" />
                <span>Government Sanctions & Regulatory Approvals</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(project.approvals && project.approvals.length > 0
                  ? project.approvals
                  : [
                      'MahaRERA Registered',
                      'NMRDA Sanctioned Layout',
                      'NIT Sanctioned Plan',
                      'NMC Water & Fire Approved',
                      'Clear Title 7/12 Verified',
                    ]
                ).map((appr) => (
                  <div
                    key={appr}
                    className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2 text-emerald-900 text-xs font-semibold"
                  >
                    <CheckCircle2 size={15} className="text-emerald-700 flex-shrink-0" />
                    <span>{appr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approved Banking Partners */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building size={16} className="text-teal-700" />
                <span>Approved Banking Partners for Home Loan</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(project.approvedBanks && project.approvedBanks.length > 0
                  ? project.approvedBanks
                  : ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Bank of Maharashtra', 'PNB']
                ).map((bank) => (
                  <div
                    key={bank}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center font-bold text-xs text-slate-700"
                  >
                    {bank}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Key-Value Specifications */}
            {project.customFields && project.customFields.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-teal-700" />
                  <span>Project Specifications & Custom Attributes</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.customFields.map((cf, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {cf.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                        {cf.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Sales & Site Office Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Site Office & Inquiries</h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Site Office Address</span>
                    <span className="text-slate-500 leading-relaxed block">
                      {project.address}, {project.localityName}, Nagpur - {project.pincode || '440025'}
                    </span>
                    {project.landmark && (
                      <span className="text-teal-700 text-[11px] font-medium block mt-0.5">
                        Landmark: {project.landmark}
                      </span>
                    )}
                  </div>
                </div>

                {project.contactPhone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={15} className="text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800 block">Direct Sales Desk</span>
                      <a
                        href={`tel:${project.contactPhone}`}
                        className="text-teal-700 hover:underline font-mono"
                      >
                        {project.contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                {project.contactWhatsApp && (
                  <div className="flex items-center gap-2.5">
                    <MessageSquare size={15} className="text-emerald-500 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800 block">WhatsApp Inquiries</span>
                      <a
                        href={`https://wa.me/${project.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline font-mono"
                      >
                        {project.contactWhatsApp}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2.5">
                  <Clock size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Inspection Timings</span>
                    <span className="text-slate-500">
                      {project.siteOfficeTimings || 'Monday – Sunday: 10:00 AM – 7:00 PM'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Developer Dossier */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Project Developer
                </span>
                <span className="font-bold text-slate-900 block">
                  {project.builderName || project.builder?.name || 'Authorized Builder'}
                </span>
                {project.builder?.experienceYears && (
                  <span className="text-slate-500 text-[11px] block">
                    {project.builder.experienceYears} Years Market Experience
                  </span>
                )}
              </div>
            </div>

            {/* Digital Documents */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Project Collateral</h3>

              <div className="space-y-2">
                {project.brochureUrl && (
                  <a
                    href={project.brochureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold transition"
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={15} className="text-teal-700" />
                      <span>Download E-Brochure (PDF)</span>
                    </span>
                    <ExternalLink size={13} className="text-slate-400" />
                  </a>
                )}

                {project.videoUrl && (
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold transition"
                  >
                    <span className="flex items-center gap-2">
                      <Video size={15} className="text-red-600" />
                      <span>Watch Walkthrough Video</span>
                    </span>
                    <ExternalLink size={13} className="text-slate-400" />
                  </a>
                )}

                {project.masterPlanUrl && (
                  <a
                    href={project.masterPlanUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold transition"
                  >
                    <span className="flex items-center gap-2">
                      <Layers size={15} className="text-indigo-600" />
                      <span>View Master Plan Layout</span>
                    </span>
                    <ExternalLink size={13} className="text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AMENITIES */}
      {activeTab === 'amenities' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Township Amenities & Lifestyle Facilities</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Modern clubhouse, recreational hubs, and security features included in this development.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
              {project.amenities?.length || 0} Amenities Configured
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
            {(project.amenities || []).map((amenity) => (
              <div
                key={amenity}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 hover:bg-slate-100/70 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                  <Check size={14} />
                </div>
                <span className="text-xs font-semibold text-slate-800">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GALLERY & PLANS */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Master Plan */}
          {project.masterPlanUrl && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers size={16} className="text-teal-700" />
                  <span>Master Plan & Layout Blueprint</span>
                </h3>
                <a
                  href={project.masterPlanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open Full Resolution</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-96 bg-slate-950 flex items-center justify-center">
                <img
                  src={project.masterPlanUrl}
                  alt="Master Plan"
                  className="w-full h-full object-contain max-h-96"
                />
              </div>
            </div>
          )}

          {/* Photo Gallery */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon size={16} className="text-teal-700" />
              <span>Project Elevations & Actual Site Photos</span>
            </h3>

            {galleryImages.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No images uploaded for this project yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video shadow-2xs"
                  >
                    <img
                      src={img.url || img}
                      alt={img.caption || `Project image ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {img.caption && (
                      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-slate-950/80 to-transparent text-[11px] text-white truncate">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuilderProjectDetailsPage;
