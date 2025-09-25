import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Target,
  Activity,
  Database,
  Globe,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Share2,
  Settings,
  Eye,
  Filter,
  Calendar,
  Sparkles,
  Crown,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Info,
  Bell,
  FileText,
  PieChart,
  LineChart as LineChartIcon,
  MoreHorizontal
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart
} from 'recharts';
import { format } from 'date-fns';

// Mock data for the overview dashboard
const dashboardData = {
  kpis: [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: '$2,847,392',
      change: 15.3,
      trend: 'up',
      icon: DollarSign,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      target: '$3,000,000',
      progress: 94.9
    },
    {
      id: 'users',
      title: 'Active Users',
      value: '156,847',
      change: 8.7,
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      target: '200,000',
      progress: 78.4
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: '24,891',
      change: -2.1,
      trend: 'down',
      icon: ShoppingCart,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      target: '30,000',
      progress: 83.0
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      value: '4.23%',
      change: 12.8,
      trend: 'up',
      icon: Target,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      target: '5.0%',
      progress: 84.6
    }
  ],
  revenueData: [
    { month: 'Jan', revenue: 185000, orders: 1240, users: 8200, profit: 45000 },
    { month: 'Feb', revenue: 201000, orders: 1380, users: 9100, profit: 52000 },
    { month: 'Mar', revenue: 187000, orders: 1290, users: 8950, profit: 48000 },
    { month: 'Apr', revenue: 224000, orders: 1520, users: 10200, profit: 58000 },
    { month: 'May', revenue: 267000, orders: 1680, users: 11500, profit: 67000 },
    { month: 'Jun', revenue: 298000, orders: 1840, users: 12800, profit: 75000 },
    { month: 'Jul', revenue: 312000, orders: 1920, users: 13200, profit: 78000 },
    { month: 'Aug', revenue: 287000, orders: 1780, users: 12600, profit: 72000 },
    { month: 'Sep', revenue: 331000, orders: 2010, users: 14100, profit: 82000 },
    { month: 'Oct', revenue: 356000, orders: 2180, users: 15300, profit: 89000 },
    { month: 'Nov', revenue: 389000, orders: 2340, users: 16200, profit: 97000 },
    { month: 'Dec', revenue: 412000, orders: 2450, users: 17100, profit: 103000 }
  ],
  categoryData: [
    { name: 'E-commerce', value: 35, revenue: 1200000, color: '#3B82F6' },
    { name: 'SaaS', value: 28, revenue: 980000, color: '#10B981' },
    { name: 'Consulting', value: 18, revenue: 630000, color: '#F59E0B' },
    { name: 'Digital Marketing', value: 12, revenue: 420000, color: '#EF4444' },
    { name: 'Other', value: 7, revenue: 245000, color: '#8B5CF6' }
  ],
  performanceMetrics: [
    { metric: 'System Uptime', value: 99.9, target: 99.5, status: 'excellent' },
    { metric: 'Query Response', value: 145, target: 200, status: 'good' },
    { metric: 'Data Processing', value: 2.3, target: 5.0, status: 'excellent' },
    { metric: 'Error Rate', value: 0.02, target: 0.1, status: 'excellent' }
  ],
  recentActivities: [
    {
      id: 1,
      user: 'João Silva',
      action: 'Generated Revenue Report',
      details: 'Q4 2024 comprehensive revenue analysis completed',
      timestamp: '2025-01-19T10:30:00Z',
      type: 'report',
      status: 'success'
    },
    {
      id: 2,
      user: 'Maria Santos',
      action: 'Database Connection',
      details: 'Connected to PostgreSQL production database',
      timestamp: '2025-01-19T10:25:00Z',
      type: 'database',
      status: 'success'
    },
    {
      id: 3,
      user: 'Carlos Eduardo',
      action: 'AI Query Execution',
      details: 'Natural language query processed successfully',
      timestamp: '2025-01-19T10:20:00Z',
      type: 'ai',
      status: 'success'
    },
    {
      id: 4,
      user: 'Ana Paula',
      action: 'Data Export Failed',
      details: 'Large dataset export exceeded timeout limit',
      timestamp: '2025-01-19T10:15:00Z',
      type: 'export',
      status: 'error'
    }
  ],
  topInsights: [
    {
      id: 1,
      title: 'Revenue Growth Acceleration',
      description: 'Q4 revenue increased by 23% compared to Q3, driven by enterprise client acquisitions',
      impact: 'high',
      category: 'revenue',
      confidence: 94
    },
    {
      id: 2,
      title: 'User Engagement Peak',
      description: 'Daily active users reached all-time high with 67% increase in session duration',
      impact: 'medium',
      category: 'engagement',
      confidence: 87
    },
    {
      id: 3,
      title: 'Conversion Optimization',
      description: 'New checkout flow improved conversion rate by 12.8% across all channels',
      impact: 'high',
      category: 'conversion',
      confidence: 91
    }
  ]
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

