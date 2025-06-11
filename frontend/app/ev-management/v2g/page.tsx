"use client";

import React, { useState } from 'react';
import { ArrowRight, Battery, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function V2GManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4">
            Vehicle-to-Grid Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl max-w-3xl mx-auto">
            Monitor and optimize bidirectional energy flow between vehicles and the power grid
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          <button 
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'vehicles' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('vehicles')}
          >
            V2G Vehicles
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'grid-services' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('grid-services')}
          >
            Grid Services
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'revenue' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('revenue')}
          >
            Revenue
          </button>
        </div>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Battery className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">42</div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">V2G Vehicles</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total vehicles with V2G capability</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Battery className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">68 kW</div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Grid Power</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Current power transfer to grid</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Battery className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">12</div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Grid Services</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Active grid support services</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Battery className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">$1,248</div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Weekly Revenue</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">From grid services this week</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Power Flow Visualization */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-80">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Real-time Power Flow</h3>
                <div className="flex items-center justify-center h-60 bg-blue-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <Zap className="h-16 w-16 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Interactive power flow visualization will appear here</p>
                  </div>
                </div>
              </div>
              
              {/* V2G Status */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">V2G Status</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Peak Shaving</span>
                    </div>
                    <span className="text-green-600 dark:text-green-400">Active</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Frequency Reg.</span>
                    </div>
                    <span className="text-green-600 dark:text-green-400">Active</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-gray-300 mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Emergency Backup</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">Standby</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Demand Response</span>
                    </div>
                    <span className="text-yellow-600 dark:text-yellow-400">Scheduled</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">V2G Performance Metrics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Energy to Grid (Week)</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">1,248 kWh</div>
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>12% increase</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Battery Health Impact</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">Minimal</div>
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>Within parameters</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Grid Stabilization</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">3.5 MW</div>
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>Peak contribution</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Carbon Offset</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">875 kg</div>
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>This month</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Link 
                href="/ev-management/demo" 
                className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <span>Explore V2G Interactive Demo</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </>
        )}
        
        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">V2G-Capable Vehicles</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vehicle ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Battery</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">V2G Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Energy Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    { id: 'EV-2401', model: 'Tesla Model 3', battery: '78%', status: 'Active', capacity: '75 kWh' },
                    { id: 'EV-1872', model: 'Nissan Leaf', battery: '64%', status: 'Standby', capacity: '62 kWh' },
                    { id: 'EV-3245', model: 'Ford F-150 Lightning', battery: '85%', status: 'Active', capacity: '131 kWh' },
                    { id: 'EV-4632', model: 'VW ID.4', battery: '42%', status: 'Charging', capacity: '82 kWh' },
                    { id: 'EV-5218', model: 'Hyundai Ioniq 5', battery: '91%', status: 'Active', capacity: '77 kWh' },
                  ].map((vehicle, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{vehicle.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{vehicle.model}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{vehicle.battery}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vehicle.status === 'Active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : vehicle.status === 'Standby' 
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{vehicle.capacity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">View</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Grid Services Tab */}
        {activeTab === 'grid-services' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Grid Services</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Services</h4>
                <div className="space-y-4">
                  {[
                    { name: 'Peak Shaving', status: 'Active', power: '45 kW', time: '4:00pm - 8:00pm' },
                    { name: 'Frequency Regulation', status: 'Active', power: '23 kW', time: 'Continuous' },
                    { name: 'Demand Response', status: 'Scheduled', power: '35 kW', time: 'Tomorrow 2:00pm' },
                    { name: 'Emergency Backup', status: 'Standby', power: '120 kW', time: 'On demand' },
                  ].map((service, index) => (
                    <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{service.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{service.time}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${
                          service.status === 'Active' 
                            ? 'text-green-600 dark:text-green-400' 
                            : service.status === 'Scheduled' 
                            ? 'text-yellow-600 dark:text-yellow-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>{service.status}</div>
                        <div className="font-medium text-gray-900 dark:text-white">{service.power}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Grid Demand Forecast</h4>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Battery className="h-16 w-16 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Interactive demand forecast will appear here</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-600 dark:bg-blue-700 rounded-xl p-6 text-white">
              <h4 className="text-lg font-medium mb-4">Upcoming Grid Events</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span>Peak Demand Period</span>
                  <span>May 20, 5:00pm - 9:00pm</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span>Demand Response Event</span>
                  <span>May 21, 2:00pm - 6:00pm</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span>Grid Maintenance</span>
                  <span>May 25, 1:00am - 5:00am</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">V2G Revenue</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Monthly Revenue</h4>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">$4,786.50</div>
                <div className="text-sm text-green-600 dark:text-green-400 mt-1">↑ 12% from last month</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Annual Projection</h4>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">$58,432</div>
                <div className="text-sm text-green-600 dark:text-green-400 mt-1">↑ 23% from last year</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Revenue per Vehicle</h4>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">$114.20</div>
                <div className="text-sm text-green-600 dark:text-green-400 mt-1">↑ 8% from last month</div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 mb-8">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white p-6 border-b border-gray-100 dark:border-gray-700">Revenue by Service Type</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">% of Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[
                      { service: 'Frequency Regulation', revenue: '$1,842.30', percentage: '38%', growth: '+15%' },
                      { service: 'Peak Shaving', revenue: '$1,256.75', percentage: '26%', growth: '+18%' },
                      { service: 'Demand Response', revenue: '$986.45', percentage: '21%', growth: '+8%' },
                      { service: 'Energy Arbitrage', revenue: '$542.80', percentage: '11%', growth: '+22%' },
                      { service: 'Spinning Reserve', revenue: '$158.20', percentage: '4%', growth: '+2%' },
                    ].map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.service}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.revenue}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.percentage}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{item.growth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Optimization Tips</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs mr-3 mt-0.5">1</div>
                  <div className="text-gray-700 dark:text-gray-300">Increase participation during peak demand hours (5pm-9pm) to maximize revenue from peak shaving services.</div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs mr-3 mt-0.5">2</div>
                  <div className="text-gray-700 dark:text-gray-300">Enable more vehicles for frequency regulation services which provide the highest revenue per kWh.</div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs mr-3 mt-0.5">3</div>
                  <div className="text-gray-700 dark:text-gray-300">Consider increasing minimum battery thresholds to ensure sufficient energy for high-value grid services.</div>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 