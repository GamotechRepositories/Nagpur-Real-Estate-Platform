import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';

const SettingsManagementPage = () => {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
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
    mutationFn: async (payload) => apiClient.patch('/admin/settings', payload),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries(['admin-settings']);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-brand-navy flex items-center space-x-2">
          <Settings className="w-6 h-6 text-brand-teal" />
          <span>Platform & Lead Routing Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure automatic CRM lead distribution, moderation SLAs, and listing expiration cycles
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Settings saved and applied across Nagpur Real Estate Platform!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Lead Routing Engine */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            CRM Lead Routing Engine
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Lead Routing Strategy
            </label>
            <select
              value={formData.leadRouting.routingMode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  leadRouting: { ...prev.leadRouting, routingMode: e.target.value },
                }))
              }
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
            >
              <option value="ROUND_ROBIN">Round-Robin (Fair distribution across all verified agents)</option>
              <option value="LOCALITY_BASED">Locality-Based (Route to agent specialized in specific locality)</option>
              <option value="MANUAL">Manual (Staff assigns leads manually via CRM board)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Default Response SLA (in Hours)
              </label>
              <input
                type="number"
                min={1}
                max={48}
                value={formData.leadRouting.defaultSlaHours}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    leadRouting: { ...prev.leadRouting, defaultSlaHours: Number(e.target.value) },
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.leadRouting.autoEscalateAfterSla}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      leadRouting: { ...prev.leadRouting, autoEscalateAfterSla: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 rounded text-brand-orange"
                />
                <span>Auto-Escalate to CRM Manager when SLA breached</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Listing Lifecycle */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Listing Lifecycle & Expiration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Active Listing Validity (Days)
              </label>
              <input
                type="number"
                min={30}
                max={365}
                value={formData.listingConfig.validityDays}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    listingConfig: { ...prev.listingConfig, validityDays: Number(e.target.value) },
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard platform listing cycle is 90 days before renewal is required.
              </span>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{mutation.isPending ? 'Saving Settings...' : 'Save Configuration'}</span>
        </button>
      </form>
    </div>
  );
};

export default SettingsManagementPage;
