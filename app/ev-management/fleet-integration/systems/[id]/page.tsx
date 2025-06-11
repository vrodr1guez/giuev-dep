"use client";

import React from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Settings, RefreshCw, Download, 
  Clock, Calendar, BarChart, Circle,
  CheckCircle, AlertCircle, Car
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';

// Sample systems data - in a real application this would come from an API
const systems = [
  {
    id: '1',
    name: 'GIU Fleet Management',
    status: 'Connected',
    lastSync: '2 minutes ago',
    nextSync: '13 minutes',
    dataPoints: ['Vehicle Status', 'Routes', 'Driver Assignments', 'Maintenance Records'],
    vehicles: 48,
    description: 'Primary fleet management system handling vehicle assignments, driver management, and maintenance scheduling.',
    connectionDate: 'March 15, 2024',
    apiVersion: 'v2.3',
    syncFrequency: '15 minutes',
    dataImported: ['Vehicle Data', 'Driver Information', 'Route History', 'Maintenance Records'],
    dataExported: ['Charging Status', 'Energy Usage', 'Battery Health', 'Charging Schedules'],
    recentActivity: [
      { id: 1, type: 'Sync Completed', status: 'Success', time: '2 minutes ago', details: 'Synchronized 48 vehicles, 12 routes, 8 drivers' },
      { id: 2, type: 'Data Export', status: 'Success', time: '17 minutes ago', details: 'Exported charging schedules for 36 vehicles' },
      { id: 3, type: 'Data Import', status: 'Success', time: '32 minutes ago', details: 'Imported updated route information for 15 vehicles' },
      { id: 4, type: 'Sync Completed', status: 'Success', time: '47 minutes ago', details: 'Synchronized 48 vehicles, 14 routes, 8 drivers' },
      { id: 5, type: 'Alert Resolved', status: 'Success', time: '1 hour ago', details: 'Resolved data format mismatch in driver profiles' }
    ],
    metrics: {
      syncSuccess: 99.8,
      dataQuality: 98.5,
      averageSyncTime: '8.2 seconds',
      dailySyncs: 96,
      errorRate: 0.2
    },
    errorLogs: []
  },
  {
    id: '2',
    name: 'RouteOptimizer Pro',
    status: 'Connected',
    lastSync: '5 minutes ago',
    nextSync: '10 minutes',
    dataPoints: ['Route Plans', 'Delivery Schedules', 'Customer Locations', 'Service Areas'],
    vehicles: 36,
    description: 'Route optimization system that calculates the most efficient delivery and service routes based on multiple factors including traffic and energy usage.',
    connectionDate: 'April 2, 2024',
    apiVersion: 'v1.8',
    syncFrequency: '15 minutes',
    dataImported: ['Route Maps', 'Delivery Windows', 'Stop Locations', 'Traffic Data'],
    dataExported: ['Vehicle Range', 'Charging Status', 'Vehicle Locations', 'Battery Levels'],
    recentActivity: [
      { id: 1, type: 'Sync Completed', status: 'Success', time: '5 minutes ago', details: 'Synchronized 36 routes, 218 stops' },
      { id: 2, type: 'Route Optimization', status: 'Success', time: '20 minutes ago', details: 'Optimized 12 routes based on traffic and charging status' },
      { id: 3, type: 'Data Export', status: 'Success', time: '35 minutes ago', details: 'Exported current vehicle ranges and battery levels' },
      { id: 4, type: 'Sync Completed', status: 'Success', time: '50 minutes ago', details: 'Synchronized 36 routes, 220 stops' },
      { id: 5, type: 'Data Import', status: 'Warning', time: '1 hour ago', details: 'Partial import of updated traffic data' }
    ],
    metrics: {
      syncSuccess: 99.1,
      dataQuality: 97.8,
      averageSyncTime: '12.5 seconds',
      dailySyncs: 96,
      errorRate: 0.9
    },
    errorLogs: [
      { id: 1, time: '1 hour ago', message: 'Incomplete traffic data for downtown sector', severity: 'Warning' }
    ]
  },
  {
    id: '3',
    name: 'Maintenance Plus',
    status: 'Connected',
    lastSync: '15 minutes ago',
    nextSync: '5 minutes',
    dataPoints: ['Service History', 'Maintenance Schedules', 'Parts Inventory', 'Repair Orders'],
    vehicles: 48,
    description: 'Vehicle maintenance management system tracking service history, parts inventory, and upcoming maintenance needs.',
    connectionDate: 'March 22, 2024',
    apiVersion: 'v3.1',
    syncFrequency: '20 minutes',
    dataImported: ['Maintenance History', 'Scheduled Services', 'Parts Inventory', 'Repair Orders'],
    dataExported: ['Battery Diagnostics', 'Charging Cycles', 'Energy Consumption', 'Performance Metrics'],
    recentActivity: [
      { id: 1, type: 'Sync Completed', status: 'Success', time: '15 minutes ago', details: 'Synchronized maintenance records for 48 vehicles' },
      { id: 2, type: 'Maintenance Alert', status: 'Warning', time: '1 hour ago', details: 'Battery service recommended for Vehicle #103' },
      { id: 3, type: 'Data Export', status: 'Success', time: '2 hours ago', details: 'Exported battery diagnostics for 48 vehicles' },
      { id: 4, type: 'Sync Completed', status: 'Success', time: '2 hours ago', details: 'Synchronized maintenance records for 48 vehicles' },
      { id: 5, type: 'Service Scheduled', status: 'Success', time: '3 hours ago', details: 'Auto-scheduled maintenance for 5 vehicles' }
    ],
    metrics: {
      syncSuccess: 100.0,
      dataQuality: 99.2,
      averageSyncTime: '7.8 seconds',
      dailySyncs: 72,
      errorRate: 0.0
    },
    errorLogs: []
  },
  {
    id: '4',
    name: 'Driver Portal',
    status: 'Issue Detected',
    lastSync: '2 hours ago',
    nextSync: 'Manual sync required',
    dataPoints: ['Driver Profiles', 'Training Records', 'Performance Metrics', 'Safety Scores'],
    vehicles: 42,
    description: 'Driver management portal tracking training, performance metrics, safety scores, and driver availability.',
    connectionDate: 'April 10, 2024',
    apiVersion: 'v1.5',
    syncFrequency: '30 minutes',
    dataImported: ['Driver Profiles', 'Training Records', 'Safety Scores', 'Schedule Preferences'],
    dataExported: ['Vehicle Assignments', 'Route Details', 'Charging Status'],
    recentActivity: [
      { id: 1, type: 'Sync Failed', status: 'Error', time: '2 hours ago', details: 'API authentication error' },
      { id: 2, type: 'Sync Retry', status: 'Error', time: '2 hours ago', details: 'Connection timeout' },
      { id: 3, type: 'Sync Completed', status: 'Success', time: '3 hours ago', details: 'Synchronized data for 42 drivers' },
      { id: 4, type: 'Data Export', status: 'Success', time: '3 hours ago', details: 'Exported vehicle assignments for 38 drivers' },
      { id: 5, type: 'Sync Completed', status: 'Success', time: '4 hours ago', details: 'Synchronized data for 42 drivers' }
    ],
    metrics: {
      syncSuccess: 92.5,
      dataQuality: 97.0,
      averageSyncTime: '15.3 seconds',
      dailySyncs: 48,
      errorRate: 7.5
    },
    errorLogs: [
      { id: 1, time: '2 hours ago', message: 'API authentication failed - invalid credentials', severity: 'Error' },
      { id: 2, time: '2 hours ago', message: 'Connection timeout after 30 seconds', severity: 'Error' }
    ]
  }
];

