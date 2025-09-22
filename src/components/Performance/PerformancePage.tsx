import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Database, 
  Users, 
  Server,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Download,
  Settings
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PerformancePage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  // const [selectedMetric, setSelectedMetric] = useState<string>('response_time');


  // Mock performance data
  const [systemMetrics, setSystemMetrics] = useState<any[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<any[]>([]);
  const [queryPerformanceData, setQueryPerformanceData] = useState<any[]>([]);
  const [resourceUtilizationData, setResourceUtilizationData] = useState<any[]>([]);
  const [userActivityData, setUserActivityData] = useState<any[]>([]);

  function fetchPerformanceData() {
    setSystemMetrics([
      {
        id: 'response_time',
        title: 'Avg Response Time',
        value: `${Math.floor(200 + Math.random() * 100)}ms`,
        change: parseFloat((Math.random() * 20 - 10).toFixed(1)),
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
        icon: Clock,
        color: 'bg-blue-500',
        target: '< 300ms',
        status: 'good'
      },
      {
        id: 'query_throughput',
        title: 'Query Throughput',
        value: `${Math.floor(1000 + Math.random() * 500)}/min`,
        change: parseFloat((Math.random() * 30 - 10).toFixed(1)),
        changeType: 'increase',
        icon: Database,
        color: 'bg-green-500',
        target: '> 1,000/min',
        status: 'excellent'
      },
      {
        id: 'active_users',
        title: 'Active Users',
        value: `${Math.floor(2000 + Math.random() * 1000)}`,
        change: parseFloat((Math.random() * 10 - 5).toFixed(1)),
        changeType: 'increase',
        icon: Users,
        color: 'bg-purple-500',
        target: '< 3,000',
        status: 'good'
      },
      {
        id: 'system_uptime',
        title: 'System Uptime',
        value: `${(99.9 + Math.random() * 0.1).toFixed(2)}%`,
        change: parseFloat((Math.random() * 0.1).toFixed(2)),
        changeType: 'increase',
        icon: Server,
        color: 'bg-emerald-500',
        target: '> 99.9%',
        status: 'excellent'
      },
      {
        id: 'data_processed',
        title: 'Data Processed',
        value: `${Math.floor(500 + Math.random() * 500)}GB`,
        change: parseFloat((Math.random() * 30).toFixed(1)),
        changeType: 'increase',
        icon: BarChart3,
        color: 'bg-orange-500',
        target: '< 1TB',
        status: 'good'
      },
      {
        id: 'error_rate',
        title: 'Error Rate',
        value: `${(Math.random() * 0.1).toFixed(2)}%`,
        change: parseFloat((Math.random() * 50 - 25).toFixed(1)),
        changeType: 'decrease',
        icon: AlertTriangle,
        color: 'bg-red-500',
        target: '< 0.1%',
        status: 'excellent'
      }
    ]);

    setResponseTimeData([
      { time: '00:00', response_time: 200 + Math.random() * 100, queries: 800 + Math.random() * 400, users: 1000 + Math.random() * 1000 },
      { time: '04:00', response_time: 200 + Math.random() * 100, queries: 800 + Math.random() * 400, users: 1000 + Math.random() * 1000 },
      { time: '08:00', response_time: 200 + Math.random() * 100, queries: 800 + Math.random() * 400, users: 1000 + Math.random() * 1000 },
      { time: '12:00', response_time: 200 + Math.random() * 100, queries: 800 + Math.random() * 400, users: 1000 + Math.random() * 1000 },
      { time: '16:00', response_time: 200 + Math.random() * 100, queries: 800 + Math.random() * 400, users: 1000 + Math.random() * 1000 },
      { time: '20:00', response_time: 200 + Math.random() * 100, queries: 800 + Math.random() * 400, users: 1000 + Math.random() * 1000 }
    ]);

    setQueryPerformanceData([
      { category: 'Dashboard Queries', avg_time: 100 + Math.random() * 100, count: 12000 + Math.floor(Math.random() * 1000), success_rate: 99 + Math.random() },
      { category: 'Report Generation', avg_time: 2000 + Math.random() * 500, count: 3000 + Math.floor(Math.random() * 500), success_rate: 98 + Math.random() * 2 },
      { category: 'Data Export', avg_time: 4000 + Math.random() * 1000, count: 800 + Math.floor(Math.random() * 200), success_rate: 98 + Math.random() * 2 },
      { category: 'Real-time Analytics', avg_time: 50 + Math.random() * 100, count: 8000 + Math.floor(Math.random() * 2000), success_rate: 99 + Math.random() },
      { category: 'AI Analysis', avg_time: 5000 + Math.random() * 1000, count: 500 + Math.floor(Math.random() * 100), success_rate: 97 + Math.random() * 3 }
    ]);

    setResourceUtilizationData([
      { name: 'CPU Usage', value: Math.floor(50 + Math.random() * 40), color: '#3B82F6' },
      { name: 'Memory Usage', value: Math.floor(50 + Math.random() * 40), color: '#10B981' },
      { name: 'Storage Usage', value: Math.floor(30 + Math.random() * 40), color: '#F59E0B' },
      { name: 'Network I/O', value: Math.floor(20 + Math.random() * 40), color: '#EF4444' }
    ]);

    setUserActivityData(Array.from({ length: 12 }, (_, i) => ({
      hour: String(i * 2).padStart(2, '0'),
      active_users: Math.floor(100 + Math.random() * 1000),
      sessions: Math.floor(80 + Math.random() * 800),
      page_views: Math.floor(500 + Math.random() * 4000)
    })));
  }

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'good': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'critical':
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">System Performance</h2>
              <p className="text-blue-100">Real-time monitoring and analytics performance metrics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              <option value="24h" className="text-gray-900">Last 24 Hours</option>
              <option value="7d" className="text-gray-900">Last 7 Days</option>
              <option value="30d" className="text-gray-900">Last 30 Days</option>
              <option value="90d" className="text-gray-900">Last 90 Days</option>
            </select>
            <button className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors">
              <RefreshCw size={20} className="text-white" />
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-6 text-sm text-blue-100">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>All Systems Operational</span>
          </div>
          <span>•</span>
          <span>Last Updated: {new Date().toLocaleTimeString()}</span>
          <span>•</span>
          <span>Monitoring 24/7</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.changeType === 'increase' ? metric.id !== 'error_rate' : metric.id === 'error_rate';
          
          return (
            <div key={metric.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`${metric.color} p-3 rounded-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {getStatusIcon(metric.status)}
                    <span className="capitalize">{metric.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-1 text-sm ${
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Target: {metric.target}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Response Time Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Response Time & Load</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">System response time, query volume, and active users</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Download size={16} />
            </button>
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Settings size={16} />
            </button>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="response_time" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Response Time (ms)"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="users" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Active Users"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Query Performance</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average response time by query type</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {queryPerformanceData.map((query, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{query.category}</h4>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {formatDuration(query.avg_time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{query.count.toLocaleString()} queries</span>
                    <span className={`${query.success_rate >= 99 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {query.success_rate}% success
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((query.avg_time / 6000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resource Utilization</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current system resource usage</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={resourceUtilizationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {resourceUtilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            {resourceUtilizationData.map((resource, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{resource.value}%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{resource.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Activity</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active users and session data over 24 hours</p>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="active_users"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
                name="Active Users"
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stackId="2"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                name="Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Alerts</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Recent system alerts and notifications</p>
          </div>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <CheckCircle size={20} className="text-green-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-400">System Performance Optimized</p>
              <p className="text-xs text-green-600 dark:text-green-300 mt-1">Response time improved by 15% after cache optimization</p>
              <p className="text-xs text-green-500 dark:text-green-400 mt-1">2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <Activity size={20} className="text-blue-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-400">High Query Volume Detected</p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Query throughput increased by 25% - system handling load well</p>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">15 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <AlertTriangle size={20} className="text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Memory Usage Above 70%</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">Consider scaling resources if usage continues to increase</p>
              <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;