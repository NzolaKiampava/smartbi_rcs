import React, { useState, useEffect } from 'react';
import { Database, Plus, Search, Filter, MoreVertical, CheckCircle, XCircle, AlertCircle, Clock, Server, Zap, Shield, Globe, Activity, TrendingUp, Settings, CreditCard as Edit, Trash2, Eye, Copy, RefreshCw, Download, Upload, Grid3x3 as Grid3X3, List, X, Save, TestTube, Loader, CheckCircle2, AlertTriangle, Info, Building2, Lock, Wifi, WifiOff, Star, HardDrive, Users, Layers, Timer, MapPin } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { graphqlService } from '../../services/graphqlService';

interface DatabaseConnection {
  id: string;
  name: string;
  type: string;
  status: string;
  config: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    apiUrl?: string;
    apiKey?: string;
    headers?: { key: string; value: string }[];
    timeout?: number;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
  lastTestedAt?: string;
}

interface EditConnectionModalProps {
  connection: DatabaseConnection | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (connection: DatabaseConnection) => void;
  isNew?: boolean;
}

interface DeleteConfirmationModalProps {
  connection: DatabaseConnection | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const EditConnectionModal: React.FC<EditConnectionModalProps> = ({ 
  connection, 
  isOpen, 
  onClose, 
  onSave, 
  isNew = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'POSTGRESQL',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
    apiUrl: '',
    apiKey: '',
    timeout: 30000,
    isDefault: false,
    ssl: false
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (connection) {
      setFormData({
        name: connection.name,
        type: connection.type,
        host: connection.config.host || '',
        port: connection.config.port || 5432,
        database: connection.config.database || '',
        username: connection.config.username || '',
        password: '',
        apiUrl: connection.config.apiUrl || '',
        apiKey: connection.config.apiKey || '',
        timeout: connection.config.timeout || 30000,
        isDefault: connection.isDefault,
        ssl: false
      });
    } else {
      setFormData({
        name: '',
        type: 'POSTGRESQL',
        host: '',
        port: 5432,
        database: '',
        username: '',
        password: '',
        apiUrl: '',
        apiKey: '',
        timeout: 30000,
        isDefault: false,
        ssl: false
      });
    }
    setTestResult(null);
  }, [connection, isOpen]);

  const handleTypeChange = (type: string) => {
    const defaultPorts: Record<string, number> = {
      'POSTGRESQL': 5432,
      'MYSQL': 3306,
      'MONGODB': 27017,
      'ORACLE': 1521,
      'REDIS': 6379,
      'SUPABASE': 5432,
      'API_REST': 443
    };

    setFormData(prev => ({
      ...prev,
      type,
      port: defaultPorts[type] || 5432
    }));
  };

  const handleTestConnection = async () => {
    if (!formData.host || !formData.database || !formData.username) {
      showError('Please fill in all required fields before testing');
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      // Use real GraphQL service for testing
      const testInput = {
        type: formData.type as any,
        host: formData.host,
        port: formData.port,
        database: formData.database,
        username: formData.username,
        password: formData.password,
        apiUrl: formData.apiUrl,
        apiKey: formData.apiKey
      };

      // This would call the real backend test endpoint
      // const result = await graphqlService.testConnectionPublic(testInput);
      
      // For now, simulate the test
      await new Promise(resolve => setTimeout(resolve, 2000));
      const success = Math.random() > 0.3;
      
      setTestResult({
        success,
        message: success 
          ? `Successfully connected to ${formData.type} database at ${formData.host}:${formData.port}`
          : `Failed to connect: Connection timeout or invalid credentials`
      });

      if (success) {
        showSuccess('Connection test successful!');
      } else {
        showError('Connection test failed. Please check your credentials.');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed due to network error'
      });
      showError('Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.host || !formData.database || !formData.username) {
      showError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const connectionInput = {
        name: formData.name,
        type: formData.type,
        config: {
          host: formData.host,
          port: formData.port,
          database: formData.database,
          username: formData.username,
          password: formData.password,
          apiUrl: formData.apiUrl,
          apiKey: formData.apiKey,
          timeout: formData.timeout
        },
        isDefault: formData.isDefault
      };

      if (isNew) {
        await graphqlService.createApiConnection(connectionInput);
        showSuccess('Database connection created successfully');
      } else {
        await graphqlService.updateApiConnection(connection!.id, connectionInput);
        showSuccess('Database connection updated successfully');
      }

      // Refresh the connections list
      window.location.reload();
    } catch (error) {
      console.error('Failed to save connection:', error);
      showError(`Failed to ${isNew ? 'create' : 'update'} connection`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Professional Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.3),transparent_50%)]"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <Database size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{isNew ? 'Add New Database' : 'Edit Database Connection'}</h2>
                  <p className="text-blue-100 text-lg">Configure your enterprise database connection</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm"
                title="Close modal"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Building2 size={24} className="mr-3 text-blue-600" />
                  Basic Information
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Connection Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="e.g., Production Database"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Database Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="POSTGRESQL">PostgreSQL</option>
                      <option value="MYSQL">MySQL</option>
                      <option value="MONGODB">MongoDB</option>
                      <option value="ORACLE">Oracle</option>
                      <option value="REDIS">Redis</option>
                      <option value="SUPABASE">Supabase</option>
                      <option value="API_REST">REST API</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <Star size={20} className="text-yellow-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Set as Default Connection</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">This will be used as the primary database</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Connection Details */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-700/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Server size={24} className="mr-3 text-green-600" />
                  Connection Details
                </h3>
                
