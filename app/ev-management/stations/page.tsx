"use client";

import React from 'react';
import Link from 'next/link';
import { Zap, MapPin, AlertCircle, Settings, Activity, WifiOff, CheckCircle, Wrench, Plus } from 'lucide-react';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent } from '../../components/ui/premium-card';
import { EnergyFlowAnimation, PulsingEnergyIndicator } from '../../components/ui/energy-flow-animation';
import { Button } from '../../components/ui/button';

export default function ChargingStationManagementPage() {
  // Sample charging station data
  const stations = [
    {
      id: 1,
      name: 'Headquarters Station 1',
      location: 'Main Office Garage',
      status: 'active',
      power: '150 kW',
      connector: 'CCS',
      availability: 'Available',
      lastMaintenance: '2024-05-15'
    },
    {
      id: 2,
      name: 'Distribution Center A-1',
      location: 'Warehouse East Wing',
      status: 'active',
      power: '50 kW',
      connector: 'CHAdeMO',
      availability: 'In Use',
      lastMaintenance: '2024-04-30'
    },
    {
      id: 3,
      name: 'Regional Office Station',
      location: 'Underground Parking',
      status: 'maintenance',
      power: '100 kW',
      connector: 'CCS',
      availability: 'Maintenance',
      lastMaintenance: '2024-05-20'
    },
    {
      id: 4,
      name: 'Retail Location 5',
      location: 'Customer Parking',
      status: 'offline',
      power: '75 kW',
      connector: 'CCS/CHAdeMO',
      availability: 'Offline',
      lastMaintenance: '2024-03-15'
    },
    {
      id: 5,
      name: 'Fleet Depot Station 3',
      location: 'Vehicle Storage Area',
      status: 'active',
      power: '350 kW',
      connector: 'CCS',
      availability: 'Available',
      lastMaintenance: '2024-05-10'
    }
  ];

  // Sample alerts
  const alerts = [
    {
      id: 1,
      station: 'Regional Office Station',
      type: 'maintenance',
      message: 'Scheduled maintenance in progress',
      time: '2 hours ago'
    },
    {
      id: 2,
      station: 'Retail Location 5',
      type: 'error',
      message: 'Communication error - station offline',
      time: '5 hours ago'
    },
    {
      id: 3,
      station: 'Headquarters Station 2',
      type: 'warning',
      message: 'Charging efficiency below threshold',
      time: '1 day ago'
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="relative mb-8">
        <div className="absolute top-0 left-0 right-0 h-40 overflow-hidden -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-70" />
          <EnergyFlowAnimation 
            color="#3b82f6" 
            intensity="low" 
            direction="horizontal"
            particleCount={20}
          />
        </div>
        
        <div className="pt-12 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">EV Charging Stations</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
            Monitor and manage your charging stations network. View real-time status, performance metrics, and schedule maintenance.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Charging Station Management</h1>
          <p className="text-gray-600">Monitor and manage your charging infrastructure</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ev-management/stations/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <span>Add Station</span>
          </Link>
          <Link
            href="/ev-management/stations/maintenance"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            <span>Schedule Maintenance</span>
          </Link>
        </div>
      </div>

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Stations</h3>
            <MapPin className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">24</p>
          <p className="text-sm text-gray-500 mt-2">Across 8 locations</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Active Stations</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold">21</p>
          <p className="text-sm text-gray-500 mt-2">87.5% availability</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Maintenance Mode</h3>
            <Settings className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold">2</p>
          <p className="text-sm text-gray-500 mt-2">Scheduled maintenance</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Offline Stations</h3>
            <WifiOff className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold">1</p>
          <p className="text-sm text-gray-500 mt-2">Requires attention</p>
        </div>
      </div>

      {/* Station Monitoring */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Charging Stations</h2>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search stations..."
                className="py-2 px-4 border border-gray-300 rounded-md pr-10"
              />
              <div className="absolute right-3 top-2.5">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <select className="py-2 px-4 border border-gray-300 rounded-md">
              <option>All Locations</option>
              <option>Headquarters</option>
              <option>Distribution Centers</option>
              <option>Regional Offices</option>
              <option>Retail Locations</option>
            </select>
            <select className="py-2 px-4 border border-gray-300 rounded-md">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Maintenance</option>
              <option>Offline</option>
            </select>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Station
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Power
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connector
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Maintenance
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stations.map((station) => (
                <tr key={station.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{station.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{station.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      station.status === 'active' ? 'bg-green-100 text-green-800' :
                      station.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {station.status === 'active' ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : station.status === 'maintenance' ? (
                        <Settings className="mr-1 h-3 w-3" />
                      ) : (
                        <WifiOff className="mr-1 h-3 w-3" />
                      )}
                      {station.status.charAt(0).toUpperCase() + station.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {station.power}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {station.connector}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {station.availability}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {station.lastMaintenance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/ev-management/stations/${station.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Details
                    </Link>
                    <Link href={`/ev-management/stations/${station.id}/edit`} className="text-blue-600 hover:text-blue-900">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Alerts</h2>
          <Link href="/ev-management/stations/alerts" className="text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {alert.type === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : alert.type === 'warning' ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Settings className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="font-medium">{alert.station}</div>
                  <div className="text-sm text-gray-500 mt-1">{alert.message}</div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-400">{alert.time}</span>
                    <Link href={`/ev-management/stations/alerts/${alert.id}`} className="text-sm text-blue-600 hover:underline">
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Schedule */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upcoming Maintenance</h2>
          <Link href="/ev-management/stations/maintenance" className="text-blue-600 hover:text-blue-800">
            View Schedule
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="flex-1 mb-6 md:mb-0">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="font-medium">Tomorrow</h3>
              </div>
              <div className="pl-6 border-l border-gray-200">
                <div className="mb-4">
                  <div className="text-sm font-medium">Fleet Depot Station 2</div>
                  <div className="text-xs text-gray-500 mt-1">9:00 AM - Routine inspection</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Retail Location 3</div>
                  <div className="text-xs text-gray-500 mt-1">2:00 PM - Software update</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 mb-6 md:mb-0">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <h3 className="font-medium">Next Week</h3>
              </div>
              <div className="pl-6 border-l border-gray-200">
                <div className="mb-4">
                  <div className="text-sm font-medium">Headquarters Stations</div>
                  <div className="text-xs text-gray-500 mt-1">Monday - Quarterly maintenance</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Distribution Center B</div>
                  <div className="text-xs text-gray-500 mt-1">Thursday - Hardware upgrade</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <h3 className="font-medium">Next Month</h3>
              </div>
              <div className="pl-6 border-l border-gray-200">
                <div className="mb-4">
                  <div className="text-sm font-medium">All Regional Stations</div>
                  <div className="text-xs text-gray-500 mt-1">First week - Annual certification</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Retail Locations</div>
                  <div className="text-xs text-gray-500 mt-1">Second week - Network upgrade</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 