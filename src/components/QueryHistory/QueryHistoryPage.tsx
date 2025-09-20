import React, { useState, useEffect, useRef } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Database,
  Eye,
  Copy,
  Download,
  AlertCircle,
  Loader,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { useNotification } from '../../contexts/NotificationContext';
import { graphqlService, AIQueryResult } from '../../services/graphqlService';
import QueryResultsModal from '../NaturalLanguage/QueryResultsModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const QueryHistoryPage: React.FC = () => {
  const [queries, setQueries] = useState<AIQueryResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'SUCCESS' | 'ERROR' | 'PROCESSING'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedQueries, setSelectedQueries] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedResultModal, setSelectedResultModal] = useState<AIQueryResult | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'multiple' | 'all';
    queryId?: string;
    queryTitle?: string;
    selectedCount?: number;
  }>({
    isOpen: false,
    type: 'single'
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const lastDeleteTimeRef = useRef<number>(0);
  const { showSuccess, showError } = useNotification();

  // Load query history from API
  useEffect(() => {
    const loadQueries = async () => {
      setIsLoading(true);
      try {
        const queryHistory = await graphqlService.getQueryHistory();
        setQueries(queryHistory);
        // Removendo notificação para evitar duplicação
        // showSuccess(`${queryHistory.length} consultas carregadas com sucesso`);
      } catch (error) {
        console.error('Failed to load query history:', error);
        showError('Erro ao carregar histórico de consultas');
        setQueries([]); // Fallback to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    loadQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Carregamento inicial apenas

  // Função para recarregar dados sem refresh da página
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const queryHistory = await graphqlService.getQueryHistory();
      setQueries(queryHistory);
      showSuccess('Histórico atualizado com sucesso');
    } catch (error) {
      console.error('Failed to refresh query history:', error);
      showError('Erro ao atualizar histórico');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.naturalQuery.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.generatedQuery.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || query.status?.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesDate = dateFilter === 'all' || (() => {
      const queryDate = new Date(query.createdAt);
      const now = new Date();
      const diffTime = now.getTime() - queryDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today': return diffDays <= 1;
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const successCount = queries.filter(q => q.status?.toLowerCase() === 'success').length;
  const errorCount = queries.filter(q => q.status?.toLowerCase() === 'error').length;
  const processingCount = queries.filter(q => q.status?.toLowerCase() === 'processing').length;
  const avgExecutionTime = queries.filter(q => q.status?.toLowerCase() === 'success').reduce((sum, q) => sum + (q.executionTime || 0), 0) / successCount || 0;

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success': return <CheckCircle size={16} className="text-green-500" />;
      case 'error': return <XCircle size={16} className="text-red-500" />;
      case 'processing': return <Loader size={16} className="text-blue-500 animate-spin" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success': return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      case 'error': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'processing': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
      default: return 'border-l-gray-300 dark:border-l-gray-600 bg-white dark:bg-gray-800';
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'postgresql': return <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Database size={16} className="text-white" /></div>;
      case 'mysql': return <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center"><Database size={16} className="text-white" /></div>;
      case 'mongodb': return <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center"><Database size={16} className="text-white" /></div>;
      default: return <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center"><Database size={16} className="text-white" /></div>;
    }
  };

  const toggleQuerySelection = (queryId: string) => {
    const newSelected = new Set(selectedQueries);
    if (newSelected.has(queryId)) {
      newSelected.delete(queryId);
    } else {
      newSelected.add(queryId);
    }
    setSelectedQueries(newSelected);
  };

  const handleDeleteQuery = (queryId: string, queryTitle: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'single',
      queryId,
      queryTitle
    });
  };

  const handleBulkDelete = () => {
    setDeleteModal({
      isOpen: true,
      type: 'multiple',
      selectedCount: selectedQueries.size
    });
  };

  const handleClearAllHistory = () => {
    setDeleteModal({
      isOpen: true,
      type: 'all'
    });
  };

  const confirmDelete = async (e?: React.MouseEvent) => {
    // Prevenir comportamento padrão se o evento existir
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const now = Date.now();
    
    // Previne múltiplas execuções (debounce de 500ms)
    if (isDeleting || (now - lastDeleteTimeRef.current) < 500) {
      return;
    }
    
    lastDeleteTimeRef.current = now;
    setIsDeleting(true);
    try {
      switch (deleteModal.type) {
        case 'single': {
          if (deleteModal.queryId) {
            await graphqlService.deleteQueryHistory(deleteModal.queryId);
            setQueries(prev => prev.filter(q => q.id !== deleteModal.queryId));
            showSuccess('Consulta removida com sucesso');
          }
          break;
        }
        
        case 'multiple': {
          const selectedIds = Array.from(selectedQueries);
          const result = await graphqlService.deleteMultipleQueryHistory(selectedIds);
          setQueries(prev => prev.filter(q => !selectedQueries.has(q.id)));
          setSelectedQueries(new Set());
          if (result.errors.length > 0) {
            showError(`${result.deletedCount} consultas removidas, ${result.errors.length} falharam`);
          } else {
            showSuccess(`${result.deletedCount} consultas removidas com sucesso`);
          }
          break;
        }
        
        case 'all': {
          const clearResult = await graphqlService.clearAllQueryHistory();
          setQueries([]);
          setSelectedQueries(new Set());
          showSuccess(`${clearResult.deletedCount} consultas removidas. ${clearResult.message}`);
          break;
        }
      }
      
      // Fechar modal após sucesso
      setDeleteModal({ isOpen: false, type: 'single' });
    } catch (error) {
      console.error('Failed to delete queries:', error);
      showError('Erro ao remover consultas. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('SQL copiado para a área de transferência');
  };

  const exportQueries = () => {
    const dataToExport = filteredQueries.map(q => ({
      naturalQuery: q.naturalQuery,
      generatedQuery: q.generatedQuery,
      status: q.status,
      executionTime: q.executionTime,
      resultCount: q.results?.length || 0,
      createdAt: q.createdAt
    }));

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_history_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Histórico exportado com sucesso');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <History size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Histórico de Consultas</h2>
              <p className="text-indigo-100">Visualize e gerencie todas as consultas executadas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={exportQueries}
              className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium rounded-lg transition-colors"
            >
              <Download size={20} className="mr-2" />
              Exportar
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              title="Atualizar histórico"
            >
              <RefreshCw size={20} className="text-white" />
            </button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle size={20} className="text-green-300" />
              <span className="text-sm text-indigo-100">Sucessos</span>
            </div>
            <div className="text-2xl font-bold">{successCount}</div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle size={20} className="text-red-300" />
              <span className="text-sm text-indigo-100">Erros</span>
            </div>
            <div className="text-2xl font-bold">{errorCount}</div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Loader size={20} className="text-blue-300" />
              <span className="text-sm text-indigo-100">Processando</span>
            </div>
            <div className="text-2xl font-bold">{processingCount}</div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock size={20} className="text-purple-300" />
              <span className="text-sm text-indigo-100">Tempo Médio</span>
            </div>
            <div className="text-2xl font-bold">{Math.round(avgExecutionTime)}ms</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Buscar consultas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'SUCCESS' | 'ERROR' | 'PROCESSING')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              title="Filtrar por status"
            >
              <option value="all">Todos os Status</option>
              <option value="SUCCESS">Sucesso</option>
              <option value="ERROR">Erro</option>
              <option value="PROCESSING">Processando</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              title="Filtrar por data"
            >
              <option value="all">Todas as Datas</option>
              <option value="today">Hoje</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedQueries.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedQueries.size} selecionadas
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBulkDelete();
                  }}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Deletar selecionadas"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            
            {queries.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClearAllHistory();
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
                title="Limpar todo o histórico"
              >
                <Trash2 size={14} />
                <span>Limpar Tudo</span>
              </button>
            )}
            
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
                title="Visualização em lista"
              >
                <History size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
                title="Visualização em grade"
              >
                <BarChart3 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Query List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Carregando histórico de consultas...</p>
          </div>
        ) : filteredQueries.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredQueries.map((query) => (
              <div
                key={query.id}
                className={`p-6 border-l-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${getStatusColor(query.status)}`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedQueries.has(query.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleQuerySelection(query.id);
                    }}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    title="Selecionar consulta"
                  />
                  
                  <div className="flex-shrink-0 mt-1">
                    {getConnectionIcon('default')}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {query.naturalQuery}
                          </h3>
                          {getStatusIcon(query.status)}
                          <span className={`text-sm font-medium ${
                            query.status?.toLowerCase() === 'success' ? 'text-green-600 dark:text-green-400' :
                            query.status?.toLowerCase() === 'error' ? 'text-red-600 dark:text-red-400' :
                            'text-blue-600 dark:text-blue-400'
                          }`}>
                            {query.status}
                          </span>
                          {query.status?.toLowerCase() === 'success' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              <Eye size={10} className="mr-1" />
                              Detalhes disponíveis
                            </span>
                          )}
                        </div>
                        
                        <div className="bg-gray-900 rounded-lg p-3 mb-3 overflow-x-auto">
                          <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                            {query.generatedQuery}
                          </pre>
                        </div>
                        
                        {query.error && (
                          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-medium text-red-800 dark:text-red-200">Erro:</span>
                            </div>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{query.error}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              {format(new Date(query.createdAt), 'dd/MM/yyyy HH:mm')}
                            </span>
                            <span className="flex items-center">
                              <BarChart3 size={14} className="mr-1" />
                              {query.results?.length || 0} registros
                            </span>
                            {query.status?.toLowerCase() === 'success' && (
                              <span className="flex items-center">
                                <Clock size={14} className="mr-1" />
                                {query.executionTime}ms
                              </span>
                            )}
                          </div>
                          
                          {query.status?.toLowerCase() === 'success' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedResultModal(query);
                              }}
                              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                              title="Ver todos os detalhes desta consulta"
                            >
                              <Eye size={12} />
                              <span>Ver todos os detalhes</span>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {query.status?.toLowerCase() === 'success' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedResultModal(query);
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 text-sm  dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium"
                            title="Visualizar detalhes completos da consulta"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyToClipboard(query.generatedQuery);
                          }}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Copiar SQL"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isDeleting) {
                              handleDeleteQuery(query.id, query.naturalQuery);
                            }
                          }}
                          disabled={isDeleting}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Deletar consulta"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <History size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma consulta encontrada
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Nenhuma consulta foi executada ainda'
              }
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: 'single' })}
        onConfirm={(e) => confirmDelete(e)}
        isLoading={isDeleting}
        title={
          deleteModal.type === 'single' 
            ? 'Confirmar Remoção de Consulta'
            : deleteModal.type === 'multiple'
            ? 'Confirmar Remoção em Lote'
            : 'Confirmar Limpeza do Histórico'
        }
        message={
          deleteModal.type === 'single'
            ? `Tem certeza que deseja remover a consulta "${deleteModal.queryTitle}"?`
            : deleteModal.type === 'multiple'
            ? `Tem certeza que deseja remover as ${deleteModal.selectedCount} consultas selecionadas?`
            : 'Tem certeza que deseja limpar todo o histórico de consultas? Esta ação irá remover permanentemente todas as consultas salvas.'
        }
        itemCount={
          deleteModal.type === 'single' 
            ? 1 
            : deleteModal.type === 'multiple' 
            ? deleteModal.selectedCount 
            : queries.length
        }
      />

      {/* Query Results Modal */}
      {selectedResultModal && (
        <QueryResultsModal
          result={{
            ...selectedResultModal,
            results: selectedResultModal.results || []
          }}
          isOpen={!!selectedResultModal}
          onClose={() => setSelectedResultModal(null)}
        />
      )}
    </div>
  );
};

export default QueryHistoryPage;