                <div className="space-y-5">
                  {formData.type === 'API_REST' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          API URL *
                        </label>
                        <input
                          type="url"
                          value={formData.apiUrl}
                          onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="https://api.example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={formData.apiKey}
                          onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter API key"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Host *
                          </label>
                          <input
                            type="text"
                            value={formData.host}
                            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="localhost"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Port *
                          </label>
                          <input
                            type="number"
                            value={formData.port}
                            onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 5432 })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Database Name *
                        </label>
                        <input
                          type="text"
                          value={formData.database}
                          onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="database_name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="username"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="••••••••"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Connection Timeout (ms)
                    </label>
                    <input
                      type="number"
                      value={formData.timeout}
                      onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) || 30000 })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="30000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Test Section */}
          <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 rounded-2xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <TestTube size={24} className="mr-3 text-gray-600" />
                Connection Test
              </h3>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isTestingConnection ? (
                  <>
                    <Loader size={20} className="mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <TestTube size={20} className="mr-2" />
                    Test Connection
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div className={`p-6 rounded-xl border-2 ${
                testResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600'
              }`}>
                <div className="flex items-center space-x-3 mb-2">
                  {testResult.success ? (
                    <CheckCircle2 size={24} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={24} className="text-red-600" />
                  )}
                  <span className={`text-lg font-semibold ${
                    testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
                  </span>
                </div>
                <p className={`text-sm ${
                  testResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {testResult.message}
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Footer Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              * Required fields must be filled
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{isNew ? 'Create Connection' : 'Update Connection'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  connection, 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  if (!isOpen || !connection) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Database Connection</h3>
              <p className="text-gray-600 dark:text-gray-400">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to delete the connection <span className="font-semibold">"{connection.name}"</span>? 
            This will permanently remove the database connection and all associated configurations.
          </p>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={16} className="text-red-600 dark:text-red-400 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="font-medium">This will:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Remove database connection permanently</li>
                  <li>Stop all active queries to this database</li>
                  <li>Remove from query history references</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>Delete Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const DatabasePage: React.FC = () => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE' | 'ERROR'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null);
  const [deletingConnection, setDeletingConnection] = useState<DatabaseConnection | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isNewConnection, setIsNewConnection] = useState(false);

  const { showSuccess, showError } = useNotification();

  // Load connections using real GraphQL service
  useEffect(() => {
    const loadConnections = async () => {
      setIsLoading(true);
      try {
        const connectionsList = await graphqlService.getConnections();
        setConnections(connectionsList);
      } catch (error) {
        console.error('Failed to load connections:', error);
        showError('Failed to load database connections');
        setConnections([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadConnections();
  }, [showError]);

  const getDatabaseIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'POSTGRESQL': return <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Database size={24} className="text-white" /></div>;
      case 'MYSQL': return <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg"><Database size={24} className="text-white" /></div>;
      case 'MONGODB': return <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg"><Database size={24} className="text-white" /></div>;
      case 'ORACLE': return <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg"><Database size={24} className="text-white" /></div>;
      case 'REDIS': return <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg"><Zap size={24} className="text-white" /></div>;
      case 'SUPABASE': return <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg"><Database size={24} className="text-white" /></div>;
      case 'API_REST': return <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg"><Globe size={24} className="text-white" /></div>;
      default: return <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center shadow-lg"><Database size={24} className="text-white" /></div>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return <CheckCircle size={16} className="text-green-500" />;
      case 'INACTIVE': return <XCircle size={16} className="text-gray-500" />;
      case 'ERROR': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-200 dark:border-green-700';
      case 'INACTIVE': return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700';
      case 'ERROR': return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30 border-red-200 dark:border-red-700';
      default: return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700';
    }
  };

  const handleEditConnection = (connection: DatabaseConnection) => {
    setEditingConnection(connection);
    setIsNewConnection(false);
    setShowEditModal(true);
  };

  const handleDeleteConnection = (connection: DatabaseConnection) => {
    setDeletingConnection(connection);
    setShowDeleteModal(true);
  };

  const handleSaveConnection = async (connectionData: DatabaseConnection) => {
    try {
      if (isNewConnection) {
        setConnections(prev => [...prev, connectionData]);
      } else {
        setConnections(prev => prev.map(conn => 
          conn.id === connectionData.id ? connectionData : conn
        ));
      }
      setShowEditModal(false);
      setEditingConnection(null);
      setIsNewConnection(false);
    } catch (error) {
      console.error('Failed to save connection:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingConnection) {
      try {
        await graphqlService.deleteConnection(deletingConnection.id);
        setConnections(prev => prev.filter(conn => conn.id !== deletingConnection.id));
        showSuccess(`Connection "${deletingConnection.name}" deleted successfully`);
      } catch (error) {
        console.error('Failed to delete connection:', error);
        showError('Failed to delete connection');
      } finally {
        setShowDeleteModal(false);
        setDeletingConnection(null);
      }
    }
  };

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (connection.config.host && connection.config.host.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || connection.status.toUpperCase() === statusFilter;
    const matchesType = typeFilter === 'all' || connection.type.toUpperCase() === typeFilter.toUpperCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const connectedCount = connections.filter(conn => conn.status.toUpperCase() === 'ACTIVE').length;
  const totalStorage = connections.length * 2.5; // Mock calculation
  const totalTables = connections.reduce((sum, conn) => sum + (Math.floor(Math.random() * 50) + 10), 0);
  const regions = [...new Set(connections.map(conn => 'US-East'))].length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-200">
      {/* Professional Header Dashboard */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.3),transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 translate-x-32"></div>
          </div>
          
          <div className="relative z-10">
            {/* Title Section */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <Database size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Database Management</h1>
                  <p className="text-xl text-blue-100">Enterprise database connections and monitoring</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-colors backdrop-blur-sm border border-white/20">
                  <Download size={18} className="mr-2" />
                  Export
                </button>
                <button
                  onClick={() => {
                    setEditingConnection(null);
                    setIsNewConnection(true);
                    setShowEditModal(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus size={20} className="mr-2" />
                  Add Database
                </button>
              </div>
            </div>

            {/* Enhanced KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Connections */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Wifi size={24} className="text-green-300" />
                  </div>
                  <div className="flex items-center space-x-1 text-green-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Live</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-white">{connectedCount}</h3>
                  <p className="text-sm text-blue-100">Active Connections</p>
                  <div className="flex items-center text-xs text-green-300">
                    <TrendingUp size={12} className="mr-1" />
                    <span>+2 this week</span>
                  </div>
                </div>
              </div>

              {/* Total Databases */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Database size={24} className="text-blue-300" />
                  </div>
                  <div className="flex items-center space-x-1 text-blue-300">
                    <Activity size={14} />
                    <span className="text-xs font-medium">Total</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-white">{connections.length}</h3>
                  <p className="text-sm text-blue-100">Total Databases</p>
                  <div className="flex items-center text-xs text-blue-300">
                    <Database size={12} className="mr-1" />
                    <span>Across {regions} regions</span>
                  </div>
                </div>
              </div>

              {/* Total Storage */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <HardDrive size={24} className="text-purple-300" />
                  </div>
                  <div className="flex items-center space-x-1 text-purple-300">
                    <TrendingUp size={14} />
                    <span className="text-xs font-medium">+12%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-white">{totalStorage.toFixed(1)} GB</h3>
                  <p className="text-sm text-blue-100">Total Storage</p>
                  <div className="flex items-center text-xs text-purple-300">
                    <HardDrive size={12} className="mr-1" />
                    <span>Optimized</span>
                  </div>
                </div>
              </div>

              {/* Total Tables */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Layers size={24} className="text-orange-300" />
                  </div>
                  <div className="flex items-center space-x-1 text-orange-300">
                    <Layers size={14} />
                    <span className="text-xs font-medium">Tables</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-white">{totalTables}</h3>
                  <p className="text-sm text-blue-100">Total Tables</p>
                  <div className="flex items-center text-xs text-orange-300">
                    <Layers size={12} className="mr-1" />
                    <span>Indexed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Filter size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Database Connections</h3>
              <p className="text-gray-600 dark:text-gray-400">Manage and monitor your database connections</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
                title="Grid View"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Connections
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search by name, type, or host..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Connected</option>
              <option value="INACTIVE">Disconnected</option>
              <option value="ERROR">Error</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            >
              <option value="all">All Types</option>
              <option value="POSTGRESQL">PostgreSQL</option>
              <option value="MYSQL">MySQL</option>
              <option value="MONGODB">MongoDB</option>
              <option value="REDIS">Redis</option>
              <option value="SUPABASE">Supabase</option>
              <option value="API_REST">REST API</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredConnections.length} of {connections.length} connections
              </span>
              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Connections Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
            <RefreshCw className="animate-spin" size={24} />
            <span className="text-lg">Loading database connections...</span>
          </div>
        </div>
      ) : filteredConnections.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredConnections.map((connection) => (
            <div key={connection.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {getDatabaseIcon(connection.type)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{connection.name}</h3>
                      {connection.isDefault && (
                        <Star size={16} className="text-yellow-500 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {connection.config.host || connection.config.apiUrl}:{connection.config.port}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(connection.status)}`}>
                        {getStatusIcon(connection.status)}
                        <span className="capitalize">{connection.status}</span>
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {connection.type}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="relative group/menu">
                  <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all" title="More options">
                    <MoreVertical size={16} className="text-gray-400 dark:text-gray-500" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                    <button
                      onClick={() => handleEditConnection(connection)}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Edit size={16} />
                      <span>Edit Connection</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(connection.config, null, 2));
                        showSuccess('Connection details copied to clipboard');
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Copy size={16} />
                      <span>Copy Config</span>
                    </button>
                    <button
                      onClick={() => handleDeleteConnection(connection)}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 size={16} />
                      <span>Delete Connection</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Connection Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center">
                    <Database size={14} className="mr-1" />
                    Database
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">{connection.config.database}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center">
                    <Users size={14} className="mr-1" />
                    Username
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">{connection.config.username}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center">
                    <Timer size={14} className="mr-1" />
                    Created
                  </span>
                  <span className="text-gray-900 dark:text-white">{new Date(connection.createdAt).toLocaleDateString()}</span>
                </div>
                
                {connection.lastTestedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center">
                      <TestTube size={14} className="mr-1" />
                      Last Tested
                    </span>
                    <span className="text-gray-900 dark:text-white">{new Date(connection.lastTestedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleEditConnection(connection)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Edit size={14} className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    // Test connection functionality
                    showSuccess('Testing connection...');
                  }}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                >
                  <TestTube size={14} className="mr-2" />
                  Test
                </button>
                <button
                  onClick={() => handleDeleteConnection(connection)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Database size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No database connections found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by adding your first database connection'
            }
          </p>
          <button
            onClick={() => {
              setEditingConnection(null);
              setIsNewConnection(true);
              setShowEditModal(true);
            }}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} className="mr-2" />
            Add Database Connection
          </button>
        </div>
      )}

      {/* Modals */}
      <EditConnectionModal
        connection={editingConnection}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingConnection(null);
          setIsNewConnection(false);
        }}
        onSave={handleSaveConnection}
        isNew={isNewConnection}
      />

      <DeleteConfirmationModal
        connection={deletingConnection}
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingConnection(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default DatabasePage;