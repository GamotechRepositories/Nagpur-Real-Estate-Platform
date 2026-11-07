import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  UserCheck,
  Star,
  Phone,
  Mail,
  Search,
  Shield,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

export const AgentsManagementPage = () => {
  const [search, setSearch] = useState('');

  const { data: agents, isLoading } = useQuery({
    queryKey: ['admin-agents-list'],
    queryFn: async () => {
      const res = await apiClient.get('/agents');
      return res.data?.data || [];
    },
  });

  const filteredAgents = agents?.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.user?.name?.toLowerCase().includes(q) ||
      a.agencyName?.toLowerCase().includes(q) ||
      a.reraNumber?.toLowerCase().includes(q) ||
      a.areasServed?.some((area) => area.toLowerCase().includes(q))
    );
  }) || [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Agents"
        subtitle="Certified agents and consultants"
        icon={UserCheck}
        breadcrumbs={[{ label: 'Agents' }]}
      />

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search agents by name, agency, RERA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Agents Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-52 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <div
              key={agent._id}
              className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                {/* Header Profile */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {agent.user?.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {agent.user?.name || 'Agent'}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {agent.agencyName || 'Independent Consultant'}
                    </p>
                    {agent.reraNumber && (
                      <span className="inline-flex items-center text-[10px] text-teal-700 font-medium">
                        <Shield className="w-3 h-3 mr-0.5" />
                        RERA: {agent.reraNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-1.5 py-2.5 border-t border-b border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rating:</span>
                    <span className="font-semibold text-amber-600 flex items-center">
                      <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                      {agent.rating || 4.8} / 5.0
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Experience:</span>
                    <span className="text-slate-800 font-medium">{agent.experienceYears || 5} Years</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Areas:</span>
                    <span className="text-slate-800 font-medium truncate max-w-[170px]">
                      {agent.areasServed?.join(', ') || 'Nagpur'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <a
                  href={`tel:+91${agent.contactPhone || agent.user?.phone}`}
                  className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-700" />
                  <span>Call</span>
                </a>

                {agent.user?.email && (
                  <a
                    href={`mailto:${agent.user.email}`}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                    title="Send Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={UserCheck}
          title="No agents found"
          description="No registered agents match your search."
        />
      )}
    </div>
  );
};

export default AgentsManagementPage;
