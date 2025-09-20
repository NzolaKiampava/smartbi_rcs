import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Database,
  MessageSquare,
  BarChart3,
  Download,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Copy,
  Sparkles,
  Brain,
  RefreshCw,
  Eye
} from 'lucide-react';
import { graphqlService, Connection, AIQueryResult } from '../../services/graphqlService';
// import { useNotification } from '../../contexts/NotificationContext'; // Temporariamente desabilitado para debug
import { format } from 'date-fns';
import QueryResultsModal from './QueryResultsModal';

const NaturalLanguageQueryPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [queries, setQueries] = useState<AIQueryResult[]>([]);
  const [activeQuery, setActiveQuery] = useState<AIQueryResult | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [showSqlQuery, setShowSqlQuery] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'unavailable' | null>(null);
  const [selectedResultModal, setSelectedResultModal] = useState<AIQueryResult | null>(null);
  // const { showSuccess, showError } = useNotification(); // Temporariamente desabilitado para debug

  const exampleQueries = [
    "Mostre os 5 primeiros usuários",
    "Quantos usuários temos no total?",
    "Mostre todas as empresas cadastradas",
    "Mostre usuários ativos",
    "Quais são as conexões do tipo SUPABASE?",
    "Mostre os usuários criados hoje",
    "Quantas empresas ativas temos?",
    "Agrupe usuários por empresa"
  ];

  const loadConnections = useCallback(async () => {
    setIsLoadingConnections(true);
    try {
      const connectionsList = await graphqlService.getConnections();
      setConnections(connectionsList);
      
      // Select default connection or first available
      const defaultConnection = connectionsList.find(conn => conn.isDefault) || connectionsList[0];
      if (defaultConnection) {
        setSelectedConnectionId(defaultConnection.id);
      }
      
      // Removendo notificação para evitar duplicação
      // showSuccess(`${connectionsList.length} conexões carregadas com sucesso`);
    } catch (error) {
      console.error('Failed to load connections:', error);
      console.warn('Erro ao carregar conexões de banco de dados');
    } finally {
      setIsLoadingConnections(false);
    }
  }, []);

  // Check API status periodically
  const checkAPIStatus = useCallback(async () => {
    try {
      setApiStatus('checking');
      // Try a simple query to check if the backend is responsive
      const response = await fetch('/api/health', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setApiStatus('available');
      } else {
        setApiStatus('unavailable');
      }
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus('unavailable');
    }
  }, []);

  // Load connections on component mount
  useEffect(() => {
    loadConnections();
    checkAPIStatus();
    
    // Check API status every 30 seconds
    const interval = setInterval(checkAPIStatus, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove dependencies to prevent infinite loops

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmitQuery();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuery();
    }
  };

  const handleSubmitQuery = async () => {
    if (!query.trim() || isProcessing || !selectedConnectionId) {
      if (!selectedConnectionId) {
        console.warn('Por favor, selecione uma conexão de banco de dados');
      }
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await graphqlService.executeNaturalQuery(selectedConnectionId, query.trim());
      
      if (result.status === 'SUCCESS') {
        setQueries(prev => [result, ...prev]);
        setActiveQuery(result);
        setQuery('');
        console.log('Consulta executada com sucesso!');
      } else {
        // Handle specific error messages from the backend
        let errorMessage = result.error || 'Erro desconhecido ao processar consulta';
        
        // Provide more user-friendly error messages
        if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
          errorMessage = 'O serviço de IA está temporariamente indisponível. Tente novamente em alguns minutos.';
        } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
          errorMessage = 'Limite de requisições excedido. Aguarde alguns minutos antes de tentar novamente.';
        } else if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('API key')) {
          errorMessage = 'Erro de autenticação com o serviço de IA. Contate o administrador do sistema.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua conexão com a internet e tente novamente.';
        } else if (errorMessage.includes('timeout')) {
          errorMessage = 'A consulta demorou muito para ser processada. Tente uma consulta mais simples.';
        }
        
        setQueries(prev => [result, ...prev]);
        setActiveQuery(result);
        console.warn(errorMessage);
      }
    } catch (error) {
      console.error('Query processing failed:', error);
      
      let errorMessage = 'Erro ao processar consulta. ';
      
      if (error instanceof Error) {
        if (error.message.includes('503')) {
          errorMessage += 'O serviço está temporariamente indisponível. Tente novamente em alguns minutos.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Verifique sua conexão com a internet.';
        } else {
          errorMessage += 'Tente novamente ou contate o suporte.';
        }
      } else {
        errorMessage += 'Tente novamente ou contate o suporte.';
      }
      
      console.warn(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    console.log('Copiado para a área de transferência');
  };

  const exportData = (format: 'csv' | 'json' | 'excel') => {
    if (!activeQuery?.results) return;

    // Convert results to exportable format
    const data = activeQuery.results;
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
            const rows = data.map(row => Object.values(row).join(',')).join('\n');
            content = `${headers}\n${rows}`;
          }
          filename += '.csv';
          break;
        default:
          console.warn('Formato de exportação não suportado ainda');
          return;
      }

      // Create download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`Dados exportados como ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      console.warn('Erro ao exportar dados');
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conexões Disponíveis</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{connections.length}</p>
            </div>
            <Database className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Consultas Executadas</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{queries.length}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Sucesso</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {queries.length > 0 ? Math.round((queries.filter(q => q.status === 'SUCCESS').length / queries.length) * 100) : 0}%
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status da IA</p>
              <div className="flex items-center space-x-2 mt-1">
                {apiStatus === 'checking' && (
                  <>
                    <Loader className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-sm text-blue-600">Verificando...</span>
                  </>
                )}
                {apiStatus === 'available' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Disponível</span>
                  </>
                )}
                {apiStatus === 'unavailable' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Indisponível</span>
                  </>
                )}
              </div>
            </div>
            <Brain className="w-12 h-12 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Query Input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <form onSubmit={handleFormSubmit}>
          {/* Connection Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Database className="inline w-4 h-4 mr-1" />
              Conexão de Banco de Dados
            </label>
          <div className="relative">
            <select
              value={selectedConnectionId}
              onChange={(e) => setSelectedConnectionId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isLoadingConnections || isProcessing}
              aria-label="Selecionar conexão de banco de dados"
            >
              <option value="">Selecione uma conexão...</option>
              {connections.map((connection) => (
                <option key={connection.id} value={connection.id}>
                  {connection.name} ({connection.type}) - {connection.status}
                  {connection.isDefault ? ' (Padrão)' : ''}
                </option>
              ))}
            </select>
            {isLoadingConnections && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          {connections.length === 0 && !isLoadingConnections && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
              Nenhuma conexão disponível. Configure uma conexão primeiro.
            </p>
          )}
        </div>

        {/* API Status Warning */}
        {apiStatus === 'unavailable' && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Serviço de IA Temporariamente Indisponível
                </p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  O serviço está passando por manutenção. Tente novamente em alguns minutos.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Faça uma pergunta sobre seus dados
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ex: Mostre os 5 primeiros usuários da empresa"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={3}
              disabled={isProcessing || !selectedConnectionId}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={!query.trim() || isProcessing || !selectedConnectionId || apiStatus === 'unavailable'}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : apiStatus === 'unavailable' ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Serviço Indisponível
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Executar Consulta
                </>
              )}
            </button>
            
            {isProcessing && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Sparkles size={16} className="mr-2 text-purple-500 animate-pulse" />
                AI está analisando sua solicitação...
              </div>
            )}

            <button
              type="button"
              onClick={loadConnections}
              disabled={isLoadingConnections}
              className="inline-flex items-center px-4 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingConnections ? 'animate-spin' : ''}`} />
              Atualizar Conexões
            </button>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <Clock className="inline w-4 h-4 mr-1" />
            Histórico: {queries.length} consultas
          </div>
        </div>
        </form>

        {/* Example Queries */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Experimente estes exemplos:</h4>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                type="button"
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Histórico de Consultas</h3>
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
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{q.naturalQuery}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {format(new Date(q.createdAt), 'dd/MM HH:mm')}
                      </span>
                      {q.results && q.results.length > 0 && (
                        <span>{q.results.length} registros retornados</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {q.status === 'SUCCESS' && (
                      <button
                        type="button"
                        onClick={() => setSelectedResultModal(q)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                        title="Visualizar detalhes"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    {q.status === 'SUCCESS' && <CheckCircle size={16} className="text-green-500" />}
                    {q.status === 'ERROR' && <AlertCircle size={16} className="text-red-500" />}
                    {q.status === 'PROCESSING' && <Loader size={16} className="text-blue-500 animate-spin" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {activeQuery && (
        <div className="space-y-6">
          {activeQuery.results && activeQuery.results.length > 0 ? (
            <>
              {/* SQL Query Display */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SQL Gerado</h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedResultModal(activeQuery)}
                  className="flex items-center px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  title="Visualizar detalhes completos"
                >
                  <Eye size={14} className="mr-1" />
                  Detalhes
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(activeQuery.generatedQuery)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copiar SQL"
                >
                  <Copy size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlQuery(!showSqlQuery)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {showSqlQuery ? 'Ocultar' : 'Mostrar'} SQL
                </button>
              </div>
            </div>

            {showSqlQuery && (
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {activeQuery.generatedQuery}
                </pre>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-4">
              <span>Tempo de execução: {activeQuery.executionTime}ms</span>
              <span>Status: {activeQuery.status}</span>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resultados da Consulta</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeQuery.results?.length || 0} registros retornados
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => exportData('csv')}
                    className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Download size={14} className="mr-1" />
                    CSV
                  </button>
                  <button
                    type="button"
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
                    {activeQuery.results?.[0] && Object.keys(activeQuery.results[0].data || activeQuery.results[0] || {}).map((column) => (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        <div className="flex items-center space-x-1">
                          <span>{String(column)}</span>
                          <Filter size={12} className="text-gray-400 dark:text-gray-500" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {activeQuery.results?.slice(0, 100).map((item, index) => {
                    const rowData = item.data || item;
                    return (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        {Object.entries(rowData).map(([column, value]) => (
                          <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {value === null || value === undefined ? '-' : String(value)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {activeQuery.results && activeQuery.results.length > 100 && (
              <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando os primeiros 100 registros de {activeQuery.results?.length || 0} total.
                  Use a exportação para ver todos os dados.
                </p>
              </div>
            )}
          </div>
            </>
          ) : (
            activeQuery.status === 'ERROR' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-medium text-red-900 dark:text-red-200">Erro na consulta</h3>
                </div>
                <p className="text-red-700 dark:text-red-300 mt-2">{activeQuery.error}</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Empty State */}
      {activeQuery && activeQuery.status === 'SUCCESS' && activeQuery.results?.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-200">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum dado encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            A consulta foi executada com sucesso, mas não retornou nenhum resultado.
          </p>
        </div>
      )}

      {/* Query Results Modal */}
      {selectedResultModal && (
        <QueryResultsModal
          result={selectedResultModal}
          isOpen={!!selectedResultModal}
          onClose={() => setSelectedResultModal(null)}
        />
      )}
    </div>
  );
};

export default NaturalLanguageQueryPage;