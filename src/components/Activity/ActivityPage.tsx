import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  User, 
  Clock, 
  FileText, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  Sparkles,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  MoreVertical,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  X,
  Zap,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import SectionHeader from '../Common/SectionHeader';
import { graphqlService, type AIQueryResult, type FileUpload } from '../../services/graphqlService';

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<unknown>;
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
  icon: React.ComponentType<unknown>;
  color: string;
  category: 'view' | 'edit' | 'delete' | 'create';
  domainCategory?: ActivityLog['category'];
  module: string;
  duration?: number;
}

type UnifiedSource = 'query' | 'file';
type UnifiedStatus = 'success' | 'error' | 'warning';

interface UnifiedActivity {
  id: string;
  timestamp: string;
  source: UnifiedSource;
  status: UnifiedStatus;
  user: string;
  title: string;
  description: string;
  module: string;
  actionCategory: RecentActivity['category'];
  severity: ActivityLog['severity'];
  category: ActivityLog['category'];
  icon: React.ComponentType<unknown>;
  color: string;
  device?: string;
  location?: string;
  ipAddress?: string;
  durationSeconds?: number;
}

const RANGE_IN_DAYS: Record<string, number> = {
  today: 1,
  week: 7,
  month: 30,
  quarter: 120
};

const getRangeStart = (rangeKey: string): Date => {
  const days = RANGE_IN_DAYS[rangeKey] ?? 7;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
};

const SUCCESS_STATUS_HINTS = ['SUCCESS', 'COMPLETED', 'DONE', 'OK'];
const FAILURE_STATUS_HINTS = ['FAIL', 'ERROR', 'TIMEOUT'];

const statusFromBackend = (status?: string | null): UnifiedStatus => {
  if (!status) return 'warning';
  const upper = status.toUpperCase();
  if (FAILURE_STATUS_HINTS.some((hint) => upper.includes(hint))) return 'error';
  if (SUCCESS_STATUS_HINTS.some((hint) => upper.includes(hint))) return 'success';
  return 'warning';
};

const severityFromStatus = (status: UnifiedStatus): ActivityLog['severity'] => {
  if (status === 'error') return 'high';
  if (status === 'warning') return 'medium';
  return 'low';
};

const colorFromSource = (source: UnifiedSource, status: UnifiedStatus): string => {
  if (status === 'error') return 'bg-red-500';
  if (status === 'warning') return 'bg-yellow-500';
  return source === 'file' ? 'bg-emerald-500' : 'bg-blue-500';
};

const deviceFromSource = (source: UnifiedSource): string => (source === 'file' ? 'Uploader' : 'API Gateway');

const locationFromSource = (source: UnifiedSource): string => (source === 'file' ? 'Object Storage' : 'Analytics Engine');

const formatTimestamp = (value?: string | null): string => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return format(parsed, 'yyyy-MM-dd HH:mm');
};

const lastDigits = (value: string): string => {
  if (!value) return '000000';
  return value.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase().padStart(6, '0');
};

const mapQueryToUnifiedActivity = (query: AIQueryResult): UnifiedActivity => {
  const status = statusFromBackend(query.status);
  const durationSeconds = query.executionTime ? Math.round(query.executionTime / 1000) : undefined;
  return {
    id: `query-${query.id}`,
    timestamp: query.createdAt,
    source: 'query',
    status,
    user: 'AI Query Service',
    title: status === 'error' ? 'AI Query Failed' : 'AI Query Executed',
    description: query.naturalQuery || query.generatedQuery || 'Consulta processada',
    module: 'AI Analytics',
    actionCategory: status === 'error' ? 'delete' : 'view',
    severity: severityFromStatus(status),
    category: 'data',
    icon: Sparkles,
    color: colorFromSource('query', status),
    device: deviceFromSource('query'),
    location: locationFromSource('query'),
    ipAddress: `QRY-${lastDigits(query.id)}`,
    durationSeconds
  };
};

