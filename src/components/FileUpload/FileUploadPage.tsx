import React, { useState, useCallback } from 'react';
import { Upload, FileText, File, CheckCircle, AlertCircle, Brain, Zap } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
  progress: number;
  analysisResult?: string;
}

const FileUploadPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const processFile = (file: File) => {
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

              // Simulate AI analysis progress
              const analysisInterval = setInterval(() => {
                setFiles(prev => prev.map(file => {
                  if (file.id === newFile.id && file.status === 'analyzing') {
                    const newProgress = file.progress + Math.random() * 25;
                    if (newProgress >= 100) {
                      clearInterval(analysisInterval);
                      return {
                        ...file,
                        status: 'completed',
                        progress: 100,
                        analysisResult: 'Document analyzed successfully. Key insights extracted and processed.'
                      };
                    }
                    return { ...file, progress: newProgress };
                  }
                  return file;
                }));
              }, 200);
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
    selectedFiles.forEach(processFile);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Document Analysis</h2>
            <p className="text-gray-600">Upload CSV or PDF files for intelligent analysis and insights</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Zap size={16} className="text-yellow-500" />
            <span>Powered by Advanced AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText size={16} className="text-blue-500" />
            <span>Supports PDF & CSV</span>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
            ${isDragOver 
              ? 'border-blue-400 bg-blue-50 scale-105' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isDragOver ? 'Drop files here!' : 'Upload your documents'}
            </h3>
            
            <p className="text-gray-500 mb-6">
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
            
            <p className="text-xs text-gray-400 mt-4">
              Maximum file size: 10MB • Supported formats: CSV, PDF
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Files</h3>
          
          <div className="space-y-4">
            {files.map((file) => (
              <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(file.status)}
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {file.status === 'analyzing' ? 'AI Analyzing...' : file.status}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
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
                
                <div className="flex justify-between text-xs text-gray-500">
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
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-sm font-medium text-green-800">Analysis Complete</span>
                    </div>
                    <p className="text-sm text-green-700">{file.analysisResult}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadPage;