import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Database, 
  BarChart3, 
  Download, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Copy,
  Play,
  Sparkles,
  Brain
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { processNaturalLanguageQuery } from '../../utils/naturalLanguageProcessor';
import { NaturalLanguageQuery, QueryFilter } from '../../types/query';
import { format } from 'date-fns';

const NaturalLanguageQueryPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [queries, setQueries] = useState<NaturalLanguageQuery[]>([]);
  const [activeQuery, setActiveQuery] = useState<NaturalLanguageQuery | null>(null);
  const [filters, setFilters] = useState<QueryFilter[]>([]);
  const [showSqlQuery, setShowSqlQuery] = useState(false);

  const exampleQueries = [
    "Show Primavera orders with pending status for more than 5 days",
    "Display sales revenue by month for the last 12 months",
    "List active customers who placed orders in the last 30 days",
    "Show top 10 products by revenue this quarter",
    "Find customers with overdue invoices greater than $1000"
  ];

  const handleSubmitQuery = async () => {
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    
    try {
      const result = await processNaturalLanguageQuery(query);
      setQueries(prev => [result, ...prev]);
      setActiveQuery(result);
      setQuery('');
    } catch (error) {
      console.error('Query processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportData = (format: 'csv' | 'json' | 'excel') => {
    if (!activeQuery?.results) return;
    
    // In a real implementation, this would generate and download the file
    console.log(`Exporting data as ${format}:`, activeQuery.results.data);
    alert(`Data exported as ${format.toUpperCase()}`);
  };

  const renderVisualization = (viz: any) => {
    const height = 300;
    
    switch (viz.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={viz.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={viz.config.xAxis} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey={viz.config.yAxis} 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={viz.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={viz.config.xAxis} stroke="#6b7280" fontSize={12} />
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
                dataKey={viz.config.yAxis} 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div className="text-gray-500">Visualization type not supported</div>;
    }
  };

  const formatCellValue = (value: any, type: string) => {
    switch (type) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'date':
        return format(new Date(value), 'MMM dd, yyyy');
      default:
        return value;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Natural Language Query</h2>
            <p className="text-purple-100">Ask questions about your data in plain English</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-purple-100">
          <div className="flex items-center space-x-2">
            <MessageSquare size={16} className="text-blue-200" />
            <span>Natural Language Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <Database size={16} className="text-purple-200" />
            <span>Auto SQL Generation</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 size={16} className="text-pink-200" />
            <span>Smart Visualizations</span>
          </div>
        </div>
      </div>

      {/* Query Input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ask a question about your data
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Show Primavera orders with pending status for more than 5 days"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={3}
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSubmitQuery}
              disabled={!query.trim() || isProcessing}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader size={20} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play size={20} className="mr-2" />
                  Execute Query
                </>
              )}
            </button>
            
            {isProcessing && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Sparkles size={16} className="mr-2 text-purple-500 animate-pulse" />
                AI is analyzing your request...
              </div>
            )}
          </div>
        </div>

        {/* Example Queries */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Try these examples:</h4>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-xs px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={isProcessing}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query History */}
      {queries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Query History</h3>
          <div className="space-y-3">
            {queries.slice(0, 5).map((q) => (
              <div
                key={q.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  activeQuery?.id === q.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => setActiveQuery(q)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{q.input}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {format(new Date(q.timestamp), 'MMM dd, HH:mm')}
                      </span>
                      {q.results && (
                        <span>{q.results.totalRows} rows returned</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {q.status === 'completed' && <CheckCircle size={16} className="text-green-500" />}
                    {q.status === 'error' && <AlertCircle size={16} className="text-red-500" />}
                    {q.status === 'processing' && <Loader size={16} className="text-blue-500 animate-spin" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {activeQuery && activeQuery.results && (
        <div className="space-y-6">
          {/* SQL Query Display */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Query</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(activeQuery.sqlQuery)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copy SQL"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => setShowSqlQuery(!showSqlQuery)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {showSqlQuery ? 'Hide' : 'Show'} SQL
                </button>
              </div>
            </div>
            
            {showSqlQuery && (
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {activeQuery.sqlQuery}
                </pre>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-4">
              <span>Execution time: {activeQuery.results.executionTime}ms</span>
              <span>API: {activeQuery.apiEndpoint}</span>
            </div>
          </div>

          {/* Visualizations */}
          {activeQuery.results.visualizations.length > 0 && (
            <div className="space-y-6">
              {activeQuery.results.visualizations.map((viz) => (
                <div key={viz.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{viz.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{viz.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => exportData('csv')}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Export Chart Data"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="h-80">
                    {renderVisualization(viz)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Data Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Query Results</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeQuery.results.totalRows} rows returned
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportData('csv')}
                    className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Download size={14} className="mr-1" />
                    CSV
                  </button>
                  <button
                    onClick={() => exportData('excel')}
                    className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Download size={14} className="mr-1" />
                    Excel
                  </button>
                  <button
                    onClick={() => exportData('json')}
                    className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Download size={14} className="mr-1" />
                    JSON
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {activeQuery.results.columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.label}</span>
                          {column.filterable && (
                            <Filter size={12} className="text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {activeQuery.results.data.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {activeQuery.results!.columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCellValue(row[column.key], column.type)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NaturalLanguageQueryPage;