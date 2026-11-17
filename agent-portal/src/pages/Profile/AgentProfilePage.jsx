import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  UserCheck,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Award,
  MapPin,
  CheckCircle,
  AlertCircle,
  Save,
  MessageCircle,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';

export const AgentProfilePage = () => {
  const { user, profile, setProfile } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    agencyName: profile?.agencyName || '',
    reraNumber: profile?.reraNumber || '',
    bio: profile?.bio || 'Certified Nagpur Real Estate professional specializing in residential apartments, luxury villas, and vetted layout plots.',
    experienceYears: profile?.experienceYears || 5,
    contactPhone: profile?.contactPhone || user?.phone || '',
    whatsappNumber: profile?.whatsappNumber || user?.phone || '',
    areasServed: Array.isArray(profile?.areasServed)
      ? profile.areasServed.join(', ')
      : profile?.areasServed || 'Besa, Wardha Road, Manish Nagar, Dharampeth',
    isAvailable: profile?.isAvailable !== undefined ? profile.isAvailable : true,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => apiClient.patch('/agents/me/profile', payload),
    onSuccess: (res) => {
      setProfile(res.data);
      setSuccessMsg('Agency profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to update agency profile.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const areasArray = formData.areasServed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      experienceYears: Number(formData.experienceYears) || 1,
      areasServed: areasArray,
    };

    updateMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Agency & Partner Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your brokerage credentials, MahaRERA registration number, and operating regions in Nagpur.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Account Verification Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center text-xl font-bold flex-shrink-0">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                <ShieldCheck size={12} className="text-emerald-600" />
                VERIFIED BROKER
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Registered Phone: <span className="font-mono text-slate-700 font-semibold">{user?.phone}</span>
              {user?.email && ` • ${user.email}`}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Role: <span className="font-mono text-teal-700 font-semibold">CERTIFIED PARTNER AGENT</span>
            </p>
          </div>
        </div>

        <div className="sm:text-right sm:border-l sm:border-slate-200 sm:pl-6">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            MahaRERA Registration
          </span>
          <span className="text-xs font-mono font-bold text-slate-900 block mt-0.5">
            {profile?.reraNumber || 'A50500012345'}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">Verified by Operations Desk</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Building2 size={15} className="text-teal-600" />
            <span>Brokerage & Agency Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Agency / Brokerage Firm Name
              </label>
              <input
                type="text"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                placeholder="e.g., Sharma Realtors Besa"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                MahaRERA Registration Number
              </label>
              <input
                type="text"
                value={formData.reraNumber}
                onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                placeholder="e.g., A50500098765"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-teal-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experience in Nagpur Real Estate (Years)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Direct WhatsApp Number for Buyer Inquiries
              </label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="e.g., 9823001234"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-teal-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operational Areas Served in Nagpur (Comma separated)
            </label>
            <input
              type="text"
              value={formData.areasServed}
              onChange={(e) => setFormData({ ...formData, areasServed: e.target.value })}
              placeholder="e.g., Besa, Manish Nagar, Wardha Road, Dharampeth, Hingna"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 transition"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Helps connect local buyers searching in these specific localities to your listings.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Bio & Specialization
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell buyers about your track record, verified developer connections, and deal closure expertise..."
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-900 outline-none focus:border-teal-600 transition resize-none"
            />
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Availability for Direct Phone / WhatsApp Inquiries
              </span>
              <span className="text-[11px] text-slate-500">
                When enabled, your contact button is prominently presented to prospective buyers on the portal.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-2xs transition disabled:opacity-50"
          >
            <Save size={15} />
            <span>{updateMutation.isPending ? 'Saving Profile...' : 'Save Agency Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
