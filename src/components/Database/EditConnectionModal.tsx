import React, { useEffect, useState } from 'react';
import { X, Server, Globe, Key } from 'lucide-react';
import { Connection, graphqlService } from '../../services/graphqlService';
import { useNotification } from '../../contexts/NotificationContext';

interface Props {
  isOpen: boolean;
  connection: Connection | null;
  onClose: () => void;
  onSaved?: (updated: Connection) => void;
}

const EditConnectionModal: React.FC<Props> = ({ isOpen, connection, onClose, onSaved }) => {
  const [form, setForm] = useState({ name: '', type: '', apiUrl: '', apiKey: '', username: '', password: '', headers: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (connection) {
      // Prefill form with connection values when opening
      const cfg: any = (connection as any).config || {};
      const headersValue = (cfg.headers || []).map((h: any) => `${h.key}: ${h.value}`).join('\n');
      setForm({
        name: connection.name || '',
        type: connection.type || '',
        apiUrl: cfg.apiUrl || cfg.host || '',
        apiKey: cfg.apiKey || '',
        username: cfg.username || '',
        password: cfg.password || '',
        headers: headersValue
      });
    } else {
      setForm({ name: '', type: '', apiUrl: '', apiKey: '', username: '', password: '', headers: '' });
    }
  }, [connection]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!connection) return;
    setIsSaving(true);
    try {
      const headersArr = form.headers
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && l.includes(':'))
        .map(l => {
          const [k, ...r] = l.split(':');
          return { key: k.trim(), value: r.join(':').trim() };
        });

      const input = {
        name: form.name,
        type: form.type,
        config: {
          apiUrl: form.apiUrl,
          apiKey: form.apiKey,
          username: form.username,
          password: form.password,
          headers: headersArr
        }
      };

      const updated = await graphqlService.updateApiConnection(connection.id, input as any);
      showSuccess('Conexão atualizada com sucesso');
      onSaved && onSaved(updated);
      onClose();
    } catch (err) {
      const errorMsg = typeof err === 'object' && err !== null && 'message' in err ? (err as any).message : String(err);
      showError('Erro ao atualizar conexão: ' + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Server size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Connection</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update connection details and headers</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <input type="text" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API URL</label>
            <input type="url" value={form.apiUrl} onChange={(e) => setForm({...form, apiUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
              <input type="text" value={form.apiKey} onChange={(e) => setForm({...form, apiKey: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input type="text" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Headers</label>
            <textarea value={form.headers} onChange={(e) => setForm({...form, headers: e.target.value})} rows={4}
              placeholder={`Content-Type: application/json\nX-Custom: value`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">One header per line in format: Header-Name: value</p>
          </div>
        </div>

        <div className="flex items-center justify-end p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button onClick={onClose} className="px-4 py-2 mr-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditConnectionModal;
