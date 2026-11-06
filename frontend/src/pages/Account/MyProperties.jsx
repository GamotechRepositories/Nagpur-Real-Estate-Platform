import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Building2, PlusCircle, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import apiClient from '../../api/client';
import { formatIndianPrice, formatDate } from '../../utils/formatters';

const MyPropertiesPage = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['my-properties'],
    queryFn: async () => {
      const res = await apiClient.get('/properties?limit=50');
      // For current user
      return res.data?.data || [];
    },
  });

  return (
    <>
      <Helmet>
        <title>My Properties & Listings — Nagpur Real Estate</title>
      </Helmet>

      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-brand-navy">Owner / Agent Dashboard</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage your submitted properties, track moderation reviews, and view received buyer inquiries
              </p>
            </div>

            <Link
              to="/post-property"
              className="inline-flex items-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Property</span>
            </Link>
          </div>

          {/* Properties List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">My Submitted Listings</h2>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading your listings...</div>
            ) : properties && properties.length > 0 ? (
              <div className="space-y-4">
                {properties.map((prop) => (
                  <div
                    key={prop._id}
                    className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={prop.coverImage || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=80'}
                        alt=""
                        className="w-20 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              prop.status === 'LIVE'
                                ? 'bg-emerald-100 text-emerald-700'
                                : prop.status === 'PENDING_REVIEW'
                                ? 'bg-amber-100 text-amber-700'
                                : prop.status === 'REJECTED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {prop.status}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {formatIndianPrice(prop.price)}
                          </span>
                        </div>

                        <Link to={`/properties/${prop.slug}`} className="text-sm font-bold text-slate-900 hover:text-brand-orange block mt-1">
                          {prop.title}
                        </Link>
                        <span className="text-xs text-slate-500">{prop.localityName}, Nagpur</span>

                        {prop.status === 'REJECTED' && prop.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                            <strong>Reason:</strong> {prop.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                      <Link
                        to={`/properties/${prop.slug}`}
                        className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4 text-brand-teal" />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No properties posted yet</h3>
                <p className="text-xs text-slate-400">Post your first residential or commercial listing for free.</p>
                <Link
                  to="/post-property"
                  className="inline-block bg-brand-orange text-white text-xs font-bold py-2.5 px-4 rounded-xl"
                >
                  Post Property Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyPropertiesPage;
