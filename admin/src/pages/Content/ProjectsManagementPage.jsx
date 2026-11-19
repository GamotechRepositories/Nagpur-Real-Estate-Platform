import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Compass,
  Plus,
  Search,
  MapPin,
  Shield,
  Edit2,
  Trash2,
  Building,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import PhotoUploader, { getFullImageUrl } from '../../components/common/PhotoUploader';
import { formatIndianPrice } from '../../utils/formatters';

const PROJECT_STATUSES = ['NEW_LAUNCH', 'UNDER_CONSTRUCTION', 'READY_TO_MOVE', 'COMPLETED'];

export const ProjectsManagementPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    localityName: 'Wardha Road',
    reraNumber: '',
    projectStatus: 'UNDER_CONSTRUCTION',
    startingPrice: '',
    description: '',
    coverPhoto: '',
    galleryPhotos: [],
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

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return apiClient.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-projects-list']);
      setDeleteModal({ isOpen: false, item: null });
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
      coverPhoto: '',
      galleryPhotos: [],
      isFeatured: false,
      isPublished: true,
    });
    setProjectModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    const cover = proj.images?.find((i) => i.isCover)?.url || proj.images?.[0]?.url || '';
    const gallery = proj.images?.filter((i) => i.url !== cover).map((i) => i.url) || [];

    setFormData({
      name: proj.name,
      slug: proj.slug,
      localityName: proj.localityName || 'Nagpur',
      reraNumber: proj.reraNumber || '',
      projectStatus: proj.projectStatus || 'UNDER_CONSTRUCTION',
      startingPrice: proj.startingPrice || '',
      description: proj.description || '',
      coverPhoto: cover,
      galleryPhotos: gallery,
      isFeatured: proj.isFeatured || false,
      isPublished: proj.isPublished ?? true,
    });
    setProjectModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const images = [];
    if (formData.coverPhoto) {
      images.push({ url: formData.coverPhoto, isCover: true, caption: 'Project Elevation' });
    }
    if (formData.galleryPhotos && formData.galleryPhotos.length > 0) {
      formData.galleryPhotos.forEach((url) => {
        if (url !== formData.coverPhoto) {
          images.push({ url, isCover: false, caption: 'Project Gallery' });
        }
      });
    }

    mutation.mutate({
      ...formData,
      startingPrice: Number(formData.startingPrice) || 0,
      images,
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
                  <th className="py-3 px-3">MahaRERA No.</th>
                  <th className="py-3 px-3">Starting Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Media</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((proj) => {
                  const coverImage = proj.images?.find((i) => i.isCover)?.url || proj.images?.[0]?.url;
                  return (
                    <tr key={proj._id} className="hover:bg-slate-50/80 transition group">
                      {/* Project Name & Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {coverImage ? (
                            <img
                              src={getFullImageUrl(coverImage)}
                              alt={proj.name}
                              className="w-12 h-10 rounded-lg object-cover border border-slate-200 shadow-2xs flex-shrink-0 bg-slate-100"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              <Compass className="w-5 h-5 text-teal-600" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-sm">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition truncate text-xs">
                                {proj.name}
                              </h3>
                              {proj.isFeatured && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{proj.localityName || 'Nagpur'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* MahaRERA No. */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {proj.reraNumber ? (
                          <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-teal-700 font-mono text-[11px] font-medium">
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

                      {/* Media */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          {proj.images?.length || 0} Photos
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(proj)}
                            className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
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

      {/* Add / Edit Project Modal */}
      {projectModalOpen && (
        <Modal
          isOpen={projectModalOpen}
          onClose={() => setProjectModalOpen(false)}
          title={editingProject ? `Edit Project: ${editingProject.name}` : 'Add New Project'}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

            {/* Photos & Visuals Upload */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <PhotoUploader
                multiple={false}
                folder="projects"
                value={formData.coverPhoto}
                onChange={(url) => setFormData((prev) => ({ ...prev, coverPhoto: url }))}
                label="Project Elevation / 3D Render"
                helperText="Upload the main project facade photo or architectural 3D render"
                aspect="video"
              />

              <PhotoUploader
                multiple={true}
                folder="projects"
                value={formData.galleryPhotos}
                onChange={(photos) => setFormData((prev) => ({ ...prev, galleryPhotos: photos }))}
                label="Project Gallery (Sample Flat, Amenities, Layout)"
                helperText="Upload up to 10 photos of project amenities, construction progress, and layouts"
                maxFiles={10}
                aspect="video"
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
