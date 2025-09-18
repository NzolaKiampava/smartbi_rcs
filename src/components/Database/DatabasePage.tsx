import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  MoreVertical, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock,
  Zap,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  Calendar,
  Loader
} from 'lucide-react';
import { format } from 'date-fns';
import { graphqlService, Connection } from '../../services/graphqlService';
import { useNotification } from '../../contexts/NotificationContext';

const DatabasePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'connected' | 'disconnected' | 'error'>('all');
  const [filterType, setFilterType] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [databases, setDatabases] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Load database connections from API
  useEffect(() => {
    const loadDatabases = async () => {
      setIsLoading(true);
      try {
        const connections = await graphqlService.getConnections();
        setDatabases(connections);
        showSuccess(`${connections.length} conexões carregadas com sucesso`);
      } catch (error) {
        console.error('Failed to load database connections:', error);
        showError('Erro ao carregar conexões de banco de dados');
        setDatabases([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDatabases();
  }, [showSuccess, showError]);

  // Function to map backend status to display status
  const mapStatus = (backendStatus: string) => {
    switch (backendStatus?.toLowerCase()) {
      case 'active': return 'connected';
      case 'inactive': return 'disconnected';
      case 'error': return 'error';
      case 'connecting': return 'connecting';
      default: return 'disconnected';
    }
  };

  const getStatusColor = (status: string) => {
    const mappedStatus = mapStatus(status);
    switch (mappedStatus) {
      case 'connected': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'disconnected': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
      case 'error': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'connecting': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    const mappedStatus = mapStatus(status);
    switch (mappedStatus) {
      case 'connected': return <CheckCircle size={16} className="text-green-500" />;
      case 'disconnected': return <XCircle size={16} className="text-gray-500" />;
      case 'error': return <AlertCircle size={16} className="text-red-500" />;
      case 'connecting': return <Clock size={16} className="text-yellow-500 animate-pulse" />;
      default: return <Database size={16} className="text-gray-500" />;
    }
  };

  const getDatabaseIcon = (type: string) => {
    const iconProps = { size: 24, className: "text-white" };
    
    switch (type.toLowerCase()) {
      case 'postgresql': 
      case 'postgres': 
        return <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'supabase': 
        return <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'mongodb': 
      case 'mongo': 
        return <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'oracle': 
        return <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'sqlserver': 
      case 'mssql': 
        return <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'redis': 
        return <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center"><Zap {...iconProps} /></div>;
      
      case 'elasticsearch': 
      case 'elastic': 
        return <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center"><Search {...iconProps} /></div>;
      
      case 'snowflake': 
        return <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'api_rest': 
        return <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'firebase': 
        return <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'sqlite': 
        return <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'cassandra': 
        return <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'mariadb': 
        return <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'dynamodb': 
        return <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'bigquery': 
        return <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'clickhouse': 
        return <div className="w-10 h-10 bg-yellow-700 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      case 'influxdb': 
        return <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      
      default: 
        return <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
    }
  };

  const getDatabaseBackgroundColor = (type: string, status?: string) => {
    const mappedStatus = status ? mapStatus(status) : '';
    
    // Se o status for connected, usar cor verde independente do tipo
    if (mappedStatus === 'connected') {
      return 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-600/70';
    }
    
    // Se não for ativo, usar cores baseadas no tipo

  };

  const filteredDatabases = databases.filter(db => {
    const matchesSearch = db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         db.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const mappedStatus = mapStatus(db.status || '');
    const matchesStatus = filterStatus === 'all' || mappedStatus === filterStatus;
    const matchesType = filterType === 'all' || db.type.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const connectedCount = databases.filter(db => mapStatus(db.status || '') === 'connected').length;
  const disconnectedCount = databases.filter(db => mapStatus(db.status || '') === 'disconnected').length;
  const errorCount = databases.filter(db => mapStatus(db.status || '') === 'error').length;

  const DatabaseCard: React.FC<{ database: Connection }> = ({ database }) => (
    <div className={`${getDatabaseBackgroundColor(database.type, database.status)} rounded-xl p-6 hover:shadow-lg transition-all duration-200 group`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getDatabaseIcon(database.type)}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{database.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{database.type}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(database.status)}`}>
            {getStatusIcon(database.status)}
            <span className="capitalize">{mapStatus(database.status || '')}</span>
          </div>
          <button 
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all"
            title="Opções da conexão"
            aria-label="Opções da conexão"
          >
            <MoreVertical size={16} className="text-gray-400 dark:text-gray-500" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">ID</span>
          <span className="text-gray-900 dark:text-white font-mono text-xs">{database.id}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Type</span>
          <span className="text-gray-900 dark:text-white capitalize">{database.type}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Created</span>
          <span className="text-gray-900 dark:text-white">{format(new Date(database.createdAt), 'dd/MM/yyyy')}</span>
        </div>
        
        {database.isDefault && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Default</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              ✓ Default Connection
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar size={12} />
            <span>Criado em {format(new Date(database.createdAt), 'dd/MM/yyyy')}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Editar conexão"
          >
            <Edit size={14} />
          </button>
          <button 
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Excluir conexão"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Database size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Database Connections</h2>
              <p className="text-blue-100">Manage and monitor your database connections</p>
            </div>
          </div>
          
          <button
            onClick={() => showSuccess('Funcionalidade de adicionar banco de dados será implementada em breve')}
            className="inline-flex items-center px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Database
          </button>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle size={20} className="text-green-300" />
              <span className="text-sm text-blue-100">Connected</span>
            </div>
            <div className="text-2xl font-bold">{connectedCount}</div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Database size={20} className="text-blue-300" />
              <span className="text-sm text-blue-100">Total Databases</span>
            </div>
            <div className="text-2xl font-bold">{databases.length}</div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle size={20} className="text-red-300" />
              <span className="text-sm text-blue-100">Disconnected</span>
            </div>
            <div className="text-2xl font-bold">{disconnectedCount}</div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle size={20} className="text-orange-300" />
              <span className="text-sm text-blue-100">Error</span>
            </div>
            <div className="text-2xl font-bold">{errorCount}</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search databases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'connected' | 'disconnected' | 'error')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Filtrar por status"
              title="Filtrar por status"
            >
              <option value="all">All Status</option>
              <option value="connected">Connected</option>
              <option value="disconnected">Disconnected</option>
              <option value="error">Error</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Filtrar por tipo"
              title="Filtrar por tipo"
            >
              <option value="all">All Types</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="mongodb">MongoDB</option>
              <option value="oracle">Oracle</option>
              <option value="sqlserver">SQL Server</option>
              <option value="api_rest">API Rest</option>
              <option value="redis">Redis</option>
              <option value="supabase">Supabase</option>
              <option value="elasticsearch">Elasticsearch</option>
              <option value="snowflake">Snowflake</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Atualizar conexões"
              aria-label="Atualizar conexões"
              onClick={() => {
                const loadDatabases = async () => {
                  setIsLoading(true);
                  try {
                    const connections = await graphqlService.getConnections();
                    setDatabases(connections);
                    showSuccess(`${connections.length} conexões atualizadas`);
                  } catch (error) {
                    console.error('Failed to refresh database connections:', error);
                    showError('Erro ao atualizar conexões');
                  } finally {
                    setIsLoading(false);
                  }
                };
                loadDatabases();
              }}
            >
              <RefreshCw size={16} />
            </button>
            
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
                title="Visualização em grade"
                aria-label="Visualização em grade"
              >
                <BarChart3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
                title="Visualização em lista"
                aria-label="Visualização em lista"
              >
                <Database size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Database Grid */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-200">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Carregando conexões...</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Por favor, aguarde enquanto carregamos suas conexões de banco de dados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatabases.map((database) => (
            <DatabaseCard key={database.id} database={database} />
          ))}
        </div>
      )}

      {filteredDatabases.length === 0 && !isLoading && (
        <div className={`${filterType !== 'all' ? getDatabaseBackgroundColor(filterType) : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} rounded-xl shadow-sm border p-12 text-center transition-colors duration-200`}>
          <Database size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No databases found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by adding your first database connection'
            }
          </p>
          <button
            onClick={() => showSuccess('Funcionalidade de adicionar banco de dados será implementada em breve')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Database
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Database Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{connectedCount}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Conectadas</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{disconnectedCount}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Desconectadas</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{errorCount}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Com Erro</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Database size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(databases.map(db => db.type)).size}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Tipos de BD</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabasePage;