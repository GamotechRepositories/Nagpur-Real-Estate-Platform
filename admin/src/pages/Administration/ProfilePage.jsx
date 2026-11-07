import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  ExternalLink,
  Sliders,
  Calendar,
  LogOut,
  Lock,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import { useAuthStore } from '../../store/useAuthStore';
import { formatRole, formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, setAuth, token, logout } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch fresh profile data
  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ['admin-current-profile'],
    queryFn: async () => {
      const res = await apiClient.get('/auth/me');
      return res.data?.data || null;
    },
    initialData: authUser,
  });

  const currentUser = profileData || authUser;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      });
    }
  }, [currentUser]);

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.patch('/auth/profile', payload);
      return res.data?.data;
    },
    onSuccess: (updatedUser) => {
      setSuccess(true);
      setError('');
      // Sync with global auth store
      if (updatedUser) {
        setAuth(updatedUser, token);
      }
      refetch();
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to update profile.');
      setTimeout(() => setError(''), 4000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    updateMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const publicUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173';
  const roleDisplay = formatRole(currentUser?.role) || 'Super Admin';
  const userInitial = currentUser?.name?.[0]?.toUpperCase() || 'A';

  const adminPrivileges = [
    { title: 'Listing & Property Moderation', desc: 'Approve, reject, feature, and verify properties across Nagpur.' },
    { title: 'CRM & Lead Routing', desc: 'Manage buyer inquiries, assign leads to agents, and track site visits.' },
    { title: 'Agent & User Administration', desc: 'Verify agent licenses, manage staff roles, and oversee accounts.' },
    { title: 'Platform & Global Settings', desc: 'Configure lead routing SLA, listing rules, and helpline contacts.' },
    { title: 'Audit Logs & System Security', desc: 'Review immutable security logs of staff administrative actions.' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Admin Profile"
        subtitle="Manage your administrator credentials, access permissions, and session info"
        icon={UserIcon}
        breadcrumbs={[{ label: 'Profile' }]}
      />

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Profile updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Summary Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white font-bold text-2xl flex items-center justify-center flex-shrink-0 shadow-xs">
                  {userInitial}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{currentUser?.name || 'Administrator'}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email || 'admin@nagpurestate.com'}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 py-0.5 px-2 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>{roleDisplay}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1 py-0.5 px-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Active</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-500">
                <span className="block text-[11px] font-medium text-slate-400">Account Created</span>
                <span className="font-semibold text-slate-700">{formatDate(currentUser?.createdAt)}</span>
              </div>
            </div>

            {/* Editable Profile Form */}
            <form onSubmit={handleSubmit} className="pt-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Account Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-teal-600 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin@nagpurestate.com"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-teal-600 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.phone || '+91 9823000000'}
                      disabled
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Phone is tied to primary OTP verification.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    System Role
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={roleDisplay}
                      disabled
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Assigned by System Administrator.</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center space-x-1.5 py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{updateMutation.isPending ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Role Privileges Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Role Privileges & Access Scope
            </h3>
            <div className="space-y-3">
              {adminPrivileges.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-6 h-6 rounded-md bg-teal-600/10 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Shortcuts & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick Shortcuts
            </h3>

            <div className="space-y-2">
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-teal-600 transition-colors" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Open Public Site</span>
                    <span className="text-[10px] text-slate-400 block">nagpurestate.com</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">↗</span>
              </a>

              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="flex items-center space-x-2.5">
                  <Sliders className="w-4 h-4 text-slate-500 group-hover:text-teal-600 transition-colors" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Platform Settings</span>
                    <span className="text-[10px] text-slate-400 block">Routing SLA & listing rules</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">→</span>
              </button>
            </div>
          </div>

          {/* Session & Sign Out Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Session Management
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You are currently authenticated as an administrative supervisor. Always sign out after finishing review tasks on shared machines.
            </p>

            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Console</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
