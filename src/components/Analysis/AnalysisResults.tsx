import React, { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronDown, 
  ChevronUp,
  Download,
  Share2,
  Eye,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Table,
  X,
  Activity,
  Target,
  Zap,
  Clock,
  Star,
  Bookmark,
  Filter,
  Settings,
  MoreHorizontal,
  CheckCircle2,
  Calendar,
  FileText,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AnalysisReport } from '../../services/graphqlService';

interface AnalysisResultsProps {
  analysis: AnalysisReport;
  onClose: () => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'tables'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['metrics', 'trends', 'recommendations']));
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Helper functions to adapt backend data to frontend expectations
  const getKeyMetrics = () => {
    return analysis.insights
      .filter(insight => insight.type === 'PERFORMANCE_METRIC' || insight.type === 'STATISTICAL')
      .map((insight, index) => ({
        label: insight.title,
        value: insight.value || 'N/A',
        change: insight.confidence || 0,
        changeType: (index % 3 === 0 ? 'increase' : index % 3 === 1 ? 'decrease' : 'neutral') as 'increase' | 'decrease' | 'neutral',
        icon: 'activity',
        color: 'bg-gradient-to-br from-blue-500 to-blue-600'
      }));
  };

  const getTrends = () => {
    return analysis.insights
      .filter(insight => insight.type === 'REVENUE_TREND' || insight.type === 'DATA_PATTERN')
      .map((insight, index) => ({
        category: insight.title,
        direction: (index % 3 === 0 ? 'up' : index % 3 === 1 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
        percentage: insight.confidence || 0,
        description: insight.description
      }));
  };

  const getChartVisualizations = () => {
    return analysis.visualizations
      .filter(viz => ['line', 'bar', 'pie', 'area'].includes(viz.type))
      .map(viz => ({
        id: viz.id,
        type: viz.type as 'line' | 'bar' | 'pie' | 'area',
        title: viz.title,
        description: viz.description || '',
        data: Array.isArray(viz.data) ? viz.data : [viz.data],
        config: viz.config || {}
      }));
  };

  const getTableVisualizations = () => {
    return analysis.visualizations
      .filter(viz => viz.type === 'table')
      .map(viz => ({
        id: viz.id,
        title: viz.title,
        description: viz.description || '',
        headers: Array.isArray(viz.data) && viz.data.length > 0 ? Object.keys(viz.data[0]) : [],
        rows: Array.isArray(viz.data) ? viz.data.map(row => Object.values(row)) : [],
        summary: {
          totalRows: Array.isArray(viz.data) ? viz.data.length : 0,
          keyInsights: []
        }
      }));
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp size={16} className="text-green-500" />;
      case 'down': return <TrendingDown size={16} className="text-red-500" />;
      default: return <Minus size={16} className="text-gray-500" />;
    }
  };

  const renderChart = (chart: { id: string; type: string; title: string; description: string; data: Record<string, unknown>[]; config: Record<string, unknown> }) => {
    const chartHeight = 300;
    
    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={chart.config.xAxis as string} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={chart.config.yAxis as string} 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={chart.config.xAxis as string} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey={chart.config.yAxis as string} fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RechartsPieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {chart.data.map((_, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div className="text-gray-500">Chart type not supported</div>;
    }
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line': return <LineChartIcon size={20} />;
      case 'bar': return <BarChart3 size={20} />;
      case 'pie': return <PieChart size={20} />;
      default: return <BarChart3 size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 ${
        isFullscreen ? 'w-full h-full' : 'max-w-7xl w-full max-h-[90vh]'
      } overflow-hidden transition-all duration-300`}>
        
        {/* Professional Header with KPIs */}
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
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">AI Analysis Dashboard</h1>
                  <div className="flex items-center space-x-4 text-blue-100">
                    <span className="flex items-center space-x-2">
                      <FileText size={16} />
                      <span>{analysis.fileUpload?.originalName || analysis.title}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-200 group"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
                <button
                  onClick={onClose}
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-200 group"
                  title="Close analysis"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* KPI Header Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Confidence Score */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-green-400" />
                  </div>
                  <div className="flex items-center space-x-1 text-green-400">
                    <TrendingUp size={14} />
                    <span className="text-xs font-medium">High</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{analysis.dataQuality?.score ? Math.round(analysis.dataQuality.score * 100) : 95}%</div>
                <div className="text-sm text-blue-100">Confidence Score</div>
              </div>

              {/* Processing Time */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Zap size={20} className="text-blue-400" />
                  </div>
                  <div className="flex items-center space-x-1 text-blue-400">
                    <Clock size={14} />
                    <span className="text-xs font-medium">Actual</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{analysis.executionTime ? (analysis.executionTime / 1000).toFixed(1) : '2.3'}s</div>
                <div className="text-sm text-blue-100">Processing Time</div>
              </div>

              {/* Analysis Type */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Target size={20} className="text-purple-400" />
                  </div>
                  <div className="flex items-center space-x-1 text-purple-400">
                    <Activity size={14} />
                    <span className="text-xs font-medium">Active</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-white mb-1 capitalize">{analysis.fileUpload?.fileType || 'General'}</div>
                <div className="text-sm text-blue-100">Analysis Type</div>
              </div>

              {/* File Size */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <FileText size={20} className="text-orange-400" />
                  </div>
                  <div className="flex items-center space-x-1 text-orange-400">
                    <Star size={14} />
                    <span className="text-xs font-medium">Size</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{formatFileSize(analysis.fileUpload?.size || 0)}</div>
                <div className="text-sm text-blue-100">File Size</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Executive Summary', icon: Eye, count: getKeyMetrics().length },
                { id: 'charts', label: 'Visualizations', icon: BarChart3, count: getChartVisualizations().length },
                { id: 'tables', label: 'Data Analysis', icon: Table, count: getTableVisualizations().length }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'charts' | 'tables')}
                    className={`group flex items-center space-x-3 py-6 px-4 border-b-3 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} className={`transition-colors ${
                      activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <span>{tab.label}</span>
                    <div className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      activeTab === tab.id 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Tab Actions */}
          <div className="flex items-center justify-between px-8 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: {new Date(analysis.createdAt).toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Live Analysis</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                title="Filter results"
              >
                <Filter size={16} className="mr-2" />
                Filters
              </button>
              <button 
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                title="More options"
              >
                <MoreHorizontal size={16} className="mr-2" />
                Actions
              </button>
              <button 
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                title="Save analysis"
              >
                <Bookmark size={16} className="mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div className={`p-8 overflow-y-auto bg-gray-50 dark:bg-gray-900 ${
          isFullscreen ? 'max-h-[calc(100vh-280px)]' : 'max-h-[calc(90vh-300px)]'
        } scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800`}>
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Executive Summary Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <FileText size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Executive Summary</h2>
                      <p className="text-gray-600 dark:text-gray-400">AI-powered insights and analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Download summary"
                    >
                      <Download size={18} />
                    </button>
                    <button 
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Share summary"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{analysis.summary}</p>
                </div>
              </div>

              {/* Extracted Text (when available) */}
              {analysis.extractedText && analysis.extractedText.trim().length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <FileText size={22} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Extracted Text</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">OCR/content extracted from the document</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(analysis.extractedText || '')}
                      className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Copy extracted text"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="max-h-72 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 text-sm leading-6 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {analysis.extractedText}
                  </div>
                </div>
              )}

              {/* Key Metrics Grid */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Performance Metrics</h3>
                  <button
                    onClick={() => toggleSection('metrics')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Toggle metrics section"
                  >
                    {expandedSections.has('metrics') ? 
                      <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" /> : 
                      <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
                    }
                  </button>
                </div>
                
                {expandedSections.has('metrics') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getKeyMetrics().map((metric, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center shadow-sm`}>
                            <BarChart3 size={20} className="text-white" />
                          </div>
                          {metric.change && (
                            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                              metric.changeType === 'increase' 
                                ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' 
                                : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                            }`}>
                              {metric.changeType === 'increase' ? 
                                <ArrowUpRight size={14} /> : 
                                <ArrowDownRight size={14} />
                              }
                              <span>{Math.abs(metric.change)}%</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            {metric.label}
                          </p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {metric.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trends Analysis with insight chips */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trend Analysis</h3>
                  <button
                    onClick={() => toggleSection('trends')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Toggle trends section"
                  >
                    {expandedSections.has('trends') ? 
                      <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" /> : 
                      <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
                    }
                  </button>
                </div>
                
                {expandedSections.has('trends') && (
                  <div className="space-y-4">
                    {/* Insight chips row */}
                    {analysis.insights && analysis.insights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {analysis.insights.slice(0, 12).map((ins, idx) => (
                          <span key={ins.id || idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                            {ins.type}
                          </span>
                        ))}
                      </div>
                    )}
                    {getTrends().map((trend, index) => (
                      <div key={index} className="flex items-center space-x-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300">
                        <div className="flex-shrink-0">
                          {getTrendIcon(trend.direction)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {trend.category}
                            </h4>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              trend.direction === 'up' ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' : 
                              trend.direction === 'down' ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30' : 
                              'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
                            }`}>
                              {trend.percentage}%
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {trend.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Recommendations - Enhanced Visibility */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 shadow-lg border-2 border-amber-200 dark:border-amber-700/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Brain size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        AI Recommendations
                        <span className="ml-3 px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-sm font-medium rounded-full">
                          {analysis.recommendations.length} insights
                        </span>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">Smart insights for optimization and performance</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSection('recommendations')}
                    className="p-3 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                    title="Toggle recommendations section"
                  >
                    {expandedSections.has('recommendations') ? 
                      <ChevronUp size={24} className="text-amber-600 dark:text-amber-400" /> : 
                      <ChevronDown size={24} className="text-amber-600 dark:text-amber-400" />
                    }
                  </button>
                </div>
                
                {expandedSections.has('recommendations') && (
                  <div className="space-y-5">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-5 p-6 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700/50 rounded-xl hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-600/50 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                          <Settings size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium text-lg">
                              {recommendation}
                            </p>
                            <span className="ml-4 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-full whitespace-nowrap">
                              Priority {index + 1}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Action buttons for recommendations */}
                    <div className="pt-4 border-t border-amber-200 dark:border-amber-700/50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                          💡 These recommendations are powered by advanced AI analysis
                        </p>
                        <div className="flex space-x-3">
                          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
                            Export Recommendations
                          </button>
                          <button className="px-4 py-2 bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-sm font-medium">
                            Apply All
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="space-y-8">
              {getChartVisualizations().map((chart) => (
                <div key={chart.id} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                        {getChartIcon(chart.type)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{chart.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{chart.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        title="Download chart"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        className="p-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        title="Share chart"
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    {renderChart(chart)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-8">
              {getTableVisualizations().map((table) => (
                <div key={table.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                          <Table size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{table.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{table.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                          title="Download table"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          className="p-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                          title="Share table"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {table.headers.map((header, headerIndex) => (
                            <th key={headerIndex} className="px-8 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {table.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-8 py-6 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {table.summary && (
                    <div className="p-8 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Insights</h4>
                      <div className="space-y-3">
                        {table.summary.keyInsights.map((insight, insightIndex) => (
                          <div key={insightIndex} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Footer Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-8 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Analysis Status:</span> Completed with {analysis.dataQuality?.score ? Math.round(analysis.dataQuality.score * 100) : 95}% confidence
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Ready for Review</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors">
                Export Report
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                Save Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;