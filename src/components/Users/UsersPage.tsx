import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Phone, 
  Filter,
  Download,
  Upload,
  RefreshCw,
  UserCheck,
  UserX,
  Crown,
  Activity,
  TrendingUp,
  Eye,
  X,
  Save,
  AlertTriangle,
  Clock,
  Grid3X3,
  List,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { useNotification } from '../../contexts/NotificationContext';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  department: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
  location?: string;
  timezone?: string;
}

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

interface DeleteConfirmationModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    role: 'viewer',
    department: '',
    status: 'active',
    location: '',
    timezone: '',
    permissions: []
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'viewer',
        department: '',
        status: 'active',
        location: '',
        timezone: '',
        permissions: []
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData: User = {
      id: user?.id || Date.now().toString(),
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone,
      role: formData.role || 'viewer',
      department: formData.department || '',
      status: formData.status || 'active',
      location: formData.location,
      timezone: formData.timezone,
      permissions: formData.permissions || [],
      createdAt: user?.createdAt || new Date().toISOString(),
      lastLogin: user?.lastLogin
    };
    onSave(userData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <UserPlus size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user ? 'Edit User' : 'Add New User'}</h2>
                <p className="text-blue-100">Manage user information and permissions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              title="Close modal"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter department"
                  required
                />
              </div>
            </div>

            {/* Role and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  title="Select user role"
                  aria-label="Select user role"
                >
                  <option value="viewer">Viewer</option>
                  <option value="analyst">Analyst</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  title="Select user status"
                  aria-label="Select user status"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter location"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Save size={18} />
              <span>{user ? 'Update User' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ user, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete User</h3>
              <p className="text-gray-600 dark:text-gray-400">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to delete <span className="font-semibold">{user.name}</span>? 
            This will permanently remove their account and all associated data.
          </p>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={16} className="text-red-600 dark:text-red-400 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="font-medium">This will:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Remove user access immediately</li>
                  <li>Delete all user preferences</li>
                  <li>Remove from all assigned projects</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>Delete User</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | User['role']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | User['status']>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { showSuccess, showError } = useNotification();

  // Mock data - Replace with real API calls
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUsers: User[] = [
          {
            id: '1',
            name: 'João Silva',
            email: 'joao.silva@company.com',
            phone: '+244 912 345 678',
            role: 'admin',
            department: 'IT',
            status: 'active',
            avatar: '',
            lastLogin: '2025-09-19T10:30:00Z',
            createdAt: '2024-01-15T08:00:00Z',
            permissions: ['read', 'write', 'admin'],
            location: 'Luanda, Angola',
            timezone: 'WAT'
          },
          {
            id: '2',
            name: 'Maria Santos',
            email: 'maria.santos@company.com',
            phone: '+244 923 456 789',
            role: 'manager',
            department: 'Finance',
            status: 'active',
            lastLogin: '2025-09-19T09:15:00Z',
            createdAt: '2024-02-20T10:00:00Z',
            permissions: ['read', 'write'],
            location: 'Benguela, Angola',
            timezone: 'WAT'
          },
          {
            id: '3',
            name: 'Carlos Eduardo',
            email: 'carlos.eduardo@company.com',
            phone: '+244 934 567 890',
            role: 'analyst',
            department: 'Analytics',
            status: 'active',
            lastLogin: '2025-09-18T16:45:00Z',
            createdAt: '2024-03-10T14:30:00Z',
            permissions: ['read'],
            location: 'Huambo, Angola',
            timezone: 'WAT'
          },
          {
            id: '4',
            name: 'Ana Costa',
            email: 'ana.costa@company.com',
            role: 'viewer',
            department: 'Marketing',
            status: 'pending',
            createdAt: '2025-09-18T12:00:00Z',
            permissions: ['read'],
            location: 'Lobito, Angola',
            timezone: 'WAT'
          },
          {
            id: '5',
            name: 'Pedro Mendes',
            email: 'pedro.mendes@company.com',
            phone: '+244 945 678 901',
            role: 'analyst',
            department: 'Operations',
            status: 'inactive',
            lastLogin: '2025-09-10T14:20:00Z',
            createdAt: '2024-05-05T11:15:00Z',
            permissions: ['read'],
            location: 'Cabinda, Angola',
            timezone: 'WAT'
          }
        ];

        setUsers(mockUsers);
        // Removendo notificação para evitar duplicação
        // showSuccess(`${mockUsers.length} users loaded successfully`);
      } catch (error) {
        console.error('Failed to load users:', error);
        showError('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Carregamento inicial apenas

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'admin': return <Crown size={16} className="text-purple-600" />;
      case 'manager': return <Shield size={16} className="text-blue-600" />;
      case 'analyst': return <Activity size={16} className="text-green-600" />;
      case 'viewer': return <Eye size={16} className="text-gray-600" />;
      default: return <Eye size={16} className="text-gray-600" />;
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30';
      case 'manager': return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
      case 'analyst': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      case 'viewer': return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      case 'inactive': return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30';
      case 'pending': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'active': return <UserCheck size={16} />;
      case 'inactive': return <UserX size={16} />;
      case 'pending': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const handleSaveUser = (userData: User) => {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(user => user.id === userData.id ? userData : user));
      showSuccess(`User ${userData.name} updated successfully`);
    } else {
      // Add new user
      setUsers([...users, userData]);
      showSuccess(`User ${userData.name} created successfully`);
    }
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleConfirmDelete = () => {
    if (deletingUser) {
      setUsers(users.filter(user => user.id !== deletingUser.id));
      showSuccess(`User ${deletingUser.name} deleted successfully`);
      setShowDeleteModal(false);
      setDeletingUser(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeUsersCount = users.filter(user => user.status === 'active').length;
  const pendingUsersCount = users.filter(user => user.status === 'pending').length;
  const totalAdmins = users.filter(user => user.role === 'admin').length;

  const UserCard: React.FC<{ user: User }> = ({ user }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
            {getStatusIcon(user.status)}
            <span className="capitalize">{user.status}</span>
          </div>
          
          <div className="relative group/menu">
            <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all" title="More options" aria-label="More options">
              <MoreVertical size={16} className="text-gray-400 dark:text-gray-500" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
              <button
                onClick={() => handleEditUser(user)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Edit size={16} />
                <span>Edit User</span>
              </button>
              <button
                onClick={() => handleDeleteUser(user)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Role</span>
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
            {getRoleIcon(user.role)}
            <span className="capitalize">{user.role}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Department</span>
          <span className="text-gray-900 dark:text-white font-medium">{user.department}</span>
        </div>
        
        {user.location && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Location</span>
            <span className="text-gray-900 dark:text-white">{user.location}</span>
          </div>
        )}
        
        {user.lastLogin && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Last Login</span>
            <span className="text-gray-900 dark:text-white">{format(new Date(user.lastLogin), 'MMM dd, HH:mm')}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        {user.phone && (
          <button className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <Phone size={14} className="mr-2" />
            Call
          </button>
        )}
        <button className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
          <Mail size={14} className="mr-2" />
          Email
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header with KPIs */}
      <div className="mb-8">
        {/* Title Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Manage team members and permissions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <Upload size={16} className="mr-2" />
              Import
            </button>
            <button className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <Download size={16} className="mr-2" />
              Export
            </button>
            <button
              onClick={() => {
                setEditingUser(null);
                setShowEditModal(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} className="mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center text-green-500">
                <TrendingUp size={16} className="mr-1" />
                <span className="text-sm font-medium">+5%</span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Users</p>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <UserCheck size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeUsersCount}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Active Users</p>
            </div>
          </div>

          {/* Pending Approval */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex items-center text-yellow-600">
                <Clock size={16} className="mr-1" />
                <span className="text-sm font-medium">Pending</span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{pendingUsersCount}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Approval</p>
            </div>
          </div>

          {/* Administrators */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Crown size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex items-center text-purple-600">
                <Shield size={16} className="mr-1" />
                <span className="text-sm font-medium">Secured</span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalAdmins}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Administrators</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Filter size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Search</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
                title="Grid View"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'all' | User['role'])}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              title="Filter by role"
              aria-label="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="analyst">Analyst</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | User['status'])}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              title="Filter by status"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredUsers.length} of {users.length} users
              </span>
              {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRole('all');
                    setFilterStatus('all');
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
            
            <button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  // Removed refresh notification to prevent noise
                }, 1000);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
            <RefreshCw className="animate-spin" size={24} />
            <span className="text-lg">Loading users...</span>
          </div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Users size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by adding your first user'
            }
          </p>
          <button
            onClick={() => {
              setEditingUser(null);
              setShowEditModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add User
          </button>
        </div>
      )}

      {/* Modals */}
      <EditUserModal
        user={editingUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
      />

      <DeleteConfirmationModal
        user={deletingUser}
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingUser(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default UsersPage;