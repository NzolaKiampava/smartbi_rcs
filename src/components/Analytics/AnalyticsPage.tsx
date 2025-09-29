import React, { useState, useMemo } from 'react';
// Months list for filters
const monthsList = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  // Lista de meses para filtro

import {
  BarChart3,
  DollarSign,
  Users,
  ShoppingCart,
  Filter,
  Download,
  Share2,
  Maximize2,
  RefreshCw,
  Settings,
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
  Pause
} from 'lucide-react';

import UniversalModal from '../Common/UniversalModal';

import {
  Line,
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
  // Advanced filters (now inside component)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState({ start: '', end: '' });
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSegment, setFilterSegment] = useState('');
  const [filterRevenueMin, setFilterRevenueMin] = useState('');
  const [filterRevenueMax, setFilterRevenueMax] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Active filters badge
  const activeFilters = useMemo(() => [filterPeriod.start, filterPeriod.end, filterCategory, filterSegment, filterRevenueMin, filterRevenueMax, filterStatus].filter(Boolean).length, [filterPeriod, filterCategory, filterSegment, filterRevenueMin, filterRevenueMax, filterStatus]);
  
  // Clear filters
  const clearFilters = () => {
    setFilterPeriod({ start: '', end: '' });
    setFilterCategory('');
    setFilterSegment('');
    setFilterRevenueMin('');
    setFilterRevenueMax('');
    setFilterStatus('');
  };
  
  // Filtrar dados
  const filteredRevenueData = useMemo(() => {
    let data = analyticsData.revenueData;
    if (filterPeriod.start && filterPeriod.end) {
      const startIdx = monthsList.indexOf(filterPeriod.start);
      const endIdx = monthsList.indexOf(filterPeriod.end);
      if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
        data = data.slice(startIdx, endIdx + 1);
      }
    }
    if (filterRevenueMin) {
      data = data.filter(row => row.revenue >= Number(filterRevenueMin));
    }
    if (filterRevenueMax) {
      data = data.filter(row => row.revenue <= Number(filterRevenueMax));
    }
  // Category, Segment, Status: examples for future expansion
    return data;
  }, [filterPeriod, filterRevenueMin, filterRevenueMax]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [isRealTime, setIsRealTime] = useState(true);
  // Removido selectedMetrics não utilizado
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

  // Estado para fullscreen (allow optional exportRef)
  const [fullscreenContent, setFullscreenContent] = useState<null | { title: string; content: React.ReactNode; exportRef?: React.RefObject<HTMLElement | null> }>(null);
  // Estado para menu de download
  const [downloadMenu, setDownloadMenu] = useState<{ open: boolean; anchor: HTMLElement | null; data: any[]; title: string } | null>(null);
  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'pdf' as 'pdf' | 'csv',
    includeKPIs: true,
    includeRevenue: true,
    includeChannels: true,
    includePerformance: true,
    includeGeo: true,
  });
  // Estado para menu de compartilhamento
  const [shareMenu, setShareMenu] = useState<{ open: boolean; anchor: HTMLElement | null; data: any[]; title: string } | null>(null);
  // Estado para menu de configurações
  const [configMenu, setConfigMenu] = useState<{ open: boolean; anchor: HTMLElement | null; title: string } | null>(null);
  // Estado mock para configurações
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [chartColor, setChartColor] = useState<string>('#3B82F6');
  const [showMetric, setShowMetric] = useState<'revenue' | 'orders' | 'users'>('revenue');
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showValues, setShowValues] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [yAxisScale, setYAxisScale] = useState<'auto' | 'fixed'>('auto');
  // Estado para tema/densidade global do Analytics
  const [analyticsTheme, setAnalyticsTheme] = useState<'default' | 'compact' | 'spacious'>('default');

  // Função utilitária para gerar texto resumido dos dados
  function getShareText(title: string, data: any[]) {
    if (!data || !data.length) return title;
    const keys = Object.keys(data[0]);
    const rows = data.map(row => keys.map(k => row[k]).join(' | '));
    return `${title}\n${keys.join(' | ')}\n${rows.join('\n')}`;
  }

  // Função utilitária para exportar CSV
  function exportToCSV(data: any[], filename: string) {
    if (!data || !data.length) return;
    const keys = Object.keys(data[0]);
    const csvRows = [keys, ...data.map(row => keys.map(k => row[k]))];
    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Função utilitária para exportar PDF (simples, print do conteúdo)
  function exportToPDF(title: string, data: any[]) {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write('<html><head><title>' + title + '</title></head><body>');
    win.document.write('<h2>' + title + '</h2>');
    win.document.write('<table border="1" cellpadding="5" style="border-collapse:collapse;">');
    win.document.write('<tr>' + Object.keys(data[0]).map(k => `<th>${k}</th>`).join('') + '</tr>');
    data.forEach(row => {
      win.document.write('<tr>' + Object.values(row).map(v => `<td>${v}</td>`).join('') + '</tr>');
    });
    win.document.write('</table></body></html>');
    win.document.close();
    win.print();
  }

  // Utility: find nearest chart container (the .h-80 element) starting from an anchor button
  function findChartContainerFromAnchor(anchor: HTMLElement | null): HTMLElement | null {
    try {
      if (!anchor) return null;
      let el: HTMLElement | null = anchor as HTMLElement;
      // climb up to chart card root
      while (el && !el.classList.contains('h-80')) {
        if (!el.parentElement) break;
        el = el.parentElement as HTMLElement;
      }
      // If we found the .h-80 use it, otherwise try to find an .h-80 inside closest card
      if (el && el.classList.contains('h-80')) return el;
      // fallback: search parent for .h-80 descendant
      let parent = anchor.parentElement;
      for (let i = 0; i < 6 && parent; i++, parent = parent.parentElement) {
        const found = parent.querySelector<HTMLElement>('.h-80');
        if (found) return found;
      }
    } catch (e) {}
    return null;
  }

  // Serialize an SVG element and draw it to a canvas to produce a PNG download
  async function exportSvgElementAsPng(svgEl: SVGElement, filename = 'chart.png') {
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);
    // add name spaces
    if(!source.match(/^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if(!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    return new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context not available');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0,0,canvas.width,canvas.height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(blob => {
            if (!blob) return reject(new Error('Failed to convert canvas to blob'));
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
            URL.revokeObjectURL(url);
            resolve();
          });
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }

  // Export chart PNG using the anchor stored in downloadMenu
  async function exportChartPNGFromAnchor(title: string, anchor: HTMLElement | null) {
    try {
      const container = findChartContainerFromAnchor(anchor);
      if (!container) {
        // fallback: try to find any svg on the page
        const svg = document.querySelector<SVGElement>('svg');
        if (svg) await exportSvgElementAsPng(svg, `${title.replace(/\s+/g,'_').toLowerCase()}.png`);
        return;
      }
      const svg = container.querySelector<SVGElement>('svg');
      if (!svg) {
        // no svg, try to rasterize the container via HTML2Canvas style approach is not available here
        alert('PNG export not available for this chart (no SVG found)');
        return;
      }
      await exportSvgElementAsPng(svg, `${title.replace(/\s+/g,'_').toLowerCase()}.png`);
    } catch (err) {
      console.error('Export PNG error', err);
      alert('Failed to export PNG: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  // Map common chart/table titles to the data they should export
  function getDataForTitle(title: string, fallback: any[] = []) {
    switch ((title || '').toLowerCase()) {
      case 'revenue trend analysis':
      case 'monthly data breakdown':
      case 'user growth & engagement':
        return filteredRevenueData;
      case 'traffic sources distribution':
        return analyticsData.channelData;
      case 'system performance metrics':
        return analyticsData.performanceData;
      case 'geographic distribution':
        return analyticsData.geographicData;
      default:
        return fallback;
    }
  }

  // Build combined data based on exportOptions and current visible data
  function buildExportSections() {
    const sections: { title: string; rows: any[] }[] = [];
    if (exportOptions.includeKPIs) {
      sections.push({ title: 'KPIs', rows: analyticsData.kpis.map(k => ({ title: k.title, value: k.value, change: k.change })) });
    }
    if (exportOptions.includeRevenue) {
      sections.push({ title: 'Revenue Trend', rows: filteredRevenueData.map(r => ({ month: r.month, revenue: r.revenue, orders: r.orders, users: r.users })) });
    }
    if (exportOptions.includeChannels) {
      sections.push({ title: 'Traffic Channels', rows: analyticsData.channelData.map(c => ({ channel: c.channel, value: c.value })) });
    }
    if (exportOptions.includePerformance) {
      sections.push({ title: 'Performance Metrics', rows: analyticsData.performanceData.map(p => ({ metric: p.metric, score: p.score, target: p.target })) });
    }
    if (exportOptions.includeGeo) {
      sections.push({ title: 'Geographic Distribution', rows: analyticsData.geographicData.map(g => ({ country: g.country, users: g.users, percentage: g.percentage })) });
    }
    return sections;
  }

  // Export combined CSV
  function doExportCSV() {
    const sections = buildExportSections();
    if (!sections.length) return;
    // For CSV, concatenate sections with headers
    const parts: string[] = [];
    sections.forEach(sec => {
      if (!sec.rows || !sec.rows.length) return;
      parts.push(sec.title);
      const keys = Object.keys(sec.rows[0]);
      parts.push(keys.join(','));
      sec.rows.forEach(r => {
        parts.push(keys.map(k => String((r as any)[k] ?? '')).join(','));
      });
      parts.push('');
    });
    const csv = parts.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export combined PDF-like HTML (uses exportToPDF util to print)
  function doExportPDF() {
    const sections = buildExportSections();
    if (!sections.length) return;
    // Build a simple table-based HTML structure
    const rows: any[] = [];
    sections.forEach(sec => {
      if (!sec.rows || !sec.rows.length) return;
      // Add a header row for section
      rows.push({ Section: sec.title });
      const keys = Object.keys(sec.rows[0]);
      // Add header keys
      rows.push(keys.reduce((acc: any, k: string) => ({ ...acc, [k]: k }), {}));
      // Add rows
      sec.rows.forEach(r => rows.push(r));
      // spacer
      rows.push({});
    });
    exportToPDF('Analytics Report', rows);
  }

  // Para cada ChartCard, passar os dados relevantes para download
  const ChartCard = ({ title, children, actions = true, dataForExport, exportRef }: { title: string; children: React.ReactNode; actions?: boolean; dataForExport?: any[]; exportRef?: React.RefObject<HTMLElement | null> }) => (
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
            <button
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
              title="Download chart"
              onClick={e => setDownloadMenu({ open: true, anchor: e.currentTarget, data: dataForExport && dataForExport.length ? dataForExport : getDataForTitle(title, []), title })}
            >
              <Download size={16} />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
              title="Share chart"
              onClick={e => setShareMenu({ open: true, anchor: e.currentTarget, data: dataForExport && dataForExport.length ? dataForExport : getDataForTitle(title, []), title })}
            >
              <Share2 size={16} />
            </button>
      {/* Menu de Compartilhamento Chart */}
      {shareMenu && shareMenu.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setShareMenu(null)}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 min-w-[260px] flex flex-col items-center border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Share "{shareMenu.title}"</h4>
            <a
              className="w-full px-4 py-2 mb-2 bg-green-600 text-white rounded hover:bg-green-700 text-center"
              href={`https://wa.me/?text=${encodeURIComponent(getShareText(shareMenu.title, shareMenu.data))}`}
              target="_blank"
              rel="noopener noreferrer"
            >WhatsApp</a>
            <a
              className="w-full px-4 py-2 mb-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
              href={`mailto:?subject=${encodeURIComponent('Sharing: ' + shareMenu.title)}&body=${encodeURIComponent(getShareText(shareMenu.title, shareMenu.data))}`}
              target="_blank"
              rel="noopener noreferrer"
            >E-mail</a>
            <button className="w-full px-4 py-2 mb-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => { navigator.clipboard?.writeText(getShareText(shareMenu.title, shareMenu.data)); setShareMenu(null); }}>Copy to clipboard</button>
            <button className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 mt-2" onClick={() => setShareMenu(null)}>Cancel</button>
          </div>
        </div>
      )}
            <button
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Fullscreen"
              onClick={() => setFullscreenContent({ title, content: children, exportRef: exportRef })}
            >
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

  // ref for revenue chart export
  const revenueExportRef = React.useRef<HTMLDivElement | null>(null);
      {/* Menu de Download Chart */}
      {downloadMenu && downloadMenu.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setDownloadMenu(null)}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 min-w-[220px] flex flex-col items-center border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Download "{downloadMenu.title}"</h4>
            <button className="w-full px-4 py-2 mb-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => { exportToCSV(downloadMenu.data, `${downloadMenu.title.replace(/\s/g,'_').toLowerCase()}.csv`); setDownloadMenu(null); }}>CSV</button>
            <button className="w-full px-4 py-2 mb-2 bg-purple-600 text-white rounded hover:bg-purple-700" onClick={() => { exportToPDF(downloadMenu.title, downloadMenu.data); setDownloadMenu(null); }}>PDF</button>
            <button className="w-full px-4 py-2 mb-2 bg-gray-800 text-white rounded hover:bg-gray-900" onClick={async () => { await exportChartPNGFromAnchor(downloadMenu.title, downloadMenu.anchor); setDownloadMenu(null); }}>PNG</button>
            <button className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 mt-2" onClick={() => setDownloadMenu(null)}>Cancel</button>
          </div>
        </div>
      )}
      {/* Dropdown-style fullscreen panel for charts/tables */}
      {fullscreenContent && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6">
          {/* backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setFullscreenContent(null)}></div>
          <div className="relative w-[calc(100%-2rem)] max-w-[1200px] bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-slideDown overflow-hidden">
            <div className="w-full flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-blue-50/60 to-purple-100/60 dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{fullscreenContent.title}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" onClick={(e) => setDownloadMenu({ open: true, anchor: e.currentTarget as HTMLElement, data: getDataForTitle(fullscreenContent.title, []), title: fullscreenContent.title })} title="Download">
                  <Download size={16} />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" onClick={(e) => setShareMenu({ open: true, anchor: e.currentTarget as HTMLElement, data: getDataForTitle(fullscreenContent.title, []), title: fullscreenContent.title })} title="Share">
                  <Share2 size={16} />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" onClick={() => setFullscreenContent(null)} title="Close">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="p-4 md:p-6">
              {/* content wrapper: give exportable container class so PNG export can find SVG */}
              <div className="w-full h-[calc(100vh-12rem)] overflow-auto exportable-chart">
                {fullscreenContent.content}
              </div>
            </div>
          </div>
        </div>
      )}

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
              <button
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors relative"
                onClick={() => setFiltersOpen(true)}
              >
                <Filter size={16} className="mr-2" />
                Filters
                {activeFilters > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">{activeFilters}</span>
                )}
              </button>
            <UniversalModal
              isOpen={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              title="Filters & Settings"
              description="Detailed filters and Analytics section settings in one place"
              Icon={Filter}
              actions={[
                { label: 'Apply', variant: 'primary', onClick: () => setFiltersOpen(false) },
                { label: 'Clear', variant: 'ghost', onClick: clearFilters }
              ]}
            >
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Filters */}
                <div>
                        <h4 className="text-sm font-semibold mb-3 text-gray-800 dark:text-white">Advanced Filters</h4>
                  <div className="mb-4 w-full">
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Period (month)</label>
                    <div className="flex space-x-2">
                      <select value={filterPeriod.start} onChange={e => setFilterPeriod(f => ({ ...f, start: e.target.value }))} className="w-1/2 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option value="">Start</option>
                        {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={filterPeriod.end} onChange={e => setFilterPeriod(f => ({ ...f, end: e.target.value }))} className="w-1/2 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option value="">End</option>
                        {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4 w-full">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="">All</option>
                      <option value="canal">Sales Channel</option>
                      <option value="regiao">Region</option>
                      <option value="produto">Product</option>
                    </select>
                  </div>

                  <div className="mb-4 w-full">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">User Segment</label>
                    <select value={filterSegment} onChange={e => setFilterSegment(e.target.value)} className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="">All</option>
                      <option value="novos">New</option>
                      <option value="recorrentes">Returning</option>
                    </select>
                  </div>

                  <div className="mb-4 w-full">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Revenue Range</label>
                    <div className="flex space-x-2">
                      <input type="number" placeholder="Min" value={filterRevenueMin} onChange={e => setFilterRevenueMin(e.target.value)} className="w-1/2 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                      <input type="number" placeholder="Max" value={filterRevenueMax} onChange={e => setFilterRevenueMax(e.target.value)} className="w-1/2 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                  </div>

                  <div className="mb-4 w-full">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="">All</option>
                      <option value="concluido">Completed</option>
                      <option value="pendente">Pending</option>
                    </select>
                  </div>
                </div>

                {/* Right: Settings (same as Configure modal) */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-800 dark:text-white">Section Settings</h4>
                  <div className="mb-3">
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Chart Type</label>
                    <select value={chartType} onChange={e => setChartType(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="bar">Bar</option>
                      <option value="line">Line</option>
                      <option value="area">Area</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Primary Color</label>
                    <input type="color" value={chartColor} onChange={e => setChartColor(e.target.value)} className="w-20 h-10 p-0 border rounded-xl" />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Displayed Metric</label>
                    <select value={showMetric} onChange={e => setShowMetric(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="revenue">Revenue</option>
                      <option value="orders">Orders</option>
                      <option value="users">Users</option>
                    </select>
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show legend</span>
                    <input type="checkbox" checked={showLegend} onChange={e => setShowLegend(e.target.checked)} className="h-4 w-4" />
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show grid</span>
                    <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} className="h-4 w-4" />
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show values on points</span>
                    <input type="checkbox" checked={showValues} onChange={e => setShowValues(e.target.checked)} className="h-4 w-4" />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Y-axis Scale</label>
                    <select value={yAxisScale} onChange={e => setYAxisScale(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="auto">Auto</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Auto refresh</span>
                    <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="h-4 w-4" />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Interval (seconds)</label>
                    <input type="number" value={refreshInterval} onChange={e => setRefreshInterval(Number(e.target.value))} min={5} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>
              </div>
            </UniversalModal>
              <button
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                onClick={e => setConfigMenu({ open: true, anchor: e.currentTarget, title: 'Chart Settings' })}
              >
                <Settings size={16} className="mr-2" />
                Configure
              </button>
      {/* Menu de Configurações Chart */}
      <UniversalModal
        isOpen={!!configMenu && configMenu.open}
        onClose={() => setConfigMenu(null)}
        title={configMenu?.title || 'Settings'}
        description="Adjust chart and Analytics section view settings"
        Icon={Settings}
        hideHeaderClose={true}
        actions={[{ label: 'Cancel', variant: 'ghost', onClick: () => setConfigMenu(null) }, { label: 'Save', variant: 'primary', onClick: () => setConfigMenu(null) }]}
      >
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chart basics */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-white">Chart View</h4>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Chart Type</label>
            <select value={chartType} onChange={e => setChartType(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="area">Area</option>
            </select>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Primary Color</label>
              <input type="color" value={chartColor} onChange={e => setChartColor(e.target.value)} className="w-20 h-10 p-0 border rounded-xl" />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Displayed Metric</label>
              <select value={showMetric} onChange={e => setShowMetric(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="revenue">Revenue</option>
                <option value="orders">Orders</option>
                <option value="users">Users</option>
              </select>
            </div>
          </div>

          {/* Chart behavior & extras */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-white">Behavior & Extras</h4>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show legend</span>
              <input type="checkbox" checked={showLegend} onChange={e => setShowLegend(e.target.checked)} className="h-4 w-4" />
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show grid</span>
              <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} className="h-4 w-4" />
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show values on points</span>
              <input type="checkbox" checked={showValues} onChange={e => setShowValues(e.target.checked)} className="h-4 w-4" />
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Y-axis Scale</label>
              <select value={yAxisScale} onChange={e => setYAxisScale(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="auto">Auto</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
          </div>

          {/* Analytics-wide settings */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-white">Analytics Section</h4>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto refresh</span>
              <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="h-4 w-4" />
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Interval (seconds)</label>
              <input type="number" value={refreshInterval} onChange={e => setRefreshInterval(Number(e.target.value))} min={5} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Density</label>
              <select value={analyticsTheme} onChange={e => setAnalyticsTheme(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="default">Default</option>
                <option value="compact">Compact</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>
          </div>

          {/* Advanced / Export options */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-white">Export & Extras</h4>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable quick export</span>
              <input type="checkbox" checked={true} onChange={() => {}} className="h-4 w-4" disabled />
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Timezone (display)</label>
              <select className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Local</option>
                <option>UTC</option>
              </select>
            </div>
          </div>
        </div>
              </UniversalModal>
              <button
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                onClick={() => setExportModalOpen(true)}
              >
                <Download size={16} className="mr-2" />
                Export Report
              </button>

              {/* Export Modal (dynamic export of selected sections) */}
              <UniversalModal
                isOpen={exportModalOpen}
                onClose={() => setExportModalOpen(false)}
                title="Export Report"
                description="Select which sections to include and the export format"
                Icon={Download}
                actions={[
                  { label: 'Cancel', variant: 'ghost', onClick: () => setExportModalOpen(false) },
                  { label: 'Export', variant: 'primary', onClick: () => {
                    // perform export based on options
                    if (exportOptions.format === 'csv') doExportCSV(); else doExportPDF();
                    setExportModalOpen(false);
                  } }
                ]}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Format</label>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center space-x-2">
                        <input type="radio" name="exportFormat" checked={exportOptions.format === 'pdf'} onChange={() => setExportOptions(o => ({ ...o, format: 'pdf' }))} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">PDF</span>
                      </label>
                      <label className="inline-flex items-center space-x-2">
                        <input type="radio" name="exportFormat" checked={exportOptions.format === 'csv'} onChange={() => setExportOptions(o => ({ ...o, format: 'csv' }))} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">CSV</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Include Sections</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="inline-flex items-center space-x-2">
                        <input type="checkbox" checked={exportOptions.includeKPIs} onChange={() => setExportOptions(o => ({ ...o, includeKPIs: !o.includeKPIs }))} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">KPIs</span>
                      </label>
                      <label className="inline-flex items-center space-x-2">
                        <input type="checkbox" checked={exportOptions.includeRevenue} onChange={() => setExportOptions(o => ({ ...o, includeRevenue: !o.includeRevenue }))} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Revenue Trend</span>
                      </label>
                      <label className="inline-flex items-center space-x-2">
                        <input type="checkbox" checked={exportOptions.includeChannels} onChange={() => setExportOptions(o => ({ ...o, includeChannels: !o.includeChannels }))} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Traffic Channels</span>
                      </label>
                      <label className="inline-flex items-center space-x-2">
                        <input type="checkbox" checked={exportOptions.includePerformance} onChange={() => setExportOptions(o => ({ ...o, includePerformance: !o.includePerformance }))} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Performance Metrics</span>
                      </label>
                      <label className="inline-flex items-center space-x-2">
                        <input type="checkbox" checked={exportOptions.includeGeo} onChange={() => setExportOptions(o => ({ ...o, includeGeo: !o.includeGeo }))} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Geographic Distribution</span>
                      </label>
                    </div>
                  </div>
                </div>
              </UniversalModal>
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
  <ChartCard title="Revenue Trend Analysis" dataForExport={filteredRevenueData} exportRef={revenueExportRef}>
    <div ref={revenueExportRef} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
      {chartType === 'bar' ? (
        <ComposedChart data={filteredRevenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
          <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
          <Legend />
          <Bar yAxisId="left" dataKey={showMetric} fill={chartColor} name={showMetric.charAt(0).toUpperCase() + showMetric.slice(1)} radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={3} name="Orders" dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
        </ComposedChart>
      ) : chartType === 'line' ? (
        <ComposedChart data={filteredRevenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
          <Legend />
          <Line type="monotone" dataKey={showMetric} stroke={chartColor} strokeWidth={3} name={showMetric.charAt(0).toUpperCase() + showMetric.slice(1)} dot={{ fill: chartColor, strokeWidth: 2, r: 4 }} />
        </ComposedChart>
      ) : (
        <AreaChart data={filteredRevenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
          <Legend />
          <Area type="monotone" dataKey={showMetric} stroke={chartColor} fill={chartColor + '33'} strokeWidth={2} name={showMetric.charAt(0).toUpperCase() + showMetric.slice(1)} />
        </AreaChart>
      )}
      </ResponsiveContainer>
    </div>
  </ChartCard>

        {/* User Growth */}
  <ChartCard title="User Growth & Engagement" dataForExport={filteredRevenueData}>
    <ResponsiveContainer width="100%" height="100%">
      {chartType === 'area' ? (
        <AreaChart data={filteredRevenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
          <Area type="monotone" dataKey={showMetric} stroke={chartColor} fill={chartColor + '33'} strokeWidth={2} name={showMetric.charAt(0).toUpperCase() + showMetric.slice(1)} />
        </AreaChart>
      ) : chartType === 'line' ? (
        <ComposedChart data={filteredRevenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
          <Legend />
          <Line type="monotone" dataKey={showMetric} stroke={chartColor} strokeWidth={3} name={showMetric.charAt(0).toUpperCase() + showMetric.slice(1)} dot={{ fill: chartColor, strokeWidth: 2, r: 4 }} />
        </ComposedChart>
      ) : (
        <ComposedChart data={filteredRevenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
          <Legend />
          <Bar dataKey={showMetric} fill={chartColor} name={showMetric.charAt(0).toUpperCase() + showMetric.slice(1)} radius={[4, 4, 0, 0]} />
        </ComposedChart>
      )}
    </ResponsiveContainer>
  </ChartCard>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Traffic Sources */}
  <ChartCard title="Traffic Sources Distribution" dataForExport={analyticsData.channelData}>
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
  <ChartCard title="System Performance Metrics" dataForExport={analyticsData.performanceData}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={analyticsData.performanceData}>
              <RadialBar
                label={{ position: 'insideStart', fill: '#fff' }}
                background
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

      {/* Tabela Detalhada com Exportação */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Data Breakdown</h3>
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            onClick={() => {
              const csvRows = [
                ['Month', 'Revenue', 'Orders', 'Users'],
                ...analyticsData.revenueData.map(row => [row.month, row.revenue, row.orders, row.users])
              ];
              const csvContent = csvRows.map(e => e.join(',')).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'analytics_data.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download size={16} className="mr-2" /> Export CSV
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Month</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Revenue</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Orders</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Users</th>
            </tr>
          </thead>
          <tbody>
            {filteredRevenueData.map((row, idx) => (
              <tr key={row.month} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/10' : ''}>
                <td className="px-4 py-2 text-gray-900 dark:text-white">{row.month}</td>
                <td className="px-4 py-2 text-green-700 dark:text-green-400 font-medium">${row.revenue.toLocaleString()}</td>
                <td className="px-4 py-2 text-blue-700 dark:text-blue-400">{row.orders}</td>
                <td className="px-4 py-2 text-purple-700 dark:text-purple-400">{row.users}</td>
              </tr>
            ))}
          </tbody>
        </table>
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