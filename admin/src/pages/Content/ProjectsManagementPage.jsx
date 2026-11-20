import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Plus,
  Search,
  MapPin,
  Shield,
  Edit2,
  Trash2,
  Building,
  Eye,
  Layers,
  Building2,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import ConfirmModal from '../../components/common/ConfirmModal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { getFullImageUrl } from '../../components/common/PhotoUploader';
import { formatIndianPrice } from '../../utils/formatters';

export const ProjectsManagementPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-projects-list'],
    queryFn: async () => {
      const res = await apiClient.get('/projects?limit=100&all=true');
      return res.data;
    },
  });

  const projects = response?.data || [];

  const filteredProjects = projects.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.localityName?.toLowerCase().includes(q) ||
      p.reraNumber?.toLowerCase().includes(q) ||
      p.builderName?.toLowerCase().includes(q)
    );
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return apiClient.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-projects-list']);
      setDeleteModal({ isOpen: false, item: null });
    },
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projects"
        subtitle="Manage residential, commercial, and plotted developments across Nagpur"
        icon={Compass}
        breadcrumbs={[{ label: 'Projects' }]}
        actions={
          <button
            onClick={() => navigate('/projects/new')}
            className="inline-flex items-center space-x-1.5 py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Project</span>
          </button>
        }
      />

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects by name, locality, developer, RERA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredProjects.length}</strong> developments
        </div>
      </div>

      {/* Projects Row-based Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-14 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Project & Locality</th>
                  <th className="py-3 px-3">Developer / Builder</th>
                  <th className="py-3 px-3">MahaRERA No.</th>
                  <th className="py-3 px-3">Starting Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Inventory / Units</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((proj) => {
                  const coverImage =
                    proj.images?.find((img) => img.isCover)?.url ||
                    proj.images?.[0]?.url ||
                    proj.coverPhoto;

                  const totalUnits = proj.totalUnitsPosted || 0;
                  const liveUnits = proj.liveUnitsPosted || 0;

                  return (
                    <tr
                      key={proj._id}
                      onClick={() => navigate(`/projects/${proj._id}`)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Project Image, Name, Locality */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 relative">
                            {coverImage ? (
                              <img
                                src={getFullImageUrl(coverImage)}
                                alt={proj.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Building className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors block line-clamp-1">
                              {proj.name}
                            </span>
                            <div className="flex items-center space-x-1 text-slate-500 text-[11px] mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {proj.localityName || proj.address || 'Nagpur'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Developer */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {proj.builderName || proj.builder?.name || 'Independent'}
                        </span>
                        {proj.projectType && (
                          <span className="text-[10px] text-slate-400 block uppercase">
                            {proj.projectType.replace('_', ' ')}
                          </span>
                        )}
                      </td>

                      {/* MahaRERA Number */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600">
                        {proj.reraNumber ? (
                          <div className="inline-flex items-center space-x-1 text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-[11px]">
                            <Shield className="w-3 h-3 flex-shrink-0" />
                            <span>{proj.reraNumber}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not Registered</span>
                        )}
                      </td>

                      {/* Starting Price */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {formatIndianPrice(proj.startingPrice)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge status={proj.projectStatus} size="xs" />
                      </td>

                      {/* Inventory / Units */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-bold ${
                            totalUnits > 0
                              ? 'bg-teal-50 text-teal-800 border border-teal-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Layers size={11} className={totalUnits > 0 ? 'text-teal-600' : 'text-slate-400'} />
                          <span>{totalUnits} Units</span>
                          {liveUnits > 0 && <span className="text-[10px] text-emerald-700">({liveUnits} Live)</span>}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end space-x-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => navigate(`/projects/${proj._id}`)}
                            className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition cursor-pointer"
                            title="Inspect Project & All Units"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Units</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/projects/edit/${proj._id}`)}
                            className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                            title="Edit Project Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteModal({ isOpen: true, item: proj })}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title="No projects found"
          description="Add a new project using the button above."
        />
      )}

      {/* In-App Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={() => deleteMutation.mutate(deleteModal.item?._id)}
        title="Delete Project"
        message={`Are you sure you want to delete project "${deleteModal.item?.name || ''}"?`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ProjectsManagementPage;
