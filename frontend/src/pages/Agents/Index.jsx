import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Star, ShieldCheck, Phone, MessageSquare } from 'lucide-react';
import apiClient from '../../api/client';

const DEFAULT_AGENTS = [
  {
    _id: 'agent-1',
    name: 'Rohit Deshmukh',
    agency: 'Prime Estate',
    rating: 4.8,
    reviewsCount: 32,
    experience: '8+ Years Exp.',
    phone: '9823000001',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    specialization: 'Dharampeth, Civil Lines & High-Rise Living',
  },
  {
    _id: 'agent-2',
    name: 'Priya Kulkarni',
    agency: 'Nagpur Properties',
    rating: 4.9,
    reviewsCount: 46,
    experience: '10+ Years Exp.',
    phone: '9823000002',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    specialization: 'Wardha Road Corridor & Modern Gated Estates',
  },
  {
    _id: 'agent-3',
    name: 'Amit Shinde',
    agency: 'City Realtors',
    rating: 4.7,
    reviewsCount: 29,
    experience: '6+ Years Exp.',
    phone: '9823000003',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    specialization: 'Manish Nagar, Besa & Plots Specialist',
  },
];

const AgentsDirectoryPage = () => {
  const { data: apiAgents, isLoading } = useQuery({
    queryKey: ['public-agents'],
    queryFn: async () => {
      const res = await apiClient.get('/agents');
      return res.data?.data || [];
    },
  });

  const agents = apiAgents && apiAgents.length > 0
    ? apiAgents.map((a, i) => ({
        _id: a._id,
        name: a.user?.name || DEFAULT_AGENTS[i % DEFAULT_AGENTS.length].name,
        agency: a.agencyName || DEFAULT_AGENTS[i % DEFAULT_AGENTS.length].agency,
        rating: a.rating || DEFAULT_AGENTS[i % DEFAULT_AGENTS.length].rating,
        reviewsCount: a.reviewsCount || 28,
        experience: '8+ Years Exp.',
        phone: a.user?.phone || '9823000000',
        avatar: a.user?.avatar || DEFAULT_AGENTS[i % DEFAULT_AGENTS.length].avatar,
        specialization: a.bio || 'Verified Nagpur Real Estate Specialist',
      }))
    : DEFAULT_AGENTS;

  return (
    <>
      <Helmet>
        <title>Verified Real Estate Agents in Nagpur | Nagpur Realty</title>
        <meta
          name="description"
          content="Find trusted, RERA registered property agents in Nagpur. Rohit Deshmukh, Priya Kulkarni, Amit Shinde, and top brokers."
        />
      </Helmet>

      <div className="bg-[#F7F4ED] min-h-screen py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header matching Screen 10 */}
          <div className="space-y-1.5 border-b border-[#E9E4DA] pb-6">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#172C3B]">
              Verified Real Estate Agents
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Connect with top licensed, RERA verified property experts across Nagpur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl h-64 animate-pulse border border-[#E9E4DA]"></div>
              ))
            ) : (
              agents.map((agent) => (
                <div
                  key={agent._id}
                  className="bg-white rounded-xl border border-[#E9E4DA] hover:border-[#B89A65]/60 transition-all duration-300 shadow-sm hover:shadow-md p-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Row: Avatar + Name + Rating */}
                    <div className="flex items-center space-x-4">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#B89A65]/30 shadow-sm shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-serif text-base sm:text-lg font-bold text-[#172C3B]">
                            {agent.name}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{agent.agency}</p>
                        <div className="flex items-center space-x-1 text-xs text-[#B89A65] font-semibold mt-1">
                          <Star className="w-3.5 h-3.5 fill-[#B89A65] text-[#B89A65]" />
                          <span>{agent.rating}</span>
                          <span className="text-gray-400 font-normal">({agent.reviewsCount || 24})</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {agent.specialization}
                    </p>
                  </div>

                  {/* Contact Buttons */}
                  <div className="pt-5 mt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <a
                      href={`tel:+91${agent.phone}`}
                      className="py-2 bg-white hover:bg-gray-50 border border-gray-300 text-[#172C3B] text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`https://wa.me/91${agent.phone}?text=${encodeURIComponent(
                        `Hello ${agent.name}, I am looking for property advisory in Nagpur.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentsDirectoryPage;
