import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  User, 
  Clock, 
  LogOut, 
  LogIn, 
  FileText, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  Users,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Eye,
  MoreVertical,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<any>;
  color: string;
  category: 'auth' | 'data' | 'system' | 'user';
  severity: 'low' | 'medium' | 'high';
  device?: string;
  location?: string;
  ipAddress?: string;
}

interface RecentActivity {
  id: number;
  user: string;
  activity: string;
  details: string;
  timestamp: string;
  icon: React.ComponentType<any>;
  color: string;
  category: 'view' | 'edit' | 'delete' | 'create';
  module: string;
  duration?: number;
}

// Enhanced mock data with more realistic information
const userLogs: ActivityLog[] = [
  {
    id: 1,
    user: 'João Silva',
    action: 'Login',
    description: 'Usuário fez login na plataforma via SSO',
    timestamp: '2025-01-19 09:15',
    icon: LogIn,
    color: 'bg-green-500',
    category: 'auth',
    severity: 'low',
    device: 'Desktop',
    location: 'Luanda, Angola',
    ipAddress: '192.168.1.100'
  },
  {
    id: 2,
    user: 'Maria Santos',
    action: 'Failed Login',
    description: 'Tentativa de login falhada - credenciais inválidas',
    timestamp: '2025-01-19 09:12',
    icon: AlertTriangle,
    color: 'bg-red-500',
    category: 'auth',
    severity: 'high',
    device: 'Mobile',
    location: 'Benguela, Angola',
    ipAddress: '192.168.1.105'
  },
  {
    id: 3,
    user: 'Carlos Eduardo',
    action: 'Login',
    description: 'Usuário fez login na plataforma',
    timestamp: '2025-01-19 08:45',
    icon: LogIn,
    color: 'bg-green-500',
    category: 'auth',
    severity: 'low',
    device: 'Tablet',
    location: 'Huambo, Angola',
    ipAddress: '192.168.1.102'
  },
  {
    id: 4,
    user: 'Ana Paula',
    action: 'Logout',
    description: 'Usuário saiu da plataforma',
    timestamp: '2025-01-19 08:30',
    icon: LogOut,
    color: 'bg-orange-500',
    category: 'auth',
    severity: 'low',
    device: 'Desktop',
    location: 'Lobito, Angola',
    ipAddress: '192.168.1.103'
  }
];

const recentActivities: RecentActivity[] = [
  {
    id: 1,
    user: 'Maria Souza',
    activity: 'Visualizou Relatório',
    details: 'Relatório de vendas Q4 2024 acessado',
    timestamp: '2025-01-19 09:20',
    icon: FileText,
    color: 'bg-blue-500',
    category: 'view',
    module: 'Reports',
    duration: 45
  },
  {
    id: 2,
    user: 'Carlos Lima',
    activity: 'Editou Dashboard',
    details: 'Dashboard de performance atualizado',
    timestamp: '2025-01-19 09:18',
    icon: Edit,
    color: 'bg-yellow-500',
    category: 'edit',
    module: 'Analytics',
    duration: 120
  },
  {
    id: 3,
    user: 'Ana Paula',
    activity: 'Criou Conexão',
    details: 'Nova conexão PostgreSQL configurada',
    timestamp: '2025-01-19 09:15',
    icon: Database,
    color: 'bg-purple-500',
    category: 'create',
    module: 'Database',
    duration: 180
  },
  {
    id: 4,
    user: 'Pedro Santos',
    activity: 'Exportou Dados',
    details: 'Relatório financeiro exportado em Excel',
    timestamp: '2025-01-19 09:10',
    icon: Download,
    color: 'bg-green-500',
    category: 'view',
    module: 'Reports',
    duration: 30
  },
  {
    id: 5,
    user: 'Sofia Costa',
    activity: 'Removeu Usuário',
    details: 'Usuário "teste@example.com" removido do sistema',
    timestamp: '2025-01-19 09:05',
    icon: Trash2,
    color: 'bg-red-500',
    category: 'delete',
    module: 'Users',
    duration: 15
  }
];

const historyActivities: RecentActivity[] = [
  {
    id: 1,
    user: 'Carlos Lima',
    activity: 'Configurou Alertas',
    details: 'Alertas de performance configurados',
    timestamp: '2025-01-18 16:10',
    icon: Settings,
    color: 'bg-indigo-500',
    category: 'edit',
    module: 'Performance',
    duration: 90
  },
  {
    id: 2,
    user: 'Maria Souza',
    activity: 'Criou Usuário',
    details: 'Novo usuário "admin@company.com" cadastrado',
    timestamp: '2025-01-18 14:45',
    icon: User,
    color: 'bg-green-500',
    category: 'create',
    module: 'Users',
    duration: 60
  },
  {
    id: 3,
    user: 'João Silva',
    activity: 'Atualizou Permissões',
    details: 'Permissões de acesso atualizadas para equipe de vendas',
    timestamp: '2025-01-18 11:30',
    icon: Shield,
    color: 'bg-blue-500',
    category: 'edit',
    module: 'Security',
    duration: 45
  }
];

const ActivityPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | string>('all');
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Enhanced filtering function
  const filterFn = (item: any, fields: string[]) => {
    const s = search.toLowerCase();
    const matchText = fields.some(f => (item[f] || '').toLowerCase().includes(s));
    
    // Date filter
    if (dateStart || dateEnd) {
      const itemDate = item.timestamp.split(' ')[0];
      if (dateStart && itemDate < dateStart) return false;
      if (dateEnd && itemDate > dateEnd) return false;
    }
    
    // Category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    
    // Severity filter (for logs)
    if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
    
    return matchText;
  };

  const filteredUserLogs = userLogs.filter(log =>
    filterFn(log, ['user', 'action', 'description', 'timestamp'])
  );

  const filteredRecentActivities = recentActivities.filter(act =>
    filterFn(act, ['user', 'activity', 'details', 'timestamp'])
  );

  const filteredHistoryActivities = historyActivities.filter(act =>
    filterFn(act, ['user', 'activity', 'details', 'timestamp'])
  );

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case 'mobile': return <Smartphone size={14} className="text-gray-500" />;
      case 'tablet': return <Tablet size={14} className="text-gray-500" />;
      case 'desktop': return <Monitor size={14} className="text-gray-500" />;
      default: return <Monitor size={14} className="text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auth': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'data': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'system': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      case 'user': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      case 'view': return 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30';
      case 'edit': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'delete': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'create': return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  // Calculate statistics
  const totalActivities = userLogs.length + recentActivities.length + historyActivities.length;
  const authEvents = userLogs.length;
  const dataEvents = recentActivities.filter(a => a.category === 'view' || a.category === 'edit').length;
  const systemEvents = recentActivities.filter(a => a.category === 'create' || a.category === 'delete').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Professional Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">System Activity Monitor</h1>
                  <p className="text-lg text-indigo-100">Real-time tracking of user actions and system events</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  <RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 font-medium rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                  <Download size={18} className="mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Real-time Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Activity size={20} className="text-blue-300" />
                  </div>
                  <div className="flex items-center space-x-1 text-blue-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Live</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{totalActivities}</div>
                <div className="text-sm text-indigo-100">Total Events</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Shield size={20} className="text-green-300" />
                  </div>
                  <div className="flex items-center space-x-1 text-green-300">
                    <TrendingUp size={14} />
                    <span className="text-xs font-medium">+12%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{authEvents}</div>
                <div className="text-sm text-indigo-100">Auth Events</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Database size={20} className="text-purple-300" />
                  </div>
                  <div className="flex items-center space-x-1 text-purple-300">
                    <TrendingUp size={14} />
                    <span className="text-xs font-medium">+8%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{dataEvents}</div>
                <div className="text-sm text-indigo-100">Data Events</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Settings size={20} className="text-orange-300" />
                  </div>
                  <div className="flex items-center space-x-1 text-orange-300">
                    <Clock size={14} />
                    <span className="text-xs font-medium">{currentTime}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{systemEvents}</div>
                <div className="text-sm text-indigo-100">System Events</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Filter size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Activities
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Search by user, action, or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="auth">Authentication</option>
              <option value="data">Data Operations</option>
              <option value="system">System Events</option>
              <option value="user">User Management</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Levels</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredUserLogs.length + filteredRecentActivities.length + filteredHistoryActivities.length} of {totalActivities} activities
              </span>
              {(search || categoryFilter !== 'all' || severityFilter !== 'all' || dateStart || dateEnd) && (
                <button
                  onClick={() => {
                    setSearch('');
                    setCategoryFilter('all');
                    setSeverityFilter('all');
                    setDateStart('');
                    setDateEnd('');
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live monitoring active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Authentication Logs</h3>
              <p className="text-gray-600 dark:text-gray-400">User login and logout activities</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <CheckCircle size={14} className="mr-1" />
              {filteredUserLogs.filter(log => log.action === 'Login').length} successful logins
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User & Device</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location & Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Security</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUserLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <Activity size={24} className="mx-auto mb-2 opacity-50" />
                    <p>No authentication logs found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUserLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {log.user.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{log.user}</div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            {getDeviceIcon(log.device)}
                            <span>{log.device}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${log.color}`}>
                          <log.icon size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{log.action}</div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
                            {log.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700 dark:text-gray-300">{log.description}</div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getSeverityColor(log.severity)}`}>
                        {log.severity} priority
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-900 dark:text-white">
                          <Globe size={14} className="text-gray-400" />
                          <span>{log.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock size={14} />
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {log.ipAddress}
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 dark:text-green-400">Secure</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
              <p className="text-gray-600 dark:text-gray-400">Latest user actions and system operations</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredRecentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <FileText size={24} className="mx-auto mb-2 opacity-50" />
              <p>No recent activities found matching your filters.</p>
            </div>
          ) : (
            filteredRecentActivities.map((activity) => (
              <div key={activity.id} className="group p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${activity.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <activity.icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{activity.activity}</h4>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
                          {activity.category}
                        </div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          {activity.module}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{activity.details}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <User size={14} />
                          <span className="font-medium">{activity.user}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock size={14} />
                          <span>{activity.timestamp}</span>
                        </div>
                        {activity.duration && (
                          <div className="flex items-center space-x-2">
                            <TrendingUp size={14} />
                            <span>{activity.duration}s duration</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Historical Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Historical Activities</h3>
              <p className="text-gray-600 dark:text-gray-400">Previous days activities and system events</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredHistoryActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <Calendar size={24} className="mx-auto mb-2 opacity-50" />
              <p>No historical activities found matching your filters.</p>
            </div>
          ) : (
            filteredHistoryActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                <div className={`p-3 rounded-lg ${activity.color} shadow-sm`}>
                  <activity.icon size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{activity.activity}</h4>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
                      {activity.category}
                    </div>
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                      {activity.module}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{activity.details}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <User size={12} />
                      <span>{activity.user}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{activity.timestamp}</span>
                    </div>
                    {activity.duration && (
                      <div className="flex items-center space-x-1">
                        <TrendingUp size={12} />
                        <span>{activity.duration}s</span>
                      </div>
                    )}
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;