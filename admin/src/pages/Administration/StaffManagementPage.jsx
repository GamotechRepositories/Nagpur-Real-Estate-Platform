import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  UserCog,
  Plus,
  Search,
  Shield,
  Activity,
  UserX,
  Edit,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToastStore } from '../../store/useToastStore';
import { formatDate } from '../../utils/formatters';

const StaffManagementPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [suspendingStaff, setSuspendingStaff] = useState(null);

  // Fetch Staff List
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-staff-list', search, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const res = await apiClient.get(`/admin/staff?${params.toString()}`);
      return res.data;
    },
  });

  const staffList = response?.data || [];
  const meta = response?.meta || { totalPages: 1, totalCount: 0, page: 1 };

  // Suspend Mutation
  const suspendMutation = useMutation({
    mutationFn: async (id) => {
      return apiClient.delete(`/admin/staff/${id}`);
    },
    onSuccess: () => {
      addToast('Staff member suspended', 'success');
      queryClient.invalidateQueries(['admin-staff-list']);
      setSuspendingStaff(null);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to suspend staff member';
      addToast(msg, 'error');
    },
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Staff & Roles Management"
        subtitle="Manage internal employees, role titles, and granular permissions"
        icon={UserCog}
        breadcrumbs={[{ label: 'Administration' }, { label: 'Staff & Roles' }]}
        actions={
          <Link
            to="/staff/new"
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Employee
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search employees by name, email, phone, or title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Staff</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Designation / Role</th>
                <th className="py-3 px-4">Access Permissions</th>
                <th className="py-3 px-4">Activity Logged</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-2" />
                    Loading staff members...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No staff members found matching criteria.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => {
                  const isSuperAdmin = staff.role === 'SUPER_ADMIN';
                  const permissionCount = isSuperAdmin
                    ? 'All Access (*)'
                    : `${staff.permissions?.length || 0} permissions`;

                  return (
                    <tr key={staff._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{staff.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{staff.email}</span>
                          <span>•</span>
                          <span>{staff.phone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-700">
                          {staff.designation || 'Staff Member'}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {staff.role}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                            isSuperAdmin
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {permissionCount}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Activity className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">{staff.actionsCount || 0}</span>
                          <span className="text-slate-400 text-[10px]">actions</span>
                        </div>
                        {staff.lastLoginAt && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Last active: {formatDate(staff.lastLoginAt)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={staff.status === 'ACTIVE' ? 'success' : 'danger'}
                        >
                          {staff.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/staff/${staff._id}/edit`}
                            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Permissions & Role"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          {!isSuperAdmin && (
                            <button
                              onClick={() => setSuspendingStaff(staff)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              title="Suspend Employee"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUSPEND CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={Boolean(suspendingStaff)}
        onClose={() => setSuspendingStaff(null)}
        onConfirm={() => suspendMutation.mutate(suspendingStaff?._id)}
        title="Suspend Employee Account"
        message={`Are you sure you want to suspend access for ${suspendingStaff?.name} (${suspendingStaff?.email})? They will no longer be able to log in to the administrative console.`}
        confirmText="Suspend Account"
        confirmVariant="danger"
        isLoading={suspendMutation.isPending}
      />
    </div>
  );
};

export default StaffManagementPage;