const mapFileToUnifiedActivity = (file: FileUpload): UnifiedActivity => {
  const status = statusFromBackend(file.analysisReport?.status ?? 'COMPLETED');
  const durationMs = file.analysisReport?.executionTime;
  return {
    id: `file-${file.id}`,
    timestamp: file.uploadedAt,
    source: 'file',
    status,
    user: (file.metadata as { uploadedBy?: string } | undefined)?.uploadedBy || 'Upload Service',
    title: status === 'error' ? 'File Analysis Failed' : 'File Uploaded',
    description: file.originalName || file.filename,
    module: 'File Processing',
    actionCategory: 'create',
    severity: severityFromStatus(status),
    category: 'system',
    icon: FileText,
    color: colorFromSource('file', status),
    device: deviceFromSource('file'),
    location: locationFromSource('file'),
    ipAddress: `FILE-${lastDigits(file.id)}`,
    durationSeconds: durationMs ? Math.round(durationMs / 1000) : undefined
  };
};

const toActivityLog = (activity: UnifiedActivity, index: number): ActivityLog => ({
  id: index + 1,
  user: activity.user,
  action: activity.title,
  description: activity.description,
  timestamp: formatTimestamp(activity.timestamp),
  icon: activity.status === 'error' ? AlertTriangle : activity.status === 'warning' ? Clock : CheckCircle,
  color: activity.color,
  category: activity.category,
  severity: activity.severity,
  device: activity.device,
  location: activity.location,
  ipAddress: activity.ipAddress
});

const toRecentActivity = (activity: UnifiedActivity, index: number): RecentActivity => ({
  id: index + 1,
  user: activity.user,
  activity: activity.title,
  details: activity.description,
  timestamp: formatTimestamp(activity.timestamp),
  icon: activity.icon,
  color: activity.color,
  category: activity.actionCategory,
  domainCategory: activity.category,
  module: activity.module,
  duration: activity.durationSeconds
});

