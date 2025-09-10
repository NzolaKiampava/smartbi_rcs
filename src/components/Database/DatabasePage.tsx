import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock,
  Activity,
  Server,
  Zap,
  Shield,
  Settings,
  Edit,
  Trash2,
  Eye,
  Copy,
  RefreshCw,
  Download,
  Upload,
  Link,
  Wifi,
  WifiOff,
  HardDrive,
  BarChart3,
  Users,
  Calendar,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'oracle' | 'sqlserver' | 'redis' | 'elasticsearch' | 'snowflake';
  host: string;
  port: number;
  database: string;
  username: string;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  lastConnected: string;
  responseTime: number;
  version: string;
  size: string;
  tables: number;
  activeConnections: number;
  maxConnections: number;
  ssl: boolean;
  environment: 'production' | 'staging' | 'development';
  region: string;
  description?: string;
}

const DatabasePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'connected' | 'disconnected' | 'error'>('all');
  const [filterType, setFilterType] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseConnection | null>(null);

  // Mock database connections
  const databases: DatabaseConnection[] = [
    {
      id: '1',
      name: 'Production PostgreSQL',
      type: 'postgresql',
      host: 'prod-db.company.com',
      port: 5432,
      database: 'smartbi_prod',
      username: 'admin',
      status: 'connected',
      lastConnected: '2024-01-18T10:30:00Z',
      responseTime: 45,
      version: '14.2',
      size: '2.4 TB',
      tables: 156,
      activeConnections: 23,
      maxConnections: 100,
      ssl: true,
      environment: 'production',
      region: 'US-East-1',
      description: 'Main production database for SmartBI platform'
    },
    {
      id: '2',
      name: 'Analytics MySQL',
      type: 'mysql',
      host: 'analytics-db.company.com',
      port: 3306,
      database: 'analytics',
      username: 'analytics_user',
      status: 'connected',
      lastConnected: '2024-01-18T10:25:00Z',
      responseTime: 67,
      version: '8.0.32',
      size: '890 GB',
      tables: 89,
      activeConnections: 12,
      maxConnections: 50,
      ssl: true,
      environment: 'production',
      region: 'US-West-2',
      description: 'Dedicated analytics and reporting database'
    },
    {
      id: '3',
      name: 'MongoDB Logs',
      type: 'mongodb',
      host: 'logs-mongo.company.com',
      port: 27017,
      database: 'application_logs',
      username: 'log_reader',
      status: 'connected',
      lastConnected: '2024-01-18T10:20:00Z',
      responseTime: 23,
      version: '6.0.4',
      size: '1.2 TB',
      tables: 45,
      activeConnections: 8,
      maxConnections: 30,
      ssl: true,
      environment: 'production',
      region: 'EU-West-1',
      description: 'Application logs and audit trail storage'
    },
    {
      id: '4',
      name: 'Staging Oracle',
      type: 'oracle',
      host: 'staging-oracle.company.com',
      port: 1521,
      database: 'STAGE',
      username: 'stage_user',
      status: 'disconnected',
      lastConnected: '2024-01-18T08:15:00Z',
      responseTime: 0,
      version: '19c',
      size: '450 GB',
      tables: 234,
      activeConnections: 0,
      maxConnections: 80,
      ssl: false,
      environment: 'staging',
      region: 'US-Central-1',
      description: 'Staging environment for testing'
    },
    {
      id: '5',
      name: 'Redis Cache',
      type: 'redis',
      host: 'cache-redis.company.com',
      port: 6379,
      database: '0',
      username: 'cache_user',
      status: 'error',
      lastConnected: '2024-01-18T09:45:00Z',
      responseTime: 0,
      version: '7.0.8',
      size: '12 GB',
      tables: 0,
      activeConnections: 0,
      maxConnections: 1000,
      ssl: true,
      environment: 'production',
      region: 'US-East-1',
      description: 'High-performance caching layer'
    },
    {
      id: '6',
      name: 'Snowflake DW',
      type: 'snowflake',
      host: 'company.snowflakecomputing.com',
      port: 443,
      database: 'DATA_WAREHOUSE',
      username: 'dw_admin',
      status: 'connected',
      lastConnected: '2024-01-18T10:35:00Z',
      responseTime: 156,
      version: '7.34.2',
      size: '5.8 TB',
      tables: 312,
      activeConnections: 15,
      maxConnections: 200,
      ssl: true,
      environment: 'production',
      region: 'US-East-1',
      description: 'Enterprise data warehouse for analytics'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'disconnected': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
      case 'error': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'connecting': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle size={16} className="text-green-500" />;
      case 'disconnected': return <XCircle size={16} className="text-gray-500" />;
      case 'error': return <AlertCircle size={16} className="text-red-500" />;
      case 'connecting': return <Clock size={16} className="text-yellow-500 animate-pulse" />;
      default: return <Database size={16} className="text-gray-500" />;
    }
  };

  const getDatabaseIcon = (type: string) => {
    const iconProps = { size: 24, className: "text-white" };
    
    switch (type) {
      case 'postgresql': return <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      case 'mysql': return <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      case 'mongodb': return <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      case 'oracle': return <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      case 'sqlserver': return <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      case 'redis': return <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center"><Zap {...iconProps} /></div>;
      case 'elasticsearch': return <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center"><Search {...iconProps} /></div>;
      case 'snowflake': return <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
      default: return <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center"><Database {...iconProps} /></div>;
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'staging': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'development': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const filteredDatabases = databases.filter(db => {
    const matchesSearch = db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         db.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         db.host.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || db.status === filterStatus;
    const matchesType = filterType === 'all' || db.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const connectedCount = databases.filter(db => db.status === 'connected').length;
  const totalConnections = databases.reduce((sum, db) => sum + db.activeConnections, 0);
  const avgResponseTime = Math.round(databases.filter(db => db.status === 'connected').reduce((sum, db) => sum + db.responseTime, 0) / connectedCount);

  const DatabaseCard: React.FC<{ database: DatabaseConnection }> = ({ database }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
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
            <span className="capitalize">{database.status}</span>
          </div>
          <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all">
            <MoreVertical size={16} className="text-gray-400 dark:text-gray-500" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Host</span>
          <span className="text-gray-900 dark:text-white font-mono text-xs">{database.host}:{database.port}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Database</span>
          <span className="text-gray-900 dark:text-white">{database.database}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Size</span>
          <span className="text-gray-900 dark:text-white">{database.size}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Tables</span>
          <span className="text-gray-900 dark:text-white">{database.tables}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Activity size={12} />
            <span>{database.activeConnections}/{database.maxConnections}</span>
          </div>
          {database.status === 'connected' && (
            <div className="flex items-center space-x-1">
              <Zap size={12} />
              <span>{database.responseTime}ms</span>
            </div>
          )}
          {database.ssl && (
            <div className="flex items-center space-x-1">
              <Shield size={12} />
              <span>SSL</span>
            </div>
          )}
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getEnvironmentColor(database.environment)}`}>
          {database.environment}
        </div>
      </div>

      {database.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">{database.description}</p>
      )}
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
              <Users size={20} className="text-purple-300" />
              <span className="text-sm text-blue-100">Active Connections</span>
            </div>
            <div className="text-2xl font-bold">{totalConnections}</div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap size={20} className="text-yellow-300" />
              <span className="text-sm text-blue-100">Avg Response</span>
            </div>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
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
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            >
              <option value="all">All Types</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="mongodb">MongoDB</option>
              <option value="oracle">Oracle</option>
              <option value="redis">Redis</option>
              <option value="snowflake">Snowflake</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <RefreshCw size={16} />
            </button>
            
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <BarChart3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <Database size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Database Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDatabases.map((database) => (
          <DatabaseCard key={database.id} database={database} />
        ))}
      </div>

      {filteredDatabases.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-200">
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Database Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{connectedCount}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Connections</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <HardDrive size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {(databases.reduce((sum, db) => sum + parseFloat(db.size.replace(/[^\d.]/g, '')), 0)).toFixed(1)} TB
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Storage</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {databases.reduce((sum, db) => sum + db.tables, 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Tables</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(databases.map(db => db.region)).size}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Regions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabasePage;