import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import UserManagement from '../components/settings/UserManagement';

const SettingsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-grid-blue">
      <h1 className="text-3xl font-bold gradient-text">System Settings</h1>
      <p className="text-gray-600">
        Configure all aspects of your EV Charging Infrastructure platform
      </p>
      
      <Tabs defaultValue="general" className="mt-6">
        <TabsList className="bg-white shadow-sm rounded-lg p-1 mb-4">
          <TabsTrigger value="general" className="rounded-md">General</TabsTrigger>
          <TabsTrigger value="users" className="rounded-md">User Management</TabsTrigger>
          <TabsTrigger value="connected" className="rounded-md">Connected Services</TabsTrigger>
          <TabsTrigger value="api" className="rounded-md">API Management</TabsTrigger>
          <TabsTrigger value="data" className="rounded-md">Data & Backups</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="card-premium p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">System Preferences</h2>
          
          <div className="space-y-6">
            {/* Organization Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label htmlFor="orgName" className="font-medium">
                  Organization Name
                </label>
                <p className="text-sm text-gray-500">
                  Your organization name as displayed throughout the system
                </p>
              </div>
              <div className="md:col-span-2">
                <input
                  id="orgName"
                  type="text"
                  className="input-field"
                  defaultValue="GIU EV Charging Infrastructure"
                />
              </div>
            </div>
            
            <hr className="border-gray-200" />
            
            {/* Time Zone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label htmlFor="timezone" className="font-medium">
                  Time Zone
                </label>
                <p className="text-sm text-gray-500">
                  Default time zone for displaying dates and times
                </p>
              </div>
              <div className="md:col-span-2">
                <select id="timezone" className="input-field">
                  <option value="America/New_York">Eastern Time (ET) - New York</option>
                  <option value="America/Chicago">Central Time (CT) - Chicago</option>
                  <option value="America/Denver">Mountain Time (MT) - Denver</option>
                  <option value="America/Los_Angeles">Pacific Time (PT) - Los Angeles</option>
                  <option value="America/Anchorage">Alaska Time - Anchorage</option>
                  <option value="Pacific/Honolulu">Hawaii Time - Honolulu</option>
                  <option value="Europe/London">GMT - London</option>
                </select>
              </div>
            </div>
            
            <hr className="border-gray-200" />
            
            {/* Date Format */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label htmlFor="dateFormat" className="font-medium">
                  Date Format
                </label>
                <p className="text-sm text-gray-500">
                  How dates should be displayed throughout the system
                </p>
              </div>
              <div className="md:col-span-2">
                <select id="dateFormat" className="input-field">
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MMM D, YYYY">MMM D, YYYY</option>
                  <option value="D MMM YYYY">D MMM YYYY</option>
                </select>
              </div>
            </div>
            
            <hr className="border-gray-200" />
            
            {/* Distance Unit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="font-medium">
                  Distance Unit
                </label>
                <p className="text-sm text-gray-500">
                  Unit for displaying distances and ranges
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio"
                      name="distanceUnit"
                      value="miles"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Miles</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio"
                      name="distanceUnit"
                      value="kilometers"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Kilometers</span>
                  </label>
                </div>
              </div>
            </div>
            
            <hr className="border-gray-200" />
            
            {/* Dark Mode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="font-medium">
                  Enable Dark Mode
                </label>
                <p className="text-sm text-gray-500">
                  Toggle between light and dark interface theme
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <button
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300"
                  >
                    <span className="flex h-5 w-5 rounded-full bg-white translate-x-1 items-center justify-center text-xs">
                      <span className="h-3 w-3 text-yellow-500">☀️</span>
                    </span>
                  </button>
                  <span className="ml-3 text-sm">
                    Light Mode Enabled
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button className="btn-primary flex items-center">
                <span className="mr-2">💾</span>
                Save Changes
              </button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="connected" className="card-premium p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Connected Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weather Service */}
            <div className="glass-effect rounded-lg p-4 animated-border">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-full mr-3 float-animation-slow">
                    <span className="h-5 w-5 text-blue-600">☁️</span>
                  </div>
                  <h3 className="text-lg font-medium">Weather Service</h3>
                </div>
                <span className="px-2 py-1 bg-green-100 rounded-full text-xs text-green-800 font-medium">
                  Connected
                </span>
              </div>
              <p className="text-gray-600 mb-3">Provides weather data for route planning</p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Connected since: May 15, 2024</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Used for:</span> Route optimization, range calculations
              </p>
              <div className="flex justify-end">
                <button className="btn-secondary text-sm">
                  Configure
                </button>
              </div>
            </div>
            
            {/* Energy Provider API */}
            <div className="glass-effect rounded-lg p-4 animated-border">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-full mr-3 float-animation">
                    <span className="h-5 w-5 text-yellow-600">⚡</span>
                  </div>
                  <h3 className="text-lg font-medium">Energy Provider API</h3>
                </div>
                <span className="px-2 py-1 bg-green-100 rounded-full text-xs text-green-800 font-medium">
                  Connected
                </span>
              </div>
              <p className="text-gray-600 mb-3">Provides electricity pricing data</p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Connected since: April 30, 2024</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Used for:</span> Smart charging scheduling, cost analysis
              </p>
              <div className="flex justify-end">
                <button className="btn-secondary text-sm">
                  Configure
                </button>
              </div>
            </div>
            
            {/* Maintenance System */}
            <div className="glass-effect rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-full mr-3">
                    <span className="h-5 w-5 text-gray-600">🔧</span>
                  </div>
                  <h3 className="text-lg font-medium">Maintenance System</h3>
                </div>
                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-800 font-medium">
                  Not Connected
                </span>
              </div>
              <p className="text-gray-600 mb-3">Fleet maintenance scheduling</p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Integration available for maintenance scheduling and history tracking.</span>
              </div>
              <div className="flex justify-end">
                <button className="btn-primary text-sm">
                  Connect
                </button>
              </div>
            </div>
            
            {/* Fleet Accounting */}
            <div className="glass-effect rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-full mr-3">
                    <span className="h-5 w-5 text-gray-600">💰</span>
                  </div>
                  <h3 className="text-lg font-medium">Fleet Accounting</h3>
                </div>
                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-800 font-medium">
                  Not Connected
                </span>
              </div>
              <p className="text-gray-600 mb-3">Financial management system</p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Integration available for cost tracking and financial reporting.</span>
              </div>
              <div className="flex justify-end">
                <button className="btn-primary text-sm">
                  Connect
                </button>
              </div>
            </div>
            
            {/* Add New Service Button */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center h-full">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <span className="text-blue-600 text-2xl">+</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Add New Integration</h3>
              <p className="text-gray-500 mb-4">Connect with additional third-party services</p>
              <button className="btn-secondary">Add Service</button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="api" className="card-premium p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">API Management</h2>
          <p className="text-gray-600 mb-6">
            Manage API keys and access for third-party applications to connect with the system.
          </p>
          
          <div className="space-y-4">
            {/* Mobile App API Key */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-full mr-3">
                    <span className="h-5 w-5 text-blue-600">📱</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Mobile App API Key</h3>
                    <p className="text-sm text-gray-500">Used for the driver mobile application</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary text-sm">
                    Reveal Key
                  </button>
                  <button className="btn-secondary text-sm">
                    Regenerate
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                ••••••••-••••-••••-••••-••••••••••••
              </div>
            </div>
            
            {/* Data Export API Key */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-full mr-3">
                    <span className="h-5 w-5 text-green-600">📊</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Data Export API Key</h3>
                    <p className="text-sm text-gray-500">Used for external analytics services</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary text-sm">
                    Reveal Key
                  </button>
                  <button className="btn-secondary text-sm">
                    Regenerate
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                ••••••••-••••-••••-••••-••••••••••••
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="btn-primary">
              Generate New API Key
            </button>
          </div>
        </TabsContent>
        
        <TabsContent value="data" className="card-premium p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Data Import & Export</h2>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <span className="p-2 bg-blue-100 rounded-full mr-3 text-blue-600">📤</span>
                    <h3 className="text-lg font-medium">Import Data</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Import vehicle data, routes, or other system information from CSV, Excel, or JSON files.
                  </p>
                  <div className="flex justify-between">
                    <button className="btn-secondary">
                      View Templates
                    </button>
                    <button className="btn-primary">
                      Import Data
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <span className="p-2 bg-green-100 rounded-full mr-3 text-green-600">📥</span>
                    <h3 className="text-lg font-medium">Export Data</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Export system data for backup or analysis in multiple formats.
                  </p>
                  <div className="flex justify-end">
                    <button className="btn-primary">
                      Export Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Backup & Restore</h2>
              
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <p className="text-gray-600 mb-6">
                  Create system backups and restore from previous backups if needed.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2">Available Backups</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200">
                      <div>
                        <div className="font-medium">Daily Backup</div>
                        <div className="text-sm text-gray-500">May 15, 2024 - 3:00 AM</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-secondary text-sm py-1">
                          Download
                        </button>
                        <button className="btn-secondary text-sm py-1">
                          Restore
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200">
                      <div>
                        <div className="font-medium">Weekly Backup</div>
                        <div className="text-sm text-gray-500">May 12, 2024 - 4:00 AM</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-secondary text-sm py-1">
                          Download
                        </button>
                        <button className="btn-secondary text-sm py-1">
                          Restore
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button className="btn-secondary">
                    Restore from Backup
                  </button>
                  <button className="btn-primary">
                    Create Backup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage; 