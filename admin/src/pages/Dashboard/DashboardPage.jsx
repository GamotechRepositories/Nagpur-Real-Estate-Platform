import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Building2,
  Clock,
  ShieldAlert,
  MessageSquare,
  Calendar,
  Users,
  ArrowRight,
  TrendingUp,
  Plus,
  Download,
  BarChart2,
  ListOrdered,
  BadgeIndianRupee,
  Layers,
  Home,
  CheckCircle2,
  Briefcase,
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
import Badge from '../../components/common/Badge';
import { formatIndianPrice, formatRelativeTime } from '../../utils/formatters';

const STATUS_PIE_COLORS = {
  LIVE: '#10b981',          // Emerald
  PENDING_REVIEW: '#f59e0b', // Amber
  DRAFT: '#94a3b8',          // Slate
  REJECTED: '#f43f5e',       // Rose
  EXPIRED: '#64748b',        // Slate
  SOLD: '#6366f1',           // Indigo
};

// Custom Tooltip for Horizontal Locality Bar Chart
const LocalityTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg border border-slate-700 text-xs space-y-1">
        <div className="font-bold text-slate-100 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span>{data._id}</span>
        </div>
        <div className="flex justify-between gap-4 text-slate-300">
          <span>Active Properties:</span>
          <span className="font-semibold text-white">{data.propertyCount}</span>
        </div>
        {data.avgPrice > 0 && (
          <div className="flex justify-between gap-4 text-slate-300">
            <span>Average Price:</span>
            <span className="font-semibold text-teal-300">{formatIndianPrice(data.avgPrice)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const DashboardPage = () => {
  const [localityLimit, setLocalityLimit] = useState(8);
  const [localityViewMode, setLocalityViewMode] = useState('chart'); // 'chart' | 'list'

  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/dashboard');
      return res.data?.data;
    },
    staleTime: 30000,
  });

  const properties = statsResponse?.properties || {};
  const categories = statsResponse?.categories || {};
  const purposes = statsResponse?.purposes || {};
  const portfolio = statsResponse?.portfolio || {};
  const partners = statsResponse?.partners || {};
  const crm = statsResponse?.crm || {};
  const funnel = crm?.funnel || {};
  const topLocalities = statsResponse?.topLocalities || [];
  const recentEnquiries = statsResponse?.recentActivity?.enquiries || [];
  const recentVisits = statsResponse?.recentActivity?.siteVisits || [];

  // Filtered / sliced localities based on limit
  const visibleLocalities = useMemo(() => {
    if (localityLimit === 0) return topLocalities;
    return topLocalities.slice(0, localityLimit);
  }, [topLocalities, localityLimit]);

  const maxLocalityCount = useMemo(() => {
    if (!topLocalities.length) return 1;
    return Math.max(...topLocalities.map((l) => l.propertyCount || 1));
  }, [topLocalities]);

  // Donut chart status data
  const pieData = useMemo(() => {
    return [
      { name: 'Live', value: properties.LIVE || 0, color: STATUS_PIE_COLORS.LIVE },
      { name: 'Pending Review', value: properties.PENDING_REVIEW || 0, color: STATUS_PIE_COLORS.PENDING_REVIEW },
      { name: 'Sold Out', value: properties.SOLD || 0, color: STATUS_PIE_COLORS.SOLD },
      { name: 'Draft', value: properties.DRAFT || 0, color: STATUS_PIE_COLORS.DRAFT },
      { name: 'Rejected', value: properties.REJECTED || 0, color: STATUS_PIE_COLORS.REJECTED },
      { name: 'Expired', value: properties.EXPIRED || 0, color: STATUS_PIE_COLORS.EXPIRED },
    ].filter((item) => item.value > 0);
  }, [properties]);

  const fallbackPie = pieData.length > 0 ? pieData : [{ name: 'No Active Data', value: 1, color: '#e2e8f0' }];

  // Category total for % calculation
  const totalCategoryProps = useMemo(() => {
    return (
      (categories.RESIDENTIAL || 0) +
      (categories.COMMERCIAL || 0) +
      (categories.PLOT || 0) +
      (categories.AGRICULTURAL || 0)
    );
  }, [categories]);

  // Dynamic height for horizontal bar chart based on number of items
  const horizontalChartHeight = useMemo(() => {
    const count = visibleLocalities.length;
    return Math.max(260, count * 34);
  }, [visibleLocalities]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Section */}
      <PageHeader
        title="Dashboard & Analytics"
        subtitle="Real-time performance metrics across Nagpur marketplace inventory, leads, and operations"
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/listings/new"
              className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </Link>

            <a
              href={`${apiClient.defaults.baseURL}/enquiries/admin/leads/export`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Export Leads CSV</span>
            </a>
          </div>
        }
      />

      {/* 2. Moderation SLA Alert Callout (Shows only if pending review items exist) */}
      {properties.PENDING_REVIEW > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 sm:p-4 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-950">
                {properties.PENDING_REVIEW} {properties.PENDING_REVIEW === 1 ? 'Listing requires' : 'Listings require'} moderation review
              </p>
              <p className="text-[11px] text-amber-800">
                Owner submissions are waiting for verification and certified broker allocation.
              </p>
            </div>
          </div>
          <Link
            to="/moderation"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex-shrink-0"
          >
            <span>Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Primary Executive KPI Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-28 bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between animate-pulse">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-7 w-16 bg-slate-200 rounded" />
              <div className="h-2.5 w-24 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total Properties */}
          <StatCard
            title="Total Properties"
            value={properties.TOTAL || 0}
            subtitle={`${properties.LIVE || 0} Live • ${properties.SOLD || 0} Sold`}
            icon={Building2}
            iconColor="text-teal-700"
            iconBg="bg-teal-50"
            linkTo="/listings"
            linkText="Inventory"
          />

          {/* Card 2: Moderation Queue */}
          <StatCard
            title="Moderation Queue"
            value={properties.PENDING_REVIEW || 0}
            subtitle={properties.PENDING_REVIEW > 0 ? `${properties.PENDING_REVIEW} Action needed` : 'Queue is all clear'}
            icon={Clock}
            iconColor={properties.PENDING_REVIEW > 0 ? 'text-amber-700' : 'text-slate-600'}
            iconBg={properties.PENDING_REVIEW > 0 ? 'bg-amber-50' : 'bg-slate-100'}
            linkTo="/moderation"
            linkText="Review"
            highlight={properties.PENDING_REVIEW > 0}
          />

          {/* Card 3: Buyer Leads (CRM) */}
          <StatCard
            title="Buyer Leads"
            value={crm.totalLeads || 0}
            subtitle={`Today: +${crm.todayEnquiries || 0} • ${crm.conversionRate || '0%'} Win`}
            icon={MessageSquare}
            iconColor="text-blue-700"
            iconBg="bg-blue-50"
            linkTo="/leads"
            linkText="Pipeline"
          />

          {/* Card 4: Site Visits */}
          <StatCard
            title="Site Inspections"
            value={crm.pendingSiteVisits || 0}
            subtitle="Pending confirmation"
            icon={Calendar}
            iconColor="text-purple-700"
            iconBg="bg-purple-50"
            linkTo="/site-visits"
            linkText="Visits"
          />

          {/* Card 5: Certified Partners */}
          <StatCard
            title="Partner Network"
            value={(partners.totalAgents || 0) + (partners.totalBuilders || 0)}
            subtitle={`${partners.totalAgents || 0} Agents • ${partners.totalProjects || 0} Projects`}
            icon={Users}
            iconColor="text-indigo-700"
            iconBg="bg-indigo-50"
            linkTo="/agents"
            linkText="Partners"
          />
        </div>
      )}

      {/* 4. Core Analytics Grid (Locality Horizontal Bar + Status Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Properties by Locality (Span 7) - High-end Horizontal Layout */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-teal-600" />
                  <span>Properties by Locality</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Inventory concentration and average valuations across Nagpur micro-markets
                </p>
              </div>

              {/* View & Limit Controls */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {/* Mode toggle (Chart vs List) */}
                <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setLocalityViewMode('chart')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
                      localityViewMode === 'chart'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Horizontal Bar Chart View"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Bars</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocalityViewMode('list')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
                      localityViewMode === 'list'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Ranked List View"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ranked</span>
                  </button>
                </div>

                {/* Limit Selector */}
                <select
                  value={localityLimit}
                  onChange={(e) => setLocalityLimit(Number(e.target.value))}
                  className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  <option value={6}>Top 6</option>
                  <option value={8}>Top 8</option>
                  <option value={12}>Top 12</option>
                  <option value={0}>All ({topLocalities.length})</option>
                </select>
              </div>
            </div>

            {/* Locality Data Display */}
            {topLocalities && topLocalities.length > 0 ? (
              localityViewMode === 'chart' ? (
                /* Mode A: Horizontal Bar Chart (Labels on left, never overlap!) */
                <div className="w-full overflow-y-auto pr-1" style={{ maxHeight: '380px' }}>
                  <div style={{ height: `${horizontalChartHeight}px`, minWidth: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={visibleLocalities}
                        margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
                      >
                        <XAxis
                          type="number"
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          allowDecimals={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="_id"
                          tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                          axisLine={false}
                          tickLine={false}
                          width={110}
                        />
                        <Tooltip content={<LocalityTooltip />} cursor={{ fill: '#f1f5f9' }} />
                        <Bar
                          dataKey="propertyCount"
                          fill="#0f766e"
                          radius={[0, 6, 6, 0]}
                          barSize={16}
                        >
                          {visibleLocalities.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index === 0 ? '#0f766e' : index < 3 ? '#0d9488' : '#14b8a6'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                /* Mode B: Ranked Breakdown List with Progress Bars & Average Prices */
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {visibleLocalities.map((item, idx) => {
                    const percent = Math.round((item.propertyCount / maxLocalityCount) * 100);
                    return (
                      <div
                        key={item._id || idx}
                        className="p-2 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-800'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-700'
                                : idx === 2
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {idx + 1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-800 truncate">
                                {item._id}
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0 text-[11px]">
                                {item.avgPrice > 0 && (
                                  <span className="text-slate-500 font-medium hidden sm:inline">
                                    Avg: {formatIndianPrice(item.avgPrice)}
                                  </span>
                                )}
                                <span className="font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-md">
                                  {item.propertyCount} {item.propertyCount === 1 ? 'prop' : 'props'}
                                </span>
                              </div>
                            </div>

                            {/* Proportional Progress Track */}
                            <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-600 rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-xs text-slate-400">
                <Building2 className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                No active property records by locality available.
              </div>
            )}
          </div>

          {/* Locality Footer link */}
          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">
              Showing {visibleLocalities.length} of {topLocalities.length} active micro-markets in Nagpur
            </span>
            <Link
              to="/localities"
              className="text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>Manage Circle Rates & Areas</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Right: Status Breakdown & Category Mix (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Marketplace Health & Mix</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Inventory approval status and property type distribution
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {properties.TOTAL > 0 ? Math.round(((properties.LIVE || 0) / properties.TOTAL) * 100) : 0}% Active
              </span>
            </div>

            {/* Donut Chart with Center Metric */}
            <div className="relative h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fallbackPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fallbackPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(val, name) => [`${val} Properties`, name]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-7">
                <span className="text-xl font-bold text-slate-900">{properties.LIVE || 0}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Live Portal</span>
              </div>
            </div>

            {/* Category Split Segment Strip */}
            <div className="pt-3 border-t border-slate-100 mt-2 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Category Distribution
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Residential */}
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Residential</span>
                    <span className="font-bold text-slate-900">{categories.RESIDENTIAL || 0}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full"
                      style={{
                        width: `${totalCategoryProps > 0 ? ((categories.RESIDENTIAL || 0) / totalCategoryProps) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Commercial */}
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Commercial</span>
                    <span className="font-bold text-slate-900">{categories.COMMERCIAL || 0}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{
                        width: `${totalCategoryProps > 0 ? ((categories.COMMERCIAL || 0) / totalCategoryProps) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Plot / Land */}
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Plots / Land</span>
                    <span className="font-bold text-slate-900">{categories.PLOT || 0}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{
                        width: `${totalCategoryProps > 0 ? ((categories.PLOT || 0) / totalCategoryProps) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Purpose Split */}
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Buy vs Rent</span>
                    <span className="font-bold text-slate-900">
                      {purposes.BUY || 0} / {purposes.RENT || 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 flex overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full"
                      style={{
                        width: `${
                          (purposes.BUY || 0) + (purposes.RENT || 0) > 0
                            ? ((purposes.BUY || 0) / ((purposes.BUY || 0) + (purposes.RENT || 0))) * 100
                            : 50
                        }%`,
                      }}
                    />
                    <div
                      className="bg-blue-500 h-full"
                      style={{
                        width: `${
                          (purposes.BUY || 0) + (purposes.RENT || 0) > 0
                            ? ((purposes.RENT || 0) / ((purposes.BUY || 0) + (purposes.RENT || 0))) * 100
                            : 50
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">
              Portfolio Value: {formatIndianPrice(portfolio.totalValue || 0)}
            </span>
            <Link
              to="/listings"
              className="text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>View Listings</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Sales & CRM Pipeline Funnel Strip */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>CRM Lead Conversion Pipeline</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Live funnel stages from buyer inquiry to closed deals
            </p>
          </div>
          <Link
            to="/leads"
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Kanban Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Funnel Stages Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Stage 1: New / Uncontacted */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                1. New Inquiries
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {funnel.NEW || 0}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Awaiting first response</span>
          </div>

          {/* Stage 2: Contacted */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                2. Contacted
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {funnel.CONTACTED || 0}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">In active discussion</span>
          </div>

          {/* Stage 3: Site Visit Scheduled */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                3. Visit Scheduled
              </span>
              <span className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {funnel.VISIT_SCHEDULED || 0}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">In-person inspection booked</span>
          </div>

          {/* Stage 4: Closed / Won */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                4. Closed / Won Deals
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-900 tracking-tight">
              {funnel.CLOSED_WON || 0}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium mt-1">
              Overall win rate: {crm.conversionRate || '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Live Operations Activity Feeds (Recent Inquiries + Upcoming Visits) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Feed A: Recent Inquiries */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recent Inquiries
                </h3>
              </div>
              <Link
                to="/leads"
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <span>View All Leads</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentEnquiries && recentEnquiries.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentEnquiries.map((enq) => (
                  <div key={enq._id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">
                          {enq.customerName || 'Inquirer'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatRelativeTime(enq.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {enq.propertyTitle || 'General Inquiry'} {enq.locality ? `• ${enq.locality}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {enq.budget && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {enq.budget}
                        </span>
                      )}
                      <Badge
                        variant={
                          enq.leadStatus === 'CLOSED_WON'
                            ? 'success'
                            : enq.leadStatus === 'NEW'
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {enq.leadStatus || 'NEW'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-400">
                No recent inquiries received yet.
              </div>
            )}
          </div>
        </div>

        {/* Feed B: Scheduled Site Visits */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Scheduled Site Visits
                </h3>
              </div>
              <Link
                to="/site-visits"
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <span>View All Visits</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentVisits && recentVisits.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentVisits.map((visit) => (
                  <div key={visit._id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">
                          {visit.customerName || 'Buyer'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {visit.preferredTimeSlot || 'Standard Slot'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {visit.property?.title || 'Nagpur Property'} {visit.property?.localityName ? `• ${visit.property.localityName}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {visit.assignedAgent && (
                        <span className="text-[10px] font-medium text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded hidden sm:inline">
                          {visit.assignedAgent.name}
                        </span>
                      )}
                      <Badge
                        variant={
                          visit.status === 'CONFIRMED' || visit.status === 'COMPLETED'
                            ? 'success'
                            : visit.status === 'REQUESTED'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {visit.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-400">
                No site visits recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
