import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Download,
  Eye,
  FileText,
  PieChart,
  RefreshCw,
  Settings,
  Share2,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import SectionHeader from '../Common/SectionHeader';
import { useAuth } from '../../contexts/AuthContext';
import { graphqlService, type AIQueryResult, type FileUpload } from '../../services/graphqlService';

type KPITrend = 'up' | 'down' | 'neutral';
type PerformanceStatus = 'excellent' | 'good' | 'warning' | 'critical';
type ActivityStatus = 'success' | 'error' | 'warning';
type ActivityType = 'file' | 'ai' | 'database' | 'report' | 'export';
type InsightImpact = 'low' | 'medium' | 'high';

interface OverviewKPI {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: KPITrend;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  target: string;
  progress: number;
  subtitle?: string;
}

interface UsageTrendPoint {
  month: string;
  queryCount: number;
  avgExecutionTime: number;
  fileUploads: number;
  successRate: number;
}

interface FileTypeSlice {
  name: string;
  count: number;
  color: string;
  percentage: number;
}

interface PerformanceMetric {
  metric: string;
  value: number;
  target: number;
  status: PerformanceStatus;
  suffix?: string;
}

interface OverviewActivity {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp?: string | null;
  type: ActivityType;
  status: ActivityStatus;
}

interface OverviewInsight {
  id: string;
  title: string;
  description: string;
  impact: InsightImpact;
  category: string;
  confidence: number;
}

interface OverviewData {
  kpis: OverviewKPI[];
  usageTrends: UsageTrendPoint[];
  fileTypeDistribution: FileTypeSlice[];
  performanceMetrics: PerformanceMetric[];
  recentActivities: OverviewActivity[];
  topInsights: OverviewInsight[];
}

const defaultOverviewData: OverviewData = {
  kpis: [],
  usageTrends: [],
  fileTypeDistribution: [],
  performanceMetrics: [],
  recentActivities: [],
  topInsights: []
};

const FILE_TYPE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1', '#F97316'];

const KPI_ACCENT_MAP: Record<string, string> = {
  'from-blue-500 to-cyan-600': 'accent-sky-500',
  'from-emerald-500 to-green-600': 'accent-emerald-500',
  'from-purple-500 to-violet-600': 'accent-purple-500',
  'from-orange-500 to-red-600': 'accent-orange-500'
};

const STATUS_ACCENT_MAP: Record<PerformanceStatus, string> = {
  excellent: 'accent-green-500',
  good: 'accent-blue-500',
  warning: 'accent-yellow-500',
  critical: 'accent-red-500'
};

const RANGE_IN_DAYS: Record<string, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365
};

const SUCCESS_STATUS_HINTS = ['SUCCESS', 'COMPLETED', 'DONE', 'OK'];
const FAILURE_STATUS_HINTS = ['FAIL', 'ERROR', 'TIMEOUT'];

const formatNumber = (value: number): string => new Intl.NumberFormat('pt-PT').format(Math.round(value));

const safeDivide = (numerator: number, denominator: number): number => {
  if (!denominator) return 0;
  return numerator / denominator;
};

const getRangeInDays = (key: string): number => RANGE_IN_DAYS[key] ?? 90;

const inferStatus = (status?: string | null): ActivityStatus => {
  if (!status) return 'warning';
  const upper = status.toUpperCase();
  if (FAILURE_STATUS_HINTS.some((hint) => upper.includes(hint))) return 'error';
  if (SUCCESS_STATUS_HINTS.some((hint) => upper.includes(hint))) return 'success';
  return 'warning';
};

const computeTrend = (series: number[]): { change: number; trend: KPITrend } => {
  if (series.length < 2) {
    return { change: 0, trend: 'neutral' };
  }
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  if (previous === 0) {
    return { change: latest > 0 ? 100 : 0, trend: latest > 0 ? 'up' : 'neutral' };
  }
  const change = ((latest - previous) / previous) * 100;
  if (change > 1) return { change, trend: 'up' };
  if (change < -1) return { change, trend: 'down' };
  return { change, trend: 'neutral' };
};

const getDominantFileType = (distribution: FileTypeSlice[]): FileTypeSlice | null => {
  if (!distribution.length) return null;
  return distribution.reduce((prev, current) => (current.count > prev.count ? current : prev), distribution[0]);
};

const ClockDisplay: React.FC = () => {
  const [now, setNow] = useState<string>(() => new Date().toLocaleTimeString());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(interval);
  }, []);
  return <span>{now}</span>;
};

