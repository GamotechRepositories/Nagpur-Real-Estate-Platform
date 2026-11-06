import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Star, ShieldCheck, Phone, ArrowRight, User } from 'lucide-react';
import apiClient from '../../api/client';

const AgentShowcase = () => {
  const { t } = useTranslation();

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents-showcase'],
    queryFn: async () => {
      const res = await apiClient.get('/agents');
      return res.data?.data || [];
    },
  });

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange bg-orange-50 px-3 py-1 rounded-full mb-2 border border-orange-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Consultants</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy">
              {t('sections.agentsTitle')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('sections.agentsSubtitle')}
            </p>
          </div>

          <Link
            to="/agents"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-bold text-brand-teal hover:text-brand-orange transition-colors"
          >
            <span>View All Agents</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse"></div>
            ))
          ) : agents && agents.length > 0 ? (
            agents.slice(0, 3).map((agent) => (
              <div
                key={agent._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={
                        agent.user?.avatar ||
                        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={agent.user?.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-teal flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-base font-bold text-slate-900">{agent.user?.name}</h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-xs font-semibold text-brand-teal mt-0.5">
                        {agent.agencyName || 'Independent Real Estate Advisor'}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{agent.rating || 4.9}</span>
                        <span className="text-slate-400 font-normal">({agent.reviewsCount || 24} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {agent.bio || 'Specialized in premium residential and commercial properties in Nagpur.'}
                  </p>

                  <div className="mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Areas Served
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {agent.areasServed && agent.areasServed.length > 0 ? (
                        agent.areasServed.map((area, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
                          >
                            {area}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">Nagpur Metro Region</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    RERA: <strong>{agent.reraNumber || 'A50500001234'}</strong>
                  </span>
                  <a
                    href={`tel:+91${agent.contactPhone || agent.user?.phone || '9823000000'}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-brand-teal hover:bg-brand-teal-light py-2 px-3.5 rounded-xl transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact</span>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-6 text-sm text-slate-500">
              No agents listed yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AgentShowcase;

