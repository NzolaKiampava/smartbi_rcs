import React, { useRef, useEffect } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Star, 
  Edit, 
  Trash2, 
  FileText, 
  File, 
  Calendar,
  User,
  HardDrive,
  Eye,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

interface FileDocument {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'docx' | 'csv' | 'pptx';
  size: number;
  lastModified: string;
  owner: string;
  shared: boolean;
  starred: boolean;
  thumbnail?: string;
}

interface FilePreviewModalProps {
  document: FileDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ document: fileDocument, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !fileDocument) return null;

  const getFileIcon = (type: string, size: number = 64) => {
    switch (type) {
      case 'pdf':
        return <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">PDF</div>;
      case 'excel':
        return <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">XLS</div>;
      case 'docx':
        return <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">DOC</div>;
      case 'csv':
        return <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">CSV</div>;
      case 'pptx':
        return <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">PPT</div>;
      default:
        return <File size={size} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeDescription = (type: string) => {
    switch (type) {
      case 'pdf': return 'PDF Document';
      case 'excel': return 'Excel Spreadsheet';
      case 'docx': return 'Word Document';
      case 'csv': return 'CSV Data File';
      case 'pptx': return 'PowerPoint Presentation';
      default: return 'Document';
    }
  };

  const renderPreview = () => {
    switch (fileDocument.type) {
      case 'pdf':
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <FileText size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">PDF Preview</p>
            <div className="bg-white rounded border p-4 text-left text-sm text-gray-700 max-w-md mx-auto">
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        );
      
      case 'excel':
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <div className="text-green-500 mx-auto mb-4">
              <div className="w-12 h-12 bg-green-500 rounded mx-auto flex items-center justify-center text-white font-bold">XLS</div>
            </div>
            <p className="text-gray-600 mb-4">Excel Spreadsheet Preview</p>
            <div className="bg-white rounded border max-w-md mx-auto">
              <div className="grid grid-cols-4 gap-px bg-gray-200">
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i} className="bg-white p-2 text-xs text-center">
                    {i < 4 ? ['A', 'B', 'C', 'D'][i] : `${Math.floor(Math.random() * 100)}`}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'csv':
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <div className="text-orange-500 mx-auto mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded mx-auto flex items-center justify-center text-white font-bold">CSV</div>
            </div>
            <p className="text-gray-600 mb-4">CSV Data Preview</p>
            <div className="bg-white rounded border max-w-md mx-auto p-4">
              <div className="text-xs font-mono text-left space-y-1">
                <div>Name,Email,Status,Revenue</div>
                <div>John Doe,john@example.com,Active,25000</div>
                <div>Jane Smith,jane@example.com,Active,18000</div>
                <div>Mike Johnson,mike@example.com,Pending,32000</div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <File size={48} className="text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600">Preview not available for this file type</p>
            <button className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ExternalLink size={16} className="mr-2" />
              Open in External App
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {getFileIcon(fileDocument.type)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{fileDocument.name}</h2>
              <p className="text-sm text-gray-500">{getFileTypeDescription(fileDocument.type)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className={`p-2 rounded-lg transition-colors ${
                fileDocument.starred 
                  ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'
              }`}
            >
              <Star size={20} className={fileDocument.starred ? 'fill-current' : ''} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Download size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Preview Area */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
              {renderPreview()}
            </div>
          </div>

          {/* Sidebar with Details */}
          <div className="w-80 bg-gray-50 p-6 border-l border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">File Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Owner</p>
                  <p className="text-sm text-gray-600">{fileDocument.owner}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Modified</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(fileDocument.lastModified), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <HardDrive size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">File Size</p>
                  <p className="text-sm text-gray-600">{formatFileSize(fileDocument.size)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Share2 size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sharing</p>
                  <p className="text-sm text-gray-600">
                    {fileDocument.shared ? 'Shared with team' : 'Private'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Eye size={16} className="mr-2" />
                Open Full View
              </button>
              
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Download size={16} className="mr-2" />
                Download
              </button>
              
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 size={16} className="mr-2" />
                Share
              </button>
            </div>

            {/* Danger Zone */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="w-full flex items-center justify-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={16} className="mr-2" />
                Delete File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;