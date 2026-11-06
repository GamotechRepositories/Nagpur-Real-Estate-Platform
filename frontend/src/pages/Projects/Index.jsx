import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Building2, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';
import { formatIndianPrice } from '../../utils/formatters';

const ProjectsPage = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['nagpur-projects'],
    queryFn: async () => {
      const res = await apiClient.get('/projects');
      return res.data?.data || [];
    },
  });

  return (
    <>
      <Helmet>
        <title>New Architectural Developments & Townships in Nagpur | Nagpur Estates</title>
        <meta
          name="description"
          content="Curated MahaRERA registered townships, ultra-luxury high-rises and master-planned residential developments in Nagpur."
        />
      </Helmet>

      <div className="bg-ivory-light min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="border-b border-beige pb-6">
            <span className="text-[10px] uppercase tracking-luxury text-gold font-semibold block mb-1">
              Curated Developments
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-navy font-normal tracking-tight">
              Architectural Projects & Estates in Nagpur
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2 font-sans max-w-2xl leading-relaxed">
              MahaRERA verified master developments, premier residential towers, and NMRDA sanctioned integrated townships across prime corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-beige h-96 animate-pulse"></div>
              ))
            ) : projects && projects.length > 0 ? (
              projects.map((proj) => (
                <Link
                  key={proj._id}
                  to={`/projects/${proj.slug || proj._id}`}
                  className="bg-white border border-beige hover:border-gold transition-colors duration-300 shadow-subtle flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-[16/10] bg-navy-dark overflow-hidden">
                      <img
                        src={proj.images?.[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                        alt={proj.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-navy text-white text-[10px] font-semibold uppercase tracking-luxury px-3 py-1 border border-white/20">
                        {proj.projectStatus?.replace(/_/g, ' ') || 'UNDER CONSTRUCTION'}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-navy-deep/80 text-gold text-[10px] font-medium uppercase tracking-luxury px-2.5 py-1 border border-gold/40">
                        RERA Approved
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div>
                        <h3 className="font-serif text-xl text-navy font-normal group-hover:text-gold transition-colors">
                          {proj.name}
                        </h3>
                        <p className="text-xs text-charcoal-muted font-sans mt-0.5">
                          By <span className="text-navy font-medium">{proj.builderName || 'Reputed Nagpur Developer'}</span>
                        </p>
                      </div>

                      <div className="flex items-center text-xs text-charcoal-muted font-sans">
                        <MapPin className="w-3.5 h-3.5 text-gold mr-1.5 shrink-0" />
                        <span>{proj.localityName}, Nagpur</span>
                      </div>

                      <p className="text-xs text-charcoal-light line-clamp-2 font-sans leading-relaxed">
                        {proj.description || 'Master-planned luxury residences with world-class clubhouse amenities, landscaped terraces, and uninterrupted views.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-4 border-t border-beige flex items-center justify-between text-xs font-sans">
                    <div>
                      <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block">Capital Range</span>
                      <span className="font-semibold text-navy text-sm font-sans">
                        {formatIndianPrice(proj.priceRange?.minPrice)} - {formatIndianPrice(proj.priceRange?.maxPrice)}
                      </span>
                    </div>

                    <span className="text-[11px] uppercase tracking-luxury text-gold group-hover:text-navy transition-colors font-medium flex items-center">
                      View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 bg-white p-14 text-center text-xs uppercase tracking-luxury text-charcoal-muted border border-beige">
                Curated developments updating.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectsPage;
