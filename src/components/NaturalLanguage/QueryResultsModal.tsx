import React, { useState } from 'react';
import { 
  X,
  Download,
  BarChart3,
  Table as TableIcon,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AIQueryResult } from '../../services/graphqlService';
import { useNotification } from '../../contexts/NotificationContext';

interface QueryResultsModalProps {
  result: AIQueryResult;
  isOpen: boolean;
  onClose: () => void;
}

const QueryResultsModal: React.FC<QueryResultsModalProps> = ({ result, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'insights'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary', 'metrics']));
  const { showSuccess, showError } = useNotification();

  // Debug: Log para entender a estrutura dos dados
  console.log('QueryResultsModal - result structure:', JSON.stringify(result, null, 2));

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const exportToPDF = () => {
    if (!result.results || result.results.length === 0) {
      showError('Nenhum dado disponível para exportação');
      return;
    }

    try {
      // Criar HTML para PDF
      const data = result.results.map(item => item.data).filter(Boolean);
      const columns = data.length > 0 ? Object.keys(data[0] || {}) : [];
      const insights = generateInsights();
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório de Consulta de Dados</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              line-height: 1.6;
            }
            
            .header {
              background: linear-gradient(135deg, #3B82F6, #1D4ED8);
              color: white;
              padding: 30px;
              margin: -20px -20px 30px -20px;
              text-align: center;
            }
            
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            
            .header .subtitle {
              margin: 10px 0 0 0;
              font-size: 14px;
              opacity: 0.9;
            }
            
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #3B82F6;
              border-bottom: 2px solid #3B82F6;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            
            .info-box {
              background: #F8FAFC;
              border: 1px solid #E2E8F0;
              border-left: 4px solid #3B82F6;
              padding: 20px;
              margin: 15px 0;
              border-radius: 5px;
            }
            
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin: 20px 0;
            }
            
            .metric-card {
              background: white;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .metric-value {
              font-size: 24px;
              font-weight: bold;
              color: #3B82F6;
              margin: 10px 0;
            }
            
            .metric-label {
              font-size: 12px;
              color: #6B7280;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .status-indicator {
              display: inline-block;
              padding: 5px 15px;
              border-radius: 20px;
              color: white;
              font-weight: bold;
              margin: 10px 0;
            }
            
            .status-success {
              background-color: #10B981;
            }
            
            .status-error {
              background-color: #EF4444;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            th {
              background: #3B82F6;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            td {
              padding: 12px;
              border-bottom: 1px solid #E2E8F0;
              font-size: 11px;
            }
            
            tr:nth-child(even) {
              background: #F8FAFC;
            }
            
            tr:hover {
              background: #EFF6FF;
            }
            
            .recommendations {
              background: #FEF3C7;
              border: 1px solid #F59E0B;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            
            .recommendations h4 {
              color: #92400E;
              margin: 0 0 15px 0;
            }
            
            .recommendations ul {
              margin: 0;
              padding-left: 20px;
            }
            
            .recommendations li {
              margin: 8px 0;
              color: #78350F;
            }
            
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #E2E8F0;
              text-align: center;
              font-size: 12px;
              color: #6B7280;
            }
            
            @media print {
              body { margin: 0; }
              .section { page-break-inside: avoid; }
              .header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header" style="display: flex; align-items: center; justify-content: flex-start;">
            <img src="/LOGOTIPO-IT-DATA-1943x2048.png" alt="Logo" style="height: 48px; width: auto; margin-right: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); background: white;" />
            <div>
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Relatório de Consulta de Dados</h1>
              <div class="subtitle">
                Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">1. Informações da Consulta</div>
            <div class="info-box">
              <strong>Consulta Natural:</strong><br>
              ${result.naturalQuery || 'Consulta não especificada'}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">2. Status da Execução</div>
            <div style="margin: 15px 0;">
              <span class="status-indicator ${result.status === 'SUCCESS' ? 'status-success' : 'status-error'}">
                ${result.status === 'SUCCESS' ? 'SUCESSO' : 'ERRO'}
              </span>
              <div style="margin-top: 10px; font-size: 14px; color: #6B7280;">
                <strong>Tempo de Execução:</strong> ${result.executionTime || 0}ms |
                <strong>Registros Encontrados:</strong> ${data.length}
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">3. Métricas Principais</div>
            <div class="metrics-grid">
              ${insights.metrics.map(metric => `
                <div class="metric-card">
                  <div class="metric-label">${metric.label}</div>
                  <div class="metric-value">${metric.value}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">4. Resumo da Análise</div>
            <div class="info-box">
              ${insights.summary}
            </div>
          </div>
          
          ${data.length > 0 ? `
          <div class="section">
            <div class="section-title">5. Dados (Primeiros 20 Registros)</div>
            <table>
              <thead>
                <tr>
                  ${columns.map(col => `<th>${col}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.slice(0, 20).map((row: any) => `
                  <tr>
                    ${columns.map(col => `
                      <td>${row[col]?.toString()?.slice(0, 50) || '-'}</td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${data.length > 20 ? `
              <div style="text-align: center; margin-top: 15px; color: #6B7280; font-size: 12px;">
                <em>Mostrando os primeiros 20 registros de ${data.length} total. Para ver todos os dados, use a exportação CSV ou JSON.</em>
              </div>
            ` : ''}
          </div>
          ` : ''}
          
          <div class="section">
            <div class="section-title">6. Recomendações</div>
            <div class="recommendations">
              <h4>💡 Sugestões para Otimização:</h4>
              <ul>
                ${insights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <div>Relatório gerado automaticamente pelo sistema SmartBI</div>
            <div>© ${new Date().getFullYear()} - Todos os direitos reservados</div>
          </div>
        </body>
        </html>
      `;
      
      // Criar e baixar o arquivo
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Aguardar o carregamento e imprimir
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      } else {
        // Fallback: download como HTML
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_consulta_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      showSuccess('Relatório gerado com sucesso! Use Ctrl+P para salvar como PDF');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      showError('Erro ao gerar relatório');
    }
  };

  const exportData = (format: 'csv' | 'json') => {
    if (!result.results || result.results.length === 0) {
      showError('Nenhum dado disponível para exportação');
      return;
    }

    // Extrai os dados: results é um array de objetos com propriedade 'data'
    const data = result.results.map(item => item.data).filter(Boolean);
    let content = '';
    let filename = `query_results_${new Date().toISOString().split('T')[0]}`;
    
    try {
      switch (format) {
        case 'json':
          content = JSON.stringify(data, null, 2);
          filename += '.json';
          break;
        case 'csv':
          if (data.length > 0) {
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row => 
              Object.values(row).map(value => 
                typeof value === 'string' && value.includes(',') ? `"${value}"` : value
              ).join(',')
            ).join('\n');
            content = `${headers}\n${rows}`;
          }
          filename += '.csv';
          break;
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess(`Dados exportados como ${format.toUpperCase()}`);
    } catch {
      showError('Erro ao exportar dados');
    }
  };

  const generateInsights = () => {
    if (!result.results || result.results.length === 0) {
      return {
        summary: 'Nenhum dado encontrado para análise.',
        metrics: [],
        trends: [],
        recommendations: ['Verifique os filtros aplicados', 'Tente uma consulta diferente']
      };
    }

    // Extrai os dados: results é um array de objetos com propriedade 'data'
    const data = result.results.map(item => item.data).filter(Boolean);
    const recordCount = data.length;
    const columns = data.length > 0 ? Object.keys(data[0] || {}) : [];
    
    // Generate basic metrics
    const metrics = [
      {
        label: 'Total de Registros',
        value: recordCount.toLocaleString(),
        icon: 'Database',
        color: 'bg-blue-500'
      },
      {
        label: 'Colunas',
        value: columns.length.toString(),
        icon: 'Table',
        color: 'bg-green-500'
      },
      {
        label: 'Tempo de Execução',
        value: `${result.executionTime || 0}ms`,
        icon: 'Clock',
        color: 'bg-purple-500'
      }
    ];

    // Generate trends based on data
    const trends = [];
    if (recordCount > 10) {
      trends.push({
        category: 'Volume de Dados',
        direction: 'up' as const,
        percentage: 85,
        description: 'Boa quantidade de registros encontrados'
      });
    }

    const recommendations = [
      'Use filtros para refinar os resultados',
      'Exporte os dados para análise adicional',
      'Considere criar visualizações personalizadas'
    ];

    if (recordCount > 100) {
      recommendations.push('Considere paginar os resultados para melhor performance');
    }

    return {
      summary: `Consulta executada com sucesso retornando ${recordCount} registros. Os dados contêm ${columns.length} colunas com informações estruturadas prontas para análise.`,
      metrics,
      trends,
      recommendations
    };
  };

  const insights = generateInsights();

  const renderTable = () => {
    if (!result.results || result.results.length === 0) {
      return (
        <div className="text-center py-8">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum dado disponível</p>
        </div>
      );
    }

    // Extrai os dados: results é um array de objetos com propriedade 'data'
    const data = result.results
      .map(item => item.data)
      .filter(Boolean)
      .slice(0, 100); // Limit to 100 rows for performance
    const columns = data.length > 0 ? Object.keys(data[0] || {}) : [];

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row: unknown, index: number) => {
              const rowData = row as Record<string, unknown>;
              return (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {columns.map((column) => (
                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {rowData[column]?.toString() || '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {result.results.length > 100 && (
          <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando os primeiros 100 registros de {result.results.length} total.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderChart = () => {
    if (!result.results || result.results.length === 0) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum dado disponível para visualização</p>
        </div>
      );
    }

    // Extrai os dados: results é um array de objetos com propriedade 'data'
    const data = result.results
      .map(item => item.data)
      .filter(Boolean)
      .slice(0, 10); // Limit for chart
    const columns = data.length > 0 ? Object.keys(data[0] || {}) : [];
    const numericColumn = columns.find(col => 
      data.some((row: unknown) => {
        const rowData = row as Record<string, unknown>;
        return typeof rowData[col] === 'number';
      })
    );
    const labelColumn = columns.find(col => {
      const firstRow = data[0] as Record<string, unknown>;
      return typeof firstRow[col] === 'string';
    }) || columns[0];

    if (!numericColumn) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma coluna numérica encontrada para visualização</p>
        </div>
      );
    }

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={labelColumn} stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey={numericColumn} fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Resultados da Consulta
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {result.naturalQuery}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportToPDF}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={() => exportData('csv')}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </button>
            <button
              onClick={() => exportData('json')}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              JSON
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Fechar modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {result.status === 'SUCCESS' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {result.status === 'SUCCESS' ? 'Sucesso' : 'Erro'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{result.executionTime || 0}ms</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Database className="w-4 h-4" />
                <span>{result.results?.length || 0} registros</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'data'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <TableIcon className="w-4 h-4 inline mr-2" />
            Dados
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'insights'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Insights
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Resumo da Consulta
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {insights.summary}
                </p>
              </div>

              {/* Metrics */}
              <div>
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => toggleSection('metrics')}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Métricas Principais
                  </h3>
                  {expandedSections.has('metrics') ? 
                    <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  }
                </div>
                {expandedSections.has('metrics') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insights.metrics.map((metric, index) => (
                      <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {metric.label}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {metric.value}
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg ${metric.color}`}>
                            {metric.icon === 'Database' && <Database className="w-6 h-6 text-white" />}
                            {metric.icon === 'Table' && <TableIcon className="w-6 h-6 text-white" />}
                            {metric.icon === 'Clock' && <Clock className="w-6 h-6 text-white" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chart Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Visualização dos Dados
                </h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  {renderChart()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              {renderTable()}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* Trends */}
              {insights.trends.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Tendências Identificadas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.trends.map((trend, index) => (
                      <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {trend.category}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {trend.direction === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                            {trend.direction === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                            {trend.direction === 'stable' && <Minus className="w-4 h-4 text-gray-500" />}
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {trend.percentage}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {trend.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recomendações
                </h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <ul className="space-y-3">
                    {insights.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <span className="text-gray-700 dark:text-gray-300">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueryResultsModal;