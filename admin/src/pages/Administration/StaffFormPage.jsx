import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserCog,
  ArrowLeft,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  Save,
  Shield,
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import { useToastStore } from '../../store/useToastStore';
import { PERMISSION_MODULES, ROLE_PRESETS } from '../../config/permissions';

const StaffFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    designation: '',
    role: 'MODERATOR',
    permissions: [],
  });

  // If in edit mode, fetch existing staff data
  const { data: staffData, isLoading: isLoadingStaff } = useQuery({
    queryKey: ['admin-staff-detail', id],
    queryFn: async () => {
      const res = await apiClient.get('/admin/staff?limit=100');
      const staffList = res.data?.data || [];
      return staffList.find((s) => s._id === id);
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && staffData) {
      setFormData({
        name: staffData.name || '',
        email: staffData.email || '',
        phone: staffData.phone || '',
        password: '',
        designation: staffData.designation || '',
        role: staffData.role || 'MODERATOR',
        permissions: staffData.permissions || [],
      });
    }
  }, [isEdit, staffData]);

  // Create Staff Mutation
  const createStaffMutation = useMutation({
    mutationFn: async (payload) => {
      return apiClient.post('/admin/staff', payload);
    },
    onSuccess: () => {
      addToast('Staff member created successfully', 'success');
      queryClient.invalidateQueries(['admin-staff-list']);
      navigate('/staff');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to create staff member';
      addToast(msg, 'error');
    },
  });

  // Update Staff Mutation
  const updateStaffMutation = useMutation({
    mutationFn: async (payload) => {
      return apiClient.patch(`/admin/staff/${id}`, payload);
    },
    onSuccess: () => {
      addToast('Staff member updated successfully', 'success');
      queryClient.invalidateQueries(['admin-staff-list']);
      navigate('/staff');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to update staff member';
      addToast(msg, 'error');
    },
  });

  // Toggle single permission checkbox
  const togglePermission = (key) => {
    setFormData((prev) => {
      const perms = prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key];
      return { ...prev, permissions: perms };
    });
  };

  // Toggle entire module
  const toggleModulePermissions = (module) => {
    const moduleKeys = module.permissions.map((p) => p.key);
    const hasAll = moduleKeys.every((k) => formData.permissions.includes(k));

    setFormData((prev) => {
      let updated;
      if (hasAll) {
        updated = prev.permissions.filter((k) => !moduleKeys.includes(k));
      } else {
        const combined = new Set([...prev.permissions, ...moduleKeys]);
        updated = Array.from(combined);
      }
      return { ...prev, permissions: updated };
    });
  };

  // Quick Preset Selection
  const applyPreset = (presetKey) => {
    const preset = ROLE_PRESETS[presetKey];
    if (!preset) return;
    setFormData((prev) => ({
      ...prev,
      designation: prev.designation || preset.title,
      permissions: [...preset.permissions],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      const payload = {
        name: formData.name,
        designation: formData.designation,
        role: formData.role,
        permissions: formData.permissions,
      };
      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      }
      updateStaffMutation.mutate(payload);
    } else {
      createStaffMutation.mutate(formData);
    }
  };

  const isSubmitting = createStaffMutation.isPending || updateStaffMutation.isPending;

  if (isEdit && isLoadingStaff) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-teal-600 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Loading staff details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title={isEdit ? `Edit Staff Member: ${formData.name || ''}` : 'Add New Staff Member'}
        subtitle={
          isEdit
            ? 'Modify employee title, credentials, and feature permissions'
            : 'Create an internal employee and assign granular permissions across all modules'
        }
        icon={UserCog}
        breadcrumbs={[
          { label: 'Administration' },
          { label: 'Staff & Roles', href: '/staff' },
          { label: isEdit ? 'Edit Staff' : 'Add Employee' },
        ]}
        actions={
          <Link
            to="/staff"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Staff List
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Account Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              1. Employee Account Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  disabled={isEdit}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@nagpurestate.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (10 digits) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  disabled={isEdit}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9823000000"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEdit ? 'Reset Password (optional)' : 'Temporary Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required={!isEdit}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={isEdit ? 'Leave blank to keep current password' : 'Min 8 characters'}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Role / Job Title (Designation) *
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Senior Listing Verification Specialist, Lead Coordinator, or Content Editor"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                This job title is displayed on audit trail logs, approvals, and employee badges.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Role Templates & Presets */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                2. Quick Role Presets (Optional)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, permissions: [] }))}
              className="text-xs text-slate-500 hover:text-red-600 transition-colors cursor-pointer self-start sm:self-auto"
            >
              Clear All Checkboxes
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Click any template below to automatically select recommended permissions for common staff roles:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => applyPreset('MODERATOR')}
              className="flex flex-col items-start p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all text-left group"
            >
              <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
                Listing Moderator Template
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Review queue, approve/reject listings, verify documents
              </span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('CRM_MANAGER')}
              className="flex flex-col items-start p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all text-left group"
            >
              <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
                CRM & Sales Template
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Leads pipeline, site visits, loan requests, CSV export
              </span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('CONTENT_EDITOR')}
              className="flex flex-col items-start p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all text-left group"
            >
              <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
                Content & CMS Template
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Articles, area guides, FAQs, and builder projects
              </span>
            </button>
          </div>
        </div>

        {/* SECTION 3: Granular Module Permissions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                3. Choose Page & Feature Permissions
              </h2>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>{formData.permissions.length} features granted</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Check the specific modules and functions this employee is authorized to access. Unselected modules will be completely hidden from their dashboard:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {PERMISSION_MODULES.map((module) => {
              const moduleKeys = module.permissions.map((p) => p.key);
              const hasAll = moduleKeys.every((k) => formData.permissions.includes(k));
              const hasSome = moduleKeys.some((k) => formData.permissions.includes(k));

              return (
                <div
                  key={module.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-3 hover:border-slate-300 transition-colors"
                >
                  {/* Module Title & Select All */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => toggleModulePermissions(module)}
                      className="flex items-center gap-2 text-left cursor-pointer group"
                    >
                      {hasAll ? (
                        <CheckSquare className="w-4 h-4 text-teal-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                      )}
                      <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                        {module.title}
                      </span>
                    </button>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {module.badge}
                    </span>
                  </div>

                  {/* Individual Feature Checkboxes */}
                  <div className="space-y-2.5 pl-6">
                    {module.permissions.map((perm) => {
                      const isChecked = formData.permissions.includes(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className="flex items-start gap-2.5 cursor-pointer text-slate-700 hover:text-slate-900 group"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm.key)}
                            className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                          <div>
                            <div className="text-xs font-semibold leading-tight group-hover:text-teal-700 transition-colors">
                              {perm.label}
                            </div>
                            <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                              {perm.desc}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            to="/staff"
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSubmitting
              ? isEdit
                ? 'Saving Changes...'
                : 'Creating Account...'
              : isEdit
              ? 'Save Employee Changes'
              : 'Create Employee Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffFormPage;

