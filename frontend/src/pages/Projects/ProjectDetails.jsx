import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Building2,
  ShieldCheck,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  Phone,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import apiClient from '../../api/client';
import { formatIndianPrice, formatDate } from '../../utils/formatters';

const ProjectDetailsPage = () => {
  const { slug } = useParams();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project-detail', slug],
    queryFn: async () => {
      const res = await apiClient.get(`/projects/${slug}`);
      return res.data?.data;
    },
  });

  if (isLoading) {
    return <div className="py-24 text-center text-xs text-slate-400 font-serif">Curating development details...</div>;
  }

  if (!project) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#172C3B]">Residential Development Not Found</h2>
        <Link to="/projects" className="text-[#B89A65] text-xs uppercase tracking-luxury font-semibold hover:underline">
          Return to All Nagpur Projects &rarr;
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${project.name} by ${project.builderName || 'Reputed Builder'} — Nagpur Real Estate`}</title>
        <meta name="description" content={project.description?.slice(0, 160) || `${project.name} project details.`} />
      </Helmet>

      <div className="bg-[#F7F4ED] min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <nav className="text-xs text-[#252525]/60 flex items-center space-x-2">
            <Link to="/" className="hover:text-[#B89A65]">Home</Link>
            <span>/</span>
            <Link to="/projects" className="hover:text-[#B89A65]">Projects</Link>
            <span>/</span>
            <span className="font-bold text-[#172C3B]">{project.name}</span>
          </nav>

          {/* Header Card */}
          <div className="bg-[#FFFFFF] border border-[#E9E4DA] p-8 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="bg-[#172C3B] text-[#FFFFFF] text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium">
                  {project.projectStatus}
                </span>
                <span className="text-[#B89A65] text-xs font-semibold flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  MahaRERA: {project.reraNumber || 'P50500012345'}
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#172C3B]">{project.name}</h1>
              <p className="text-xs text-[#252525]/60 flex items-center">
                <MapPin className="w-3.5 h-3.5 text-[#B89A65] mr-1" />
                <span>{project.address}, {project.localityName}, Nagpur</span>
              </p>
            </div>

            <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-[#E9E4DA]">
              <span className="text-[11px] uppercase tracking-wider text-[#252525]/60 block font-medium">Price Spectrum</span>
              <div className="text-2xl font-semibold text-[#172C3B] mt-0.5">
                {formatIndianPrice(project.priceRange?.minPrice)} - {formatIndianPrice(project.priceRange?.maxPrice)}
              </div>
            </div>
          </div>

          {/* Main Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              <div className="aspect-[16/10] overflow-hidden bg-[#172C3B] border border-[#E9E4DA]">
                <img
                  src={project.images?.[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="bg-[#FFFFFF] border border-[#E9E4DA] p-8 shadow-card space-y-4">
                <h2 className="font-serif text-2xl font-bold text-[#172C3B]">Development Narrative</h2>
                <p className="text-xs sm:text-sm text-[#252525]/80 leading-relaxed whitespace-pre-line font-light">
                  {project.description || 'Master-planned luxury residences crafted to the highest architectural standards with dedicated clubhouse amenities and lush landscapes.'}
                </p>
              </div>

              {project.configurations && project.configurations.length > 0 && (
                <div className="bg-[#FFFFFF] border border-[#E9E4DA] p-8 shadow-card space-y-4">
                  <h2 className="font-serif text-2xl font-bold text-[#172C3B]">Available Residences</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {project.configurations.map((cfg, idx) => (
                      <div key={idx} className="p-4 bg-[#F7F4ED] border border-[#E9E4DA] flex justify-between items-center">
                        <div>
                          <strong className="text-sm font-semibold text-[#172C3B] block">{cfg.type || `${cfg.bhk} BHK`}</strong>
                          <span className="text-[#252525]/60">{cfg.carpetAreaSqFt} Sq.Ft Carpet</span>
                        </div>
                        <span className="font-semibold text-[#172C3B] text-sm">
                          {formatIndianPrice(cfg.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Inquiries */}
            <aside className="lg:col-span-4 bg-[#FFFFFF] border border-[#E9E4DA] p-6 shadow-card space-y-5 sticky top-28">
              <span className="text-[10px] uppercase tracking-widest text-[#B89A65] font-semibold block">
                Direct Developer Access
              </span>
              <h3 className="font-serif text-xl font-bold text-[#172C3B]">Request Private Presentation</h3>
              <p className="text-xs text-[#252525]/70 font-light leading-relaxed">
                Connect with our senior relationship manager for confidential floor plans, unit allocations, and private site visits.
              </p>

              <div className="space-y-3 pt-2">
                <a
                  href="tel:+917122550100"
                  className="w-full bg-[#172C3B] hover:bg-[#223D52] text-[#FFFFFF] text-xs uppercase tracking-luxury font-medium py-3 border border-[#B89A65]/40 transition-colors flex items-center justify-center space-x-2"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B89A65]" />
                  <span>Call Advisory Desk</span>
                </a>

                <a
                  href={`https://wa.me/919823000000?text=Hello,%20I%20would%20like%20confidential%20details%20for%20project%20${encodeURIComponent(project.name)}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#F7F4ED] hover:bg-[#EFECE3] border border-[#E9E4DA] text-[#172C3B] text-xs uppercase tracking-luxury font-medium py-3 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#B89A65]" />
                  <span>WhatsApp Portfolio</span>
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetailsPage;
