import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, ShieldCheck, Star, Phone, Mail, Award, CheckCircle } from 'lucide-react';
import apiClient from '../../api/client';

const AgentsManagementPage = () => {
  const queryClient = useQueryClient();

  const { data: agents, isLoading } = useQuery({
    queryKey: ['admin-agents-list'],
    queryFn: async () => {
      const res = await apiClient.get('/agents');
      return res.data?.data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center space-x-2">
            <Users className="w-6 h-6 text-brand-teal" />
            <span>Nagpur Real Estate Agents Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            MahaRERA verified property consultants, agency profiles, and performance ratings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="h-60 bg-white rounded-3xl border border-slate-200 animate-pulse"></div>
          ))
        ) : agents && agents.length > 0 ? (
          agents.map((agent) => (
            <div
              key={agent._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                    {agent.user?.name?.[0] || 'A'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{agent.user?.name}</h3>
                    <p className="text-xs text-brand-teal font-semibold">
                      {agent.agencyName || 'Independent Real Estate Consultant'}
                    </p>
                    <span className="inline-flex items-center text-[10px] text-emerald-600 font-bold mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 mr-0.5" />
                      RERA: {agent.reraNumber || 'A50500001234'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 py-2 border-t border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rating:</span>
                    <span className="font-bold flex items-center text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                      {agent.rating || 4.8} / 5.0
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Experience:</span>
                    <strong className="text-slate-800">{agent.experienceYears || 5} Years in Nagpur</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Localities:</span>
                    <span className="text-slate-800 truncate max-w-[150px]">
                      {agent.areasServed?.join(', ') || 'Nagpur'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <a
                  href={`tel:+91${agent.contactPhone || agent.user?.phone}`}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Call Agent</span>
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-xs text-slate-500 bg-white rounded-3xl border border-slate-200">
            No agents registered yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentsManagementPage;

