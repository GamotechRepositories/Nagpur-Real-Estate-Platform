import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';
import apiClient from '../../api/client';

const AgentShowcase = () => {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents-showcase'],
    queryFn: async () => {
      const res = await apiClient.get('/agents');
      return res.data?.data || [];
    },
  });

  return (
    <section className="py-24 bg-white border-t border-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-semibold uppercase tracking-luxury text-gold border border-gold/40 px-3 py-1 bg-ivory mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified Nagpur Advisors</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-navy font-normal tracking-tight">
              Distinguished Real Estate Consultants
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2 max-w-2xl font-sans leading-relaxed">
              Partner with licensed professionals offering confidential client representation, institutional market intelligence, and dedicated acquisition advisory.
            </p>
          </div>

          <Link
            to="/agents"
            className="mt-6 md:mt-0 inline-flex items-center space-x-2 text-xs uppercase tracking-luxury text-navy hover:text-gold transition-colors font-medium border-b border-navy/20 pb-1"
          >
            <span>View Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="h-72 bg-ivory border border-beige animate-pulse"></div>
            ))
          ) : agents && agents.length > 0 ? (
            agents.slice(0, 3).map((agent) => (
              <div
                key={agent._id}
                className="bg-ivory-light border border-beige p-7 hover:border-gold transition-all duration-300 shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start space-x-5 mb-5">
                    <img
                      src={
                        agent.user?.avatar ||
                        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80'
                      }
                      alt={agent.user?.name}
                      className="w-18 h-18 object-cover border border-gold/30 shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-serif text-lg font-normal text-navy">{agent.user?.name}</h3>
                        <ShieldCheck className="w-3.5 h-3.5 text-gold shrink-0" />
                      </div>
                      <p className="text-xs text-charcoal-muted mt-0.5 font-sans">
                        {agent.agencyName || 'Independent Real Estate Advisor'}
                      </p>
                      <div className="flex items-center space-x-1.5 text-xs text-gold font-medium mt-1.5 font-sans">
                        <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                        <span className="text-navy font-semibold">{agent.rating || 4.9}</span>
                        <span className="text-charcoal-muted font-normal">({agent.reviewsCount || 24} client reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-charcoal-light line-clamp-2 mb-5 font-sans leading-relaxed">
                    {agent.bio || 'Advisory practice specializing in prime residential corridors, luxury high-rises, and NMRDA sanctioned estates.'}
                  </p>

                  <div className="mb-6">
                    <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-2 font-sans font-medium">
                      Market Corridors
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.areasServed && agent.areasServed.length > 0 ? (
                        agent.areasServed.map((area, i) => (
                          <span
                            key={i}
                            className="bg-white border border-beige text-charcoal text-[10px] uppercase tracking-wider px-2 py-0.5"
                          >
                            {area}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-charcoal-muted">Civil Lines, Dharampeth</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-beige flex items-center justify-between">
                  <span className="text-xs text-charcoal-muted font-sans">
                    {agent.experienceYears ? `${agent.experienceYears}+ Yrs Advisory` : 'Certified Broker'}
                  </span>
                  <a
                    href={`https://wa.me/${agent.user?.phone?.replace(/\D/g, '') || '919823000000'}?text=Hello%20${encodeURIComponent(agent.user?.name || '')},%20inquiring%20via%20Nagpur%20Estates`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-luxury font-medium text-navy hover:text-gold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-gold" />
                    <span>Inquire</span>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 bg-ivory border border-beige p-10 text-center text-xs uppercase tracking-luxury text-charcoal-muted">
              Advisory directory updating.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AgentShowcase;
