import React, { useState, useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import Dropdown from '../Common/Dropdown';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type User = any;

const ImportExportControls: React.FC<{ users: User[]; onImport?: (text: string, name: string) => void }> = ({ users, onImport }) => {
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onImportClick = () => fileRef.current?.click();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        if (onImport) onImport(text, f.name);
      } catch (err) {
        // noop
      }
    };
    reader.readAsText(f);
  };

  return (
    <div className="flex items-center space-x-3">
      <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" onChange={handleFile} />
      <div className="relative inline-block">
        <button onClick={() => setImportOpen(o => !o)} className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
          <Upload size={16} className="mr-2" />
          Import
        </button>
        <Dropdown open={importOpen} onClose={() => setImportOpen(false)}>
          <div className="flex flex-col">
            <button onClick={() => { onImportClick(); setImportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Upload CSV/JSON</button>
            <button onClick={() => { setImportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Import from SSO</button>
          </div>
        </Dropdown>
      </div>

      <div className="relative inline-block">
        <button onClick={() => setExportOpen(o => !o)} className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
          <Download size={16} className="mr-2" />
          Export
        </button>
        <Dropdown open={exportOpen} onClose={() => setExportOpen(false)}>
          <div className="flex flex-col">
            <button onClick={() => {
              // Export CSV robustly
              if (!users || !users.length) return setExportOpen(false);
              const headers = Object.keys(users[0]);
              const csvRows = [headers.join(',')].concat(users.map(u => headers.map(h => JSON.stringify(u[h] ?? '')).join(','))).join('\n');
              const blob = new Blob([csvRows], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'users.csv';
              a.click();
              URL.revokeObjectURL(url);
              setExportOpen(false);
            }} className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Export CSV</button>
            <button onClick={() => {
              if (!users || !users.length) return setExportOpen(false);
              try {
                const doc = new jsPDF();
                const headers = Object.keys(users[0]);
                const data = users.map(u => headers.map(h => String(u[h] ?? '')));
                // @ts-ignore - autotable plugin augments jsPDF
                (doc as any).autoTable({ head: [headers], body: data, theme: 'striped' });
                doc.save('users.pdf');
              } catch (e) {
                console.error('Failed to generate PDF', e);
                const win = window.open('', '_blank'); if (win) { win.document.write('<pre>' + JSON.stringify(users, null, 2) + '</pre>'); win.document.close(); win.print(); }
              }
              setExportOpen(false);
            }} className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Export PDF</button>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default ImportExportControls;
