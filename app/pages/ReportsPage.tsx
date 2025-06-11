import React from 'react';

const ReportsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-semibold">Reports & Analytics</h2>
      <p className="mt-4">Detailed reports and analytics will be available here.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-medium">Fleet Performance</h3>
          <p className="mt-2 text-gray-600">Comprehensive fleet performance metrics and KPIs</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-medium">Energy Usage</h3>
          <p className="mt-2 text-gray-600">Detailed energy consumption and charging patterns</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-medium">Driver Behavior</h3>
          <p className="mt-2 text-gray-600">Driver performance and behavior analysis</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 