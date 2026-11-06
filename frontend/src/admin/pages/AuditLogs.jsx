import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Shield, User, Clock } from 'lucide-react';
import apiClient from '../../api/client';
import { formatDate } from '../../utils/formatters';

const AuditLogsPage = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/audit-logs');
      return res.data;
    },
  });

  const logs = response?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-navy flex items-center space-x-2">
          <Shield className="w-6 h-6 text-brand-teal" />
          <span>Security & Staff Audit Logs</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable trail of administrative approvals, rejections, setting updates, and lead routing
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Type</th>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Notes / Details</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Loading audit trail...</td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-brand-teal">
                      {log.targetType}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{log.performedBy?.name || 'Staff'}</span>
                      <span className="text-[10px] text-slate-400 block">{log.performedBy?.email}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">No audit logs recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
