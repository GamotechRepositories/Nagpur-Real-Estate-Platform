import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const ALL_ROLES = [
  'SUPER_ADMIN',
  'MODERATOR',
  'CRM_MANAGER',
  'CONTENT_EDITOR',
  'AGENT',
  'OWNER',
  'USER',
];

export const UsersManagementPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-users-list', search, roleFilter, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const res = await apiClient.get(`/admin/users?${params.toString()}`);
      return res.data;
    },
  });

  const users = response?.data || [];
  const meta = response?.meta || { totalPages: 1, totalCount: 0, page: 1 };

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role, status }) => {
      return apiClient.patch(`/admin/users/${id}/role`, { role, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users-list']);
      queryClient.invalidateQueries(['admin-dashboard-stats']);
      setEditingUser(null);
    },
  });

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
    setNewStatus(user.status || 'ACTIVE');
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    updateRoleMutation.mutate({
      id: editingUser._id,
      role: newRole,
      status: newStatus,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users & Roles"
        subtitle="Manage user accounts and staff permissions"
        icon={Users}
        breadcrumbs={[{ label: 'Users' }]}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white outline-none"
          >
            <option value="">All Roles</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace('_', ' ')}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 sm:px-4">User</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Joined</th>
                <th className="py-3 px-3 sm:px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 sm:px-4 font-semibold text-slate-900">
                      {u.name || 'Unnamed'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {u.email}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {u.phone ? `+91 ${u.phone}` : '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {u.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge status={u.status || 'ACTIVE'} size="xs" />
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        title="Edit Role & Status"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={Users} title="No users found" description="No users match your criteria." />
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
              <strong className="text-slate-800">{meta.totalPages}</strong> ({meta.totalCount} total)
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

      {/* Edit Role & Status Modal */}
      {editingUser && (
        <Modal
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          title={`Edit User: ${editingUser.name}`}
          subtitle={editingUser.email}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium bg-white"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateRoleMutation.isPending}
                className="py-1.5 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {updateRoleMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UsersManagementPage;
