import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  File, 
  CheckCircle, 
  AlertCircle, 
  Brain, 
  Zap, 
  Sparkles,
  BarChart3,
  TrendingUp,
  Database,
  Cloud,
  Shield,
  Clock,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { graphqlService, FileUploadInput, AnalysisReport } from '../../services/graphqlService';
import AnalysisResults from '../Analysis/AnalysisResults';
import SectionHeader from '../Common/SectionHeader';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
  progress: number;
  analysisResult?: AnalysisReport;
  uploadId?: string; // Backend file upload ID
  processingTime?: number; // Tempo de processamento em caso de erro
}

interface SavedAnalysis {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  analysisDate: string;
  analysisResult: AnalysisReport;
}

const STORAGE_KEY = 'smartbi_analysis_history';

// Helper functions for localStorage
const saveAnalysisToStorage = (analysis: SavedAnalysis) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as SavedAnalysis[];
    const updated = [analysis, ...existing].slice(0, 50); // Keep only last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save analysis to localStorage:', error);
  }
};

const loadAnalysisHistory = (): SavedAnalysis[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as SavedAnalysis[];
  } catch (error) {
    console.error('Failed to load analysis history:', error);
    return [];
  }
};

const deleteAnalysisFromStorage = (id: string) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as SavedAnalysis[];
    const updated = existing.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete analysis from localStorage:', error);
  }
};

const FileUploadPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisReport | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<SavedAnalysis[]>([]);

  // Load analysis history on component mount
  React.useEffect(() => {
    setAnalysisHistory(loadAnalysisHistory());
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    const startTime = Date.now(); // Capturar tempo de início
    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    };

    setFiles(prev => [...prev, newFile]);

    try {
      // Prepare file upload input
      const uploadInput: FileUploadInput = {
        file,
        description: `File upload: ${file.name}`,
        analysisOptions: {
          analyzeRevenue: true,
          analyzeTables: true,
          generateInsights: true,
          checkDataQuality: true,
          generateVisualizations: true
        }
      };

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === newFile.id && f.status === 'uploading') {
            const newProgress = Math.min(f.progress + Math.random() * 20, 95);
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 300);

      // Upload and analyze file using new 2-step architecture
      console.log('🚀 Using new 2-step file upload architecture...');
      const analysisResult = await graphqlService.uploadAndAnalyzeFileV2(uploadInput);
      
      // Clear progress interval
      clearInterval(progressInterval);

      // Update file status to analyzing
      setFiles(prev => prev.map(f => 
        f.id === newFile.id 
          ? { ...f, status: 'analyzing', progress: 0, uploadId: analysisResult.fileUploadId }
          : f
      ));

      // Simulate analysis progress (since we don't have real-time updates yet)
      const analysisInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === newFile.id && f.status === 'analyzing') {
            const newProgress = Math.min(f.progress + Math.random() * 15, 95);
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 400);

      // Wait a bit to simulate processing time
      setTimeout(() => {
        clearInterval(analysisInterval);
        
        const endTime = Date.now();
        const processingTime = endTime - startTime; // Calcular tempo real de processamento
        
        // Atualizar analysisResult com tempo real
        const updatedAnalysisResult = {
          ...analysisResult,
          executionTime: processingTime,
          fileUpload: {
            ...analysisResult.fileUpload,
            size: file.size,
            originalName: file.name
          }
        };
        
        // Save analysis to localStorage
        const savedAnalysis: SavedAnalysis = {
          id: newFile.id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          analysisDate: new Date().toISOString(),
          analysisResult: updatedAnalysisResult
        };
        saveAnalysisToStorage(savedAnalysis);
        setAnalysisHistory(loadAnalysisHistory());
        
        // Mark as completed with analysis result
        setFiles(prev => prev.map(f => 
          f.id === newFile.id 
            ? { ...f, status: 'completed', progress: 100, analysisResult: updatedAnalysisResult }
            : f
        ));

        console.log(`Analysis completed for ${file.name}`);
      }, 3000);

    } catch (error) {
      console.error('File upload and analysis failed:', error);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime; // Capturar tempo mesmo no erro
      
      setFiles(prev => prev.map(f => 
        f.id === newFile.id 
          ? { ...f, status: 'error', progress: 0, processingTime }
          : f
      ));

      console.error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(processFile);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(file => processFile(file));
  }, [processFile]);

  const handleDeleteHistory = useCallback((id: string) => {
    deleteAnalysisFromStorage(id);
    setAnalysisHistory(loadAnalysisHistory());
  }, []);

  const handleViewHistoryAnalysis = useCallback((analysis: SavedAnalysis) => {
    setSelectedAnalysis(analysis.analysisResult);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate progress width class
  const getProgressWidth = (progress: number) => {
    if (progress === 0) return 'w-0';
    if (progress <= 5) return 'w-1';
    if (progress <= 10) return 'w-2';
    if (progress <= 15) return 'w-3';
    if (progress <= 20) return 'w-4';
    if (progress <= 25) return 'w-5';
    if (progress <= 30) return 'w-6';
    if (progress <= 35) return 'w-7';
    if (progress <= 40) return 'w-8';
    if (progress <= 45) return 'w-9';
    if (progress <= 50) return 'w-1/2';
    if (progress <= 60) return 'w-3/5';
    if (progress <= 70) return 'w-2/3';
    if (progress <= 75) return 'w-3/4';
    if (progress <= 80) return 'w-4/5';
    if (progress <= 90) return 'w-11/12';
    return 'w-full';
  };

  const getCompletionWidth = () => {
    const completedFiles = files.filter(f => f.status === 'completed').length;
    const totalFiles = files.length;
    if (totalFiles === 0) return 'w-0';
    const percentage = (completedFiles / totalFiles) * 100;
    return getProgressWidth(percentage);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="text-red-500" size={24} />;
    if (type.includes('csv')) return <Database className="text-green-500" size={24} />;
    if (type.includes('excel') || type.includes('sheet')) return <File className="text-emerald-500" size={24} />;
    if (type.includes('json')) return <File className="text-yellow-500" size={24} />;
    return <File className="text-blue-500" size={24} />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Upload className="text-blue-500 animate-pulse" size={20} />;
      case 'analyzing':
        return <Brain className="text-purple-500 animate-pulse" size={20} />;
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* Professional Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <Cloud size={32} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Document Intelligence Hub</h1>
                    <p className="text-lg text-blue-100">Advanced AI-powered document analysis and insights</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                    <div className="flex items-center space-x-3">
                      <Shield size={24} className="text-green-300" />
                      <div>
                        <p className="text-white font-semibold">Secure Upload</p>
                        <p className="text-blue-100 text-sm">Enterprise-grade security</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                    <div className="flex items-center space-x-3">
                      <Brain size={24} className="text-purple-300" />
                      <div>
                        <p className="text-white font-semibold">AI Analysis</p>
                        <p className="text-blue-100 text-sm">Intelligent insights extraction</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                    <div className="flex items-center space-x-3">
                      <BarChart3 size={24} className="text-yellow-300" />
                      <div>
                        <p className="text-white font-semibold">Real-time Results</p>
                        <p className="text-blue-100 text-sm">Instant data visualization</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block ml-8">
                <div className="w-32 h-32 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
                  <TrendingUp size={64} className="text-white opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Upload Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Upload size={24} className="mr-3 text-blue-600" />
                  Upload Documents
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Drag and drop your files or click to browse
                </p>
              </div>
              
              <div className="p-6">
                <div
                  className={`
                    relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ease-in-out
                    ${isDragOver 
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105 shadow-lg' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className={`transition-all duration-300 ${isDragOver ? 'scale-110' : ''}`}>
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Upload size={40} className={`text-white ${isDragOver ? 'animate-bounce' : ''}`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {isDragOver ? 'Drop files here!' : 'Upload your documents'}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                      Support for CSV, PDF, Excel files up to 50MB. Our AI will analyze your data and provide intelligent insights.
                    </p>
                    
                    <input
                      type="file"
                      multiple
                      accept=".csv,.pdf,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Upload size={20} className="mr-3" />
                      Choose Files
                    </label>
                    
                    <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <FileText size={16} />
                        <span>PDF</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Database size={16} />
                        <span>CSV</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <File size={16} />
                        <span>Excel</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Info Panel */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <SectionHeader icon={BarChart3} title="Processing Stats" />
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Files Uploaded</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{files.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-semibold text-green-600">{files.filter(f => f.status === 'completed').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Processing</span>
                  <span className="font-semibold text-blue-600">{files.filter(f => f.status === 'analyzing' || f.status === 'uploading').length}</span>
                </div>
              </div>
            </div>
            
            {/* AI Features */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
              <SectionHeader icon={Sparkles} title="AI Capabilities" />
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Brain size={16} className="text-purple-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Smart Analysis</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Automatic data pattern detection</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp size={16} className="text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Trend Identification</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Historical pattern analysis</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap size={16} className="text-yellow-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Instant Insights</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Real-time recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File Processing List */}
        {files.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Clock size={24} className="mr-3 text-blue-600" />
                  Processing Queue
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {files.filter(f => f.status === 'completed').length} of {files.length} completed
                  </span>
                  <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`bg-green-500 h-2 rounded-full transition-all duration-300 ${getCompletionWidth()}`}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {files.map((file) => (
                <div key={file.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span className="capitalize">{file.type.split('/')[1] || 'Unknown'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(file.status)}
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                              file.status === 'completed' 
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : file.status === 'analyzing'
                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                : file.status === 'uploading'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}>
                              {file.status === 'analyzing' ? 'AI Processing' : 
                               file.status === 'uploading' ? 'Uploading' :
                               file.status === 'completed' ? 'Complete' : 'Error'}
                            </span>
                          </div>
                          
                          {file.status === 'completed' && (
                            <button
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Remove file"
                              onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Enhanced Progress Bar */}
                      {(file.status === 'uploading' || file.status === 'analyzing') && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>
                              {file.status === 'uploading' ? 'Uploading...' : 'AI Analyzing...'}
                            </span>
                            <span>{Math.round(file.progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                file.status === 'analyzing' 
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                              } ${getProgressWidth(file.progress)}`}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Analysis Result Card */}
                      {file.status === 'completed' && file.analysisResult && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-3">
                                <CheckCircle size={20} className="text-green-500" />
                                <span className="text-lg font-semibold text-green-800 dark:text-green-400">
                                  Analysis Complete
                                </span>
                                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                                  AI Powered
                                </span>
                              </div>
                              
                              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                                {file.analysisResult.summary}
                              </p>
                              
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => setSelectedAnalysis(file.analysisResult!)}
                                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                  <Eye size={16} className="mr-2" />
                                  View Analysis
                                </button>
                                
                                <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                  <Download size={16} className="mr-2" />
                                  Export
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Error State */}
                      {file.status === 'error' && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <AlertCircle size={20} className="text-red-500" />
                              <span className="text-red-800 dark:text-red-400 font-medium">
                                Processing failed
                              </span>
                            </div>
                            <button 
                              onClick={() => {
                                // Reset file status to retry processing
                                setFiles(prev => prev.map(f => 
                                  f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
                                ));
                                // You could add actual retry logic here
                              }}
                              className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <RefreshCw size={14} className="mr-1" />
                              Retry
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Analysis History Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200 mt-8">
        <div className="flex items-center justify-between mb-6">
          <SectionHeader 
            icon={Clock} 
            title="Histórico de Análises" 
            subtitle="Análises guardadas localmente no seu navegador" 
          />
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {analysisHistory.length} análise{analysisHistory.length !== 1 ? 's' : ''} guardada{analysisHistory.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {analysisHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center">
                <Clock size={40} className="text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-semibold text-lg">
                  Nenhuma Análise Guardada
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-md mx-auto">
                  As análises de ficheiros serão automaticamente guardadas aqui após o processamento.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisHistory.map((analysis) => (
              <div 
                key={analysis.id}
                className="group bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <FileText size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-semibold text-gray-900 dark:text-white text-sm break-words line-clamp-2"
                        title={analysis.fileName}
                      >
                        {analysis.fileName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatFileSize(analysis.fileSize)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-3 space-y-1">
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <Calendar size={12} className="mr-1" />
                    <span>{new Date(analysis.analysisDate).toLocaleDateString('pt-PT')}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <Clock size={12} className="mr-1" />
                    <span>{new Date(analysis.analysisDate).toLocaleTimeString('pt-PT')}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <Brain size={12} className="mr-1" />
                    <span>{analysis.analysisResult.insights?.length || 0} insights</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewHistoryAnalysis(analysis)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye size={14} />
                    <span>Ver Análise</span>
                  </button>
                  <button
                    onClick={() => handleDeleteHistory(analysis.id)}
                    className="px-3 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                    title="Eliminar análise"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Results Modal */}
```
      {selectedAnalysis && (
        <AnalysisResults 
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
        />
      )}
    </>
  );
};

export default FileUploadPage;