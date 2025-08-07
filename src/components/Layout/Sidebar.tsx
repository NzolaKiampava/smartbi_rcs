import React from 'react';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Settings, 
  FileText, 
  PieChart,
  Activity,
  Database,
  X,
  Upload
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
        fixed top-0 left-0 z-50 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:relative lg:transform-none lg:shadow-none lg:border-r lg:border-gray-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 lg:hidden">
          <h2 className="text-xl font-bold text-gray-900">SmartBI</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        <div className="hidden lg:flex items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">SmartBI</h2>
              <p className="text-xs text-gray-500">Business Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 px-3">
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
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon size={20} className={`mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <Settings size={20} className="mr-3 text-gray-400" />
              Settings
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;