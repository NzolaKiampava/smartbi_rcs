import React, { useState } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MetricCard from './components/Dashboard/MetricCard';
import RevenueChart from './components/Charts/RevenueChart';
import CategoryChart from './components/Charts/CategoryChart';
import DataTable from './components/Tables/DataTable';
import { metricsData, revenueData, categoryData, tableData } from './data/mockData';

function App() {
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
}

export default App;