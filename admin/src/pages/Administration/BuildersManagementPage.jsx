import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Star,
  Phone,
  Mail,
  Search,
  Shield,
  Plus,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  Clock,
  Edit2,
  Lock,
  ArrowRight,
  ExternalLink,
  Layers,
  Compass,
  Globe,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import PhotoUploader, { getFullImageUrl } from '../../components/common/PhotoUploader';

export const BuildersManagementPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBuilder, setEditingBuilder] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordWasUpdated, setPasswordWasUpdated] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    password: '',
    logo: '',
    reraNumber: '',
    establishedYear: '',
    experienceYears: 10,
    address: 'Nagpur, Maharashtra',
    website: '',
    description: '',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    password: '',
    reraNumber: '',
    establishedYear: '',
    experienceYears: 10,
    address: '',
    website: '',
    description: '',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    isActive: true,
    isAvailable: true,
  });

  // Fetch builders from backend
  const { data: builders, isLoading } = useQuery({
    queryKey: ['admin-builders-list'],
    queryFn: async () => {
      const res = await apiClient.get('/builders');
      return res.data?.data || [];
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return apiClient.post('/builders/admin', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-builders-list']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
      setModalOpen(false);
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        password: '',
        logo: '',
        reraNumber: '',
        establishedYear: '',
        experienceYears: 10,
        address: 'Nagpur, Maharashtra',
        website: '',
        description: '',
      });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to onboard builder.';
      setErrorMessage(msg);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return apiClient.put(`/builders/${id}`, payload);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['admin-builders-list']);
      queryClient.invalidateQueries(['admin-builder-details', editingBuilder?._id]);
      setEditModalOpen(false);
      setErrorMessage('');
      setPasswordWasUpdated(Boolean(variables?.payload?.password && variables.payload.password.trim()));
      setShowSuccessModal(true);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to update builder profile.';
      setErrorMessage(msg);
    },
  });

  // Quick Availability Status Toggle
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isAvailable }) => {
      return apiClient.patch(`/builders/${id}`, { isAvailable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-builders-list']);
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    createMutation.mutate(formData);
  };

  const openEditModal = (builder) => {
    setEditingBuilder(builder);
    setErrorMessage('');
    setEditFormData({
      name: builder.name || '',
      contactPerson: builder.contactPerson || builder.user?.name || '',
      phone: builder.contactPhone || builder.user?.phone || '',
      email: builder.contactEmail || builder.user?.email || '',
      password: '',
      reraNumber: builder.reraNumber || '',
      establishedYear: builder.establishedYear || '',
      experienceYears: builder.experienceYears || 10,
      address: builder.address || '',
      website: builder.website || '',
      description: builder.description || '',
      status: builder.user?.status || 'ACTIVE',
      verificationStatus: builder.verificationStatus || 'VERIFIED',
      isActive: builder.isActive !== false,
      isAvailable: builder.isAvailable !== false,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingBuilder) return;
    setErrorMessage('');

    const payload = { ...editFormData };
    if (!payload.password || !payload.password.trim()) {
      delete payload.password;
    }

    updateMutation.mutate({
      id: editingBuilder._id,
      payload,
    });
  };

  const filteredBuilders = (builders || []).filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.contactPerson?.toLowerCase().includes(q) ||
      b.user?.name?.toLowerCase().includes(q) ||
      b.reraNumber?.toLowerCase().includes(q) ||
      b.contactPhone?.includes(q) ||
      b.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Builders & Developers"
        subtitle="Manage certified township builders, MahaRERA registrations, and inventory projects across Nagpur"
        actions={
          <button
            type="button"
            onClick={() => {
              setErrorMessage('');
              setModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 py-2 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs hover:shadow-md transition duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>+ Onboard Builder</span>
          </button>
        }
      />

      {/* Search Bar & Total Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search builders by company name, contact person, MahaRERA, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 font-medium"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium px-2 flex items-center justify-between sm:justify-end gap-2">
          <span>Total Developers:</span>
          <span className="font-bold text-slate-800 bg-slate-100 py-1 px-2.5 rounded-md font-mono">
            {filteredBuilders.length}
          </span>
        </div>
      </div>

      {/* Builders Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredBuilders.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Builders or Developers Found"
          description={search ? 'No builders matched your search query.' : 'Onboard your first real estate developer to showcase their township projects.'}
          action={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="py-2 px-4 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition"
            >
              + Onboard First Builder
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBuilders.map((builder) => {
            const logoUrl = getFullImageUrl(builder.logo || builder.user?.avatar);
            const totalProj = builder.dynamicTotalProjects ?? builder.totalProjects ?? 0;
            const totalUnits = builder.dynamicTotalListings ?? 0;

            return (
              <div
                key={builder._id}
                className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-teal-500/60 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top: Logo & Name & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={builder.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0 bg-white"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-base flex-shrink-0 shadow-2xs">
                          {builder.name?.[0]?.toUpperCase() || 'B'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                          {builder.name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate font-medium">
                          {builder.contactPerson || builder.user?.name || 'Developer Representative'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <span
                        className={`inline-flex items-center space-x-1 py-0.5 px-2 rounded-md text-[10px] font-bold ${
                          builder.verificationStatus === 'VERIFIED'
                            ? 'bg-teal-50 border border-teal-200 text-teal-800'
                            : 'bg-amber-50 border border-amber-200 text-amber-800'
                        }`}
                      >
                        <Shield className="w-3 h-3 text-teal-600" />
                        <span>{builder.verificationStatus || 'VERIFIED'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(builder);
                        }}
                        className="p-1 rounded-md border border-slate-200 text-slate-500 hover:text-teal-700 hover:bg-slate-50 transition"
                        title="Edit Profile & Password"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Key Metrics: Projects, Units, Experience, Rating */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Township Projects</span>
                      <span className="font-bold text-teal-700 inline-flex items-center">
                        <Compass className="w-3.5 h-3.5 mr-1 text-teal-600" />
                        {totalProj} Projects
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Inventory Units</span>
                      <span className="font-bold text-slate-800 inline-flex items-center">
                        <Building2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        {totalUnits} Units
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Track Record</span>
                      <span className="font-bold text-slate-800">{builder.experienceYears || 10} Years</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Rating</span>
                      <span className="font-bold text-amber-600 inline-flex items-center">
                        <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                        {builder.rating || 4.8} / 5.0
                      </span>
                    </div>

                    {builder.reraNumber && (
                      <div className="col-span-2 pt-1 border-t border-slate-200/60 font-mono text-[11px] text-slate-700 flex items-center justify-between">
                        <span>MahaRERA:</span>
                        <span className="font-semibold text-slate-900">{builder.reraNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Office / Address */}
                  {builder.address && (
                    <div className="text-xs text-slate-600 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{builder.address}</span>
                    </div>
                  )}
                </div>

                {/* Actions: WhatsApp + Call + Email + Routing status + View Full Details */}
                <div className="pt-3 border-t border-slate-100 space-y-2 mt-3">
                  <div className="flex items-center space-x-1.5 text-xs">
                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/91${builder.contactPhone || builder.user?.phone}?text=${encodeURIComponent(
                        `Hello ${builder.name}, regarding your projects on Nagpur Real Estate Platform:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Phone Call */}
                    <a
                      href={`tel:+91${builder.contactPhone || builder.user?.phone}`}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Call Developer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    {/* Email */}
                    {(builder.contactEmail || builder.user?.email) && (
                      <a
                        href={`mailto:${builder.contactEmail || builder.user?.email}`}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Website */}
                    {builder.website && (
                      <a
                        href={builder.website.startsWith('http') ? builder.website : `https://${builder.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Open Website"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                    <span>Partner Portal:</span>
                    <button
                      type="button"
                      onClick={() => {
                        toggleMutation.mutate({
                          id: builder._id,
                          isAvailable: !builder.isAvailable,
                        });
                      }}
                      className={`font-semibold transition-colors ${
                        builder.isAvailable !== false
                          ? 'text-emerald-700 hover:underline'
                          : 'text-slate-400 hover:underline'
                      }`}
                    >
                      {builder.isAvailable !== false ? '● Active in Portal' : '○ Access Paused'}
                    </button>
                  </div>

                  {/* View Full Details Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/builders/${builder._id}`)}
                      className="w-full text-center py-1.5 px-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200/70 transition flex items-center justify-center gap-1.5"
                    >
                      <span>View Full Details & Projects</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Onboard New Builder */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Onboard Builder / Real Estate Developer"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Company / Developer Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Godrej Properties, Sandesh Infrastructure, Kukreja Realties"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Contact Person / Representative *
              </label>
              <input
                type="text"
                placeholder="e.g. Vikram Malhotra (Director)"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Official Mobile Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 9822114455"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. sales@godrejnagpur.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-teal-600" />
                <span>Partner Portal Password *</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Nagpur@Builder2026!"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                required
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Builder uses this password to log into Partner Portal (localhost:5175)
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                MahaRERA Registration Number
              </label>
              <input
                type="text"
                placeholder="e.g. P50500001234"
                value={formData.reraNumber}
                onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Years of Experience / Established
              </label>
              <input
                type="number"
                min={1}
                max={100}
                placeholder="15"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Head Office Address in Nagpur
              </label>
              <input
                type="text"
                placeholder="e.g. Civil Lines / Ramdaspeth, Nagpur - 440010"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Official Website
              </label>
              <input
                type="url"
                placeholder="https://www.example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Company Logo URL
              </label>
              <PhotoUploader
                value={formData.logo}
                onChange={(url) => setFormData({ ...formData, logo: url })}
                label="Developer Logo / Brand Mark"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Company Overview & Bio
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe the developer's legacy, prominent townships, and quality benchmarks..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none resize-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="py-2 px-4 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="py-2 px-4 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Onboarding Developer...' : 'Verify & Onboard Builder'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Builder Profile & Password */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingBuilder(null);
        }}
        title={`Edit Profile: ${editingBuilder?.name || 'Builder'}`}
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Company / Developer Name *
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                value={editFormData.contactPerson}
                onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-teal-600" />
                <span>Reset Partner Portal Password</span>
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Set a new password for builder login on partner portal
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                MahaRERA Registration No.
              </label>
              <input
                type="text"
                value={editFormData.reraNumber}
                onChange={(e) => setEditFormData({ ...editFormData, reraNumber: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={editFormData.experienceYears}
                onChange={(e) => setEditFormData({ ...editFormData, experienceYears: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Portal Account Status
              </label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              >
                <option value="ACTIVE">ACTIVE (Can log into Partner Portal)</option>
                <option value="SUSPENDED">SUSPENDED (Access blocked)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Head Office Address
              </label>
              <input
                type="text"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Official Website
              </label>
              <input
                type="url"
                value={editFormData.website}
                onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Company Description
              </label>
              <textarea
                rows={3}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium outline-none resize-none focus:border-teal-600"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">Available in Partner Portal</span>
                <span className="text-[11px] text-slate-500">
                  Allow developer to post township projects & property units
                </span>
              </div>
              <input
                type="checkbox"
                checked={editFormData.isAvailable}
                onChange={(e) => setEditFormData({ ...editFormData, isAvailable: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setEditModalOpen(false);
                setEditingBuilder(null);
              }}
              className="py-2 px-4 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="py-2 px-4 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Success Notification Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Builder Profile Updated"
        size="sm"
      >
        <div className="text-center py-4 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Changes Saved Successfully</h4>
          <p className="text-xs text-slate-500">
            {passwordWasUpdated
              ? 'Builder profile details and partner portal login password were updated successfully.'
              : 'Builder profile details were updated successfully.'}
          </p>
          <button
            type="button"
            onClick={() => setShowSuccessModal(false)}
            className="w-full py-2 px-4 rounded-lg bg-teal-700 text-white font-semibold text-xs hover:bg-teal-800 transition"
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BuildersManagementPage;
