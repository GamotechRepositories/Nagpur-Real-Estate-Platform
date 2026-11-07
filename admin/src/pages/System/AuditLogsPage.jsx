import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Shield,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/formatters';

const AUDIT_ACTIONS = [
  'APPROVE_PROPERTY',
  'REJECT_PROPERTY',
  'TOGGLE_BADGES',
  'RENEW_PROPERTY',
  'UPDATE_USER_PERMISSIONS',
  'UPDATE_PLATFORM_SETTINGS',
];

const TARGET_TYPES = ['PROPERTY', 'USER', 'SETTINGS'];

export const AuditLogsPage = () => {
  const [actionFilter, setActionFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', actionFilter, targetFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);
      if (targetFilter) params.append('targetType', targetFilter);
      params.append('page', page.toString());
      params.append('limit', '25');

      const res = await apiClient.get(`/admin/audit-logs?${params.toString()}`);
      return res.data;
    },
  });

  const logs = response?.data || [];
  const meta = response?.meta || { totalPages: 1, totalCount: 0, page: 1 };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Logs"
        subtitle="Security events and administrative actions"
        icon={Shield}
        breadcrumbs={[{ label: 'Audit Logs' }]}
      />

      {/* Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white outline-none"
          >
            <option value="">All Actions</option>
            {AUDIT_ACTIONS.map((act) => (
              <option key={act} value={act}>
                {act.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Target Type Filter */}
          <select
            value={targetFilter}
            onChange={(e) => {
              setTargetFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white outline-none"
          >
            <option value="">All Targets</option>
            {TARGET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Total Logs: <strong className="text-slate-800">{meta.totalCount}</strong>
        </span>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 sm:px-4">Action</th>
                <th className="py-3 px-3">Target</th>
                <th className="py-3 px-3">Performed By</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-3">IP Address</th>
                <th className="py-3 px-3 sm:px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 sm:px-4 font-mono font-medium text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-teal-700 text-[11px]">
                      {log.targetType}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-medium text-slate-800 block">
                        {log.performedBy?.name || 'Staff User'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {log.performedBy?.email || '—'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                      {log.notes || '—'}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3 text-slate-300" />
                        <span>{log.ipAddress || '127.0.0.1'}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 sm:px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Shield}
                      title="No audit entries"
                      description="Administrative events will be logged here."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page <strong className="text-slate-800">{meta.page}</strong> of{' '}
              <strong className="text-slate-800">{meta.totalPages}</strong>
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="py-1 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-medium flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="py-1 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-medium flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