const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { company } = useAuth();

  const [selectedTimeRange, setSelectedTimeRange] = useState('90d');
  const [isRealTime, setIsRealTime] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem('overview_auto_refresh') || 'false');
    } catch {
      return false;
    }
  });
  const [refreshing, setRefreshing] = useState(false);
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('overview_refresh_interval') || '180');
    } catch {
      return 180;
    }
  });

  const [overviewData, setOverviewData] = useState<OverviewData>(defaultOverviewData);
  const [analyticsStats, setAnalyticsStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [showQuerySeries, setShowQuerySeries] = useState(true);
  const [showFileSeries, setShowFileSeries] = useState(true);
  const [showExecutionSeries, setShowExecutionSeries] = useState(true);
  const [showSuccessSeries, setShowSuccessSeries] = useState(true);

  const [chartMessage, setChartMessage] = useState<string | null>(null);
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(() => new Set());
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  const filteredDistribution = useMemo(
    () => overviewData.fileTypeDistribution.filter((entry) => !hiddenCategories.has(entry.name)),
    [overviewData.fileTypeDistribution, hiddenCategories]
  );

  const handleDownloadCSV = useCallback(() => {
    const rows = overviewData.usageTrends.map((point) => `${point.month},${point.queryCount},${point.fileUploads},${point.avgExecutionTime}`);
    const csv = ['month,queryCount,fileUploads,avgExecutionTimeMs', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'overview_timeseries.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setDownloadMessage('CSV exportado');
    setTimeout(() => setDownloadMessage(null), 2500);
  }, [overviewData.usageTrends]);

  const handleDownloadJSON = useCallback(() => {
    const payload = JSON.stringify({ overviewData, analyticsStats }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'overview_snapshot.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setDownloadMessage('JSON exportado');
    setTimeout(() => setDownloadMessage(null), 2500);
  }, [analyticsStats, overviewData]);

  const handleCopyJSON = useCallback(() => {
    try {
      navigator.clipboard?.writeText(JSON.stringify({ overviewData, analyticsStats }, null, 2));
      setDownloadMessage('JSON copiado para clipboard');
    } catch {
      setDownloadMessage('Falha ao copiar');
    }
    setTimeout(() => setDownloadMessage(null), 2500);
  }, [analyticsStats, overviewData]);

  const fetchOverviewData = useCallback(async (options: { manual?: boolean } = {}) => {
    if (!options.manual) {
      setLoading(true);
    }
    setError(null);

    const rangeDays = getRangeInDays(selectedTimeRange);
    const now = new Date();
    const rangeStart = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    try {
      const [analyticsResult, filesResult, queriesResult, overviewResult] = await Promise.allSettled([
        graphqlService.getAnalyticsStats(company?.id),
        graphqlService.listFileUploads(200, 0),
        graphqlService.getQueryHistory(),
        graphqlService.getOverview()
      ]);

      const analytics = analyticsResult.status === 'fulfilled' ? (analyticsResult.value as Record<string, unknown>) : null;
      const files = filesResult.status === 'fulfilled' ? (filesResult.value as FileUpload[]) : [];
      const queries = queriesResult.status === 'fulfilled' ? (queriesResult.value as AIQueryResult[]) : [];
      const backendOverview = overviewResult.status === 'fulfilled' ? (overviewResult.value as Partial<OverviewData>) : null;

      setAnalyticsStats(analytics);

      const filteredQueries = queries.filter((query) => {
        if (!query.createdAt) return false;
        const created = new Date(query.createdAt);
        return created >= rangeStart;
      });

      const filteredFiles = files.filter((file) => {
        if (!file.uploadedAt) return false;
        const uploaded = new Date(file.uploadedAt);
        return uploaded >= rangeStart;
      });

      const analyticsTyped = analytics as {
        totalUsers?: number;
        totalFiles?: number;
        totalQueries?: number;
        totalConnections?: number;
        recentQueries?: Array<{ date: string; count: number; avgExecutionTime: number }>;
        filesByType?: Array<{ type: string; count: number }>;
      } | null;

      const totalUsers = analyticsTyped?.totalUsers ?? Number(backendOverview?.kpis?.find((kpi) => kpi.id === 'users')?.value?.replace?.(/[^0-9]/g, '') || 0);
      const totalFiles = analyticsTyped?.totalFiles ?? files.length;
      const totalQueries = analyticsTyped?.totalQueries ?? queries.length;
      const totalConnections = analyticsTyped?.totalConnections ?? 0;

      const monthlyQueryBuckets = new Map<string, { total: number; success: number; sumExecution: number }>();
      queries.forEach((query) => {
        if (!query.createdAt) return;
        const key = query.createdAt.substring(0, 7);
        const bucket = monthlyQueryBuckets.get(key) ?? { total: 0, success: 0, sumExecution: 0 };
        bucket.total += 1;
        bucket.sumExecution += query.executionTime || 0;
        if (inferStatus(query.status) !== 'error') {
          bucket.success += 1;
        }
        monthlyQueryBuckets.set(key, bucket);
      });

      const monthlyFileBuckets = new Map<string, number>();
      files.forEach((file) => {
        if (!file.uploadedAt) return;
        const key = file.uploadedAt.substring(0, 7);
        monthlyFileBuckets.set(key, (monthlyFileBuckets.get(key) ?? 0) + 1);
      });

      const recentQuerySeries = analyticsTyped?.recentQueries ?? [];
      const timelineKeys = recentQuerySeries
        .map((item) => item.date)
        .filter((key) => {
          const date = new Date(`${key}-01T00:00:00`);
          return !Number.isNaN(date.getTime()) && date >= new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
        });

      if (!timelineKeys.length) {
        const baseKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        timelineKeys.push(baseKey);
      }

      while (timelineKeys.length < 6) {
        const referenceKey = timelineKeys[0];
        const [yearStr, monthStr] = referenceKey.split('-');
        const seed = new Date(Number(yearStr), Number(monthStr) - 1, 1);
        seed.setMonth(seed.getMonth() - 1);
        const newKey = `${seed.getFullYear()}-${String(seed.getMonth() + 1).padStart(2, '0')}`;
        if (!timelineKeys.includes(newKey)) {
          timelineKeys.unshift(newKey);
        } else {
          break;
        }
      }

      const usageTrends: UsageTrendPoint[] = timelineKeys.slice(-6).map((key) => {
        const analyticEntry = recentQuerySeries.find((item) => item.date === key);
        const bucket = monthlyQueryBuckets.get(key) ?? { total: 0, success: 0, sumExecution: 0 };
        const fileCount = monthlyFileBuckets.get(key) ?? 0;
        const successRate = bucket.total ? (bucket.success / bucket.total) * 100 : 0;
        const avgExecution = bucket.total ? bucket.sumExecution / bucket.total : analyticEntry?.avgExecutionTime ?? 0;
        const monthLabel = format(new Date(`${key}-01T00:00:00`), 'MMM yyyy');

        return {
          month: monthLabel,
          queryCount: analyticEntry?.count ?? bucket.total,
          avgExecutionTime: analyticEntry?.avgExecutionTime ?? avgExecution,
          fileUploads: fileCount,
          successRate
        };
      });

      const querySeries = usageTrends.map((item) => item.queryCount);
      const fileSeries = usageTrends.map((item) => item.fileUploads);
      const queryTrend = computeTrend(querySeries);
      const fileTrend = computeTrend(fileSeries);

      const userTarget = Math.max(totalUsers * 1.15, totalUsers + 5);
      const filesTarget = Math.max(totalFiles * 1.2, totalFiles + 10);
      const queriesTarget = Math.max(totalQueries * 1.2, totalQueries + 20);
      const connectionsTarget = Math.max(totalConnections * 1.5, totalConnections + 3);

      const kpis: OverviewKPI[] = [
        {
          id: 'users',
          title: 'Total Users',
          value: formatNumber(totalUsers),
          change: 0,
          trend: 'neutral',
          icon: Users,
          color: 'from-blue-500 to-cyan-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          target: formatNumber(userTarget),
          progress: Math.min(100, safeDivide(totalUsers, userTarget) * 100),
          subtitle: company?.name ? `Empresa: ${company.name}` : 'Todos os utilizadores'
        },
        {
          id: 'files',
          title: 'Files Processed',
          value: formatNumber(totalFiles),
          change: fileTrend.change,
          trend: fileTrend.trend,
          icon: FileText,
          color: 'from-emerald-500 to-green-600',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          target: formatNumber(filesTarget),
          progress: Math.min(100, safeDivide(totalFiles, filesTarget) * 100),
          subtitle: `${formatNumber(filteredFiles.length)} no período`
        },
        {
          id: 'queries',
          title: 'AI Queries',
          value: formatNumber(totalQueries),
          change: queryTrend.change,
          trend: queryTrend.trend,
          icon: TrendingUp,
          color: 'from-purple-500 to-violet-600',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          target: formatNumber(queriesTarget),
          progress: Math.min(100, safeDivide(totalQueries, queriesTarget) * 100),
          subtitle: `${formatNumber(filteredQueries.length)} no período`
        },
        {
          id: 'connections',
          title: 'Data Connections',
          value: formatNumber(totalConnections),
          change: 0,
          trend: totalConnections > 0 ? 'up' : 'neutral',
          icon: Database,
          color: 'from-orange-500 to-red-600',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          target: formatNumber(connectionsTarget),
          progress: Math.min(100, safeDivide(totalConnections, connectionsTarget) * 100),
          subtitle: 'Integrações activas'
        }
      ];

      const distributionSource = Array.isArray(analyticsTyped?.filesByType)
        ? analyticsTyped?.filesByType ?? []
        : files.reduce<Record<string, number>>((acc, file) => {
            const type = file.fileType || 'OTHER';
            acc[type] = (acc[type] ?? 0) + 1;
            return acc;
          }, {} as Record<string, number>);

      const distributionEntries: FileTypeSlice[] = Array.isArray(distributionSource)
        ? distributionSource.map((entry, index) => ({
            name: entry.type ?? 'Other',
            count: entry.count ?? 0,
            color: FILE_TYPE_COLORS[index % FILE_TYPE_COLORS.length],
            percentage: 0
          }))
        : Object.entries(distributionSource).map(([type, count], index) => ({
            name: type,
            count,
            color: FILE_TYPE_COLORS[index % FILE_TYPE_COLORS.length],
            percentage: 0
          }));

      const totalDistribution = distributionEntries.reduce((sum, entry) => sum + entry.count, 0);
      const fileTypeDistribution = distributionEntries.map((entry) => ({
        ...entry,
        percentage: totalDistribution ? (entry.count / totalDistribution) * 100 : 0
      }));

      const totalSuccess = queries.reduce((sum, query) => sum + (inferStatus(query.status) !== 'error' ? 1 : 0), 0);
      const overallSuccessRate = safeDivide(totalSuccess, queries.length) * 100;
      const overallAvgExecution = queries.length
        ? queries.reduce((sum, query) => sum + (query.executionTime || 0), 0) / queries.length
        : 0;
      const filesPerDay = rangeDays ? filteredFiles.length / rangeDays : filteredFiles.length;

      const successStatus: PerformanceStatus = overallSuccessRate >= 95 ? 'excellent' : overallSuccessRate >= 85 ? 'good' : overallSuccessRate >= 70 ? 'warning' : 'critical';
      const executionStatus: PerformanceStatus = overallAvgExecution <= 250 ? 'excellent' : overallAvgExecution <= 450 ? 'good' : overallAvgExecution <= 650 ? 'warning' : 'critical';
      const fileStatus: PerformanceStatus = filesPerDay >= 5 ? 'excellent' : filesPerDay >= 2 ? 'good' : filesPerDay > 0.2 ? 'warning' : 'critical';
      const connectionStatus: PerformanceStatus = totalConnections > 0 ? 'good' : 'warning';

      const performanceMetrics: PerformanceMetric[] = [
        {
          metric: 'Query Success Rate',
          value: Number(overallSuccessRate.toFixed(1)),
          target: 95,
          status: successStatus,
          suffix: '%'
        },
        {
          metric: 'Average Execution',
          value: Number(overallAvgExecution.toFixed(0)),
          target: 250,
          status: executionStatus,
          suffix: 'ms'
        },
        {
          metric: 'Files por dia',
          value: Number(filesPerDay.toFixed(2)),
          target: 5,
          status: fileStatus
        },
        {
          metric: 'Active Integrations',
          value: totalConnections,
          target: Math.ceil(connectionsTarget),
          status: connectionStatus
        }
      ];

      const fileActivities: OverviewActivity[] = files.slice(0, 15).map((file) => ({
        id: `file-${file.id}`,
        user: (file.metadata as { uploadedBy?: string } | undefined)?.uploadedBy || 'Upload Service',
        action: 'File Uploaded',
        details: file.originalName || file.filename,
        timestamp: file.uploadedAt,
        type: 'file',
        status: inferStatus(file.analysisReport?.status)
      }));

      const queryActivities: OverviewActivity[] = queries.slice(0, 15).map((query) => ({
        id: `query-${query.id}`,
        user: 'AI Engine',
        action: 'AI Query Executed',
        details: query.naturalQuery || query.generatedQuery || 'Consulta processada',
        timestamp: query.createdAt,
        type: 'ai',
        status: inferStatus(query.status)
      }));

      const recentActivities = [...fileActivities, ...queryActivities]
        .filter((activity) => activity.timestamp)
        .sort((a, b) => new Date(b.timestamp ?? '').getTime() - new Date(a.timestamp ?? '').getTime())
        .slice(0, 10);

      const dominantType = getDominantFileType(fileTypeDistribution);
      const latestTrend = usageTrends[usageTrends.length - 1];
      const previousTrend = usageTrends.length > 1 ? usageTrends[usageTrends.length - 2] : undefined;

      const insights: OverviewInsight[] = [];

      if (!Number.isNaN(overallSuccessRate)) {
        insights.push({
          id: 'insight-success',
          title: overallSuccessRate >= 90 ? 'Execuções saudáveis' : 'Melhorar fiabilidade',
          description:
            overallSuccessRate >= 90
              ? `As consultas estão a responder com ${overallSuccessRate.toFixed(1)}% de sucesso. Continue a monitorizar para manter esse nível.`
              : `A taxa de sucesso das consultas está em ${overallSuccessRate.toFixed(1)}%. Verifique logs de falha e credenciais das integrações.`,
          impact: overallSuccessRate >= 90 ? 'high' : 'medium',
          category: 'analytics',
          confidence: 85
        });
      }

      if (dominantType && dominantType.percentage >= 10) {
        insights.push({
          id: 'insight-files',
          title: `${dominantType.name} domina uploads`,
          description: `${dominantType.percentage.toFixed(1)}% dos ficheiros carregados são do tipo ${dominantType.name}. Considere automatizar validações para esse formato.`,
          impact: 'medium',
          category: 'files',
          confidence: 70
        });
      }

      if (latestTrend && previousTrend) {
        const diff = latestTrend.queryCount - previousTrend.queryCount;
        insights.push({
          id: 'insight-trend',
          title: diff >= 0 ? 'Queries em crescimento' : 'Queries estabilizaram',
          description:
            diff >= 0
              ? `Foram processadas ${latestTrend.queryCount} queries no último período, ${diff} acima do anterior. Prepare dashboards para o aumento de carga.`
              : `O volume de queries manteve-se em ${latestTrend.queryCount}. Analise novas fontes de dados para estimular o uso.`,
          impact: diff >= 0 ? 'high' : 'low',
          category: 'usage',
          confidence: 65
        });
      }

      if (!insights.length && backendOverview?.topInsights?.length) {
        insights.push(...backendOverview.topInsights);
      }

      setOverviewData({
        kpis,
        usageTrends,
        fileTypeDistribution,
        performanceMetrics,
        recentActivities,
        topInsights: insights.length ? insights : backendOverview?.topInsights ?? []
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Overview fetch failed:', err);
      const message = err instanceof Error ? err.message : 'Erro ao carregar overview';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [company?.id, company?.name, selectedTimeRange]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOverviewData({ manual: true });
  }, [fetchOverviewData]);

  useEffect(() => {
    if (!isRealTime) return undefined;

    const initialDelayMs = 8000;
    const minIntervalMs = 5000;

    let intervalId: NodeJS.Timeout | null = null;

    const initialTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        handleRefresh();
      }, Math.max(minIntervalMs, refreshIntervalSeconds * 1000));
    }, initialDelayMs);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [handleRefresh, isRealTime, refreshIntervalSeconds]);

  useEffect(() => {
    try {
      localStorage.setItem('overview_auto_refresh', JSON.stringify(!!isRealTime));
    } catch (storageError) {
      console.warn('Failed to persist auto refresh preference', storageError);
    }
  }, [isRealTime]);

  useEffect(() => {
    try {
      localStorage.setItem('overview_refresh_interval', String(refreshIntervalSeconds));
    } catch (storageError) {
      console.warn('Failed to persist refresh interval', storageError);
    }
  }, [refreshIntervalSeconds]);

  const KPICard = ({ kpi }: { kpi: OverviewKPI }) => {
    const trendLabel = kpi.change ? `${Math.abs(kpi.change).toFixed(1)}%` : '—';
    const trendConfig = kpi.trend === 'up'
      ? {
          className: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30',
          icon: <ArrowUpRight size={16} />
        }
      : kpi.trend === 'down'
        ? {
            className: 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30',
            icon: <ArrowDownRight size={16} />
          }
        : {
            className: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30',
            icon: <Clock size={16} />
          };
    const accentClass = KPI_ACCENT_MAP[kpi.color] ?? 'accent-blue-500';

    return (
      <div className={`${kpi.bgColor} rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-14 h-14 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <kpi.icon size={28} className="text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-semibold ${trendConfig.className}`}>
                {trendConfig.icon}
                <span>{trendLabel}</span>
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
              {kpi.subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{kpi.subtitle}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Progress to Target</span>
                <span>{Math.round(Math.min(100, kpi.progress))}%</span>
              </div>
              <progress
                className={`w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden ${accentClass}`}
                value={Math.min(100, kpi.progress)}
                max={100}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Target: {kpi.target}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ChartCard = ({
    title,
    children,
    icon: Icon,
    actions = true,
    actionsContent
  }: {
    title: string;
    children: React.ReactNode;
  icon: React.ElementType;
    actions?: boolean;
    actionsContent?: React.ReactNode;
  }) => (
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
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            {actionsContent ?? (
              <>
                <button aria-label="Download chart CSV" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Download size={16} />
                </button>
                <button aria-label="Share chart data" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Share2 size={16} />
                </button>
                <button aria-label="Open chart settings" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Settings size={16} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="h-80">
        {children}
      </div>
    </div>
  );

  const InsightCard = ({ insight }: { insight: OverviewInsight }) => {
    const categoryMap: Record<string, string> = {
      analytics: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      files: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      usage: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };

    const impactMap: Record<InsightImpact, string> = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${impactMap[insight.impact] ?? impactMap.medium}`}>
            <Sparkles size={20} />
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryMap[insight.category] ?? categoryMap.analytics}`}>
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
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${impactMap[insight.impact] ?? impactMap.medium}`}>
            {insight.impact} impact
          </span>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
            View Details →
          </button>
        </div>
      </div>
    );
  };

  const ActivityItem = ({ activity }: { activity: OverviewActivity }) => {
    const iconMap: Record<ActivityType, React.ReactNode> = {
      file: <FileText size={16} className="text-blue-600 dark:text-blue-400" />,
      ai: <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />,
      database: <Database size={16} className="text-indigo-600 dark:text-indigo-400" />,
      report: <Download size={16} className="text-orange-600 dark:text-orange-400" />,
      export: <Download size={16} className="text-orange-600 dark:text-orange-400" />
    };

    const backgroundMap: Record<ActivityStatus, string> = {
      success: 'bg-green-100 dark:bg-green-900/30',
      error: 'bg-red-100 dark:bg-red-900/30',
      warning: 'bg-blue-100 dark:bg-blue-900/30'
    };

    return (
      <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${backgroundMap[activity.status]}`}>
          {iconMap[activity.type]}
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
              {activity.timestamp && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{activity.details}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">by {activity.user}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BarChart3 size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Business Intelligence Overview</h2>
                <p className="text-blue-100">Real-time insights and comprehensive analytics dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <label htmlFor="overview-time-range" className="sr-only">
                Selecionar intervalo temporal
              </label>
              <select
                id="overview-time-range"
                value={selectedTimeRange}
                onChange={(event) => setSelectedTimeRange(event.target.value)}
                aria-label="Selecionar intervalo temporal"
                className="px-4 py-2 bg-white/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                <option value="24h" className="text-gray-900">Last 24 Hours</option>
                <option value="7d" className="text-gray-900">Last 7 Days</option>
                <option value="30d" className="text-gray-900">Last 30 Days</option>
                <option value="90d" className="text-gray-900">Last 90 Days</option>
                <option value="1y" className="text-gray-900">Last Year</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-60"
                title="Refresh data"
              >
                <RefreshCw size={20} className={`text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center space-x-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                <label className="text-sm text-white/90 mr-2">Auto</label>
                <button
                  onClick={() => setIsRealTime((state) => !state)}
                  className={`px-2 py-1 rounded ${isRealTime ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  <span className="text-sm">{isRealTime ? 'On' : 'Off'}</span>
                </button>
                <label htmlFor="overview-refresh-interval" className="sr-only">
                  Intervalo de atualização (segundos)
                </label>
                <input
                  id="overview-refresh-interval"
                  type="number"
                  min={1}
                  value={refreshIntervalSeconds}
                  onChange={(event) => setRefreshIntervalSeconds(Math.max(1, Number(event.target.value) || 1))}
                  aria-label="Intervalo de atualização (segundos)"
                  className="w-20 ml-2 rounded px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200"
                />
                <span className="text-sm text-white/80 ml-1">s</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setDownloadMenuOpen((open) => !open)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
                  title="Download overview"
                >
                  <Download size={18} className="text-white" />
                  <span className="text-sm text-white/90">Download</span>
                </button>
                {downloadMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <button
                      onClick={() => {
                        handleDownloadCSV();
                        setDownloadMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      Download CSV (Usage)
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadJSON();
                        setDownloadMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      Download JSON (Full)
                    </button>
                    <button
                      onClick={() => {
                        handleCopyJSON();
                        setDownloadMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      Copy JSON
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center flex-wrap gap-4 text-sm text-blue-100">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1 border border-white/10">
              <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span>{isRealTime ? 'Live Data' : 'Paused'}</span>
              <ClockDisplay />
            </div>
            <span>•</span>
            <span>
              Last Updated: {lastUpdated ? formatDistanceToNow(lastUpdated, { addSuffix: true }) : '—'}
            </span>
            {downloadMessage && (
              <span className="ml-auto text-sm text-green-200 bg-green-800/20 px-3 py-1 rounded-md">
                {downloadMessage}
              </span>
            )}
          </div>
          {error && (
            <div className="mt-4 bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-gray-600 dark:text-gray-300">
          A carregar dados do overview...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewData.kpis.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartCard
          title="Usage & Volume Analysis"
          icon={TrendingUp}
          actionsContent={(
            <>
              <button
                onClick={() => {
                  const rows = overviewData.usageTrends.map((point) => `${point.month},${point.queryCount},${point.fileUploads},${point.successRate.toFixed(1)}`);
                  const csv = ['month,queryCount,fileUploads,successRatePercent', ...rows].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement('a');
                  anchor.href = url;
                  anchor.download = 'usage_trends.csv';
                  document.body.appendChild(anchor);
                  anchor.click();
                  anchor.remove();
                  URL.revokeObjectURL(url);
                  setChartMessage('CSV exported');
                  setTimeout(() => setChartMessage(null), 2500);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Download CSV"
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(overviewData.usageTrends, null, 2));
                  setChartMessage('Chart JSON copied to clipboard');
                  setTimeout(() => setChartMessage(null), 2500);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Copy JSON"
              >
                <Share2 size={16} />
              </button>
              <div className="p-2 flex items-center space-x-3">
                <label className="flex items-center space-x-1 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={showQuerySeries}
                    onChange={() => setShowQuerySeries((state) => !state)}
                  />
                  <span>Queries</span>
                </label>
                <label className="flex items-center space-x-1 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={showFileSeries}
                    onChange={() => setShowFileSeries((state) => !state)}
                  />
                  <span>Uploads</span>
                </label>
              </div>
            </>
          )}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={overviewData.usageTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              {showQuerySeries && (
                <Bar yAxisId="left" dataKey="queryCount" fill="#3B82F6" name="Queries" radius={[4, 4, 0, 0]} />
              )}
              {showFileSeries && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="fileUploads"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Uploads"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
          {chartMessage && <div className="mt-2 text-sm text-green-600">{chartMessage}</div>}
        </ChartCard>

        <ChartCard
          title="Performance & Latency"
          icon={Users}
          actionsContent={(
            <>
              <button
                onClick={() => {
                  const rows = overviewData.usageTrends.map((point) => `${point.month},${point.avgExecutionTime.toFixed(2)},${point.successRate.toFixed(1)}`);
                  const csv = ['month,avgExecutionTimeMs,successRatePercent', ...rows].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement('a');
                  anchor.href = url;
                  anchor.download = 'performance_trends.csv';
                  document.body.appendChild(anchor);
                  anchor.click();
                  anchor.remove();
                  URL.revokeObjectURL(url);
                  setChartMessage('Performance CSV exported');
                  setTimeout(() => setChartMessage(null), 2500);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Download CSV"
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(
                    JSON.stringify(
                      overviewData.usageTrends.map((point) => ({
                        month: point.month,
                        avgExecutionTime: point.avgExecutionTime,
                        successRate: point.successRate
                      })),
                      null,
                      2
                    )
                  );
                  setChartMessage('Performance JSON copied');
                  setTimeout(() => setChartMessage(null), 2500);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Copy JSON"
              >
                <Share2 size={16} />
              </button>
              <div className="p-2 flex items-center space-x-3">
                <label className="flex items-center space-x-1 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={showExecutionSeries}
                    onChange={() => setShowExecutionSeries((state) => !state)}
                  />
                  <span>Execução</span>
                </label>
                <label className="flex items-center space-x-1 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={showSuccessSeries}
                    onChange={() => setShowSuccessSeries((state) => !state)}
                  />
                  <span>Sucesso</span>
                </label>
              </div>
            </>
          )}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={overviewData.usageTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              {showExecutionSeries && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgExecutionTime"
                  stroke="#8B5CF6"
                  fill="url(#executionGradient)"
                  strokeWidth={3}
                  name="Avg Execution (ms)"
                />
              )}
              {showSuccessSeries && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="successRate"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  name="Success Rate (%)"
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                />
              )}
              <defs>
                <linearGradient id="executionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
          {chartMessage && <div className="mt-2 text-sm text-green-600">{chartMessage}</div>}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <ChartCard
          title="File Type Distribution"
          icon={PieChart}
          actionsContent={(
            <>
              <button
                onClick={() => {
                  const rows = overviewData.fileTypeDistribution.map((slice) => `${slice.name},${slice.count},${slice.percentage.toFixed(1)}`);
                  const csv = ['type,count,percentage', ...rows].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement('a');
                  anchor.href = url;
                  anchor.download = 'file_distribution.csv';
                  document.body.appendChild(anchor);
                  anchor.click();
                  anchor.remove();
                  URL.revokeObjectURL(url);
                  setChartMessage('Distribution CSV exported');
                  setTimeout(() => setChartMessage(null), 2500);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Download CSV"
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(overviewData.fileTypeDistribution, null, 2));
                  setChartMessage('Distribution JSON copied');
                  setTimeout(() => setChartMessage(null), 2500);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Copy JSON"
              >
                <Share2 size={16} />
              </button>
            </>
          )}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={filteredDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="count"
                label={({ name, percent }) => `${name} ${Math.round((percent || 0) * 100)}%`}
                labelLine={false}
              >
                {filteredDistribution.map((entry, index) => (
                  <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, 'Count']} />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {overviewData.fileTypeDistribution.map((slice) => (
              <label key={slice.name} className="text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!hiddenCategories.has(slice.name)}
                  onChange={() => {
                    setHiddenCategories((prev) => {
                      const copy = new Set(prev);
                      if (copy.has(slice.name)) {
                        copy.delete(slice.name);
                      } else {
                        copy.add(slice.name);
                      }
                      return copy;
                    });
                  }}
                />
                <span>{slice.name}</span>
              </label>
            ))}
          </div>
          {chartMessage && <div className="mt-2 text-sm text-green-600">{chartMessage}</div>}
        </ChartCard>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
          <SectionHeader icon={Activity} title="System Performance" subtitle="Key performance indicators" />
          <div className="space-y-4 mt-4">
            {overviewData.performanceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{metric.metric}</span>
                    <span className={`text-sm font-semibold ${
                      metric.status === 'excellent'
                        ? 'text-green-600 dark:text-green-400'
                        : metric.status === 'good'
                          ? 'text-blue-600 dark:text-blue-400'
                          : metric.status === 'warning'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                    }`}>
                      {metric.value}{metric.suffix ?? ''}
                    </span>
                  </div>
                  <progress
                    className={`w-full h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden ${STATUS_ACCENT_MAP[metric.status]}`}
                    value={Math.min((metric.value / metric.target) * 100, 100)}
                    max={100}
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>
                      Target: {metric.target}
                      {metric.suffix ?? ''}
                    </span>
                    <span className={`font-medium ${
                      metric.status === 'excellent'
                        ? 'text-green-600 dark:text-green-400'
                        : metric.status === 'good'
                          ? 'text-blue-600 dark:text-blue-400'
                          : metric.status === 'warning'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                    }`}>
                      {metric.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
            {overviewData.recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>

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
          {overviewData.topInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text.white">Quick Actions</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">Frequently used features</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{
            icon: FileText,
            label: 'Generate Report',
            color: 'from-blue-500 to-cyan-600',
            description: 'Create new analytics report',
            section: 'reports'
          }, {
            icon: Database,
            label: 'Connect Database',
            color: 'from-green-500 to-emerald-600',
            description: 'Add new data source',
            section: 'database'
          }, {
            icon: Sparkles,
            label: 'AI Analysis',
            color: 'from-purple-500 to-violet-600',
            description: 'Run AI-powered analysis',
            section: 'instant-insight'
          }, {
            icon: Download,
            label: 'Export Data',
            color: 'from-orange-500 to-red-600',
            description: 'Export current dataset',
            section: 'reports'
          }].map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(`/${action.section}`)}
              className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <action.icon size={24} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {action.label}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;