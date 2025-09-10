import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './components/Landing/LandingPage';
import LoginPage from './components/Auth/LoginPage';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MetricCard from './components/Dashboard/MetricCard';
import RevenueChart from './components/Charts/RevenueChart';
import CategoryChart from './components/Charts/CategoryChart';
import DataTable from './components/Tables/DataTable';
import FileUploadPage from './components/FileUpload/FileUploadPage';
import NaturalLanguageQueryPage from './components/NaturalLanguage/NaturalLanguageQueryPage';
import ReportsPage from './components/Reports/ReportsPage';
import PerformancePage from './components/Performance/PerformancePage';
import DatabasePage from './components/Database/DatabasePage';
import ChatbaseWidget from './components/Chatbase/ChatbaseWidget';
import { metricsData, revenueData, categoryData, tableData } from './data/mockData';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

const sections = [
  'overview',
  'analytics',
  'users',
  'file-upload',
  'natural-query',
  'reports',
  'database'
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sectionFromUrl = location.pathname.replace('/', '') || 'overview';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(sectionFromUrl);

  // Atualiza o estado quando a URL muda
  React.useEffect(() => {
    setActiveSection(sectionFromUrl);
  }, [sectionFromUrl]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    navigate(`/${section}`);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricsData.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart data={revenueData} />
              <CategoryChart data={categoryData} />
            </div>

            {/* Data Table */}
            <DataTable data={tableData} />
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics</h2>
              <p className="text-gray-600">Deep dive into your business metrics and performance indicators.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart data={revenueData} />
              <CategoryChart data={categoryData} />
            </div>
          </div>
        );
      
      case 'users':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
              <p className="text-gray-600">Manage user accounts, permissions, and activity tracking.</p>
            </div>
            
            <DataTable data={tableData} />
          </div>
        );
      
      case 'file-upload':
        return <FileUploadPage />;
      
      case 'natural-query':
        return <NaturalLanguageQueryPage />;
      
      case 'reports':
        return <ReportsPage />;
      
      case 'performance':
        return <PerformancePage />;
      
      case 'database':
        return <DatabasePage />;
      
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>
            <p className="text-gray-600">This section is under development. More features coming soon!</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden transition-colors duration-200">
      {/* Componente Chatbase - carrega o widget de chat */}
      <ChatbaseWidget />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeSection={activeSection}
          setActiveSection={handleSectionChange}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Welcome to SmartBI - Your comprehensive business intelligence platform
                </p>
              </div>
              
              {renderContent()}
            </div>
          </main>
          
          {/* Fixed Footer */}
          <footer className="h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0 transition-colors duration-200">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600">© {new Date().getFullYear()}. All rights reserved.</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Version 2.1.0</span>
              <span>•</span>
              <button className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Privacy</button>
              <span>•</span>
              <button className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Terms</button>
              <span>•</span>
              <button className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Support</button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const location = useLocation();

  // Reset showLanding quando a URL for '/'
  React.useEffect(() => {
    if (location.pathname === '/') {
      setShowLanding(true);
    }
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Se não autenticado e showLanding é true, mostra landing page
  if (!isAuthenticated && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // Se não autenticado e showLanding é false, mostra login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Se autenticado, mostra dashboard
  return (
    <Routes>
      <Route path="/*" element={<Dashboard />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
