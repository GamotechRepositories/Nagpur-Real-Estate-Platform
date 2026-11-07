import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  FileCheck,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const AUDIENCES = [
  { id: 'ALL', label: 'All Users (Buyers & Agents)' },
  { id: 'USER', label: 'Home Buyers & Tenants Only' },
  { id: 'AGENT', label: 'Verified Agents Only' },
  { id: 'OWNER', label: 'Property Owners Only' },
];

export const NotificationsBroadcastPage = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [link, setLink] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch past broadcast history
  const { data: broadcastHistory, isLoading } = useQuery({
    queryKey: ['admin-broadcast-history'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications/admin/broadcasts');
      return res.data?.data || [];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/notifications/admin/broadcast', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMsg(data?.message || 'Broadcast dispatched successfully!');
      setErrorMsg('');
      setTitle('');
      setMessage('');
      setLink('');
      queryClient.invalidateQueries(['admin-broadcast-history']);
      setTimeout(() => setSuccessMsg(''), 5000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to dispatch broadcast.');
      setTimeout(() => setErrorMsg(''), 5000);
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMsg('Title and message are required.');
      return;
    }
    sendMutation.mutate({
      title: title.trim(),
      message: message.trim(),
      targetRole,
      link: link.trim(),
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Broadcast Notifications"
        subtitle="Dispatch system announcements, new launch alerts, and push updates across Nagpur"
        icon={Bell}
        breadcrumbs={[{ label: 'Broadcasts' }]}
      />

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Composer Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Radio className="w-4 h-4 text-teal-600 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-900">Compose New Broadcast</h2>
        </div>

        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Announcement Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 20+ New Verified Plots Added in Besa & Wardha Road"
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:border-teal-600 focus:bg-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Target Audience
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800 outline-none focus:bg-white"
              >
                {AUDIENCES.map((aud) => (
                  <option key={aud.id} value={aud.id}>
                    {aud.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Notification Message *
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the full announcement message visible on the user's dashboard and mobile notifications..."
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-teal-600 focus:bg-white leading-relaxed"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Deep-link / Landing URL (Optional)
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g., /properties?locality=Besa or /projects"
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              Dispatches instantly as an in-app system notification.
            </span>

            <button
              type="submit"
              disabled={sendMutation.isPending || !title.trim() || !message.trim()}
              className="inline-flex items-center space-x-1.5 py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendMutation.isPending ? 'Sending...' : 'Dispatch Broadcast'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-4 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Recent Broadcast History
        </h3>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading history...</div>
        ) : broadcastHistory?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Message</th>
                  <th className="py-2.5 px-3">Recipients Reached</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {broadcastHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 max-w-xs truncate">
                      {item._id?.title}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-sm truncate italic">
                      "{item._id?.message}"
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold text-[11px]">
                        {item.totalSent} Users
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {formatDate(item.lastSentAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="No past broadcasts"
            description="Broadcast announcements to keep buyers and agents engaged with fresh updates."
          />
        )}
      </div>
    </div>
  );
};

export default NotificationsBroadcastPage;
