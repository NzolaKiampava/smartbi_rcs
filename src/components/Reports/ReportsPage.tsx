import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Trash2,
  Search, 
  Grid, 
  List,
  Clock,
  File,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { graphqlService, FileUpload } from '../../services/graphqlService';
import { useNotification } from '../../contexts/NotificationContext';

const ReportsPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  
  // State management
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('modified');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load files on component mount
  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const result = await graphqlService.listFileUploads(100, 0);
      setFiles(result);
    } catch (error) {
      console.error('❌ Error loading files:', error);
      showError('Failed to load files from database');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadFiles();
      showSuccess('Files list refreshed');
    } catch {
      showError('Failed to refresh files');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownload = async (file: FileUpload) => {
    try {
      await graphqlService.downloadFile(file.id, file.originalName);
      showSuccess(`Downloaded: ${file.originalName}`);
    } catch (error) {
      console.error('❌ Download error:', error);
      showError(`Failed to download: ${file.originalName}`);
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    try {
      const success = await graphqlService.deleteFileUpload(fileId);
      if (success) {
        setFiles(files.filter(f => f.id !== fileId));
        showSuccess(`Deleted: ${fileName}`);
        setDeleteConfirmId(null);
      } else {
        showError(`Failed to delete: ${fileName}`);
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      showError(`Error deleting: ${fileName}`);
    }
  };

  const handleBulkDownload = async () => {
    const selected = files.filter(f => selectedFiles.has(f.id));
    for (const file of selected) {
      await handleDownload(file);
    }
    setSelectedFiles(new Set());
  };

  const handleBulkDelete = async () => {
    const selected = files.filter(f => selectedFiles.has(f.id));
    if (window.confirm(`Are you sure you want to delete ${selected.length} file(s)?`)) {
      for (const file of selected) {
        await handleDelete(file.id, file.originalName);
      }
      setSelectedFiles(new Set());
    }
  };

  const recentFiles = files.slice(0, 4);

  // File icon based on fileType
  const getFileIcon = (fileType: string) => {
    const type = fileType.toUpperCase();
    switch (type) {
      case 'PDF':
        return <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">PDF</div>;
      case 'EXCEL':
        return <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">XLS</div>;
      case 'CSV':
        return <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">CSV</div>;
      case 'JSON':
        return <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">JSON</div>;
      case 'SQL':
        return <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">SQL</div>;
      case 'XML':
        return <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">XML</div>;
      case 'TXT':
        return <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">TXT</div>;
      default:
        return <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center text-white font-bold text-xs">FILE</div>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter and sort files
  const filteredFiles = files.filter(file =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.originalName.localeCompare(b.originalName);
      case 'size':
        return b.size - a.size;
      case 'modified':
      default:
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
  });

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  // File Card Component for Grid View
  const FileCard: React.FC<{ file: FileUpload }> = ({ file }) => (
    <div className={`
      group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all duration-200
      ${selectedFiles.has(file.id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
    `}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedFiles.has(file.id)}
            onChange={() => toggleFileSelection(file.id)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            aria-label={`Select ${file.originalName}`}
          />
          <div>
            {getFileIcon(file.fileType)}
          </div>
        </div>
  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button 
            onClick={() => handleDownload(file)}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400"
            title="Download file"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={() => setDeleteConfirmId(file.id)}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
            title="Delete file"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight line-clamp-2" title={file.originalName}>
          {file.originalName}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatFileSize(file.size)}</span>
          <span>{format(new Date(file.uploadedAt), 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">{file.fileType}</span>
          <span className="text-gray-400 dark:text-gray-500 truncate max-w-[120px]" title={file.id}>
            ID: {file.id.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId === file.id && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete File</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete <strong>{file.originalName}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(file.id, file.originalName)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // File Row Component for List View
  const FileRow: React.FC<{ file: FileUpload }> = ({ file }) => (
    <tr className={`
      hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group
      ${selectedFiles.has(file.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
    `}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={selectedFiles.has(file.id)}
            onChange={() => toggleFileSelection(file.id)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            aria-label={`Select ${file.originalName}`}
          />
          <div className="w-12 h-12 flex-shrink-0">
            {getFileIcon(file.fileType)}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{file.originalName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{file.fileType}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {format(new Date(file.uploadedAt), 'MMM dd, yyyy HH:mm')}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {formatFileSize(file.size)}
      </td>
      <td className="px-6 py-4">
  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button 
            onClick={() => handleDownload(file)}
            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400"
            title="Download file"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={() => setDeleteConfirmId(file.id)}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
            title="Delete file"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw size={48} className="text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400">Loading files from database...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText size={32} className="text-white" />
              <h1 className="text-2xl font-bold text-white">Reports & Documents</h1>
            </div>
            <p className="text-blue-100">Manage uploaded files from database</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Recent Files */}
      {recentFiles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Files</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentFiles.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => handleDownload(file)}
              >
                <div className="w-12 h-12 flex-shrink-0">
                  {getFileIcon(file.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate" title={file.originalName}>
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(file.uploadedAt), 'MMM dd')} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Files Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'modified' | 'size')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                aria-label="Sort files by"
              >
                <option value="modified">Last Modified</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Bulk Actions */}
              {selectedFiles.size > 0 && (
                <div className="flex items-center space-x-2 mr-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{selectedFiles.size} selected</span>
                  <button 
                    onClick={handleBulkDownload}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Download selected"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete selected"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  aria-label="List view"
                  title="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Files Display */}
        <div className="p-6">
          {sortedFiles.length === 0 ? (
            <div className="text-center py-12">
              <File size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                {searchTerm ? 'No files found matching your search.' : 'No files uploaded yet.'}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {searchTerm ? 'Try a different search term.' : 'Upload files to see them here.'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedFiles.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedFiles.map((file) => (
                    <FileRow key={file.id} file={file} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;