const OverviewPage: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [isRealTime, setIsRealTime] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const KPICard = ({ kpi }: { kpi: any }) => (
    <div className={`${kpi.bgColor} rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <kpi.icon size={28} className="text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
              kpi.trend === 'up' 
                ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30' 
                : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
            }`}>
              {kpi.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{Math.abs(kpi.change)}%</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              {kpi.title}
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {kpi.value}
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Progress to Target</span>
              <span>{kpi.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${kpi.color} transition-all duration-500`}
                style={{ width: `${kpi.progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Target: {kpi.target}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, icon: Icon, actions = true }: { title: string; children: React.ReactNode; icon: any; actions?: boolean }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-lg transition-shadow">
            <Icon size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time analytics</p>
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Download size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Share2 size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Settings size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="h-80">
        {children}
      </div>
    </div>
  );

  const InsightCard = ({ insight }: { insight: any }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          insight.impact === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
          insight.impact === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
          'bg-blue-100 dark:bg-blue-900/30'
        }`}>
          <Sparkles size={20} className={
            insight.impact === 'high' ? 'text-red-600 dark:text-red-400' :
            insight.impact === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-blue-600 dark:text-blue-400'
          } />
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            insight.category === 'revenue' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            insight.category === 'engagement' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
          }`}>
            {insight.category}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{insight.confidence}% confidence</span>
        </div>
      </div>
      
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {insight.title}
      </h4>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        {insight.description}
      </p>
      
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            insight.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {insight.impact} impact
          </span>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }: { activity: any }) => (
    <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
        activity.status === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
        'bg-blue-100 dark:bg-blue-900/30'
      }`}>
        {activity.type === 'report' && <FileText size={16} className="text-green-600 dark:text-green-400" />}
        {activity.type === 'database' && <Database size={16} className="text-blue-600 dark:text-blue-400" />}
        {activity.type === 'ai' && <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />}
        {activity.type === 'export' && <Download size={16} className="text-orange-600 dark:text-orange-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{activity.action}</h4>
          <div className="flex items-center space-x-2">
            {activity.status === 'success' ? (
              <CheckCircle2 size={14} className="text-green-500" />
            ) : (
              <AlertTriangle size={14} className="text-red-500" />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {format(new Date(activity.timestamp), 'HH:mm')}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.details}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">by {activity.user}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Professional Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.3),transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,rgba(147,51,234,0.3),transparent_50%)]"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Business Intelligence Overview</h1>
                  <p className="text-xl text-blue-100">Real-time insights and comprehensive analytics dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Real-time Status */}
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <div className={`w-3 h-3 rounded-full ${isRealTime ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium">
                    {isRealTime ? 'Live Data' : 'Paused'}
                  </span>
                  <span className="text-sm text-blue-200">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
                    title="Refresh data"
                  >
                    <RefreshCw size={20} className={`text-white ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20">
                    <Download size={20} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-white/50"
                >
                  <option value="24h" className="text-gray-900">Last 24 Hours</option>
                  <option value="7d" className="text-gray-900">Last 7 Days</option>
                  <option value="30d" className="text-gray-900">Last 30 Days</option>
                  <option value="90d" className="text-gray-900">Last 90 Days</option>
                  <option value="1y" className="text-gray-900">Last Year</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-blue-100">
                <div className="flex items-center space-x-2">
                  <Shield size={16} />
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe size={16} />
                  <span>Global Access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown size={16} />
                  <span>Premium Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardData.kpis.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend */}
        <ChartCard title="Revenue & Growth Analysis" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dashboardData.revenueData}>
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
              <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} name="Profit" dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* User Analytics */}
        <ChartCard title="User Growth & Engagement" icon={Users}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboardData.revenueData}>
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
                strokeWidth={3}
                name="Active Users"
              />
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Distribution */}
        <ChartCard title="Revenue by Category" icon={PieChart}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={dashboardData.categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {dashboardData.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <Activity size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Performance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Key performance indicators</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {dashboardData.performanceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{metric.metric}</span>
                    <span className={`text-sm font-semibold ${
                      metric.status === 'excellent' ? 'text-green-600 dark:text-green-400' :
                      metric.status === 'good' ? 'text-blue-600 dark:text-blue-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {metric.value}{metric.metric.includes('Rate') ? '%' : metric.metric.includes('Time') ? 'ms' : metric.metric.includes('Processing') ? 's' : '%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.status === 'excellent' ? 'bg-green-500' :
                        metric.status === 'good' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Target: {metric.target}{metric.metric.includes('Rate') ? '%' : metric.metric.includes('Time') ? 'ms' : metric.metric.includes('Processing') ? 's' : '%'}</span>
                    <span className={`font-medium ${
                      metric.status === 'excellent' ? 'text-green-600 dark:text-green-400' :
                      metric.status === 'good' ? 'text-blue-600 dark:text-blue-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {metric.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
                <Clock size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Latest system events</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              View All →
            </button>
          </div>
          
          <div className="space-y-2">
            {dashboardData.recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI-Powered Insights</h2>
              <p className="text-gray-600 dark:text-gray-400">Intelligent recommendations based on your data</p>
            </div>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <Eye size={16} className="mr-2" />
            View All Insights
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData.topInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">Frequently used features</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FileText, label: 'Generate Report', color: 'from-blue-500 to-cyan-600', description: 'Create new analytics report' },
            { icon: Database, label: 'Connect Database', color: 'from-green-500 to-emerald-600', description: 'Add new data source' },
            { icon: Sparkles, label: 'AI Analysis', color: 'from-purple-500 to-violet-600', description: 'Run AI-powered analysis' },
            { icon: Download, label: 'Export Data', color: 'from-orange-500 to-red-600', description: 'Export current dataset' }
          ].map((action, index) => (
            <button
              key={index}
              className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <action.icon size={24} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {action.label}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;