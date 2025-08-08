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
  Table
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AnalysisResult } from '../../types/analysis';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  onClose: () => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'tables'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['metrics', 'trends']));

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

  const renderChart = (chart: any) => {
    const chartHeight = 300;
    
    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={chart.config.xAxis} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={chart.config.yAxis} 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={chart.config.xAxis} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey={chart.config.yAxis} fill="#3B82F6" radius={[4, 4, 0, 0]} />
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chart.data.map((entry: any, index: number) => (
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Brain size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Analysis Results</h2>
                <p className="text-blue-100">{analysis.fileName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-blue-100">Confidence Score</div>
                <div className="text-2xl font-bold">{analysis.confidence}%</div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Processing Stats */}
          <div className="mt-4 flex items-center space-x-6 text-sm text-blue-100">
            <span>Processing Time: {(analysis.processingTime / 1000).toFixed(1)}s</span>
            <span>•</span>
            <span>Analysis Type: {analysis.analysisType.charAt(0).toUpperCase() + analysis.analysisType.slice(1)}</span>
            <span>•</span>
            <span>Generated: {new Date(analysis.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'charts', label: 'Visualizations', icon: BarChart3 },
              { id: 'tables', label: 'Data Tables', icon: Table }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis Summary</h3>
                <p className="text-gray-700 leading-relaxed">{analysis.insights.summary}</p>
              </div>

              {/* Key Metrics */}
              <div>
                <button
                  onClick={() => toggleSection('metrics')}
                  className="flex items-center justify-between w-full text-left mb-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
                  {expandedSections.has('metrics') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedSections.has('metrics') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-300">
                    {analysis.insights.keyMetrics.map((metric, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-10 h-10 ${metric.color} rounded-lg flex items-center justify-center`}>
                            <span className="text-white text-sm">📊</span>
                          </div>
                          {metric.change && (
                            <div className={`flex items-center space-x-1 text-sm ${
                              metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {metric.changeType === 'increase' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                              <span>{Math.abs(metric.change)}%</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{metric.label}</p>
                          <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trends */}
              <div>
                <button
                  onClick={() => toggleSection('trends')}
                  className="flex items-center justify-between w-full text-left mb-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Trends & Insights</h3>
                  {expandedSections.has('trends') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedSections.has('trends') && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    {analysis.insights.trends.map((trend, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        {getTrendIcon(trend.direction)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{trend.category}</h4>
                            <span className={`text-sm font-medium ${
                              trend.direction === 'up' ? 'text-green-600' : 
                              trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {trend.percentage}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{trend.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div>
                <button
                  onClick={() => toggleSection('recommendations')}
                  className="flex items-center justify-between w-full text-left mb-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
                  {expandedSections.has('recommendations') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedSections.has('recommendations') && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    {analysis.insights.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">💡</span>
                        </div>
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="space-y-6">
              {analysis.visualizations.charts.map((chart, index) => (
                <div key={chart.id} className="bg-white border border-gray-200 rounded-xl p-6 animate-in fade-in-50 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getChartIcon(chart.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{chart.title}</h3>
                        <p className="text-sm text-gray-600">{chart.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="h-80">
                    {renderChart(chart)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-6">
              {analysis.visualizations.tables.map((table, index) => (
                <div key={table.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-in fade-in-50 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{table.title}</h3>
                        <p className="text-sm text-gray-600">{table.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Download size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {table.headers.map((header, headerIndex) => (
                            <th key={headerIndex} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {table.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {table.summary && (
                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
                      <div className="space-y-1">
                        {table.summary.keyInsights.map((insight, insightIndex) => (
                          <p key={insightIndex} className="text-sm text-gray-600">• {insight}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Analysis completed with {analysis.confidence}% confidence
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Export Report
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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