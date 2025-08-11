import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import ChatbaseWidget from './components/Chatbase/ChatbaseWidget';
import { metricsData, revenueData, categoryData, tableData } from './data/mockData';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

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
    <div className="min-h-screen bg-gray-50">
      {/* Componente Chatbase - carrega o widget de chat */}
      <ChatbaseWidget />
      
      <div className="flex">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        
        <div className="flex-1 flex flex-col min-h-screen">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Welcome to SmartBI - Your comprehensive business intelligence platform
                </p>
              </div>
              
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;