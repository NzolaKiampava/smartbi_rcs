import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Eye,
  Calendar,
  Filter,
  Download,
  Share2,
  Maximize2,
  RefreshCw,
  Settings,
  PieChart,
  LineChart as LineChartIcon,
  Activity,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Globe,
  Database,
  AlertTriangle,
  CheckCircle2,
  Info,
  MoreHorizontal,
  Play,
  Pause,
  Calendar as CalendarIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';

// Mock data for analytics
const analyticsData = {
  kpis: [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: '$2,547,832',
      change: 12.5,
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'vs last month'
    },
    {
      id: 'users',
      title: 'Active Users',
      value: '124,596',
      change: 8.2,
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'vs last month'
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: '18,264',
      change: -3.1,
      trend: 'down',
      icon: ShoppingCart,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'vs last month'
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      value: '3.84%',
      change: 0.9,
      trend: 'up',
      icon: Target,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      description: 'vs last month'
    }
  ],
  revenueData: [
    { month: 'Jan', revenue: 185000, orders: 1240, users: 8200 },
    { month: 'Feb', revenue: 201000, orders: 1380, users: 9100 },
    { month: 'Mar', revenue: 187000, orders: 1290, users: 8950 },
    { month: 'Apr', revenue: 224000, orders: 1520, users: 10200 },
    { month: 'May', revenue: 267000, orders: 1680, users: 11500 },
    { month: 'Jun', revenue: 298000, orders: 1840, users: 12800 },
    { month: 'Jul', revenue: 312000, orders: 1920, users: 13200 },
    { month: 'Aug', revenue: 287000, orders: 1780, users: 12600 },
    { month: 'Sep', revenue: 331000, orders: 2010, users: 14100 },
    { month: 'Oct', revenue: 356000, orders: 2180, users: 15300 },
    { month: 'Nov', revenue: 389000, orders: 2340, users: 16200 },
    { month: 'Dec', revenue: 412000, orders: 2450, users: 17100 }
  ],
  channelData: [
    { channel: 'Organic Search', value: 35, color: '#3B82F6' },
    { channel: 'Direct', value: 28, color: '#10B981' },
    { channel: 'Social Media', value: 18, color: '#F59E0B' },
    { channel: 'Email', value: 12, color: '#EF4444' },
    { channel: 'Paid Ads', value: 7, color: '#8B5CF6' }
  ],
  performanceData: [
    { metric: 'Page Load Speed', score: 92, target: 95, color: '#10B981' },
    { metric: 'Uptime', score: 99.8, target: 99.9, color: '#3B82F6' },
    { metric: 'Error Rate', score: 0.2, target: 0.1, color: '#EF4444' },
    { metric: 'API Response Time', score: 145, target: 200, color: '#F59E0B' }
  ],
  geographicData: [
    { country: 'United States', users: 45280, percentage: 36.4 },
    { country: 'United Kingdom', users: 18960, percentage: 15.2 },
    { country: 'Germany', users: 12450, percentage: 10.0 },
    { country: 'Canada', users: 9870, percentage: 7.9 },
    { country: 'France', users: 8230, percentage: 6.6 },
    { country: 'Others', users: 29806, percentage: 23.9 }
  ]
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

const AnalyticsPage: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [isRealTime, setIsRealTime] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'users', 'orders']);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const KPICard = ({ kpi }: { kpi: any }) => (
    <div className={`${kpi.bgColor} rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-sm`}>
          <kpi.icon size={24} className="text-white" />
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
            kpi.trend === 'up' 
              ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' 
              : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
          }`}>
            {kpi.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(kpi.change)}%</span>
          </div>
          <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all">
            <MoreHorizontal size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {kpi.title}
        </h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {kpi.value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {kpi.description}
        </p>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, actions = true }: { title: string; children: React.ReactNode; actions?: boolean }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {actions && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Download chart">
              <Download size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Share chart">
              <Share2 size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Fullscreen">
              <Maximize2 size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="h-80">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Business Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Comprehensive business intelligence dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Real-time toggle */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isRealTime ? 'Live' : 'Paused'}
                </span>
              </div>
              <button
                onClick={() => setIsRealTime(!isRealTime)}
                className={`p-2 rounded-lg transition-colors ${
                  isRealTime 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                }`}
                title={isRealTime ? 'Pause real-time updates' : 'Resume real-time updates'}
              >
                {isRealTime ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>

            {/* Time range selector */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <Filter size={16} className="mr-2" />
                Filters
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <Settings size={16} className="mr-2" />
                Configure
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                <Download size={16} className="mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* KPI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsData.kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend Analysis">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={analyticsData.revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue ($)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={3} name="Orders" dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* User Growth */}
        <ChartCard title="User Growth & Engagement">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData.revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#8B5CF6" 
                fill="url(#userGradient)" 
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Traffic Sources */}
        <ChartCard title="Traffic Sources Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={analyticsData.channelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({ channel, value }) => `${channel}: ${value}%`}
                labelLine={false}
              >
                {analyticsData.channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Performance Metrics */}
        <ChartCard title="System Performance Metrics">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={analyticsData.performanceData}>
              <RadialBar 
                minAngle={15} 
                label={{ position: 'insideStart', fill: '#fff' }} 
                background 
                clockWise 
                dataKey="score" 
                fill="#3B82F6"
              />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Geographic Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Geographic Distribution</h3>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Globe size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {analyticsData.geographicData.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{country.country}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${country.percentage}%`, 
                        backgroundColor: COLORS[index % COLORS.length] 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {country.percentage}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-500 w-16 text-right">
                    {country.users.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Insights & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Insights</h3>
            </div>
            <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
              Auto-Generated
            </span>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/50">
              <div className="flex items-start space-x-3">
                <Info size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Revenue Optimization</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Revenue increased by 12.5% this month. Peak performance observed on weekends with mobile traffic contributing 67% of conversions.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700/50">
              <div className="flex items-start space-x-3">
                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">User Engagement</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    User engagement improved significantly. Average session duration increased by 23% with social media being the top acquisition channel.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700/50">
              <div className="flex items-start space-x-3">
                <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Attention Required</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Order volume decreased by 3.1%. Consider optimizing checkout process and implementing cart abandonment campaigns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Activity size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time Activity</h3>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400">Live</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { time: '2 mins ago', event: 'New user registered from Germany', type: 'user', icon: Users },
              { time: '5 mins ago', event: 'Order #12847 completed - $247.99', type: 'order', icon: ShoppingCart },
              { time: '8 mins ago', event: 'Database backup completed successfully', type: 'system', icon: Database },
              { time: '12 mins ago', event: 'New customer from social media campaign', type: 'marketing', icon: Target },
              { time: '15 mins ago', event: 'Performance alert: API response time improved', type: 'performance', icon: Zap }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className={`w-8 h-8 ${
                  activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'order' ? 'bg-green-100 text-green-600' :
                  activity.type === 'system' ? 'bg-gray-100 text-gray-600' :
                  activity.type === 'marketing' ? 'bg-purple-100 text-purple-600' :
                  'bg-orange-100 text-orange-600'
                } rounded-lg flex items-center justify-center`}>
                  <activity.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.event}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                    <Clock size={12} className="mr-1" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;