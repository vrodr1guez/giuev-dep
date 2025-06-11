"use client";

import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Battery, 
  Zap, 
  Calendar, 
  Clock, 
  ChevronRight, 
  History,
  Filter,
  Download,
  BarChart2,
  Search,
  ArrowRight,
  BatteryCharging
} from 'lucide-react';

type VehicleHistoryProps = {
  params: {
    id: string;
  };
};

const VehicleHistory = ({ params }: VehicleHistoryProps) => {
  const { id } = params;
  const [activeTab, setActiveTab] = useState('charging');
  const [dateRange, setDateRange] = useState('30d');

  // Mock vehicle data
  const vehicle = {
    id,
    name: 'Tesla Model 3 Long Range',
    licensePlate: 'EV-123-456',
    batteryCapacity: 75 // kWh
  };

  // Mock history data
  const chargingHistory = [
    { 
      id: 'ch-001', 
      type: 'charging',
      location: 'Main Depot - Bay 12',
      startTime: '2023-06-01T08:15:00Z', 
      endTime: '2023-06-01T10:45:00Z',
      energyAmount: 45.2,
      startSoC: 12,
      endSoC: 78,
      averagePower: 17.2,
      cost: 12.65
    },
    { 
      id: 'ch-002', 
      type: 'charging',
      location: 'Downtown Station C4',
      startTime: '2023-06-03T18:30:00Z', 
      endTime: '2023-06-03T20:15:00Z',
      energyAmount: 27.5,
      startSoC: 34,
      endSoC: 70,
      averagePower: 16.8,
      cost: 8.25
    },
    { 
      id: 'ch-003', 
      type: 'charging',
      location: 'Main Depot - Bay 8',
      startTime: '2023-06-05T07:20:00Z', 
      endTime: '2023-06-05T09:50:00Z',
      energyAmount: 42.8,
      startSoC: 15,
      endSoC: 76,
      averagePower: 17.1,
      cost: 10.70
    }
  ];

  const v2gHistory = [
    { 
      id: 'v2g-001', 
      type: 'v2g',
      location: 'Smart Grid Hub A',
      startTime: '2023-06-02T16:00:00Z', 
      endTime: '2023-06-02T19:00:00Z',
      energyAmount: 15.8,
      startSoC: 85,
      endSoC: 65,
      averagePower: 5.3,
      revenue: 4.74
    },
    { 
      id: 'v2g-002', 
      type: 'v2g',
      location: 'Grid Support Node 12',
      startTime: '2023-06-04T17:30:00Z', 
      endTime: '2023-06-04T20:00:00Z',
      energyAmount: 13.7,
      startSoC: 82,
      endSoC: 64,
      averagePower: 5.5,
      revenue: 4.11
    }
  ];

  const maintenanceHistory = [
    {
      id: 'mt-001',
      type: 'maintenance',
      date: '2023-05-15T10:00:00Z',
      description: 'Regular maintenance check',
      technician: 'J. Smith',
      notes: 'All systems operating normally. Battery health at 97%.',
      cost: 145.00
    },
    {
      id: 'mt-002',
      type: 'maintenance',
      date: '2023-03-20T09:30:00Z',
      description: 'Firmware update',
      technician: 'A. Johnson',
      notes: 'Updated onboard computer firmware to version 2023.12.4. Improved charging efficiency by 2%.',
      cost: 75.00
    }
  ];

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate duration between two dates in hours:minutes format
  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Tab definitions
  const tabs = [
    { id: 'charging', label: 'Charging History', icon: <BatteryCharging className="h-5 w-5 mr-2" /> },
    { id: 'v2g', label: 'V2G Activity', icon: <Zap className="h-5 w-5 mr-2" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <History className="h-5 w-5 mr-2" /> }
  ];

  // Filter options
  const timeRanges = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: 'all', label: 'All Time' }
  ];

  // Get active history data based on tab
  const getActiveHistoryData = () => {
    switch(activeTab) {
      case 'charging': return chargingHistory;
      case 'v2g': return v2gHistory;
      case 'maintenance': return maintenanceHistory;
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <a href="/ev-management/smart-grid" className="hover:text-blue-600 dark:hover:text-blue-400">Smart Grid</a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <a href="/ev-management/smart-grid/vehicles" className="hover:text-blue-600 dark:hover:text-blue-400">Vehicles</a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <a href={`/ev-management/smart-grid/vehicles/${id}`} className="hover:text-blue-600 dark:hover:text-blue-400">{vehicle.name}</a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-800 dark:text-white">History</span>
        </div>

        {/* Vehicle Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
              <History className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{vehicle.name} History</h1>
              <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                <span>{vehicle.licensePlate}</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-2 mt-4 md:mt-0"
          >
            <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center hover:shadow-sm">
              <Download className="h-4 w-4 mr-1" /> Export Data
            </button>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-t-xl shadow-md border border-gray-100 dark:border-gray-700 p-1"
        >
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium min-w-max ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Controls and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-x border-gray-100 dark:border-gray-700 p-4"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={`Search ${activeTab} history...`}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Time Range:</div>
              <div className="flex">
                {timeRanges.map(range => (
                  <button
                    key={range.id}
                    onClick={() => setDateRange(range.id)}
                    className={`px-3 py-1 text-sm ${
                      dateRange === range.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium rounded-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              
              <button className="flex items-center gap-1 px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                <Filter size={16} />
                More Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* History Content */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-b-xl shadow-md border-x border-b border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          {activeTab === 'charging' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Energy</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SoC Change</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {chargingHistory.map((session, index) => (
                    <motion.tr 
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800 dark:text-white">{formatDate(session.startTime)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(session.startTime)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800 dark:text-white">{session.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800 dark:text-white">
                          {calculateDuration(session.startTime, session.endTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800 dark:text-white flex items-center">
                          <Battery className="h-4 w-4 mr-1 text-green-500" />
                          {session.energyAmount} kWh
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {session.averagePower} kW avg
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-800 dark:text-white">
                          <span className="text-amber-500">{session.startSoC}%</span>
                          <ArrowRight className="h-3 w-3 mx-1" />
                          <span className="text-green-500">{session.endSoC}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800 dark:text-white">${session.cost.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                          Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'v2g' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Energy Provided</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SoC Change</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {v2gHistory.map((session, index) => (
                    <motion.tr 
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800 dark:text-white">{formatDate(session.startTime)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(session.startTime)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800 dark:text-white">{session.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800 dark:text-white">
                          {calculateDuration(session.startTime, session.endTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800 dark:text-white flex items-center">
                          <Zap className="h-4 w-4 mr-1 text-purple-500" />
                          {session.energyAmount} kWh
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {session.averagePower} kW avg
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-800 dark:text-white">
                          <span className="text-green-500">{session.startSoC}%</span>
                          <ArrowRight className="h-3 w-3 mx-1" />
                          <span className="text-amber-500">{session.endSoC}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">${session.revenue.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                          Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {maintenanceHistory.map((record, index) => (
                <motion.div 
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-4">
                        <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">{record.description}</h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(record.date)} at {formatTime(record.date)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 text-sm font-medium text-gray-800 dark:text-white">
                      Cost: ${record.cost.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-4 ml-11">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Technician:</span> {record.technician}
                    </div>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                      {record.notes}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{getActiveHistoryData().length}</span> of{' '}
                  <span className="font-medium">{getActiveHistoryData().length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span className="sr-only">Previous</span>
                    <ChevronRight className="h-5 w-5 transform rotate-180" />
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/30 text-sm font-medium text-blue-600 dark:text-blue-400">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VehicleHistory; 