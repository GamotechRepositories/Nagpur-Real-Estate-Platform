import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldAlert,
  Clock,
  MessageSquare,
  Calendar,
  Plus,
  ArrowRight,
  Download,
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
import PageHeader from '../../components/common/PageHeader';

const STATUS_PIE_COLORS = {
  LIVE: '#10b981',
  PENDING_REVIEW: '#f59e0b',
  DRAFT: '#94a3b8',
  REJECTED: '#f43f5e',
  EXPIRED: '#64748b',
  SOLD: '#6366f1',
};

export const DashboardPage = () => {
  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/dashboard');
      return res.data?.data;
    },
  });

  const properties = statsResponse?.properties || {};
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
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Overview of inventory, moderation queue, and lead activity"
        actions={
          <div className="flex items-center space-x-2">
            <Link
              to="/listings/new"
              className="inline-flex items-center space-x-1.5 py-1.5 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </Link>

            <a
              href={`${apiClient.defaults.baseURL}/enquiries/admin/leads/export`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Export Leads</span>
            </a>
          </div>
        }
      />

      {/* Moderation Alert Callout */}
      {properties.PENDING_REVIEW > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-semibold">
                {properties.PENDING_REVIEW} {properties.PENDING_REVIEW === 1 ? 'property is' : 'properties are'} waiting for moderation
              </p>
            </div>
          </div>
          <Link
            to="/moderation"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-800 hover:text-amber-950 flex-shrink-0"
          >
            <span>Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Primary KPI Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="h-6 w-12 bg-slate-200 rounded" />
                </div>
                <div className="w-10 h-10 rounded-lg bg-slate-100" />
              </div>
              <div className="h-2.5 w-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Properties"
            value={properties.TOTAL || 0}
            subtitle={`${properties.LIVE || 0} Live`}
            icon={Building2}
            iconColor="text-teal-700"
            iconBg="bg-teal-50"
            linkTo="/listings"
            linkText="View all"
          />

          <StatCard
            title="Moderation Queue"
            value={properties.PENDING_REVIEW || 0}
            subtitle={`${properties.REJECTED || 0} Rejected`}
            icon={Clock}
            iconColor="text-amber-700"
            iconBg="bg-amber-50"
            linkTo="/moderation"
            linkText="Review"
            highlight={properties.PENDING_REVIEW > 0}
          />

          <StatCard
            title="Today's Leads"
            value={crm.todayEnquiries || 0}
            subtitle={`Conversion: ${crm.conversionRate || '0%'}`}
            icon={MessageSquare}
            iconColor="text-blue-700"
            iconBg="bg-blue-50"
            linkTo="/leads"
            linkText="Pipeline"
          />

          <StatCard
            title="Site Visits"
            value={crm.pendingSiteVisits || 0}
            subtitle="Pending visits"
            icon={Calendar}
            iconColor="text-purple-700"
            iconBg="bg-purple-50"
            linkTo="/site-visits"
            linkText="Schedule"
          />
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top Localities in Nagpur (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Properties by Locality</h3>
            </div>
            <Link to="/localities" className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center space-x-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-64 w-full">
            {topLocalities && topLocalities.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topLocalities} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(val) => [val, 'Properties']}
                    labelFormatter={(label) => `Locality: ${label}`}
                  />
                  <Bar dataKey="propertyCount" fill="#0f766e" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No active property data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution Pie Chart (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Status Breakdown</h3>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fallbackPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {fallbackPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  formatter={(val, name) => [val, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
