import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Plus,
  Search,
  MapPin,
  Building2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Layers,
  Eye,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const BuilderProjectsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['builder-my-projects'],
    queryFn: () => apiClient.get('/builders/me/projects'),
  });

  const projects = response?.data || [];

  const filteredProjects = projects.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.localityName?.toLowerCase().includes(q) ||
      p.reraNumber?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    );
  });

  const totalUnitsPlanned = projects.reduce((sum, p) => sum + (Number(p.totalUnits) || 0), 0);
  const totalUnitsPosted = projects.reduce((sum, p) => sum + (Number(p.totalUnitsPosted) || 0), 0);
  const totalLiveUnits = projects.reduce((sum, p) => sum + (Number(p.liveUnitsPosted) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            My Township Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your registered high-rises, gated villa townships, and plotted schemes in Nagpur.
          </p>
        </div>

        <Link
          to="/projects/new"
          className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus size={16} />
          <span>+ Add New Project</span>
        </Link>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Total Projects
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {projects.length}
          </span>
          <span className="text-[10px] text-teal-700 font-medium block">
            Registered developments
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Total Units Planned
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {totalUnitsPlanned}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            Across all phases
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Units Posted
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {totalUnitsPosted}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            In inventory system
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Live on Marketplace
          </span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">
            {totalLiveUnits}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium block">
            Verified & visible to buyers
          </span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <Search size={16} className="text-slate-400 ml-1" />
        <input
          type="text"
          placeholder="Search projects by name, locality, or MahaRERA number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 text-xs outline-none bg-transparent placeholder-slate-400 font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <Compass size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No Projects Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchTerm
                ? 'No projects matched your search keywords.'
                : 'You have not added any real estate projects yet. Add your first project to start posting property units.'}
            </p>
          </div>
          <Link
            to="/projects/new"
            className="inline-flex items-center space-x-1.5 py-2 px-4 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
          >
            <Plus size={15} />
            <span>+ Add Your First Project</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const coverImage =
              project.images?.find((img) => img.isCover)?.url ||
              project.images?.[0]?.url ||
              project.coverPhoto ||
              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={project._id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="cursor-pointer"
                >
                  <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={coverImage}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="py-1 px-2.5 rounded-lg text-[10px] font-bold bg-white/95 text-slate-800 backdrop-blur-xs border border-slate-200 shadow-2xs">
                        {project.projectStatus?.replace('_', ' ') || 'UNDER CONSTRUCTION'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-teal-700 transition">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{project.localityName || project.address}, Nagpur</span>
                      </div>
                    </div>

                    {project.reraNumber && (
                      <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">MahaRERA:</span>
                        <span className="font-semibold text-slate-900">{project.reraNumber}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Units Planned
                        </span>
                        <span className="font-bold text-slate-800">
                          {project.totalUnits || 'N/A'} Units
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Inventory Posted
                        </span>
                        <span className="font-bold text-teal-700">
                          {project.totalUnitsPosted || 0} Units ({project.liveUnitsPosted || 0} Live)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <Link
                    to={`/projects/${project._id}`}
                    className="w-full sm:flex-1 text-center py-1.5 px-2.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold shadow-2xs transition flex items-center justify-center gap-1"
                  >
                    <Eye size={13} />
                    <span>View Units & Details</span>
                  </Link>

                  <Link
                    to={`/listings/new?projectId=${project._id}`}
                    className="w-full sm:flex-1 text-center py-1.5 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-2xs transition flex items-center justify-center gap-1"
                  >
                    <Plus size={13} />
                    <span>+ Post Unit</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BuilderProjectsPage;
