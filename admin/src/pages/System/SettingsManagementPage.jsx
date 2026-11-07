import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sliders,
  CheckCircle,
  AlertCircle,
  Save,
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
    <div className="max-w-4xl space-y-5">
      <PageHeader
        title="Settings"
        subtitle="Manage lead distribution, listing cycles, and contacts"
        icon={Sliders}
        breadcrumbs={[{ label: 'Settings' }]}
      />

      {success && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Lead Routing */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Lead Routing
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Routing Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'ROUND_ROBIN', label: 'Round Robin' },
                  { id: 'LOCALITY_BASED', label: 'Locality Based' },
                  { id: 'MANUAL', label: 'Manual' },
                ].map((mode) => (
                  <label
                    key={mode.id}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                      formData.leadRouting.routingMode === mode.id
                        ? 'border-teal-600 bg-teal-50/40 text-teal-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
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
                    <span>{mode.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Response SLA (Hours)
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
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex items-center pt-5 sm:pt-6">
                <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
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
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Auto-escalate uncontacted leads</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Listing Configuration */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Listing Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Listing Validity (Days)
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
                className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Photos Allowed
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
                className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Support Contacts
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Helpline Phone
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
                className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Support Email
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
                className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Number
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
                className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Office Address
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
                className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center space-x-1.5 py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{mutation.isPending ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManagementPage;
