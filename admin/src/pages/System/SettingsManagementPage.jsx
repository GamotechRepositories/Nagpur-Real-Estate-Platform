import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  Shuffle,
  Shield,
  PhoneCall,
  MapPin,
  Mail,
  Sliders,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';

export const SettingsManagementPage = () => {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-platform-settings'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/settings');
      return res.data?.data || {};
    },
  });

  const [formData, setFormData] = useState({
    leadRouting: {
      routingMode: 'ROUND_ROBIN',
      defaultSlaHours: 4,
      autoEscalateAfterSla: true,
    },
    listingConfig: {
      validityDays: 90,
      reminderDays: [7, 1],
      maxFreePhotos: 15,
    },
    contacts: {
      helplinePhone: '+91 712 2550100',
      supportEmail: 'support@nagpurestate.com',
      whatsappNumber: '+91 9823000000',
      officeAddress: 'Civil Lines, Nagpur, Maharashtra 440001',
    },
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        leadRouting: {
          routingMode: settings.leadRouting?.routingMode || 'ROUND_ROBIN',
          defaultSlaHours: settings.leadRouting?.defaultSlaHours || 4,
          autoEscalateAfterSla: settings.leadRouting?.autoEscalateAfterSla ?? true,
        },
        listingConfig: {
          validityDays: settings.listingConfig?.validityDays || 90,
          reminderDays: settings.listingConfig?.reminderDays || [7, 1],
          maxFreePhotos: settings.listingConfig?.maxFreePhotos || 15,
        },
        contacts: {
          helplinePhone: settings.contacts?.helplinePhone || '+91 712 2550100',
          supportEmail: settings.contacts?.supportEmail || 'support@nagpurestate.com',
          whatsappNumber: settings.contacts?.whatsappNumber || '+91 9823000000',
          officeAddress: settings.contacts?.officeAddress || 'Civil Lines, Nagpur, Maharashtra 440001',
        },
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return apiClient.patch('/admin/settings', payload);
    },
    onSuccess: () => {
      setSuccess(true);
      setError('');
      queryClient.invalidateQueries(['admin-platform-settings']);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to update platform settings.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Platform & Lead Engine Configuration"
        subtitle="Manage CRM lead distribution algorithm, automated SLA triggers, listing validity cycles, and Nagpur support lines"
        icon={Sliders}
        breadcrumbs={[{ label: 'System Settings' }]}
      />

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Platform configuration updated and applied in real-time!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Lead Routing Engine */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Shuffle className="w-4 h-4 text-brand-orange" />
            <span>CRM Lead Routing & SLA Engine</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Distribution Strategy
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'ROUND_ROBIN', label: 'Round Robin', desc: 'Evenly cycles new leads among verified agents' },
                  { id: 'LOCALITY_BASED', label: 'Locality Match', desc: 'Matches buyer inquiry to agent localized in that area' },
                  { id: 'MANUAL', label: 'Manual Assignment', desc: 'CRM manager manually assigns each incoming lead' },
                ].map((mode) => (
                  <label
                    key={mode.id}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                      formData.leadRouting.routingMode === mode.id
                        ? 'border-brand-orange bg-orange-50/50 shadow-xs ring-1 ring-brand-orange'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="routingMode"
                      checked={formData.leadRouting.routingMode === mode.id}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          leadRouting: { ...formData.leadRouting, routingMode: mode.id },
                        })
                      }
                      className="sr-only"
                    />
                    <strong className="block font-bold text-slate-900 mb-0.5">{mode.label}</strong>
                    <span className="text-[11px] text-slate-500 leading-tight block">{mode.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Default Agent Response SLA (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={formData.leadRouting.defaultSlaHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      leadRouting: {
                        ...formData.leadRouting,
                        defaultSlaHours: Number(e.target.value) || 4,
                      },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.leadRouting.autoEscalateAfterSla}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        leadRouting: {
                          ...formData.leadRouting,
                          autoEscalateAfterSla: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-brand-orange focus:ring-brand-orange"
                  />
                  <span>Auto-escalate lead if uncontacted after SLA</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Listing Lifecycle & Expiration */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-brand-teal" />
            <span>Listing Expiration & Photo Limits</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Active Listing Duration (Days)
              </label>
              <input
                type="number"
                min={15}
                max={365}
                value={formData.listingConfig.validityDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    listingConfig: {
                      ...formData.listingConfig,
                      validityDays: Number(e.target.value) || 90,
                    },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard duration approved listings remain LIVE on marketplace.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Max Free Photos Allowed per Listing
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={formData.listingConfig.maxFreePhotos}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    listingConfig: {
                      ...formData.listingConfig,
                      maxFreePhotos: Number(e.target.value) || 15,
                    },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Support Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>Nagpur Public Helpdesk & Office</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Nagpur Helpline Phone
              </label>
              <input
                type="text"
                value={formData.contacts.helplinePhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, helplinePhone: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Official Support Email
              </label>
              <input
                type="email"
                value={formData.contacts.supportEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, supportEmail: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                WhatsApp Business Number
              </label>
              <input
                type="text"
                value={formData.contacts.whatsappNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, whatsappNumber: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Registered Office Address
              </label>
              <input
                type="text"
                value={formData.contacts.officeAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, officeAddress: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="py-3 px-8 rounded-2xl bg-brand-orange hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{mutation.isPending ? 'Saving Settings...' : 'Save Platform Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManagementPage;