const ActivityPage: React.FC = () => {
  const [userLogsData, setUserLogsData] = useState<ActivityLog[]>([]);
  const [recentActivitiesData, setRecentActivitiesData] = useState<RecentActivity[]>([]);
  const [historyActivitiesData, setHistoryActivitiesData] = useState<RecentActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [isUsingRealData, setIsUsingRealData] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [search, setSearch] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | string>('all');
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  
  // Pagination states
  const [logsCurrentPage, setLogsCurrentPage] = useState(1);
  const [recentCurrentPage, setRecentCurrentPage] = useState(1);
  const logsPerPage = 10;
  const recentPerPage = 6;
  
  // Modal state
  const [selectedActivity, setSelectedActivity] = useState<RecentActivity | null>(null);

  const fetchActivities = useCallback(async (options?: { manual?: boolean }) => {
    if (options?.manual) {
      setIsRefreshing(true);
    }
    setActivityLoading(true);
    setActivityError(null);

    try {
      const rangeStart = getRangeStart(selectedTimeRange);

      const [queries, files] = await Promise.all([
        graphqlService
          .getQueryHistory()
          .catch((error) => {
            console.error('Failed to load query history for activity page:', error);
            return [] as AIQueryResult[];
          }),
        graphqlService
          .listFileUploads(200)
          .catch((error) => {
            console.error('Failed to load file uploads for activity page:', error);
            return [] as FileUpload[];
          })
      ]);

      const relevantQueries = queries.filter((query) => {
        if (!query.createdAt) return false;
        const createdAt = new Date(query.createdAt);
        return !Number.isNaN(createdAt.getTime()) && createdAt >= rangeStart;
      });

      const relevantFiles = files.filter((file) => {
        if (!file.uploadedAt) return false;
        const uploadedAt = new Date(file.uploadedAt);
        return !Number.isNaN(uploadedAt.getTime()) && uploadedAt >= rangeStart;
      });

      const unifiedActivities = [
        ...relevantQueries.map(mapQueryToUnifiedActivity),
        ...relevantFiles.map(mapFileToUnifiedActivity)
      ]
        .filter((activity) => !!activity.timestamp)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Show all system activities in the logs table
      // This includes AI queries, file uploads, and any future auth events
      const activityLogs = unifiedActivities
        .slice(0, 30)
        .map(toActivityLog);

      // Recent activities: most recent items (up to 18)
      // Historical activities: older items (from position 6 onwards, up to 48 total)
      const recentCount = Math.min(6, unifiedActivities.length);
      const historicalStart = recentCount;
      
      setUserLogsData(activityLogs);
      setRecentActivitiesData(unifiedActivities.slice(0, recentCount).map(toRecentActivity));
      setHistoryActivitiesData(unifiedActivities.slice(historicalStart, 48).map(toRecentActivity));
      setIsUsingRealData(true);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Unexpected failure while loading activity feed:', error);
      setActivityError(error instanceof Error ? error.message : 'Não foi possível carregar as atividades.');
      setUserLogsData([]);
      setRecentActivitiesData([]);
      setHistoryActivitiesData([]);
      setIsUsingRealData(false);
    } finally {
      setActivityLoading(false);
      if (options?.manual) {
        setIsRefreshing(false);
      }
    }
  }, [selectedTimeRange]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchActivities();
    
    // Auto-refresh activities every 30 seconds to show real-time data
    const refreshInterval = setInterval(() => {
      fetchActivities();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchActivities]);

  const handleRefresh = useCallback(async () => {
    await fetchActivities({ manual: true });
  }, [fetchActivities]);

  // Reset pagination when filters change
  useEffect(() => {
    setLogsCurrentPage(1);
    setRecentCurrentPage(1);
  }, [search, categoryFilter, severityFilter, dateStart, dateEnd, selectedTimeRange]);

  // Enhanced filtering function
  type Filterable = {
    timestamp?: string | null;
    category?: string | null;
    severity?: string | null;
    domainCategory?: ActivityLog['category'];
  } & Record<string, unknown>;

  const CATEGORY_FILTER_OPTIONS: readonly ActivityLog['category'][] = ['auth', 'data', 'system', 'user'];

  const filterFn = <T extends Filterable>(item: T, fields: string[]) => {
    const s = search.toLowerCase();
    const matchText = fields.some((field) => {
      const value = item[field as keyof T];
      return typeof value === 'string' && value.toLowerCase().includes(s);
    });
    
    // Date filter
    if (dateStart || dateEnd) {
      const timestamp = typeof item.timestamp === 'string' ? item.timestamp : undefined;
      const itemDate = timestamp ? timestamp.split(' ')[0] : undefined;
      if (dateStart && (!itemDate || itemDate < dateStart)) return false;
      if (dateEnd && (!itemDate || itemDate > dateEnd)) return false;
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      const categoryValue = (item as { domainCategory?: ActivityLog['category']; category?: string }).domainCategory ?? item.category;
      if (typeof categoryValue !== 'string') return false;
      if (!CATEGORY_FILTER_OPTIONS.includes(categoryValue as ActivityLog['category'])) return false;
      if (categoryValue !== categoryFilter) return false;
    }
    
    // Severity filter (for logs)
    if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
    
    return matchText;
  };

  const filteredUserLogs = userLogsData.filter(log =>
    filterFn(log, ['user', 'action', 'description', 'timestamp'])
  );

  const filteredRecentActivities = recentActivitiesData.filter(act =>
    filterFn(act, ['user', 'activity', 'details', 'timestamp', 'category', 'domainCategory', 'module'])
  );

  const filteredHistoryActivities = historyActivitiesData.filter(act =>
    filterFn(act, ['user', 'activity', 'details', 'timestamp', 'category', 'domainCategory', 'module'])
  );

  // Pagination logic for logs
  const totalLogsPages = Math.ceil(filteredUserLogs.length / logsPerPage);
  const logsIndexOfLastItem = logsCurrentPage * logsPerPage;
  const logsIndexOfFirstItem = logsIndexOfLastItem - logsPerPage;
  const currentLogsItems = filteredUserLogs.slice(logsIndexOfFirstItem, logsIndexOfLastItem);

  // Pagination logic for recent activities
  const totalRecentPages = Math.ceil(filteredRecentActivities.length / recentPerPage);
  const recentIndexOfLastItem = recentCurrentPage * recentPerPage;
  const recentIndexOfFirstItem = recentIndexOfLastItem - recentPerPage;
  const currentRecentItems = filteredRecentActivities.slice(recentIndexOfFirstItem, recentIndexOfLastItem);

  const getDeviceIcon = (device?: string) => {
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
  const aggregatedActivities = [...recentActivitiesData, ...historyActivitiesData];
  const totalActivities = userLogsData.length + aggregatedActivities.length;
  const authEvents = userLogsData.length;
  const dataEvents = aggregatedActivities.filter(a => a.domainCategory === 'data').length;
  const systemEvents = aggregatedActivities.filter(a => a.domainCategory === 'system').length;

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
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-4xl font-bold text-white">System Activity Monitor</h1>
                    {isUsingRealData && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-indigo-100">
                    {isUsingRealData 
                      ? totalActivities > 0 
                        ? 'Monitoramento em tempo real de ações e eventos do sistema'
                        : 'Sistema pronto - Aguardando primeiras atividades'
                      : 'Erro ao carregar dados do sistema'}
                  </p>
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

      {activityError && (
        <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
          {activityError}
        </div>
      )}

      {activityLoading && !activityError && (
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200 px-4 py-3 rounded-xl flex items-center space-x-3">
          <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
          <span>A carregar atividades do sistema...</span>
        </div>
      )}

      {!activityLoading && !activityError && isUsingRealData && totalActivities === 0 && (
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 border border-blue-200 dark:border-gray-700 rounded-2xl p-8 text-center shadow-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity size={40} className="text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Nenhuma Atividade Registrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                O sistema está pronto e a monitorizar. As atividades aparecerão aqui assim que os utilizadores começarem a interagir com a plataforma.
              </p>
            </div>
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Database size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Execute Consultas AI</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FileText size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Faça Upload de Ficheiros</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <User size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Ações de Utilizadores</p>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RefreshCw size={18} className="mr-2" />
                Atualizar Agora
              </button>
            </div>
          </div>
        </div>
      )}

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
              id="activity-time-range"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              aria-label="Filter activities by time range"
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
            <label htmlFor="activity-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Activities
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input
                type="text"
                id="activity-search"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Search by user, action, or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="activity-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              id="activity-category"
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
            <label htmlFor="activity-severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Severity
            </label>
            <select
              id="activity-severity"
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
            <label htmlFor="activity-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="activity-start-date"
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="activity-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="activity-end-date"
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
              {isUsingRealData ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Dados reais do sistema</span>
                  {lastUpdateTime && (
                    <span className="text-xs">
                      (atualizado {lastUpdateTime.toLocaleTimeString()})
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Dados de exemplo</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <SectionHeader icon={Shield} title="Activity Logs" subtitle="System operations and user activities" />
            {isUsingRealData && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                Real-time
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <CheckCircle size={14} className="mr-1" />
              {filteredUserLogs.length} activities
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
              {currentLogsItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                        <Shield size={32} className="text-gray-400 dark:text-gray-500" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg">
                          Nenhum Log de Autenticação
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                          Os eventos de login e logout aparecerão aqui quando os utilizadores acederem ao sistema.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentLogsItems.map((log) => (
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
        
        {/* Pagination Controls for Logs */}
        {filteredUserLogs.length > logsPerPage && (
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {logsIndexOfFirstItem + 1} to {Math.min(logsIndexOfLastItem, filteredUserLogs.length)} of {filteredUserLogs.length} logs
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLogsCurrentPage(Math.max(1, logsCurrentPage - 1))}
                disabled={logsCurrentPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalLogsPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setLogsCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg ${
                      page === logsCurrentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } transition-colors`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setLogsCurrentPage(Math.min(totalLogsPages, logsCurrentPage + 1))}
                disabled={logsCurrentPage === totalLogsPages}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
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
              <p className="text-gray-600 dark:text-gray-400">
                {totalActivities > 0
                  ? 'Últimas ações de usuários e operações do sistema' 
                  : 'Aguardando as primeiras atividades do sistema'}
              </p>
            </div>
            {isUsingRealData && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse"></div>
                Live
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredRecentActivities.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center">
                  <Activity size={40} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold text-lg">
                    Nenhuma Atividade Recente
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-md mx-auto">
                    As atividades mais recentes do sistema aparecerão aqui. Comece executando consultas, fazendo uploads ou gerindo utilizadores.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            currentRecentItems.map((activity) => (
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
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setSelectedActivity(activity)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      aria-label="View activity details"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      aria-label="More activity options"
                      title="More options"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination Controls for Recent Activities */}
        {filteredRecentActivities.length > recentPerPage && (
          <div className="flex items-center justify-between mt-6 px-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {recentIndexOfFirstItem + 1} to {Math.min(recentIndexOfLastItem, filteredRecentActivities.length)} of {filteredRecentActivities.length} activities
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRecentCurrentPage(Math.max(1, recentCurrentPage - 1))}
                disabled={recentCurrentPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalRecentPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setRecentCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg ${
                      page === recentCurrentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } transition-colors`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setRecentCurrentPage(Math.min(totalRecentPages, recentCurrentPage + 1))}
                disabled={recentCurrentPage === totalRecentPages}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
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
              <p className="text-gray-600 dark:text-gray-400">
                {totalActivities > 0 
                  ? 'Atividades anteriores e eventos do sistema' 
                  : 'O histórico será criado conforme o uso do sistema'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredHistoryActivities.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl flex items-center justify-center">
                  <Calendar size={40} className="text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold text-lg">
                    Sem Histórico de Atividades
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-md mx-auto">
                    O histórico de atividades anteriores aparecerá aqui à medida que o sistema for utilizado ao longo do tempo.
                  </p>
                </div>
              </div>
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
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Quick action">
                  <MoreVertical size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden transition-all duration-300">
            
            {/* Professional Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.3),transparent_50%)]"></div>
              </div>
              
              <div className="relative z-10">
                {/* Header Top Row */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 ${selectedActivity.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <selectedActivity.icon size={32} className="text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-1">{selectedActivity.activity}</h1>
                      <div className="flex items-center space-x-4 text-blue-100">
                        <span className="flex items-center space-x-2">
                          <User size={16} />
                          <span>{selectedActivity.user}</span>
                        </span>
                        <span className="flex items-center space-x-2">
                          <Clock size={16} />
                          <span>{selectedActivity.timestamp}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-200 group"
                      title="Close details"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* KPI Header Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Category */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <Filter size={20} className="text-blue-400" />
                      </div>
                    </div>
                    <div className="text-lg font-bold text-white mb-1 capitalize">{selectedActivity.category}</div>
                    <div className="text-sm text-blue-100">Category</div>
                  </div>

                  {/* Module */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <Settings size={20} className="text-purple-400" />
                      </div>
                    </div>
                    <div className="text-lg font-bold text-white mb-1">{selectedActivity.module}</div>
                    <div className="text-sm text-blue-100">Module</div>
                  </div>

                  {/* Duration */}
                  {selectedActivity.duration && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <Zap size={20} className="text-green-400" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{selectedActivity.duration}s</div>
                      <div className="text-sm text-blue-100">Duration</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-300px)]">
              {/* Details Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <FileText size={20} className="text-white" />
                  </div>
                  <span>Activity Details</span>
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 border border-blue-200 dark:border-gray-600">
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    {selectedActivity.details}
                  </p>
                </div>
              </div>

              {/* Metadata Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Activity size={20} className="text-white" />
                  </div>
                  <span>Metadata</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Domain Category</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{selectedActivity.domainCategory}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Activity ID</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">#{selectedActivity.id}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Performed By</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedActivity.user}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Timestamp</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedActivity.timestamp}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-750">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
                  >
                    <Download size={16} />
                    <span>Export Details</span>
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors flex items-center space-x-2"
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityPage;