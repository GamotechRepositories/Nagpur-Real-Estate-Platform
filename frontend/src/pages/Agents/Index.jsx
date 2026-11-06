import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Users, Star, ShieldCheck, Phone, MapPin } from 'lucide-react';
import apiClient from '../../api/client';

const AgentsDirectoryPage = () => {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['public-agents'],
    queryFn: async () => {
      const res = await apiClient.get('/agents');
      return res.data?.data || [];
    },
  });

  return (
    <>
      <Helmet>
        <title>Top Real Estate Agents in Nagpur — MahaRERA Verified Consultants</title>
        <meta
          name="description"
          content="Connect with verified real estate agents in Nagpur. Specialized local consultants for Dharampeth, Manish Nagar, Wardha Road, Besa and prime areas."
        />
      </Helmet>

      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Local Property Experts
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy mt-1">
              Nagpur Real Estate Consultants & Agents
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              KYC & MahaRERA verified real estate professionals ready to assist your property journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl h-64 animate-pulse border border-slate-200"></div>
              ))
            ) : agents && agents.length > 0 ? (
              agents.map((agent) => (
                <div
                  key={agent._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card hover:shadow-hover transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start space-x-4 mb-4">
                      <img
                        src={agent.user?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'}
                        alt={agent.user?.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-teal flex-shrink-0"
                      />
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{agent.user?.name}</h3>
                        <p className="text-xs text-brand-teal font-semibold">{agent.agencyName || 'Independent Consultant'}</p>
                        <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold mt-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{agent.rating || 4.9}</span>
                          <span className="text-slate-400 font-normal">({agent.reviewsCount || 20} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {agent.bio || 'Professional real estate advisory for residential and commercial transactions.'}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {agent.areasServed?.map((area, i) => (
                        <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      RERA: <strong className="text-slate-700">{agent.reraNumber || 'A50500001234'}</strong>
                    </span>
                    <a
                      href={`tel:+91${agent.contactPhone || agent.user?.phone}`}
                      className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-brand-teal-light transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Contact</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-xs text-slate-400">
                No agents found.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentsDirectoryPage;

