import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Plus,
  Search,
  Building2,
  TrendingUp,
  Sparkles,
  Edit2,
  CheckCircle,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
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
    <div className="space-y-6">
      <PageHeader
        title="Nagpur Localities & Neighborhoods"
        subtitle="Manage localized growth corridors, average price per square foot, and active property counts"
        icon={MapPin}
        breadcrumbs={[{ label: 'Localities' }]}
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 py-2 px-4 rounded-xl bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Locality</span>
          </button>
        }
      />

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by locality name or pincode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Localities Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-52 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : localities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {localities.map((loc) => (
            <div
              key={loc._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-brand-teal font-extrabold text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{loc.name}</span>
                  </div>

                  {loc.isFeatured && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase">
                      Featured
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Live Listings</span>
                    <strong className="text-brand-navy font-black text-sm">
                      {loc.propertyCount || 0}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Avg Rate</span>
                    <strong className="text-brand-orange font-black text-sm">
                      ₹{loc.avgPriceSqFt || '—'}/Sq.Ft
                    </strong>
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>
                    <span className="text-slate-400">Pincode: </span>
                    <span className="font-mono font-bold text-slate-700">{loc.pincode || '4400xx'}</span>
                  </div>
                  {loc.description && (
                    <p className="line-clamp-2 leading-relaxed text-slate-600">
                      {loc.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => handleOpenEdit(loc)}
                  className="py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors inline-flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Rate & Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title="No localities found"
          description="Click 'Add Locality' to configure Nagpur neighborhoods."
        />
      )}

      {/* Add / Edit Locality Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingLocality ? `Edit Locality: ${editingLocality.name}` : 'Add New Locality'}
          subtitle="Configure neighborhood boundaries, benchmark rate per sq.ft, and pincode"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Locality Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramdaspeth"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="440010"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Avg Rate (₹/Sq.Ft)
                </label>
                <input
                  type="number"
                  value={formData.avgPriceSqFt}
                  onChange={(e) => setFormData({ ...formData, avgPriceSqFt: e.target.value })}
                  placeholder="6500"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-brand-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Neighborhood Overview
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key connectivity, lifestyle, hospital, commercial corridors..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-brand-orange focus:ring-brand-orange"
                />
                <span>Highlight as Prime Nagpur Corridor</span>
              </label>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="py-2 px-5 rounded-xl bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-bold shadow-md disabled:opacity-50"
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
