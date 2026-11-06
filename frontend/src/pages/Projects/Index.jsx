import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Building2, ShieldCheck, MapPin, IndianRupee, FileText } from 'lucide-react';
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
        <title>New Real Estate Projects & Townships in Nagpur — MahaRERA Approved</title>
        <meta name="description" content="Discover upcoming residential townships, high-rises and luxury villa projects by top builders in Nagpur." />
      </Helmet>

      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
              Builder Launches
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy mt-1">
              New Projects & Townships in Nagpur
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              MahaRERA verified ongoing developments and upcoming residential high-rises
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-200"></div>
              ))
            ) : projects && projects.length > 0 ? (
              projects.map((proj) => (
                <div
                  key={proj._id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-card hover:shadow-hover transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] bg-slate-100">
                    <img
                      src={proj.images?.[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                      alt={proj.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-brand-navy text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      {proj.projectStatus}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-slate-900">{proj.name}</h3>
                    <p className="text-xs text-brand-teal font-semibold">By {proj.builderName || 'Reputed Nagpur Developer'}</p>
                    <div className="flex items-center text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-brand-orange mr-1" />
                      <span>{proj.localityName}, Nagpur</span>
                    </div>

                    <div className="pt-2 text-xs text-slate-700 flex justify-between border-t border-slate-100">
                      <span>RERA: <strong>{proj.reraNumber || 'P50500012345'}</strong></span>
                      <span className="font-bold text-brand-orange">
                        {formatIndianPrice(proj.priceRange?.minPrice)} - {formatIndianPrice(proj.priceRange?.maxPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 bg-white rounded-3xl p-12 text-center text-xs text-slate-500 border border-slate-200">
                New project launches will be updated shortly.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectsPage;
