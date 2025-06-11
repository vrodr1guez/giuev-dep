"use client";

import React, { useState, useEffect } from 'react';
import { Battery, BarChart, Server, Zap } from 'lucide-react';

interface ChargingStation {
  id: string;
  status: string;
  utilization: number;
  power: number;
}

interface LiveData {
  active_sessions: number;
  power_utilization: number;
  energy_delivered: number;
  current_load: number;
  charging_stations: ChargingStation[];
}

interface DemoData {
  live_data?: LiveData;
  [key: string]: any;
}

export default function DemoPage() {
  const [demoType, setDemoType] = useState('charging');
  const [demoData, setDemoData] = useState(null as DemoData | null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/analytics/demo-data?demo_type=${demoType}`);
        const data = await response.json();
        setDemoData(data);
      } catch (error) {
        console.error('Error fetching demo data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [demoType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4">
            Interactive Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl max-w-3xl mx-auto">
            Explore various demonstrations of our EV charging infrastructure platform
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              demoType === 'charging'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setDemoType('charging')}
          >
            <Battery className="inline-block mr-2 h-5 w-5" />
            Charging Demo
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              demoType === 'v2g'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setDemoType('v2g')}
          >
            <Zap className="inline-block mr-2 h-5 w-5" />
            V2G Demo
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              demoType === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setDemoType('analytics')}
          >
            <BarChart className="inline-block mr-2 h-5 w-5" />
            Analytics Demo
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              demoType === 'api'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setDemoType('api')}
          >
            <Server className="inline-block mr-2 h-5 w-5" />
            API Demo
          </button>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : demoData ? (
            <div>
              {demoType === 'charging' && demoData.live_data && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Charging Station Monitoring</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Active Sessions</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {demoData.live_data.active_sessions}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Power Utilization</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {demoData.live_data.power_utilization.toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Energy Delivered</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {demoData.live_data.energy_delivered.toFixed(2)} kWh
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Current Load</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {demoData.live_data.current_load.toFixed(2)} kW
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Charging Stations Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {demoData.live_data.charging_stations.map((station, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <div className="font-medium text-gray-900 dark:text-white">{station.id}</div>
                            <div className={`px-2 py-1 rounded text-xs ${
                              station.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : station.status === 'idle'
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {station.status.toUpperCase()}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Utilization</span>
                              <span className="text-gray-900 dark:text-white">{station.utilization.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Power</span>
                              <span className="text-gray-900 dark:text-white">{station.power.toFixed(2)} kW</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {demoType === 'v2g' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Vehicle-to-Grid Integration</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Monitor real-time V2G capabilities across your fleet, providing grid services and generating revenue.
                  </p>
                  
                  <div className="flex justify-center my-8">
                    <div className="w-full max-w-2xl h-60 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                        V2G Visualization Demo
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                      <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">V2G Capable</div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">42</div>
                      </div>
                      <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Grid Services</div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">12</div>
                      </div>
                      <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Revenue</div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">$1.2k</div>
                      </div>
                      <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Power Flow</div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">68kW</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {demoType === 'analytics' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Advanced Analytics Dashboard</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Gain insights into your charging infrastructure with our advanced analytics tools.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Energy Usage Trends</h3>
                      <div className="h-40 flex items-end space-x-2">
                        {[40, 65, 52, 78, 45, 68, 93, 72, 80, 60, 75, 85].map((value, i) => (
                          <div key={i} className="flex-1">
                            <div 
                              className="bg-blue-500 dark:bg-blue-600 rounded-t" 
                              style={{ height: `${value}%` }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Carbon Savings</h3>
                      <div className="flex items-center justify-center h-40">
                        <div className="relative h-32 w-32 rounded-full border-8 border-green-500 flex items-center justify-center">
                          <div className="text-xl font-bold text-gray-900 dark:text-white">76%</div>
                          <div className="absolute -top-8 text-sm text-gray-600 dark:text-gray-300">vs. ICE vehicles</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-medium mb-4">AI-Powered Predictive Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded p-4">
                        <div className="text-sm opacity-80 mb-1">Peak Usage Forecast</div>
                        <div className="text-xl font-medium">Tomorrow, 4-7PM</div>
                      </div>
                      <div className="bg-white/10 rounded p-4">
                        <div className="text-sm opacity-80 mb-1">Maintenance Alert</div>
                        <div className="text-xl font-medium">Station CS04 in 5 days</div>
                      </div>
                      <div className="bg-white/10 rounded p-4">
                        <div className="text-sm opacity-80 mb-1">Optimal Charging Times</div>
                        <div className="text-xl font-medium">2-4AM, 11AM-1PM</div>
                      </div>
                      <div className="bg-white/10 rounded p-4">
                        <div className="text-sm opacity-80 mb-1">Energy Cost Forecast</div>
                        <div className="text-xl font-medium">-12% next week</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {demoType === 'api' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">API Integration Demo</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Explore our comprehensive API ecosystem for seamless integration with your systems.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">API Endpoints</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">47</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Request Rate</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">8.2k/min</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Success Rate</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">99.8%</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Integration Status</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">Payment Systems</span>
                          </div>
                          <span className="text-green-600 dark:text-green-400">Connected</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">Fleet Management</span>
                          </div>
                          <span className="text-green-600 dark:text-green-400">Connected</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">Energy Markets</span>
                          </div>
                          <span className="text-yellow-600 dark:text-yellow-400">Partial</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">Authentication</span>
                          </div>
                          <span className="text-green-600 dark:text-green-400">Connected</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-1/2 bg-gray-900 text-white rounded-lg p-4 font-mono text-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">API Example</h3>
                        <span className="text-xs text-gray-400">GET /api/v1/charging-stations</span>
                      </div>
                      <pre className="overflow-x-auto">
{`{
  "status": "success",
  "data": {
    "stations": [
      {
        "id": "CS01",
        "status": "active",
        "current_power": 7.2,
        "utilization": 80.5,
        "last_maintenance": "2025-04-12"
      },
      // ... more stations
    ]
  }
}`}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <a 
                      href="/api-docs" 
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      <span>Explore Full API Documentation</span>
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-600 dark:text-gray-300">Unable to load demo data. Please try again later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 