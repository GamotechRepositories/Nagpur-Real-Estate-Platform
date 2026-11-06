import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Edit2,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  AlertTriangle,
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

const ALL_STATUSES = ['ACTIVE', 'SUSPENDED', 'PENDING'];

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
    <div className="space-y-6">
      <PageHeader
        title="User & Staff Administration"
        subtitle="Manage platform users, assign staff roles (Super Admin, Moderator, CRM), and control account status"
        icon={Users}
        breadcrumbs={[{ label: 'Users & Roles' }]}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, or Indian phone number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:bg-white transition-all"
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
            className="py-2.5 px-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none"
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
            className="py-2.5 px-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none"
          >
            <option value="">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
              <tr>
                <th className="py-4 px-4">User</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">Account Status</th>
                <th className="py-4 px-4">Contact Phone</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">Joined Date</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading users list...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-teal to-cyan-700 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                          {u.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name || 'Unnamed'}</p>
                          <span className="text-[10px] text-slate-400 block font-mono">ID: {u._id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge status={u.role} />
                    </td>

                    <td className="py-3 px-4">
                      <Badge status={u.status || 'ACTIVE'} />
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      +91 {u.phone}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {u.email || '—'}
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="inline-flex items-center space-x-1 py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit Role</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Users}
                      title="No users found"
                      description="Try clearing your search query or role filter."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing page <strong className="text-slate-800">{meta.page}</strong> of{' '}
              <strong className="text-slate-800">{meta.totalPages}</strong> ({meta.totalCount} total users)
            </span>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-bold flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-bold flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Role & Status Modal */}
      {editingUser && (
        <Modal
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          title={`Edit Permissions: ${editingUser.name}`}
          subtitle={`Phone: +91 ${editingUser.phone} · Current Role: ${editingUser.role}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Assign System Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
              >
                {ALL_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Account Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
              >
                {ALL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateRoleMutation.isPending}
                className="py-2 px-5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white text-xs font-bold shadow-md"
              >
                {updateRoleMutation.isPending ? 'Updating...' : 'Save Permissions'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UsersManagementPage;
