import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Star, ShieldCheck, Phone, MessageSquare, ArrowRight } from 'lucide-react';
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
        <title>Accredited Real Estate Consultants & Advisory in Nagpur | Nagpur Estates</title>
        <meta
          name="description"
          content="Connect with licensed, MahaRERA certified property consultants and acquisition advisors in Nagpur."
        />
      </Helmet>

      <div className="bg-ivory-light min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="border-b border-beige pb-6">
            <span className="text-[10px] uppercase tracking-luxury text-gold font-semibold block mb-1">
              Advisory Council
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-navy font-normal tracking-tight">
              Accredited Nagpur Real Estate Consultants
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2 font-sans max-w-2xl leading-relaxed">
              MahaRERA certified practitioners providing discrete representation, institutional valuation advisory, and transaction stewardship across Vidarbha.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-beige h-72 animate-pulse"></div>
              ))
            ) : agents && agents.length > 0 ? (
              agents.map((agent) => (
                <div
                  key={agent._id}
                  className="bg-white p-7 border border-beige hover:border-gold transition-colors duration-300 shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start space-x-4 mb-5">
                      <img
                        src={agent.user?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80'}
                        alt={agent.user?.name}
                        className="w-16 h-16 object-cover border border-gold/30 shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-serif text-lg font-normal text-navy">{agent.user?.name}</h3>
                          <ShieldCheck className="w-3.5 h-3.5 text-gold shrink-0" />
                        </div>
                        <p className="text-xs text-charcoal-muted font-sans mt-0.5">
                          {agent.agencyName || 'Independent Real Estate Advisor'}
                        </p>
                        <div className="flex items-center space-x-1.5 text-xs text-gold font-medium mt-1 font-sans">
                          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                          <span className="text-navy font-semibold">{agent.rating || 4.9}</span>
                          <span className="text-charcoal-muted font-normal">({agent.reviewsCount || 24} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-charcoal-light line-clamp-2 mb-5 font-sans leading-relaxed">
                      {agent.bio || 'Advisory practice specializing in prime residential corridors, luxury high-rises, and NMRDA sanctioned estates.'}
                    </p>

                    <div className="mb-4">
                      <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-2 font-sans font-medium">
                        Market Corridors
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.areasServed && agent.areasServed.length > 0 ? (
                          agent.areasServed.map((area, i) => (
                            <span
                              key={i}
                              className="bg-ivory border border-beige text-charcoal text-[10px] uppercase tracking-wider px-2 py-0.5"
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

                  <div className="pt-4 border-t border-beige flex items-center justify-between text-xs font-sans">
                    <span className="text-[11px] text-charcoal-muted">
                      RERA: <strong className="text-navy font-mono">{agent.reraNumber || 'A50500001234'}</strong>
                    </span>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`https://wa.me/${(agent.contactPhone || agent.user?.phone || '919823000000').replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(agent.user?.name || '')},%20inquiring%20via%20Nagpur%20Estates`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 border border-beige bg-ivory hover:border-gold text-navy transition-colors"
                        title="WhatsApp Advisory"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`tel:+91${agent.contactPhone || agent.user?.phone || '9823000000'}`}
                        className="inline-flex items-center space-x-1.5 py-2 px-3 bg-navy hover:bg-navy-light text-white text-[10px] uppercase tracking-luxury font-medium transition-colors"
                      >
                        <Phone className="w-3 h-3 text-gold" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-14 text-xs uppercase tracking-luxury text-charcoal-muted bg-white border border-beige">
                Advisory roster updating.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentsDirectoryPage;
