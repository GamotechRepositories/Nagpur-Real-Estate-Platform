import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  ShieldAlert,
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
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

const COLORS = ['#0d4e56', '#ea580c', '#0284c7', '#e11d48', '#8b5cf6'];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy">Operations & Moderation Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics and management for Nagpur Real Estate Platform
          </p>
        </div>

        {properties.PENDING_REVIEW > 0 && (
          <Link
            to="/admin/moderation"
            className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all animate-bounce"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{properties.PENDING_REVIEW} Pending Listings Awaiting Review</span>
          </Link>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Properties */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Listings</span>
            <div className="text-2xl font-black text-brand-navy mt-1">{properties.TOTAL || 0}</div>
            <span className="text-[11px] text-emerald-600 font-semibold">{properties.LIVE || 0} Live on website</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Moderation */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{properties.PENDING_REVIEW || 0}</div>
            <Link to="/admin/moderation" className="text-[11px] text-brand-orange font-bold hover:underline">
              Moderate Queue →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Today's CRM Enquiries */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Enquiries</span>
            <div className="text-2xl font-black text-brand-orange mt-1">{crm.todayEnquiries || 0}</div>
            <span className="text-[11px] text-slate-500 font-medium">Conversion: {crm.conversionRate || '0%'}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Site Visits */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Site Visits</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{crm.pendingSiteVisits || 0}</div>
            <Link to="/admin/site-visits" className="text-[11px] text-blue-600 font-bold hover:underline">
              View Schedule →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Localities Bar Chart (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Properties by Nagpur Locality</h3>
              <p className="text-xs text-slate-500">Live active listings across prime Nagpur areas</p>
            </div>
            <Link to="/admin/listings" className="text-xs font-bold text-brand-teal hover:underline">
              View All
            </Link>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topLocalities}>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [val, 'Listings']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="propertyCount" fill="#0d4e56" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Listing Status Distribution</h3>
          <p className="text-xs text-slate-500 mb-6">Overall breakdown across all listing statuses</p>

          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {propertyStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-medium text-slate-600">
            {propertyStatusData.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span>{item.name}: <strong>{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Moderation & Leads Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-brand-navy to-slate-800 text-white rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <ShieldCheck className="w-8 h-8 text-brand-orange mb-3" />
            <h4 className="text-lg font-bold">Property Verification SLA</h4>
            <p className="text-xs text-slate-300 mt-1">
              Verify RERA registration, 7/12 land records, and owner photos within the 24-hour turnaround SLA.
            </p>
          </div>
          <Link
            to="/admin/moderation"
            className="mt-6 inline-flex items-center space-x-1.5 text-xs font-bold text-brand-orange hover:text-white transition-colors"
          >
            <span>Open Moderation Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-brand-teal to-brand-teal-dark text-white rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <MessageSquare className="w-8 h-8 text-emerald-300 mb-3" />
            <h4 className="text-lg font-bold">CRM Lead Routing</h4>
            <p className="text-xs text-slate-200 mt-1">
              Manage automatic round-robin and locality-based lead assignment to active Nagpur real estate agents.
            </p>
          </div>
          <Link
            to="/admin/leads"
            className="mt-6 inline-flex items-center space-x-1.5 text-xs font-bold text-white hover:text-orange-200 transition-colors"
          >
            <span>View Leads Kanban Board</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <h4 className="text-lg font-bold text-slate-900">Agents & Users</h4>
            <p className="text-xs text-slate-500 mt-1">
              Manage registered buyers ({users.total || 0}), verified agents ({users.agents || 0}), and staff permissions.
            </p>
          </div>
          <Link
            to="/admin/agents"
            className="mt-6 inline-flex items-center space-x-1.5 text-xs font-bold text-brand-teal hover:text-brand-orange transition-colors"
          >
            <span>Manage Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
