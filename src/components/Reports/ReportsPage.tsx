import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  MoreVertical, 
  Search, 
  Grid, 
  List, 
  Plus,
  Clock,
  Star,
  Trash2,
  Upload
} from 'lucide-react';
import { format } from 'date-fns';
import FilePreviewModal from './FilePreviewModal';
import SectionHeader from '../Common/SectionHeader';
import { graphqlService } from '../../services/graphqlService';

interface Document {
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

const ReportsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('modified');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Mock data for documents
  const documents: Document[] = [
    {
      id: '1',
      name: 'Q4 Sales Report 2024.pdf',
      type: 'pdf',
      size: 2456789,
      lastModified: '2024-01-15T10:30:00Z',
      owner: 'John Doe',
      shared: true,
      starred: true
    },
    {
      id: '2',
      name: 'Customer Analytics Dashboard.xlsx',
      type: 'excel',
      size: 1234567,
      lastModified: '2024-01-14T15:45:00Z',
      owner: 'Jane Smith',
      shared: false,
      starred: false
    },
    {
      id: '3',
      name: 'Business Intelligence Summary.docx',
      type: 'docx',
      size: 987654,
      lastModified: '2024-01-13T09:15:00Z',
      owner: 'Mike Johnson',
      shared: true,
      starred: false
    },
    {
      id: '4',
      name: 'Revenue Data Export.csv',
      type: 'csv',
      size: 543210,
      lastModified: '2024-01-12T14:20:00Z',
      owner: 'Sarah Wilson',
      shared: false,
      starred: true
    },
    {
      id: '5',
      name: 'Monthly Presentation.pptx',
      type: 'pptx',
      size: 3456789,
      lastModified: '2024-01-11T11:00:00Z',
      owner: 'David Brown',
      shared: true,
      starred: false
    },
    {
      id: '6',
      name: 'Financial Analysis Q3.pdf',
      type: 'pdf',
      size: 1876543,
      lastModified: '2024-01-10T16:30:00Z',
      owner: 'Emily Davis',
      shared: false,
      starred: false
    }
  ];

  const recentDocuments = documents.slice(0, 4);

  const getFileIcon = (type: string, size: number = 48) => {
    const iconProps = { size, className: "drop-shadow-sm" };
    
    switch (type) {
      case 'pdf':
        return <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">PDF</div>;
      case 'excel':
        return <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">XLS</div>;
      case 'docx':
        return <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">DOC</div>;
      case 'csv':
        return <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">CSV</div>;
      case 'pptx':
        return <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">PPT</div>;
      default:
        return <FileText {...iconProps} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      case 'modified':
      default:
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    }
  });

  const toggleDocSelection = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  const DocumentCard: React.FC<{ doc: Document }> = ({ doc }) => (
    <div className={`
      group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer
      ${selectedDocs.has(doc.id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
    `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedDocs.has(doc.id)}
            onChange={() => toggleDocSelection(doc.id)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div onClick={() => handleDocumentClick(doc)}>
            {getFileIcon(doc.type)}
          </div>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {doc.starred && <Star size={16} className="text-yellow-500 fill-current" />}
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <MoreVertical size={16} className="text-gray-400 dark:text-gray-500" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2" onClick={() => handleDocumentClick(doc)}>
        <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">
          {doc.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatFileSize(doc.size)}</span>
          <span>{format(new Date(doc.lastModified), 'MMM dd')}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">{doc.owner}</span>
          {doc.shared && (
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <Share2 size={12} className="mr-1" />
              <span>Shared</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const DocumentRow: React.FC<{ doc: Document }> = ({ doc }) => (
    <tr className={`
      hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer
      ${selectedDocs.has(doc.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
    `}
    >
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedDocs.has(doc.id)}
            onChange={() => toggleDocSelection(doc.id)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="w-8 h-8">
            {getFileIcon(doc.type, 32)}
          </div>
          <div onClick={() => handleDocumentClick(doc)}>
            <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{doc.owner}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400" onClick={() => handleDocumentClick(doc)}>
        {format(new Date(doc.lastModified), 'MMM dd, yyyy HH:mm')}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400" onClick={() => handleDocumentClick(doc)}>
        {formatFileSize(doc.size)}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          {doc.starred && <Star size={16} className="text-yellow-500 fill-current" />}
          {doc.shared && <Share2 size={16} className="text-blue-600 dark:text-blue-400" />}
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical size={16} className="text-gray-400 dark:text-gray-500" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="rounded-xl p-0">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-between">
            <SectionHeader icon={FileText} title={<div className="text-2xl font-bold">Reports & Documents</div>} subtitle={<span className="text-gray-500 dark:text-gray-400">Manage and export reports</span>} />

            <div className="flex items-center space-x-3 ml-4">
              {/* Hidden file input to wire Upload label */}
              <input
                id="reports-file-input"
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setUploading(true);
                    // Attempt to call backend upload if available
                    if (graphqlService?.uploadAndAnalyzeFile) {
                      const input = { file, description: `Uploaded via Reports UI: ${file.name}` } as any;
                      await graphqlService.uploadAndAnalyzeFile(input);
                      alert('Upload enviado com sucesso');
                    } else {
                      // Fallback: brief simulated delay
                      await new Promise((r) => setTimeout(r, 700));
                      alert('Upload simulado concluído');
                    }
                  } catch (err) {
                    console.error('Upload failed', err);
                    alert('Falha no upload — o servidor pode estar offline.');
                  } finally {
                    setUploading(false);
                    // clear the input so same file can be reselected
                    const el = document.getElementById('reports-file-input') as HTMLInputElement | null;
                    if (el) el.value = '';
                  }
                }}
              />

              <label htmlFor="reports-file-input" aria-label="Upload report" className={`inline-flex items-center px-4 py-2 ${uploading ? 'bg-white/30' : 'bg-white bg-opacity-20 hover:bg-opacity-30'} text-white font-medium rounded-lg transition-colors cursor-pointer`}>
                <Upload size={20} className="mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
              </label>

              <div className="relative">
                <button aria-expanded={isNewReportOpen} onClick={() => setIsNewReportOpen(s => !s)} className="inline-flex items-center px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors">
                  <Plus size={20} className="mr-2" />
                  New Report
                </button>

                {isNewReportOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                          <FileText size={18} className="text-gray-700 dark:text-gray-200" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Create New Report</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Choose a report template or start from scratch</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <button onClick={() => { alert('Template: Executive Summary'); setIsNewReportOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Executive Summary</button>
                      <button onClick={() => { alert('Template: Sales Dashboard'); setIsNewReportOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Sales Dashboard</button>
                      <button onClick={() => { alert('Blank report'); setIsNewReportOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Start from Blank</button>
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button onClick={() => { navigator.clipboard?.writeText('https://example.com/report-template'); setIsNewReportOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">Import template URL</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Recent Documents */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <SectionHeader icon={Clock} title={<div className="flex items-center">Recent Documents</div>} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="w-10 h-10">
                {getFileIcon(doc.type, 40)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{doc.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(doc.lastModified), 'MMM dd')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Documents Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="modified">Last Modified</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedDocs.size > 0 && (
                <div className="flex items-center space-x-2 mr-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{selectedDocs.size} selected</span>
                  <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Download size={16} />
                  </button>
                  <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Share2 size={16} />
                  </button>
                  <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Display */}
        <div className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedDocuments.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
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
                  {sortedDocuments.map((doc) => (
                    <DocumentRow key={doc.id} doc={doc} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {sortedDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No documents found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal 
        document={selectedDocument}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default ReportsPage;