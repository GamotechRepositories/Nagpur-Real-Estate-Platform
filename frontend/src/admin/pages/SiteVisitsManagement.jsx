import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, CheckCircle, XCircle, Phone, MapPin, User } from 'lucide-react';
import apiClient from '../../api/client';
import { formatDate } from '../../utils/formatters';

const SiteVisitsManagementPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: visits, isLoading } = useQuery({
    queryKey: ['admin-site-visits', statusFilter],
    queryFn: async () => {
      const res = await apiClient.get(`/site-visits${statusFilter ? `?status=${statusFilter}` : ''}`);
      return res.data?.data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, feedback }) => {
      return apiClient.patch(`/site-visits/${id}`, { status, feedbackNotes: feedback });
    },
    onSuccess: () => queryClient.invalidateQueries(['admin-site-visits']),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-brand-teal" />
            <span>Site Visits Schedule</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate physical visits with buyers, sellers, and assigned Nagpur agents
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-slate-700"
        >
          <option value="">All Visit Statuses</option>
          <option value="REQUESTED">REQUESTED</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))
        ) : visits && visits.length > 0 ? (
          visits.map((v) => (
            <div
              key={v._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      v.status === 'CONFIRMED'
                        ? 'bg-blue-100 text-blue-700'
                        : v.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : v.status === 'REQUESTED'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {v.status}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Requested {formatDate(v.createdAt)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {v.property?.title || 'Nagpur Property'}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600 mt-2">
                  <div className="flex items-center space-x-1.5 font-bold text-brand-navy">
                    <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                    <span>{formatDate(v.preferredDate)} &middot; {v.preferredTimeSlot}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{v.customerName}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:+91${v.phoneNumber}`} className="text-brand-orange hover:underline font-bold">
                      +91 {v.phoneNumber}
                    </a>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {v.status === 'REQUESTED' && (
                  <div className="flex space-x-2 w-full">
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: v._id, status: 'CONFIRMED' })}
                      className="flex-1 bg-brand-teal hover:bg-brand-teal-light text-white text-xs font-bold py-2 rounded-xl"
                    >
                      Confirm Slot
                    </button>
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: v._id, status: 'CANCELLED' })}
                      className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {v.status === 'CONFIRMED' && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: v._id, status: 'COMPLETED', feedback: 'Site visit completed successfully.' })}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl"
                  >
                    Mark Visit Completed
                  </button>
                )}

                {['COMPLETED', 'CANCELLED'].includes(v.status) && (
                  <span className="text-xs text-slate-400 italic">No further actions required</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-10 text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No site visits recorded.
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteVisitsManagementPage;

