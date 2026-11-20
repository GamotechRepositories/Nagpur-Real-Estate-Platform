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
  Edit2,
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
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatIndianPrice, formatArea, formatDate } from '../../utils/formatters';
import { getFullImageUrl } from '../../components/common/PhotoUploader';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'overview' | 'gallery' | 'amenities'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchInventory, setSearchInventory] = useState('');

  // Fetch Project Details with its associated properties
  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-project-details', id],
    queryFn: async () => {
      const res = await apiClient.get(`/projects/${id}`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });

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
      <div className="p-8 space-y-4">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-8">
        <EmptyState
          icon={Compass}
          title="Project Not Found"
          description="The requested development project could not be located."
          actionText="Back to Projects"
          onAction={() => navigate('/projects')}
        />
      </div>
    );
  }

  const coverImage =
    project.images?.find((img) => img.isCover)?.url ||
    project.images?.[0]?.url ||
    project.coverPhoto ||
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';

  const galleryImages = project.images || [];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            to="/projects"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs font-semibold flex items-center gap-1 transition"
          >
            <ArrowLeft size={14} />
            <span>Projects</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
            {project.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/projects/edit/${project._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition"
          >
            <Edit2 size={13} />
            <span>Edit Project</span>
          </Link>
          <Link
            to={`/listings/new?projectId=${project._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus size={14} />
            <span>+ Add Unit to this Project</span>
          </Link>
        </div>
      </div>

      {/* Hero Banner Showcase */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="relative h-64 sm:h-80 w-full bg-slate-900">
          <img
            src={getFullImageUrl(coverImage)}
            alt={project.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Top Floating Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 text-slate-900 backdrop-blur-md shadow-xs">
                {project.projectType || 'RESIDENTIAL'}
              </span>
              <Badge status={project.projectStatus || 'UNDER_CONSTRUCTION'} size="sm" />
              {project.isFeatured && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1">
                  <Sparkles size={11} /> Featured
                </span>
              )}
            </div>

            {project.reraNumber && (
              <a
                href={project.reraWebsite || 'https://maharera.mahaonline.gov.in'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 text-teal-300 border border-teal-500/40 backdrop-blur-md text-[11px] font-mono hover:bg-slate-900 transition"
              >
                <Shield size={12} className="text-teal-400" />
                <span>MahaRERA: {project.reraNumber}</span>
                <ExternalLink size={10} className="text-slate-400" />
              </a>
            )}
          </div>

          {/* Bottom Title & Fast Overview */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="max-w-3xl space-y-1.5">
              <h1 className="text-xl sm:text-3xl font-black tracking-tight drop-shadow-md">
                {project.name}
              </h1>
              {project.tagline && (
                <p className="text-xs sm:text-sm text-slate-200 font-medium line-clamp-1 drop-shadow">
                  {project.tagline}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-slate-300 pt-1 flex-wrap drop-shadow">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} className="text-teal-400" />
                  <span>{project.localityName || 'Nagpur'}, {project.address}</span>
                </span>
                {project.builderName && (
                  <span className="inline-flex items-center gap-1 font-semibold text-white">
                    <Building size={13} className="text-teal-400" />
                    <span>Developer: {project.builderName}</span>
                  </span>
                )}
                <span className="font-mono text-amber-300 font-bold">
                  Starts {formatIndianPrice(project.startingPrice)}
                  {project.pricePerSqFt ? ` • ₹ ${project.pricePerSqFt}/sq.ft` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fast Facts KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-slate-50 border-t border-slate-200 text-xs">
          <div className="p-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Land Parcel</span>
            <span className="font-bold text-slate-900 mt-0.5 block">
              {project.totalLandArea || 'Master Township'}
            </span>
          </div>

          <div className="p-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Towers / Blocks</span>
            <span className="font-bold text-slate-900 mt-0.5 block">
              {project.totalTowers || 'High-Rise Blocks'}
            </span>
          </div>

          <div className="p-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Planned Units</span>
            <span className="font-bold text-slate-900 mt-0.5 block">
              {project.totalUnits ? `${project.totalUnits} Units` : 'N/A'}
            </span>
          </div>

          <div className="p-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Inventory In System</span>
            <span className="font-bold text-teal-800 mt-0.5 block">
              {project.totalUnitsPosted || properties.length} Units ({project.liveUnitsPosted || 0} Live)
            </span>
          </div>

          <div className="p-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Open Space %</span>
            <span className="font-bold text-emerald-800 mt-0.5 block flex items-center gap-1">
              <TreePine size={13} className="text-emerald-600" />
              <span>{project.openSpacePercentage || '65% Open Landscaping'}</span>
            </span>
          </div>

          <div className="p-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Possession Timeline</span>
            <span className="font-bold text-slate-900 mt-0.5 block">
              {project.possessionDate ? formatDate(project.possessionDate) : 'Ready / In Phases'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'inventory'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={14} />
          <span>Properties & Units in Project</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-mono">
            {properties.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={14} />
          <span>Project Specifications & Approvals</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'gallery'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon size={14} />
          <span>Photo Gallery & Plans</span>
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
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
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
                      <th className="py-3 px-3">Assigned Representative</th>
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
                                    src={getFullImageUrl(propCover)}
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
                                Floor {prop.floor}
                              </span>
                            )}
                          </td>

                          {/* Area */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-mono text-slate-800">
                              {prop.carpetAreaSqFt ? `${prop.carpetAreaSqFt} sq.ft (Carpet)` : `${prop.areaSqFt} sq.ft`}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-bold text-slate-900 font-mono text-xs">
                              {formatIndianPrice(prop.price)}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <Badge status={prop.status} size="xs" />
                          </td>

                          {/* Representative */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {prop.assignedAgent ? (
                              <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                {prop.assignedAgent.name || 'Certified Agent'}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Central Desk</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              <Link
                                to={`/listings/edit/${prop._id}`}
                                className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
                              >
                                <Edit2 size={12} />
                                <span>Edit</span>
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

      {/* TAB 2: PROJECT OVERVIEW & SPECIFICATIONS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main Specifications */}
          <div className="md:col-span-2 space-y-5">
            {/* Description */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText size={16} className="text-teal-700" />
                <span>About {project.name}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {project.description ||
                  'Modern township development situated in prime Nagpur with extensive open green spaces, lifestyle clubhouse facilities, and NMC compliant infrastructure.'}
              </p>
            </div>

            {/* Available Configurations Badges */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers size={16} className="text-teal-700" />
                <span>Available Unit Typologies & Configurations</span>
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {(project.availableConfigurations && project.availableConfigurations.length > 0
                  ? project.availableConfigurations
                  : ['1 BHK Luxury Flat', '2 BHK Premium', '3 BHK High-Rise', '4 BHK Penthouse']
                ).map((cfg, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} className="text-teal-600" />
                    <span>{cfg}</span>
                  </span>
                ))}
              </div>
              {project.carpetAreaRange && (
                <p className="text-xs text-slate-500 font-mono pt-1">
                  Typical Carpet Area Range: <strong>{project.carpetAreaRange}</strong>
                </p>
              )}
            </div>

            {/* Amenities Grid */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-teal-700" />
                <span>Project Amenities & Lifestyle Facilities</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(project.amenities && project.amenities.length > 0
                  ? project.amenities
                  : [
                      'Grand Lifestyle Clubhouse',
                      'Infinity Swimming Pool',
                      'Hi-tech Fitness Center & Gym',
                      '24x7 Multi-tier CCTV & Gated Security',
                      '100% DG Power Backup for Common Areas',
                      'Children Play Zone & Sand Pit',
                      'Landscaped Zen Garden & Jogging Track',
                      'Rainwater Harvesting & Solar Lighting',
                    ]
                ).map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700"
                  >
                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                      <Check size={12} />
                    </div>
                    <span className="font-semibold">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Key-Value Specifications */}
            {project.customFields && project.customFields.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-teal-700" />
                  <span>Project Specifications & Custom Attributes</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.customFields.map((cf, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
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

          {/* Right Sidebar: Approvals, Bank Tie-ups, Site Office */}
          <div className="space-y-5">
            {/* Legal & Approvals */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-teal-700" />
                <span>Legal Sanctions & Approvals</span>
              </h3>
              <div className="space-y-2 text-xs">
                {(project.approvals && project.approvals.length > 0
                  ? project.approvals
                  : ['MahaRERA Registered', 'NMRDA Sanctioned Layout', 'NIT Sanctioned Plan', 'NMC Water & Fire Compliant']
                ).map((appr, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                    <span>{appr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approved Banks */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 size={16} className="text-teal-700" />
                <span>Home Loan Approved Banks</span>
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(project.approvedBanks && project.approvedBanks.length > 0
                  ? project.approvedBanks
                  : ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Bank of Maharashtra']
                ).map((bank, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-semibold"
                  >
                    {bank}
                  </span>
                ))}
              </div>
            </div>

            {/* Site Office Contact */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Phone size={16} className="text-teal-700" />
                <span>Site Office & Sales Desk</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  <strong className="text-slate-900 font-semibold block">Site Address:</strong>
                  <span>{project.address}, Nagpur - {project.pincode || '440025'}</span>
                </p>
                {project.contactPhone && (
                  <p>
                    <strong className="text-slate-900 font-semibold block">Inquiry Helpline:</strong>
                    <a href={`tel:${project.contactPhone}`} className="text-teal-700 font-mono font-bold hover:underline">
                      {project.contactPhone}
                    </a>
                  </p>
                )}
                {project.contactEmail && (
                  <p>
                    <strong className="text-slate-900 font-semibold block">Official Email:</strong>
                    <a href={`mailto:${project.contactEmail}`} className="text-teal-700 font-mono hover:underline">
                      {project.contactEmail}
                    </a>
                  </p>
                )}
                <p>
                  <strong className="text-slate-900 font-semibold block">Site Visit Hours:</strong>
                  <span>{project.siteOfficeTimings || '10:00 AM - 7:00 PM (All 7 Days Open)'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PHOTO GALLERY & MASTER PLANS */}
      {activeTab === 'gallery' && (
        <div className="space-y-5">
          {galleryImages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400 text-xs">
              No gallery images uploaded for this project yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs group relative"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={getFullImageUrl(img.url)}
                      alt={img.caption || `Project image ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  {img.caption && (
                    <div className="p-2.5 text-xs font-semibold text-slate-700 truncate bg-white">
                      {img.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Master Plan & Video */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
            {project.masterPlanUrl && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers size={16} className="text-teal-700" />
                  <span>Master Layout Plan</span>
                </h3>
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={getFullImageUrl(project.masterPlanUrl)}
                    alt="Master Plan"
                    className="w-full h-64 object-contain bg-slate-900"
                  />
                </div>
              </div>
            )}

            {project.brochureUrl && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={16} className="text-teal-700" />
                  <span>Official Project Brochure</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive high-resolution PDF brochure covering floor plans, specifications, and layout.
                </p>
                <a
                  href={getFullImageUrl(project.brochureUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  <ExternalLink size={14} />
                  <span>Download / View PDF Brochure</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
