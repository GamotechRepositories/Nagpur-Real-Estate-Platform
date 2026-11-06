import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Landmark,
  Plus,
  Search,
  Building,
  Shield,
  MapPin,
  IndianRupee,
  Calendar,
  CheckCircle,
  ExternalLink,
  Edit2,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatIndianPrice, formatDate } from '../../utils/formatters';

const PROJECT_STATUSES = ['NEW_LAUNCH', 'UNDER_CONSTRUCTION', 'READY_TO_MOVE', 'COMPLETED'];

export const ProjectsManagementPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    localityName: 'Wardha Road',
    reraNumber: '',
    projectStatus: 'UNDER_CONSTRUCTION',
    startingPrice: '',
    description: '',
    isFeatured: false,
    isPublished: true,
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-projects-list'],
    queryFn: async () => {
      const res = await apiClient.get('/projects?limit=50');
      return res.data;
    },
  });

  const projects = response?.data || [];

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return apiClient.post('/projects', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-projects-list']);
      setProjectModalOpen(false);
      setEditingProject(null);
      setFormData({
        name: '',
        slug: '',
        localityName: 'Wardha Road',
        reraNumber: '',
        projectStatus: 'UNDER_CONSTRUCTION',
        startingPrice: '',
        description: '',
        isFeatured: false,
        isPublished: true,
      });
    },
  });

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      slug: '',
      localityName: 'Wardha Road',
      reraNumber: '',
      projectStatus: 'UNDER_CONSTRUCTION',
      startingPrice: '',
      description: '',
      isFeatured: false,
      isPublished: true,
    });
    setProjectModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name,
      slug: proj.slug,
      localityName: proj.localityName || 'Nagpur',
      reraNumber: proj.reraNumber || '',
      projectStatus: proj.projectStatus || 'UNDER_CONSTRUCTION',
      startingPrice: proj.startingPrice || '',
      description: proj.description || '',
      isFeatured: proj.isFeatured || false,
      isPublished: proj.isPublished ?? true,
    });
    setProjectModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      startingPrice: Number(formData.startingPrice) || 0,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nagpur Projects & Townships"
        subtitle="Manage large residential and commercial developments, builder profiles, and MahaRERA registrations"
        icon={Landmark}
        breadcrumbs={[{ label: 'Projects' }]}
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 py-2 px-4 rounded-xl bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>
        }
      />

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge status={proj.projectStatus} />
                  {proj.isFeatured && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase">
                      Featured
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 line-clamp-1">{proj.name}</h3>
                  <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{proj.localityName || 'Nagpur'}</span>
                  </div>
                </div>

                {proj.startingPrice > 0 && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Starts From</span>
                    <strong className="text-brand-orange text-sm font-black">
                      {formatIndianPrice(proj.startingPrice)}
                    </strong>
                  </div>
                )}

                {proj.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                )}

                {proj.reraNumber && (
                  <div className="flex items-center space-x-1 text-emerald-700 text-xs font-mono font-bold">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>RERA: {proj.reraNumber}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleOpenEdit(proj)}
                  className="py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors inline-flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Project</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Landmark}
          title="No projects registered"
          description="Click 'Add New Project' to onboard townships or high-rises in Nagpur."
          action={
            <button
              onClick={handleOpenAdd}
              className="py-2 px-4 rounded-xl bg-brand-teal text-white text-xs font-bold shadow-sm"
            >
              Add First Project
            </button>
          }
        />
      )}

      {/* Add / Edit Project Modal */}
      {projectModalOpen && (
        <Modal
          isOpen={projectModalOpen}
          onClose={() => setProjectModalOpen(false)}
          title={editingProject ? `Edit Project: ${editingProject.name}` : 'Add New Nagpur Project'}
          subtitle="Configure development details, RERA compliance, starting ticket size, and locality"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Godrej Anandam, Ganeshpeth"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Locality Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.localityName}
                  onChange={(e) => setFormData({ ...formData, localityName: e.target.value })}
                  placeholder="Wardha Road"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Project Status
                </label>
                <select
                  value={formData.projectStatus}
                  onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  {PROJECT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Starting Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.startingPrice}
                  onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                  placeholder="5500000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-brand-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  MahaRERA Number
                </label>
                <input
                  type="text"
                  value={formData.reraNumber}
                  onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                  placeholder="P50500001234"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-brand-teal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Project Overview & Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="High-rise gated community with clubhouse, swimming pool, jogging track..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>

            <div className="flex items-center space-x-4 pt-2">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-brand-orange focus:ring-brand-orange"
                />
                <span>Featured on Homepage</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded text-brand-teal focus:ring-brand-teal"
                />
                <span>Published Active</span>
              </label>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProjectModalOpen(false)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="py-2 px-5 rounded-xl bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-bold shadow-md disabled:opacity-50"
              >
                {mutation.isPending ? 'Saving...' : 'Save Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProjectsManagementPage;
