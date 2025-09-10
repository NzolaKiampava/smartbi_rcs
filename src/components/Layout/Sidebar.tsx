import React from 'react';
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Settings, 
  FileText, 
  PieChart,
  Activity,
  Database,
  X,
  Upload,
  MessageSquare,
  BarChart3,
  Sparkles,
  Crown
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const navigation = [
  { name: 'Overview', icon: BarChart3, section: 'overview' },
  { name: 'Analytics', icon: PieChart, section: 'analytics' },
  { name: 'Users', icon: Users, section: 'users' },
  { name: 'Orders', icon: ShoppingCart, section: 'orders' },
  { name: 'Performance', icon: TrendingUp, section: 'performance' },
  { name: 'AI Analysis', icon: Upload, section: 'file-upload' },
  { name: 'Natural Query', icon: MessageSquare, section: 'natural-query' },
  { name: 'Reports', icon: FileText, section: 'reports' },
  { name: 'Activity', icon: Activity, section: 'activity' },
  { name: 'Database', icon: Database, section: 'database' },
];

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, activeSection, setActiveSection }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        lg:relative lg:transform-none lg:shadow-none lg:border-r lg:border-gray-200 dark:lg:border-gray-700 lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 flex flex-col
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 lg:hidden bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">SmartBI</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="hidden lg:flex items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <img 
              src="/LOGOTIPO-IT-DATA-1943x2048.png" 
              alt="IT Data Logo" 
              className="w-8 h-8 object-contain"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">SmartBI</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Business Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto mt-6 px-3 bg-white dark:bg-gray-800">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.section;
              
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveSection(item.section);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-2 border-blue-700 dark:border-blue-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} className={`mr-3 ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Settings size={20} className="mr-3 text-gray-400 dark:text-gray-500" />
              Settings
            </button>
          </div>
        </nav>

        {/* Cool SaaS Banner */}
        <div className="p-4 bg-white dark:bg-gray-800">
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl p-4 overflow-hidden group hover:shadow-lg transition-all duration-300">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-500"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Crown size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">IT Data</h3>
                  <p className="text-blue-100 text-xs">SaaS Solutions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-white/90">
                <Sparkles size={14} className="text-yellow-300" />
                <span className="text-xs font-medium">Powered by 42</span>
              </div>
              
              {/* Version badge */}
              <div className="mt-3 inline-flex items-center px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-white text-xs font-medium">v2.1.0</span>
              </div>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
