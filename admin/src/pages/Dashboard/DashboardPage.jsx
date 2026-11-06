import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldAlert,
  Clock,
  MessageSquare,
  Calendar,
  Users,
  CheckCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Download,
  AlertTriangle,
  MapPin,
  Sparkles,
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
  Legend,
} from 'recharts';
import apiClient from '../../api/client';
import StatCard from '../../components/common/StatCard';
import { formatIndianPrice } from '../../utils/formatters';

const STATUS_PIE_COLORS = {
  LIVE: '#10b981', // emerald
  PENDING_REVIEW: '#f59e0b', // amber
  DRAFT: '#94a3b8', // slate
  REJECTED: '#f43f5e', // rose
  EXPIRED: '#64748b', // slate dark
  SOLD: '#6366f1', // indigo
};

export const DashboardPage = () => {
  const { data: statsResponse, isLoading, refetch } = useQuery({
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

  // Pie chart data
  const pieData = [
    { name: 'Live', value: properties.LIVE || 0, color: STATUS_PIE_COLORS.LIVE },
    { name: 'Pending', value: properties.PENDING_REVIEW || 0, color: STATUS_PIE_COLORS.PENDING_REVIEW },
    { name: 'Draft', value: properties.DRAFT || 0, color: STATUS_PIE_COLORS.DRAFT },
    { name: 'Rejected', value: properties.REJECTED || 0, color: STATUS_PIE_COLORS.REJECTED },
    { name: 'Expired', value: properties.EXPIRED || 0, color: STATUS_PIE_COLORS.EXPIRED },
    { name: 'Sold', value: properties.SOLD || 0, color: STATUS_PIE_COLORS.SOLD },
  ].filter((item) => item.value > 0);

  const fallbackPie = pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
            Nagpur Operations & Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time multi-channel inventory, RERA moderation pipeline, and CRM lead routing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/listings/new"
            className="inline-flex items-center space-x-1.5 py-2.5 px-4 rounded-xl bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Listing</span>
          </Link>

          <a
            href={`${apiClient.defaults.baseURL}/enquiries/admin/leads/export`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Leads CSV</span>
          </a>
        </div>
      </div>

      {/* Moderation Alert Callout */}
      {properties.PENDING_REVIEW > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-5 text-white shadow-lg shadow-amber-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base">
                {properties.PENDING_REVIEW} New Listing{properties.PENDING_REVIEW > 1 ? 's' : ''} Require Moderation
              </h3>
              <p className="text-xs text-white/90 mt-0.5">
                Ensure compliance with Maharashtra RERA & verification of 7/12 documents before publishing.
              </p>
            </div>
          </div>
          <Link
            to="/moderation"
            className="inline-flex items-center space-x-2 py-2 px-4 rounded-xl bg-white text-brand-navy text-xs font-black shadow-md hover:bg-slate-50 transition-all flex-shrink-0"
          >
            <span>Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Properties"
          value={properties.TOTAL || 0}
          subtitle={`${properties.LIVE || 0} Active on Marketplace`}
          icon={Building2}
          iconColor="text-brand-teal"
          iconBg="bg-teal-50"
          linkTo="/listings"
          linkText="Browse all"
        />

        <StatCard
          title="Moderation Queue"
          value={properties.PENDING_REVIEW || 0}
          subtitle={`${properties.REJECTED || 0} Rejected`}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          linkTo="/moderation"
          linkText="Moderate now"
          highlight={properties.PENDING_REVIEW > 0}
        />

        <StatCard
          title="Today's CRM Leads"
          value={crm.todayEnquiries || 0}
          subtitle={`Conversion Rate: ${crm.conversionRate || '0%'}`}
          icon={MessageSquare}
          iconColor="text-brand-orange"
          iconBg="bg-orange-50"
          linkTo="/leads"
          linkText="View Pipeline"
        />

        <StatCard
          title="Site Visits"
          value={crm.pendingSiteVisits || 0}
          subtitle="Pending Agent Visits"
          icon={Calendar}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          linkTo="/site-visits"
          linkText="Manage Visits"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Localities in Nagpur (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-brand-navy">Listings Across Nagpur Localities</h3>
              <p className="text-xs text-slate-500">Live property distribution in key neighborhood corridors</p>
            </div>
            <Link to="/localities" className="text-xs font-bold text-brand-teal hover:underline flex items-center space-x-1">
              <span>View Localities</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-72 w-full">
            {topLocalities && topLocalities.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topLocalities} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(val, name) => [val, 'Listings']}
                    labelFormatter={(label) => `Locality: ${label}`}
                  />
                  <Bar dataKey="propertyCount" fill="#0d4e56" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No active property locality distributions yet.
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution Pie Chart (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-brand-navy">Listing Status Breakdown</h3>
            <p className="text-xs text-slate-500">Inventory proportion across review stages</p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fallbackPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {fallbackPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(val, name) => [val, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Stats & Quick Platform Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-brand-teal flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Users</h4>
              <p className="text-xl font-black text-brand-navy">{users.total || 0}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Nagpur buyers, tenants, and property owners seeking properties.
          </p>
          <Link to="/users" className="text-xs font-bold text-brand-teal hover:underline inline-flex items-center space-x-1">
            <span>Manage User Directory</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Agents</h4>
              <p className="text-xl font-black text-brand-navy">{users.agents || 0}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            MahaRERA certified consultants handling assigned buyer inquiries.
          </p>
          <Link to="/agents" className="text-xs font-bold text-brand-teal hover:underline inline-flex items-center space-x-1">
            <span>View Certified Agents</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deals Won</h4>
              <p className="text-xl font-black text-brand-navy">{crm.closedWonLeads || 0}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Total verified real estate transactions completed through Nagpur CRM.
          </p>
          <Link to="/leads" className="text-xs font-bold text-brand-teal hover:underline inline-flex items-center space-x-1">
            <span>Inspect CRM Pipeline</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
