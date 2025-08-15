import React, { useState, useCallback } from 'react';
import { Upload, FileText, File, CheckCircle, AlertCircle, Brain, Zap, Sparkles } from 'lucide-react';
import { analyzeFile } from '../../utils/aiAnalyzer';
import { AnalysisResult } from '../../types/analysis';
import AnalysisResults from '../Analysis/AnalysisResults';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
  progress: number;
  analysisResult?: AnalysisResult;
}

const FileUploadPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const processFile = async (file: File) => {
    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    };

    setFiles(prev => [...prev, newFile]);

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === newFile.id && f.status === 'uploading') {
          const newProgress = f.progress + Math.random() * 30;
          if (newProgress >= 100) {
            clearInterval(uploadInterval);
            
            // Start AI analysis simulation
            setTimeout(() => {
              setFiles(prev => prev.map(file => 
                file.id === newFile.id 
                  ? { ...file, status: 'analyzing', progress: 0 }
                  : file
              ));

              // Perform actual AI analysis
              analyzeFile(file).then(analysisResult => {
                setFiles(prev => prev.map(f => 
                  f.id === newFile.id 
                    ? { ...f, status: 'completed', progress: 100, analysisResult }
                    : f
                ));
              }).catch(error => {
                console.error('Analysis failed:', error);
                setFiles(prev => prev.map(f => 
                  f.id === newFile.id 
                    ? { ...f, status: 'error', progress: 0 }
                    : f
                ));
              });

              // Simulate analysis progress
              const progressInterval = setInterval(() => {
                setFiles(prev => prev.map(f => {
                  if (f.id === newFile.id && f.status === 'analyzing') {
                    const newProgress = Math.min(f.progress + Math.random() * 15, 95);
                    return { ...f, progress: newProgress };
                  }
                  return f;
                }));
              }, 300);

              // Clear progress interval after analysis completes
              setTimeout(() => {
                clearInterval(progressInterval);
              }, 5000);
            }, 500);

            return { ...f, status: 'uploading', progress: 100 };
          }
          return { ...f, progress: newProgress };
        }
        return f;
      }));
    }, 100);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(processFile);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(file => processFile(file));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="text-red-500" size={24} />;
    if (type.includes('csv')) return <File className="text-green-500" size={24} />;
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
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">AI Document Analysis</h2>
              <p className="text-purple-100">Upload CSV or PDF files for intelligent analysis and insights</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-purple-100">
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-yellow-300" />
              <span>Powered by Advanced AI</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText size={16} className="text-blue-200" />
              <span>Supports PDF & CSV</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain size={16} className="text-purple-200" />
              <span>Intelligent Insights</span>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
              ${isDragOver 
                ? 'border-blue-400 bg-blue-50 scale-105' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={`transition-all duration-300 ${isDragOver ? 'scale-110' : ''}`}>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={32} className={`text-blue-500 ${isDragOver ? 'animate-bounce' : ''}`} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {isDragOver ? 'Drop files here!' : 'Upload your documents'}
              </h3>
              
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Drag and drop your CSV or PDF files here, or click to browse
              </p>
              
              <input
                type="file"
                multiple
                accept=".csv,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
              >
                <Upload size={20} className="mr-2" />
                Choose Files
              </label>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                Maximum file size: 10MB • Supported formats: CSV, PDF
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Processing Files</h3>
            
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                        {file.status === 'analyzing' ? 'AI Analyzing...' : file.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        file.status === 'analyzing' 
                          ? 'bg-purple-500' 
                          : file.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{Math.round(file.progress)}% complete</span>
                    <span>
                      {file.status === 'analyzing' && (
                        <span className="flex items-center">
                          <Brain size={12} className="mr-1 animate-pulse" />
                          AI Processing...
                        </span>
                      )}
                    </span>
                  </div>
                  
                  {/* Analysis Result */}
                  {file.status === 'completed' && file.analysisResult && (
                    <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-400">Analysis Complete</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-3">{file.analysisResult.insights.summary}</p>
                      <button
                        onClick={() => setSelectedAnalysis(file.analysisResult!)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Brain size={16} className="mr-2" />
                        View Detailed Analysis
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results Modal */}
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