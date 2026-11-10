import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import PhotoUploader, { getFullImageUrl } from '../../components/common/PhotoUploader';
import { formatIndianPrice } from '../../utils/formatters';

export const LocalitiesManagementPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocality, setEditingLocality] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    pincode: '440010',
    avgPriceSqFt: 5500,
    description: '',
    heroImage: '',
    isFeatured: true,
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-localities-list', search],
    queryFn: async () => {
      const res = await apiClient.get(`/localities${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      return res.data?.data || [];
    },
  });

  const localities = response || [];

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return apiClient.post('/localities', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-localities-list']);
      setModalOpen(false);
      setEditingLocality(null);
      setFormData({
        name: '',
        slug: '',
        pincode: '440010',
        avgPriceSqFt: 5500,
        description: '',
        isFeatured: true,
      });
    },
  });

  const handleOpenAdd = () => {
    setEditingLocality(null);
    setFormData({
      name: '',
      slug: '',
      pincode: '440010',
      avgPriceSqFt: 5500,
      description: '',
      heroImage: '',
      isFeatured: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLocality(loc);
    setFormData({
      name: loc.name,
      slug: loc.slug,
      pincode: loc.pincode || '',
      avgPriceSqFt: loc.avgPriceSqFt || 5000,
      description: loc.description || '',
      heroImage: loc.heroImage || '',
      isFeatured: loc.isFeatured ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      avgPriceSqFt: Number(formData.avgPriceSqFt) || 0,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Localities"
        subtitle="Manage areas and average price benchmarks"
        icon={MapPin}
        breadcrumbs={[{ label: 'Localities' }]}
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 py-1.5 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Locality</span>
          </button>
        }
      />

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by locality or pincode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Localities Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : localities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {localities.map((loc) => (
            <div
              key={loc._id}
              className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              {loc.heroImage && (
                <div className="h-32 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={getFullImageUrl(loc.heroImage)}
                    alt={loc.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {loc.isFeatured && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500 text-white shadow-xs">
                      Featured
                    </span>
                  )}
                </div>
              )}

              <div className="p-4 sm:p-5 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{loc.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">Pincode: {loc.pincode || '440010'}</span>
                  </div>
                  {!loc.heroImage && loc.isFeatured && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Featured
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Avg. Price / Sq.Ft:</span>
                  <span className="font-bold text-slate-900">
                    ₹{loc.avgPriceSqFt?.toLocaleString('en-IN') || '5,500'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => handleOpenEdit(loc)}
                  className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold transition-colors"
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
          icon={MapPin}
          title="No localities found"
          description="Add a new locality using the button above."
        />
      )}

      {/* Add / Edit Locality Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingLocality ? `Edit Locality: ${editingLocality.name}` : 'Add New Locality'}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Locality Name *
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
                placeholder="e.g. Ramdaspeth"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="440010"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-mono font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Avg. Rate / Sq.Ft (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.avgPriceSqFt}
                  onChange={(e) => setFormData({ ...formData, avgPriceSqFt: e.target.value })}
                  placeholder="5500"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Overview of this area..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium outline-none"
              />
            </div>

            {/* Locality Landmark Cover Photo */}
            <div className="pt-2 border-t border-slate-100">
              <PhotoUploader
                multiple={false}
                folder="localities"
                value={formData.heroImage}
                onChange={(url) => setFormData((prev) => ({ ...prev, heroImage: url }))}
                label="Locality Landmark / Cover Photo"
                helperText="Upload a high-quality landmark, street view, or junction photo of this locality"
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
                <span>Feature on Homepage Localities</span>
              </label>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="py-1.5 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {mutation.isPending ? 'Saving...' : 'Save Locality'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default LocalitiesManagementPage;
