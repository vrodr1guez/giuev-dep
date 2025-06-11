import React from 'react';

export default function SmartCharging() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Smart Charging</h2>
      <p>Optimize charging schedules and manage energy usage.</p>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-xl font-semibold mb-3">Energy Management</h3>
          <div className="p-4 border rounded-lg bg-blue-50 mb-4">
            <h4 className="font-medium text-lg mb-2">Current Demand</h4>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Peak hours:</span>
              <span className="font-medium">18:00 - 22:00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current load:</span>
              <span className="font-medium">245 kW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Suggested delay:</span>
              <span className="font-medium text-orange-600">2 hours</span>
            </div>
          </div>
          
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Apply Smart Charging Schedule
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-xl font-semibold mb-3">Vehicle Priority</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-2 border-b">
              <div>
                <div className="font-medium">EV-101 (Tesla Model 3)</div>
                <div className="text-sm text-gray-500">Current: 87% | Needed by: 09:00</div>
              </div>
              <div>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">High Priority</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-2 border-b">
              <div>
                <div className="font-medium">EV-102 (Nissan Leaf)</div>
                <div className="text-sm text-gray-500">Current: 45% | Needed by: 14:00</div>
              </div>
              <div>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Medium Priority</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-2 border-b">
              <div>
                <div className="font-medium">EV-103 (BMW i3)</div>
                <div className="text-sm text-gray-500">Current: 32% | Needed by: 17:00</div>
              </div>
              <div>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Low Priority</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 