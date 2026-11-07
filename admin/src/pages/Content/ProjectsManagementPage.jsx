import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Compass,
  Plus,
  Search,
  MapPin,
  Shield,
  Edit2,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatIndianPrice } from '../../utils/formatters';

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

  const filteredProjects = projects.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.localityName?.toLowerCase().includes(q) ||
      p.reraNumber?.toLowerCase().includes(q)
    );
  });

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
    <div className="space-y-5">
      <PageHeader
        title="Projects"
        subtitle="Manage residential and commercial developments"
        icon={Compass}
        breadcrumbs={[{ label: 'Projects' }]}
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 py-1.5 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        }
      />

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects by name, locality, RERA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj) => (
            <div
              key={proj._id}
              className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <Badge status={proj.projectStatus} size="xs" />
                  {proj.isFeatured && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Featured
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 truncate">{proj.name}</h3>
                  <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{proj.localityName || 'Nagpur'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Starting Price:</span>
                  <span className="font-bold text-slate-900">
                    {formatIndianPrice(proj.startingPrice)}
                  </span>
                </div>

                {proj.reraNumber && (
                  <div className="text-[11px] text-teal-700 font-mono font-medium flex items-center space-x-1">
                    <Shield className="w-3 h-3 flex-shrink-0" />
                    <span>RERA: {proj.reraNumber}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => handleOpenEdit(proj)}
                  className="inline-flex items-center space-x-1 py-1 px-2.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title="No projects found"
          description="Add a new project using the button above."
        />
      )}

      {/* Add / Edit Project Modal */}
      {projectModalOpen && (
        <Modal
          isOpen={projectModalOpen}
          onClose={() => setProjectModalOpen(false)}
          title={editingProject ? `Edit Project: ${editingProject.name}` : 'Add New Project'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    name: val,
                    slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  });
                }}
                placeholder="e.g. Godrej Anandam"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Locality
                </label>
                <input
                  type="text"
                  value={formData.localityName}
                  onChange={(e) => setFormData({ ...formData, localityName: e.target.value })}
                  placeholder="e.g. Wardha Road"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.projectStatus}
                  onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                >
                  {PROJECT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Starting Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.startingPrice}
                  onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                  placeholder="5000000"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  MahaRERA Number
                </label>
                <input
                  type="text"
                  value={formData.reraNumber}
                  onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                  placeholder="P50500012345"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-mono font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Overview of the development..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium outline-none"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Feature on Homepage</span>
              </label>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProjectModalOpen(false)}
                className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="py-1.5 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
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
