import React, { useState, useEffect } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import EditConnectionModal from './EditConnectionModal';
  import SectionHeader from '../Common/SectionHeader';
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
  Loader,
  X,
  Eye,
  EyeOff,
  Globe,
  Server,
  Key
} from 'lucide-react';
import { format } from 'date-fns';
import { graphqlService, Connection } from '../../services/graphqlService';
import { useNotification } from '../../contexts/NotificationContext';

const DatabasePage: React.FC = () => {
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; connection: Connection | null; loading: boolean }>({ open: false, connection: null, loading: false });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editConnection, setEditConnection] = useState<Connection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'connected' | 'disconnected' | 'error'>('all');
  const [filterType, setFilterType] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [databases, setDatabases] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'database' | 'api'>('database');
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    description: '',
    // API specific fields
    baseUrl: '',
    apiKey: '',
    authType: 'none',
    headers: ''
  });
  const { showSuccess, showError } = useNotification();

  // Load database connections from API
  const loadDatabases = async () => {
    setIsLoading(true);
    try {
      const connections = await graphqlService.getConnections();
      setDatabases(connections);
    } catch (error) {
      console.error('Failed to load database connections:', error);
      showError('Erro ao carregar conexões de banco de dados');
      setDatabases([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Carregamento inicial apenas

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
    
    // Se for erro, usar cor vermelha
    if (mappedStatus === 'error') {
      return 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-600/70';
    }
    
    // Se for connecting, usar cor amarela
    if (mappedStatus === 'connecting') {
      return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-600/70';
    }
    
    // Se não for ativo, usar cores baseadas no tipo
    switch (type.toLowerCase()) {
      case 'postgresql': 
      case 'postgres': 
        return 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700/50';
      
      case 'mysql': 
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700/50';
      
      case 'mongodb': 
      case 'mongo': 
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50';
      
      case 'oracle': 
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50';
      
      case 'sqlserver': 
      case 'mssql': 
        return 'bg-slate-50 dark:bg-slate-900/30 border-slate-300 dark:border-slate-600/50';
      
      case 'redis': 
        return 'bg-red-50 dark:bg-red-900/25 border-red-300 dark:border-red-600/50';
      
      case 'elasticsearch': 
      case 'elastic': 
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/50';
      
      case 'snowflake': 
        return 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700/50';
      
      case 'supabase': 
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/50';
      
      case 'firebase': 
        return 'bg-yellow-50 dark:bg-yellow-900/25 border-yellow-300 dark:border-yellow-600/50';
      
      case 'sqlite': 
        return 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700/50';
      
      case 'cassandra': 
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700/50';
      
      case 'mariadb': 
        return 'bg-teal-50 dark:bg-teal-900/25 border-teal-300 dark:border-teal-600/50';
      
      case 'dynamodb': 
        return 'bg-orange-50 dark:bg-orange-900/25 border-orange-300 dark:border-orange-600/50';
      
      case 'bigquery': 
        return 'bg-purple-50 dark:bg-purple-900/15 border-purple-200 dark:border-purple-800/50';
      
      case 'clickhouse': 
        return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600/50';
      
      case 'influxdb': 
        return 'bg-purple-50 dark:bg-purple-900/25 border-purple-300 dark:border-purple-600/50';
      
      default: 
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700/50';
    }
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
            onClick={() => {
              setEditConnection(database);
              setEditModalOpen(true);
            }}
          >
            <Edit size={14} />
          </button>
          <button 
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Excluir conexão"
            onClick={() => setDeleteModal({ open: true, connection: database, loading: false })}
          >
            <Trash2 size={14} />
          </button>
  {/* Delete Confirmation Modal */}
  <DeleteConfirmationModal
    isOpen={deleteModal.open}
    title="Excluir conexão"
    message={`Tem certeza que deseja excluir a conexão "${deleteModal.connection?.name}"?`}
    isLoading={deleteModal.loading}
    onClose={() => setDeleteModal({ open: false, connection: null, loading: false })}
    onConfirm={async () => {
      if (!deleteModal.connection) return;
      setDeleteModal((prev) => ({ ...prev, loading: true }));
      try {
        // Use the public delete endpoint for demo/dev connections
        await graphqlService.deleteConnectionPublic(deleteModal.connection.id);
        showSuccess('Conexão excluída com sucesso!');
        await loadDatabases();
        setDeleteModal({ open: false, connection: null, loading: false });
      } catch (err) {
        const errorMsg = typeof err === 'object' && err !== null && 'message' in err ? (err as any).message : String(err);
        showError('Erro ao excluir conexão: ' + errorMsg);
        setDeleteModal((prev) => ({ ...prev, loading: false }));
      }
    }}
  />
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
            onClick={() => setShowAddModal(true)}
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
                    // Removed refresh notification to prevent noise
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
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatabases.map((database) => (
              <DatabaseCard key={database.id} database={database} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDatabases.map((database) => (
              <div key={database.id} className={`${getDatabaseBackgroundColor(database.type, database.status)} rounded-xl p-4 hover:shadow-lg transition-all duration-200 flex items-center justify-between` }>
                <div className="flex items-center space-x-4">
                  {getDatabaseIcon(database.type)}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{database.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{database.type} • ID {database.id}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(database.status)}`}>
                    {getStatusIcon(database.status)}
                    <span className="capitalize">{mapStatus(database.status || '')}</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(database.createdAt), 'dd/MM/yyyy')}</div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Editar conexão"
                      onClick={() => { setEditConnection(database); setEditModalOpen(true); }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Excluir conexão"
                      onClick={() => setDeleteModal({ open: true, connection: database, loading: false })}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
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
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Database
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <SectionHeader icon={Database} title="Database Overview" />
        
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

      {/* Add Database Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  {connectionMode === 'database' ? (
                    <Database size={20} className="text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Globe size={20} className="text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Add {connectionMode === 'database' ? 'Database' : 'API'} Connection
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Connect to your {connectionMode === 'database' ? 'database' : 'API service'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Fechar modal"
                aria-label="Fechar modal"
              >
                <X size={20} className="text-gray-400 dark:text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Connection Mode Toggle */}
              <div className="flex items-center justify-center">
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setConnectionMode('database')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      connectionMode === 'database' 
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                    }`}
                  >
                    <Database size={16} className="mr-2" />
                    Database
                  </button>
                  <button
                    onClick={() => setConnectionMode('api')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      connectionMode === 'api' 
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                    }`}
                  >
                    <Globe size={16} className="mr-2" />
                    API
                  </button>
                </div>
              </div>
              {/* Connection Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Server size={16} className="inline mr-2" />
                  {connectionMode === 'database' ? 'Database Type' : 'API Type'}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  title={`Selecionar tipo de ${connectionMode === 'database' ? 'banco de dados' : 'API'}`}
                  aria-label={`Tipo de ${connectionMode === 'database' ? 'banco de dados' : 'API'}`}
                >
                  {connectionMode === 'database' ? (
                    <>
                      <option value="postgresql">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                      <option value="mongodb">MongoDB</option>
                      <option value="oracle">Oracle</option>
                      <option value="sqlserver">SQL Server</option>
                      <option value="redis">Redis</option>
                      <option value="supabase">Supabase</option>
                      <option value="elasticsearch">Elasticsearch</option>
                      <option value="snowflake">Snowflake</option>
                      <option value="sqlite">SQLite</option>
                      <option value="firebase">Firebase</option>
                    </>
                  ) : (
                    <>
                      <option value="rest">REST API</option>
                      <option value="graphql">GraphQL API</option>
                      <option value="soap">SOAP API</option>
                      <option value="webhook">Webhook</option>
                      <option value="custom">Custom API</option>
                    </>
                  )}
                </select>
              </div>

              {/* Connection Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Connection Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={connectionMode === 'database' ? "e.g., Production Database" : "e.g., Customer API"}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Database specific fields */}
              {connectionMode === 'database' && (
                <>
                  {/* Host and Port */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Globe size={16} className="inline mr-2" />
                        Host *
                      </label>
                      <input
                        type="text"
                        value={formData.host}
                        onChange={(e) => setFormData({...formData, host: e.target.value})}
                        placeholder="localhost or database.example.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Port
                      </label>
                      <input
                        type="text"
                        value={formData.port}
                        onChange={(e) => setFormData({...formData, port: e.target.value})}
                        placeholder="5432"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Database Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Database Name
                    </label>
                    <input
                      type="text"
                      value={formData.database}
                      onChange={(e) => setFormData({...formData, database: e.target.value})}
                      placeholder="my_database"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>

                  {/* Username and Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        placeholder="database_user"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Key size={16} className="inline mr-2" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showPassword ? (
                            <EyeOff size={16} className="text-gray-400 dark:text-gray-500" />
                          ) : (
                            <Eye size={16} className="text-gray-400 dark:text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* API specific fields */}
              {connectionMode === 'api' && (
                <>
                  {/* Base URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Globe size={16} className="inline mr-2" />
                      Base URL *
                    </label>
                    <input
                      type="url"
                      value={formData.baseUrl}
                      onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
                      placeholder="https://api.example.com/v1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>

                  {/* Authentication Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Authentication Type
                    </label>
                    <select
                      value={formData.authType}
                      onChange={(e) => setFormData({...formData, authType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      title="Selecionar tipo de autenticação"
                      aria-label="Tipo de autenticação"
                    >
                      <option value="none">No Authentication</option>
                      <option value="apikey">API Key</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth</option>
                      <option value="oauth">OAuth 2.0</option>
                    </select>
                  </div>

                  {/* API Key (if auth type is apikey or bearer) */}
                  {(formData.authType === 'apikey' || formData.authType === 'bearer') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Key size={16} className="inline mr-2" />
                        {formData.authType === 'apikey' ? 'API Key' : 'Bearer Token'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.apiKey}
                          onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                          placeholder="Enter your API key or token"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          title={showPassword ? "Ocultar token" : "Mostrar token"}
                          aria-label={showPassword ? "Ocultar token" : "Mostrar token"}
                        >
                          {showPassword ? (
                            <EyeOff size={16} className="text-gray-400 dark:text-gray-500" />
                          ) : (
                            <Eye size={16} className="text-gray-400 dark:text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Basic Auth Username/Password */}
                  {formData.authType === 'basic' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          placeholder="api_username"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Key size={16} className="inline mr-2" />
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showPassword ? (
                              <EyeOff size={16} className="text-gray-400 dark:text-gray-500" />
                            ) : (
                              <Eye size={16} className="text-gray-400 dark:text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom Headers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Custom Headers (Optional)
                    </label>
                    <textarea
                      value={formData.headers}
                      onChange={(e) => setFormData({...formData, headers: e.target.value})}
                      placeholder={`Content-Type: application/json\nX-Custom-Header: value`}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      One header per line in format: Header-Name: value
                    </p>
                  </div>
                </>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe this database connection..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="text-red-500">*</span> Required fields
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      name: '',
                      type: connectionMode === 'database' ? 'postgresql' : 'rest',
                      host: '',
                      port: '',
                      database: '',
                      username: '',
                      password: '',
                      description: '',
                      baseUrl: '',
                      apiKey: '',
                      authType: 'none',
                      headers: ''
                    });
                    setShowPassword(false);
                    setConnectionMode('database');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (connectionMode === 'api') {
                        // Parse headers from textarea
                        const headersArr = formData.headers
                          .split('\n')
                          .map(line => line.trim())
                          .filter(line => line && line.includes(':'))
                          .map(line => {
                            const [key, ...rest] = line.split(':');
                            return { key: key.trim(), value: rest.join(':').trim() };
                          });
                        const apiInput = {
                          name: formData.name,
                          type: 'API_REST',
                          config: {
                            apiUrl: formData.baseUrl,
                            apiKey: formData.apiKey,
                            username: formData.username,
                            password: formData.password,
                            headers: headersArr,
                          },
                          isDefault: false,
                        };
                        await graphqlService.createApiConnection(apiInput);
                        // Removed create notification - user will see the new connection in the list
                        await loadDatabases();
                      } else {
                        // Database connection logic (not implemented here)
                        showSuccess('Database connection will be added soon!');
                      }
                      setShowAddModal(false);
                      setFormData({
                        name: '',
                        type: connectionMode === 'database' ? 'postgresql' : 'rest',
                        host: '',
                        port: '',
                        database: '',
                        username: '',
                        password: '',
                        description: '',
                        baseUrl: '',
                        apiKey: '',
                        authType: 'none',
                        headers: ''
                      });
                      setShowPassword(false);
                    } catch (err) {
                      const errorMsg = typeof err === 'object' && err !== null && 'message' in err ? (err as any).message : String(err);
                      showError('Erro ao criar conexão API: ' + errorMsg);
                    }
                  }}
                  disabled={
                    !formData.name || 
                    (connectionMode === 'database' && !formData.host) ||
                    (connectionMode === 'api' && !formData.baseUrl)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={16} className="inline mr-2" />
                  Add Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Connection Modal */}
      <EditConnectionModal
        isOpen={editModalOpen}
        connection={editConnection}
        onClose={() => { setEditModalOpen(false); setEditConnection(null); }}
        onSaved={async () => {
          // refresh list and keep modal closed
          await loadDatabases();
        }}
      />
    </div>
  );
};

export default DatabasePage;