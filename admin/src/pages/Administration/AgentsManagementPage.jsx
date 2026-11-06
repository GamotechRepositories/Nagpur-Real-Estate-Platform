import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  UserCheck,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  MapPin,
  Building,
  Award,
  Search,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

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
    <div className="space-y-6">
      <PageHeader
        title="Nagpur Real Estate Agents Directory"
        subtitle="MahaRERA certified consultants, localized advisory partners, and assigned agency performance"
        icon={UserCheck}
        breadcrumbs={[{ label: 'Agents' }]}
      />

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by agent name, agency, RERA, or locality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Agents Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header Profile */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-teal to-teal-700 text-white flex items-center justify-center font-black text-base flex-shrink-0 shadow-sm">
                    {agent.user?.name?.[0] || 'A'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-slate-900 truncate">
                      {agent.user?.name || 'Agent'}
                    </h3>
                    <p className="text-xs font-semibold text-brand-teal truncate">
                      {agent.agencyName || 'Independent Consultant'}
                    </p>
                    <span className="inline-flex items-center text-[10px] text-emerald-600 font-extrabold mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      RERA: {agent.reraNumber || 'A50500001234'}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-2 py-3 border-t border-b border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rating:</span>
                    <span className="font-black text-amber-500 flex items-center">
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
                    <span className="text-slate-800 font-semibold truncate max-w-[170px]">
                      {agent.areasServed?.join(', ') || 'Nagpur Prime Corridors'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <a
                  href={`tel:+91${agent.contactPhone || agent.user?.phone}`}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Call Agent</span>
                </a>

                {agent.user?.email && (
                  <a
                    href={`mailto:${agent.user.email}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
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
          title="No agents matched"
          description="Try clearing your search query or registering new certified consultants."
        />
      )}
    </div>
  );
};

export default AgentsManagementPage;
