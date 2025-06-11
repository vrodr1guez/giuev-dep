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
  AlertCircle, 
  ChevronRight, 
  CheckCircle, 
  ArrowUp,
  BarChart2,
  Layers,
  Settings,
  PlugZap,
  History
} from 'lucide-react';

type VehicleDetailProps = {
  params: {
    id: string;
  };
};

const VehicleDetail = ({ params }: VehicleDetailProps) => {
  const { id } = params;
  const [activeTab, setActiveTab] = useState('overview');

  // Mock vehicle data - in a real app, this would be fetched from an API
  const vehicle = {
    id,
    name: 'Tesla Model 3 Long Range',
    licensePlate: 'EV-123-456',
    vin: '5YJ3E1EA1LF123456',
    status: 'v2g_active',
    batteryLevel: 78,
    batteryCapacity: 75, // kWh
    range: 287, // miles
    lastConnected: '2023-06-15T14:30:00Z',
    connectionStatus: 'connected',
    chargeRate: 11, // kW
    location: 'Main Depot - Bay 12',
    gridStatus: 'providing',
    gridPower: 7.2, // kW
    energyProvided: 14.8, // kWh today
    nextSchedule: '2023-06-16T08:00:00Z',
    batteryHealth: 96, // percentage
    lifetimeEnergyProvided: 1245, // kWh
    revenueGenerated: 186.75, // $ this month
    alerts: [
      {
        id: 'alert-1',
        type: 'info',
        message: 'Scheduled for maintenance in 15 days',
        timestamp: '2023-06-14T10:15:00Z'
      }
    ],
    v2gEvents: [
      {
        id: 'v2g-1',
        type: 'discharge',
        startTime: '2023-06-15T14:30:00Z',
        endTime: '2023-06-15T17:30:00Z',
        energyAmount: 14.8,
        rate: 7.2,
        revenue: 4.44
      },
      {
        id: 'v2g-2',
        type: 'discharge',
        startTime: '2023-06-14T15:00:00Z',
        endTime: '2023-06-14T18:00:00Z',
        energyAmount: 16.2,
        rate: 7.2,
        revenue: 4.86
      },
      {
        id: 'v2g-3',
        type: 'discharge',
        startTime: '2023-06-13T14:45:00Z',
        endTime: '2023-06-13T17:45:00Z',
        energyAmount: 15.3,
        rate: 7.2,
        revenue: 4.59
      }
    ]
  };

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

  // Tab definitions
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Layers className="h-5 w-5 mr-2" /> },
    { id: 'v2g', label: 'V2G Activity', icon: <Zap className="h-5 w-5 mr-2" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="h-5 w-5 mr-2" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5 mr-2" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <a href="/ev-management/smart-grid" className="hover:text-blue-600 dark:hover:text-blue-400">Smart Grid</a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <a href="/ev-management/smart-grid/vehicles" className="hover:text-blue-600 dark:hover:text-blue-400">Vehicles</a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-800 dark:text-white">{vehicle.name}</span>
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
              <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{vehicle.name}</h1>
              <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                <span className="mr-3">{vehicle.licensePlate}</span>
                <span className="text-sm">VIN: {vehicle.vin}</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-2 mt-4 md:mt-0"
          >
            {vehicle.status === 'v2g_active' && (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <PlugZap className="h-4 w-4 mr-1" /> V2G Active
              </div>
            )}
            <a 
              href={`/ev-management/smart-grid/vehicles/${id}/settings`}
              className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center hover:shadow-sm"
            >
              <Settings className="h-4 w-4 mr-1" /> Configure
            </a>
            <a 
              href={`/ev-management/smart-grid/vehicles/${id}/history`}
              className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center hover:shadow-sm"
            >
              <History className="h-4 w-4 mr-1" /> History
            </a>
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

        {/* Tab Content */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-b-xl shadow-md border-x border-b border-gray-100 dark:border-gray-700 p-6"
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Status Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Battery Status Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Battery Status</h3>
                    <Battery className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-800 dark:text-white">{vehicle.batteryLevel}%</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{vehicle.range} mi range</div>
                    </div>
                    <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          vehicle.batteryLevel > 60 ? 'bg-green-500' : 
                          vehicle.batteryLevel > 30 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${vehicle.batteryLevel}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>

                {/* V2G Status Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Grid Status</h3>
                    <Zap className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-800 dark:text-white">{vehicle.gridPower} kW</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {vehicle.gridStatus === 'providing' ? 'Providing to grid' : 'Drawing from grid'}
                      </div>
                    </div>
                    <div className="flex items-center justify-center h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <ArrowUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </motion.div>

                {/* Energy Provided Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Energy Provided Today</h3>
                    <PlugZap className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-800 dark:text-white">{vehicle.energyProvided} kWh</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">${(vehicle.energyProvided * 0.3).toFixed(2)} revenue</div>
                    </div>
                    <div className="flex h-8 px-2 bg-green-100 dark:bg-green-900/30 items-center justify-center rounded-full">
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">+12%</span>
                    </div>
                  </div>
                </motion.div>

                {/* Next Schedule Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Schedule</h3>
                    <Calendar className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xl font-bold text-gray-800 dark:text-white">{formatDate(vehicle.nextSchedule)}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatTime(vehicle.nextSchedule)}</div>
                    </div>
                    <div className="flex items-center justify-center h-8 w-8 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Details and Alerts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vehicle Details */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Vehicle Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Battery Capacity</h4>
                      <p className="text-gray-800 dark:text-white">{vehicle.batteryCapacity} kWh</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Battery Health</h4>
                      <p className="text-gray-800 dark:text-white">{vehicle.batteryHealth}%</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h4>
                      <p className="text-gray-800 dark:text-white">{vehicle.location}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Connection Status</h4>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${
                          vehicle.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <p className="text-gray-800 dark:text-white capitalize">{vehicle.connectionStatus}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Connected</h4>
                      <p className="text-gray-800 dark:text-white">{formatDate(vehicle.lastConnected)} at {formatTime(vehicle.lastConnected)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lifetime Energy Provided</h4>
                      <p className="text-gray-800 dark:text-white">{vehicle.lifetimeEnergyProvided} kWh</p>
                    </div>
                  </div>
                </motion.div>

                {/* Alerts */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Alerts & Notifications</h3>
                  {vehicle.alerts.length > 0 ? (
                    <div className="space-y-4">
                      {vehicle.alerts.map(alert => (
                        <div key={alert.id} className="flex items-start border-l-4 border-amber-500 pl-4 py-2">
                          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-gray-800 dark:text-white">{alert.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(alert.timestamp)} at {formatTime(alert.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500">
                      <div className="text-center">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>No active alerts</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* V2G Events Preview */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent V2G Activity</h3>
                  <button
                    onClick={() => setActiveTab('v2g')}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500 flex items-center"
                  >
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Energy</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {vehicle.v2gEvents.slice(0, 3).map((event, index) => {
                        const startDate = new Date(event.startTime);
                        const endDate = new Date(event.endTime);
                        const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
                        
                        return (
                          <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-800 dark:text-white">{formatDate(event.startTime)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(event.startTime)}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-800 dark:text-white">{durationHours.toFixed(1)} hours</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-800 dark:text-white">{event.energyAmount} kWh</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-800 dark:text-white">{event.rate} kW</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-green-600 dark:text-green-400">${event.revenue.toFixed(2)}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}

          {/* V2G Activity Tab */}
          {activeTab === 'v2g' && (
            <div className="space-y-8">
              <div className="text-gray-600 dark:text-gray-300">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">V2G Activity Details</h3>
                <p className="mb-6">
                  Complete history of Vehicle-to-Grid energy transfers for this vehicle, including energy provided to the grid, revenue generated, and associated metrics.
                </p>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Energy Provided</h4>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">{vehicle.lifetimeEnergyProvided} kWh</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Revenue This Month</h4>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">${vehicle.revenueGenerated}</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Average Session Duration</h4>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">3.1 hours</div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Energy</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {vehicle.v2gEvents.map((event) => {
                          const startDate = new Date(event.startTime);
                          const endDate = new Date(event.endTime);
                          const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
                          
                          return (
                            <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-800 dark:text-white">{formatDate(event.startTime)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-800 dark:text-white">
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-800 dark:text-white">{durationHours.toFixed(1)} hours</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-800 dark:text-white">{event.energyAmount} kWh</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-800 dark:text-white">{event.rate} kW</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-green-600 dark:text-green-400">${event.revenue.toFixed(2)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics and Settings tabs would be implemented similarly */}
          {activeTab === 'analytics' && (
            <div className="py-8 px-4 text-center text-gray-500 dark:text-gray-400">
              <BarChart2 className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Analytics Coming Soon</h3>
              <p>Detailed vehicle performance analytics and insights are currently under development.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="py-8 px-4 text-center text-gray-500 dark:text-gray-400">
              <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Vehicle Settings</h3>
              <p>Please visit the dedicated settings page to configure this vehicle's V2G parameters.</p>
              <div className="mt-4">
                <a 
                  href={`/ev-management/smart-grid/vehicles/${id}/settings`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Settings <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VehicleDetail; 