export default function SystemDetailPage({ params }) {
  const systemId = params.id;
  const system = systems.find(s => s.id === systemId) || systems[0];
  
  // Status indicator based on current system status
  const getStatusIndicator = () => {
    switch(system.status) {
      case 'Connected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" />
          Connected
        </span>;
      case 'Issue Detected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="mr-1 h-3 w-3" />
          Issue Detected
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Circle className="mr-1 h-3 w-3" />
          {system.status}
        </span>;
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/ev-management/fleet-integration" className="flex items-center hover:text-blue-600 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Fleet Integration
        </Link>
      </div>
      
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">{system.name}</h1>
            {getStatusIndicator()}
          </div>
          <p className="text-gray-600">{system.description}</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center" onClick={() => console.log('Sync now')}>
            <RefreshCw className="h-4 w-4 mr-2" />
            <span>Sync Now</span>
          </Button>
          <Link 
            href={`/ev-management/fleet-integration/systems/${systemId}/settings`}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            <span>Configure</span>
          </Link>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Last Synchronized</p>
                <p className="font-medium">{system.lastSync}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Next Sync: <span className="font-medium">{system.nextSync}</span></p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Vehicles Connected</p>
                <p className="font-medium">{system.vehicles}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Car className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Data Points: <span className="font-medium">{system.dataPoints.length}</span></p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Sync Success Rate</p>
                <p className="font-medium">{system.metrics.syncSuccess}%</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Error Rate: <span className="font-medium">{system.metrics.errorRate}%</span></p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Data Quality</p>
                <p className="font-medium">{system.metrics.dataQuality}%</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <BarChart className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Daily Syncs: <span className="font-medium">{system.metrics.dailySyncs}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Details and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-6">
          {/* System Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">System Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Connected Since</span>
                    <span className="text-sm font-medium">{system.connectionDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">API Version</span>
                    <span className="text-sm font-medium">{system.apiVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Sync Frequency</span>
                    <span className="text-sm font-medium">{system.syncFrequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Avg Sync Time</span>
                    <span className="text-sm font-medium">{system.metrics.averageSyncTime}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold mb-2">Data Imported</h3>
                  <div className="flex flex-wrap gap-2">
                    {system.dataImported.map((data, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {data}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold mb-2">Data Exported</h3>
                  <div className="flex flex-wrap gap-2">
                    {system.dataExported.map((data, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {data}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Logs */}
          {system.errorLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Error Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {system.errorLogs.map((error) => (
                    <div key={error.id} className="bg-red-50 border border-red-100 text-red-800 rounded-md p-3">
                      <div className="flex items-start">
                        <AlertCircle className="h-4 w-4 mt-0.5 mr-2 text-red-600" />
                        <div>
                          <p className="font-medium text-sm">{error.message}</p>
                          <p className="text-xs text-red-600 mt-1">{error.time} • {error.severity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <Button variant="outline" className="h-8 px-2 text-xs">
                <Download className="h-3.5 w-3.5 mr-1" />
                <span>Export Log</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200 z-0"></div>
                <div className="space-y-6 relative z-10">
                  {system.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                          activity.status === 'Success' ? 'bg-green-100' : 
                          activity.status === 'Warning' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          {activity.status === 'Success' ? (
                            <CheckCircle className={`h-4 w-4 text-green-600`} />
                          ) : activity.status === 'Warning' ? (
                            <AlertCircle className={`h-4 w-4 text-yellow-600`} />
                          ) : (
                            <AlertCircle className={`h-4 w-4 text-red-600`} />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <p className="text-sm font-medium">{activity.type}</p>
                          <span className="text-sm text-gray-500">{activity.time}</span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Connected Vehicles */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Connected Vehicles</CardTitle>
          <Link 
            href={`/ev-management/fleet-integration/systems/${systemId}/vehicles`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Vehicles
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-6">
            This system is connected to {system.vehicles} vehicles. 
            <br className="hidden md:block" />
            Visit the vehicles page to see all connected vehicles and their details.
          </p>
          <div className="flex justify-center mt-2">
            <Link 
              href={`/ev-management/fleet-integration/systems/${systemId}/vehicles`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Car className="h-4 w-4 mr-2" />
              <span>View Connected Vehicles</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 