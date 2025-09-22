import React, { useState, useEffect } from 'react';
import { Activity, User, Clock, LogOut, LogIn, FileText, Edit, Trash2 } from 'lucide-react';

// Mocked user log data
const userLogs = [

  {
    id: 1,
    user: 'João Silva',
    action: 'Login',
    description: 'Usuário fez login na plataforma',
    timestamp: '2025-09-22 09:15',
    icon: LogIn,
    color: 'bg-green-500',
  },
  {
    id: 2,
    user: 'João Silva',
    action: 'Logout',
    description: 'Usuário saiu da plataforma',
    timestamp: '2025-09-22 09:30',
    icon: LogOut,
    color: 'bg-red-500',
  },
  {
    id: 3,
    user: 'Ana Paula',
    action: 'Login',
    description: 'Usuário fez login na plataforma',
    timestamp: '2025-09-22 09:32',
    icon: LogIn,
    color: 'bg-green-500',
  },
];

// Mocked recent activity data (today)
const recentActivities = [
  {
    id: 1,
    user: 'Maria Souza',
    activity: 'Visualizou Relatório',
    details: 'Relatório de vendas acessado',
    timestamp: '2025-09-22 09:20',
    icon: FileText,
    color: 'bg-blue-500',
  },
  {
    id: 2,
    user: 'Carlos Lima',
    activity: 'Editou Dados',
    details: 'Atualizou cadastro de cliente',
    timestamp: '2025-09-22 09:25',
    icon: Edit,
    color: 'bg-yellow-500',
  },
  {
    id: 3,
    user: 'Ana Paula',
    activity: 'Removeu Arquivo',
    details: 'Arquivo "contrato.pdf" removido',
    timestamp: '2025-09-22 09:35',
    icon: Trash2,
    color: 'bg-pink-500',
  },
];

// Mocked previous days activities
const historyActivities = [
  {
    id: 1,
    user: 'Carlos Lima',
    activity: 'Exportou Dados',
    details: 'Exportou relatório financeiro',
    timestamp: '2025-09-21 16:10',
    icon: FileText,
    color: 'bg-blue-400',
  },
  {
    id: 2,
    user: 'Maria Souza',
    activity: 'Adicionou Usuário',
    details: 'Novo usuário cadastrado',
    timestamp: '2025-09-20 10:45',
    icon: Edit,
    color: 'bg-green-400',
  },
  {
    id: 3,
    user: 'João Silva',
    activity: 'Removeu Permissão',
    details: 'Permissão de acesso removida',
    timestamp: '2025-09-19 14:30',
    icon: Trash2,
    color: 'bg-pink-400',
  },
];

const ActivityPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Função para extrair data (yyyy-mm-dd) de timestamp string
  const extractDate = (timestamp: string) => timestamp.split(' ')[0];

  // Filtro para todas as tabelas
  const filterFn = (item: any, fields: string[]) => {
    const s = search.toLowerCase();
    const matchText = fields.some(f => (item[f] || '').toLowerCase().includes(s));
    // Filtro de datas
    if (dateStart || dateEnd) {
      const itemDate = extractDate(item.timestamp);
      if (dateStart && itemDate < dateStart) return false;
      if (dateEnd && itemDate > dateEnd) return false;
    }
    return matchText;
  };

  // Filtro para userLogs
  const filteredUserLogs = userLogs.filter(log =>
    filterFn(log, ['user', 'action', 'description', 'timestamp'])
  );
  // Filtro para atividades recentes
  const filteredRecentActivities = recentActivities.filter(act =>
    filterFn(act, ['user', 'activity', 'details', 'timestamp'])
  );
  // Filtro para histórico
  const filteredHistoryActivities = historyActivities.filter(act =>
    filterFn(act, ['user', 'activity', 'details', 'timestamp'])
  );

  return (
    <div className="space-y-6">
      {/* Filtro de Pesquisa */}
      <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-2 md:space-y-0">
        <div className="flex-1">
          <input
            type="text"
            className="w-full md:w-96 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="Pesquisar por usuário, ação ou descrição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-row space-x-2">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Data inicial</label>
            <input
              type="date"
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Data final</label>
            <input
              type="date"
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Atividades Recentes</h2>
            <p className="text-blue-100">Logs e ações recentes dos usuários na plataforma</p>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-6 text-sm text-blue-100">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Monitorando em tempo real</span>
          </div>
          <span>•</span>
          <span>Última atualização: {currentTime}</span>
        </div>
      </div>

      {/* User Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Logs de Usuários</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Entradas e saídas recentes dos usuários</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuário</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ação</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descrição</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Horário</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUserLogs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4 text-gray-400">Nenhum resultado encontrado.</td></tr>
              ) : filteredUserLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 flex items-center space-x-2">
                    <User size={18} className="text-gray-400 mr-1" />
                    <span className="font-medium text-gray-900 dark:text-white">{log.user}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold text-white ${log.color}`}>
                      <log.icon size={14} className="mr-1" />
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{log.description}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                    <Clock size={14} className="mr-1" />
                    <span>{log.timestamp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Atividades Recentes</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ações realizadas recentemente na plataforma</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuário</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Atividade</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detalhes</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Horário</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecentActivities.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4 text-gray-400">Nenhum resultado encontrado.</td></tr>
              ) : filteredRecentActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 flex items-center space-x-2">
                    <User size={18} className="text-gray-400 mr-1" />
                    <span className="font-medium text-gray-900 dark:text-white">{activity.user}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold text-white ${activity.color}`}>
                      <activity.icon size={14} className="mr-1" />
                      {activity.activity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{activity.details}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                    <Clock size={14} className="mr-1" />
                    <span>{activity.timestamp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórico de Atividades de Dias Anteriores */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico de Atividades (Dias Anteriores)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ações realizadas em dias anteriores na plataforma</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuário</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Atividade</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detalhes</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Horário</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredHistoryActivities.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4 text-gray-400">Nenhum resultado encontrado.</td></tr>
              ) : filteredHistoryActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 flex items-center space-x-2">
                    <User size={18} className="text-gray-400 mr-1" />
                    <span className="font-medium text-gray-900 dark:text-white">{activity.user}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold text-white ${activity.color}`}>
                      <activity.icon size={14} className="mr-1" />
                      {activity.activity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{activity.details}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                    <Clock size={14} className="mr-1" />
                    <span>{activity.timestamp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
