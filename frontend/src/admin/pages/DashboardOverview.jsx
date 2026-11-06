import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  ShieldAlert,
  Users,
  MessageSquare,
  Calendar,
  ArrowRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import apiClient from '../../api/client';

const LUXURY_PALETTE = ['#172C3B', '#B89A65', '#223D52', '#9A7D4C', '#DCD5C8'];

const DashboardOverview = () => {
  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/dashboard');
      return res.data?.data;
    },
  });

  const properties = statsResponse?.properties || {};
  const users = statsResponse?.users || {};
  const crm = statsResponse?.crm || {};
  const topLocalities = statsResponse?.topLocalities || [];

  const propertyStatusData = [
    { name: 'Live', value: properties.LIVE || 0 },
    { name: 'Pending', value: properties.PENDING_REVIEW || 0 },
    { name: 'Draft', value: properties.DRAFT || 0 },
    { name: 'Rejected', value: properties.REJECTED || 0 },
    { name: 'Expired', value: properties.EXPIRED || 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-beige">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-gold font-semibold block mb-1">
            Executive Operations Overview
          </span>
          <h1 className="font-serif text-3xl text-navy font-normal">Real Estate Management Command</h1>
          <p className="text-xs text-charcoal-muted mt-1 font-sans">
            Real-time portfolio intelligence, moderation workflow, and client lead performance across Nagpur.
          </p>
        </div>

        {properties.PENDING_REVIEW > 0 && (
          <Link
            to="/admin/moderation"
            className="inline-flex items-center space-x-2 bg-navy hover:bg-navy-light text-gold text-xs font-medium tracking-luxury uppercase py-3 px-5 border border-gold/40 transition-colors shadow-subtle"
          >
            <ShieldAlert className="w-4 h-4 text-gold" />
            <span>{properties.PENDING_REVIEW} Assets Awaiting Moderation</span>
          </Link>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Properties */}
        <div className="bg-white p-6 border border-beige shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted font-medium block">
              Total Portfolio Assets
            </span>
            <div className="font-serif text-3xl text-navy font-semibold mt-1.5">{properties.TOTAL || 0}</div>
            <span className="text-xs text-navy/70 font-sans mt-0.5 block">{properties.LIVE || 0} Active on public portal</span>
          </div>
          <div className="w-12 h-12 border border-beige bg-ivory flex items-center justify-center text-navy">
            <Building2 className="w-5 h-5 stroke-[1.5]" />
          </div>
        </div>

        {/* Pending Moderation */}
        <div className="bg-white p-6 border border-beige shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted font-medium block">
              Pending Validation
            </span>
            <div className="font-serif text-3xl text-gold font-semibold mt-1.5">{properties.PENDING_REVIEW || 0}</div>
            <Link to="/admin/moderation" className="text-xs text-navy hover:text-gold transition-colors font-medium">
              Review Queue →
            </Link>
          </div>
          <div className="w-12 h-12 border border-gold/30 bg-ivory flex items-center justify-center text-gold">
            <Clock className="w-5 h-5 stroke-[1.5]" />
          </div>
        </div>

        {/* Today's CRM Enquiries */}
        <div className="bg-white p-6 border border-beige shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted font-medium block">
              Today's Inquiries
            </span>
            <div className="font-serif text-3xl text-navy font-semibold mt-1.5">{crm.todayEnquiries || 0}</div>
            <span className="text-xs text-charcoal-muted font-sans mt-0.5 block">Conversion: {crm.conversionRate || '0%'}</span>
          </div>
          <div className="w-12 h-12 border border-beige bg-ivory flex items-center justify-center text-navy">
            <MessageSquare className="w-5 h-5 stroke-[1.5]" />
          </div>
        </div>

        {/* Pending Site Visits */}
        <div className="bg-white p-6 border border-beige shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted font-medium block">
              Private Viewings
            </span>
            <div className="font-serif text-3xl text-navy font-semibold mt-1.5">{crm.pendingSiteVisits || 0}</div>
            <Link to="/admin/site-visits" className="text-xs text-navy hover:text-gold transition-colors font-medium">
              View Schedule →
            </Link>
          </div>
          <div className="w-12 h-12 border border-beige bg-ivory flex items-center justify-center text-navy">
            <Calendar className="w-5 h-5 stroke-[1.5]" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Localities Bar Chart */}
        <div className="lg:col-span-7 bg-white p-7 border border-beige shadow-subtle">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-beige">
            <div>
              <h3 className="font-serif text-lg text-navy font-normal">Active Inventory by Nagpur Enclave</h3>
              <p className="text-xs text-charcoal-muted font-sans mt-0.5">Asset distribution across high-demand corridors</p>
            </div>
            <Link to="/admin/listings" className="text-xs uppercase tracking-luxury text-navy hover:text-gold transition-colors font-medium">
              Inspect Listings
            </Link>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topLocalities}>
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip
                  formatter={(val) => [val, 'Properties']}
                  contentStyle={{ backgroundColor: '#172C3B', color: '#FAF8F3', borderRadius: '0px', border: '1px solid #B89A65', fontSize: '11px' }}
                />
                <Bar dataKey="propertyCount" fill="#172C3B" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-5 bg-white p-7 border border-beige shadow-subtle">
          <div className="mb-6 pb-4 border-b border-beige">
            <h3 className="font-serif text-lg text-navy font-normal">Portfolio Lifecycle Breakdown</h3>
            <p className="text-xs text-charcoal-muted font-sans mt-0.5">90-day active cycle & compliance status</p>
          </div>

          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {propertyStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={LUXURY_PALETTE[index % LUXURY_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#172C3B', color: '#FAF8F3', borderRadius: '0px', border: '1px solid #B89A65', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-4 text-xs font-sans text-charcoal">
            {propertyStatusData.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5" style={{ backgroundColor: LUXURY_PALETTE[index % LUXURY_PALETTE.length] }}></span>
                <span>{item.name}: <strong className="text-navy">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Moderation & Leads Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-navy text-ivory p-7 border border-navy-light shadow-subtle flex flex-col justify-between">
          <div>
            <ShieldCheck className="w-7 h-7 text-gold mb-3 stroke-[1.5]" />
            <h4 className="font-serif text-lg font-normal text-white">Title & MahaRERA Verification</h4>
            <p className="text-xs text-ivory/70 mt-1 font-sans leading-relaxed">
              Enforce NMRDA sanctions, non-agricultural certificates, and owner authenticity within the 24-hour turnaround SLA.
            </p>
          </div>
          <Link
            to="/admin/moderation"
            className="mt-6 inline-flex items-center space-x-1.5 text-xs uppercase tracking-luxury text-gold hover:text-white transition-colors font-medium"
          >
            <span>Open Moderation Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-ivory text-charcoal p-7 border border-beige shadow-subtle flex flex-col justify-between">
          <div>
            <MessageSquare className="w-7 h-7 text-navy mb-3 stroke-[1.5]" />
            <h4 className="font-serif text-lg font-normal text-navy">CRM Lead Coordination</h4>
            <p className="text-xs text-charcoal-muted mt-1 font-sans leading-relaxed">
              Automated corridor-based lead allocation to certified Nagpur real estate advisors with follow-up tracking.
            </p>
          </div>
          <Link
            to="/admin/leads"
            className="mt-6 inline-flex items-center space-x-1.5 text-xs uppercase tracking-luxury text-navy hover:text-gold transition-colors font-medium"
          >
            <span>View Leads Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white text-charcoal p-7 border border-beige shadow-subtle flex flex-col justify-between">
          <div>
            <Users className="w-7 h-7 text-gold mb-3 stroke-[1.5]" />
            <h4 className="font-serif text-lg font-normal text-navy">Advisor & Staff Directory</h4>
            <p className="text-xs text-charcoal-muted mt-1 font-sans leading-relaxed">
              Manage verified advisory agents ({users.agents || 0}), asset owners, and staff permissions across the platform.
            </p>
          </div>
          <Link
            to="/admin/agents"
            className="mt-6 inline-flex items-center space-x-1.5 text-xs uppercase tracking-luxury text-navy hover:text-gold transition-colors font-medium"
          >
            <span>Inspect Staff Roster</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
