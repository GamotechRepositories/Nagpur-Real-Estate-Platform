import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Plus, Eye, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';
import { formatIndianPrice, formatDate } from '../../utils/formatters';

const MyPropertiesPage = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['my-properties'],
    queryFn: async () => {
      const res = await apiClient.get('/properties?limit=50');
      return res.data?.data || [];
    },
  });

  return (
    <>
      <Helmet>
        <title>Portfolio Assets & Listings | Nagpur Estates</title>
      </Helmet>

      <div className="bg-ivory-light min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-beige pb-6">
            <div>
              <span className="text-[10px] uppercase tracking-luxury text-gold font-semibold block mb-1">
                Asset Portfolio Console
              </span>
              <h1 className="font-serif text-3xl text-navy font-normal">Principal Asset Management</h1>
              <p className="text-xs text-charcoal-muted mt-1 font-sans">
                Review submitted listings, track compliance status, and manage active marketplace cycles
              </p>
            </div>

            <Link
              to="/post-property"
              className="inline-flex items-center space-x-2 bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase py-3 px-5 transition-colors shadow-subtle"
            >
              <Plus className="w-4 h-4 text-gold" />
              <span>List New Asset</span>
            </Link>
          </div>

          {/* Properties List */}
          <div className="bg-white border border-beige shadow-subtle p-8">
            <h2 className="font-serif text-xl text-navy font-normal mb-6">Registered Property Portfolio</h2>

            {isLoading ? (
              <div className="py-14 text-center text-xs uppercase tracking-luxury text-charcoal-muted font-sans">
                Accessing portfolio ledger...
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="space-y-4">
                {properties.map((prop) => (
                  <div
                    key={prop._id}
                    className="p-5 border border-beige hover:border-gold transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-ivory-light"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={prop.coverImage || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=80'}
                        alt=""
                        className="w-20 h-16 object-cover border border-beige shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-luxury border ${
                              prop.status === 'LIVE'
                                ? 'bg-ivory text-gold border-gold/40'
                                : prop.status === 'PENDING_REVIEW'
                                ? 'bg-navy text-white border-navy'
                                : 'bg-white text-charcoal-muted border-beige'
                            }`}
                          >
                            {prop.status}
                          </span>
                          <span className="text-xs font-semibold text-navy font-sans">
                            {formatIndianPrice(prop.price)}
                          </span>
                        </div>
                        <h3 className="font-serif text-base text-navy font-normal mt-1">{prop.title}</h3>
                        <p className="text-[11px] text-charcoal-muted font-sans mt-0.5">
                          {prop.localityName} &bull; {prop.areaSqFt} Sq.Ft &bull; Submitted {formatDate(prop.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-beige">
                      <Link
                        to={`/properties/${prop.slug}`}
                        className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-luxury font-medium text-navy hover:text-gold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs uppercase tracking-luxury text-charcoal-muted border border-dashed border-beige">
                No properties registered under your portfolio account.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyPropertiesPage;
