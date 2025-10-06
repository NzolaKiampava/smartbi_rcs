import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Check, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock,
  Trash2,
  Archive,
  Settings,
  Eye,
  EyeOff,
  Star,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'system' | 'security' | 'performance' | 'user' | 'data';
  actionUrl?: string;
  starred?: boolean;
  archived?: boolean;
}

const NotificationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read' | 'starred'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'System Performance Alert',
      message: 'Database response time has increased by 15% in the last hour. Consider checking server resources.',
      type: 'warning',
      timestamp: '2024-01-18T10:30:00Z',
      read: false,
      priority: 'high',
      category: 'performance',
      starred: true
    },
    {
      id: '2',
      title: 'New User Registration',
      message: 'Sarah Johnson (sarah.johnson@company.com) has registered and is pending approval.',
      type: 'info',
      timestamp: '2024-01-18T09:45:00Z',
      read: false,
      priority: 'medium',
      category: 'user'
    },
    {
      id: '3',
      title: 'Data Export Completed',
      message: 'Your requested data export for Q4 2023 sales report has been completed successfully.',
      type: 'success',
      timestamp: '2024-01-18T09:15:00Z',
      read: true,
      priority: 'low',
      category: 'data'
    },
    {
      id: '4',
      title: 'Security Alert',
      message: 'Multiple failed login attempts detected from IP 192.168.1.100. Account has been temporarily locked.',
      type: 'error',
      timestamp: '2024-01-18T08:30:00Z',
      read: false,
      priority: 'high',
      category: 'security',
      starred: true
    },
    {
      id: '5',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance will occur on January 20th from 2:00 AM to 4:00 AM UTC. Services may be temporarily unavailable.',
      type: 'info',
      timestamp: '2024-01-17T16:00:00Z',
      read: true,
      priority: 'medium',
      category: 'system'
    },
    {
      id: '6',
      title: 'Query Performance Optimized',
      message: 'Dashboard query performance has been improved by 25% after recent optimizations.',
      type: 'success',
      timestamp: '2024-01-17T14:20:00Z',
      read: true,
      priority: 'low',
      category: 'performance'
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'error': return <AlertTriangle size={20} className="text-red-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      default: return 'border-l-gray-300 dark:border-l-gray-600 bg-white dark:bg-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'security': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'performance': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'user': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'data': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'unread' && !notification.read) ||
                       (filterType === 'read' && notification.read) ||
                       (filterType === 'starred' && notification.starred);
    
    const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory && !notification.archived;
  });

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
  const starredCount = notifications.filter(n => n.starred && !n.archived).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleToggleStar = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleArchiveNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: true } : n));
  };

  const toggleNotificationSelection = (id: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const handleBulkAction = (action: 'read' | 'delete' | 'archive') => {
    if (action === 'read') {
      setNotifications(prev => prev.map(n => 
        selectedNotifications.has(n.id) ? { ...n, read: true } : n
      ));
    } else if (action === 'delete') {
      setNotifications(prev => prev.filter(n => !selectedNotifications.has(n.id)));
    } else if (action === 'archive') {
      setNotifications(prev => prev.map(n => 
        selectedNotifications.has(n.id) ? { ...n, archived: true } : n
      ));
    }
    setSelectedNotifications(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Notifications</h2>
              <p className="text-blue-100">Manage your system notifications and alerts</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors">
              <Settings size={20} className="text-white" />
            </button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Bell size={20} className="text-blue-300" />
              <span className="text-sm text-blue-100">Total</span>
            </div>
            <div className="text-2xl font-bold">{notifications.filter(n => !n.archived).length}</div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <EyeOff size={20} className="text-yellow-300" />
              <span className="text-sm text-blue-100">Unread</span>
            </div>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Star size={20} className="text-yellow-300" />
              <span className="text-sm text-blue-100">Starred</span>
            </div>
            <div className="text-2xl font-bold">{starredCount}</div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle size={20} className="text-red-300" />
              <span className="text-sm text-blue-100">High Priority</span>
            </div>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.priority === 'high' && !n.archived).length}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="starred">Starred</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="system">System</option>
              <option value="security">Security</option>
              <option value="performance">Performance</option>
              <option value="user">User</option>
              <option value="data">Data</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedNotifications.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedNotifications.size} selected
                </span>
                <button
                  onClick={() => handleBulkAction('read')}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Mark as read"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Archive"
                >
                  <Archive size={16} />
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 border-l-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group ${
                  getPriorityColor(notification.priority)
                }`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => toggleNotificationSelection(notification.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-lg font-semibold ${
                            notification.read 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {notification.title}
                          </h3>
                          
                          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(notification.category)}`}>
                            {notification.category}
                          </span>
                          
                          {notification.priority === 'high' && (
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                              High Priority
                            </span>
                          )}
                          
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {format(new Date(notification.timestamp), 'MMM dd, yyyy HH:mm')}
                          </span>
                          <span className="flex items-center">
                            <Tag size={14} className="mr-1" />
                            {notification.priority} priority
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleStar(notification.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            notification.starred
                              ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                              : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                          }`}
                          title={notification.starred ? 'Remove star' : 'Add star'}
                        >
                          <Star size={16} className={notification.starred ? 'fill-current' : ''} />
                        </button>
                        
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleArchiveNotification(notification.id)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Archive size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Bell size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'You\'re all caught up! Check back later for updates.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;