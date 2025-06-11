/// <reference path="../../types/react.d.ts" />
"use client";

// @ts-ignore
import React from 'react';
import { 
  Settings, 
  Shield, 
  Database, 
  Server, 
  Globe, 
  Bell, 
  Smartphone, 
  Users, 
  Key, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Sun, 
  Moon,
  Cloud,
  Clock,
  Plus,
  Edit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const SystemSettings: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState('services');
  const [darkMode, setDarkMode] = React.useState(false);
  
  // API Keys state (for visibility toggling)
  const [apiKeys, setApiKeys] = React.useState({
    mobileApp: { key: 'a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6', visible: false },
    dataExport: { key: 'p6o5n4m3-l2k1-j0i9-h8g7-f6e5d4c3b2a1', visible: false }
  });

  // Toggle API key visibility
  const toggleKeyVisibility = (keyName: 'mobileApp' | 'dataExport') => {
    setApiKeys({
      ...apiKeys,
      [keyName]: {
        ...apiKeys[keyName],
        visible: !apiKeys[keyName].visible
      }
    });
  };

  // Format service date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold gradient-text">System Settings</h1>
        <Button className="btn-glow bg-blue-600 hover:bg-blue-700">
          <CheckCircle className="mr-2 h-4 w-4" />
          Save All Changes
        </Button>
      </div>
      
      <Tabs 
        defaultValue={selectedTab} 
        className="w-full"
      >
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6 animated-border">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 p-1">
            <TabsTrigger 
              value="services" 
              className={`rounded-md transition-all ${selectedTab === 'services' ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              <Cloud className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Connected Services</span>
              <span className="sm:hidden">Services</span>
            </TabsTrigger>
            <TabsTrigger 
              value="api" 
              className={`rounded-md transition-all ${selectedTab === 'api' ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              <Key className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">API Management</span>
              <span className="sm:hidden">API</span>
            </TabsTrigger>
            <TabsTrigger 
              value="data" 
              className={`rounded-md transition-all ${selectedTab === 'data' ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              <Database className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Import & Export</span>
              <span className="sm:hidden">Data</span>
            </TabsTrigger>
            <TabsTrigger 
              value="backup" 
              className={`rounded-md transition-all ${selectedTab === 'backup' ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Backup & Restore</span>
              <span className="sm:hidden">Backup</span>
            </TabsTrigger>
            <TabsTrigger 
              value="retention" 
              className={`rounded-md transition-all ${selectedTab === 'retention' ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              <Clock className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Data Retention</span>
              <span className="sm:hidden">Retention</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className={`rounded-md transition-all ${selectedTab === 'preferences' ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">System Preferences</span>
              <span className="sm:hidden">Preferences</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Connected Services */}
        <TabsContent value="services" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Connected Services</h2>
            <Button variant="outline" className="bg-white">
              <Plus className="mr-2 h-4 w-4" />
              Add New Service
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weather Service */}
            <Card className="card-premium overflow-hidden">
              <CardHeader className="pb-2 flex flex-row justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-full mr-3">
                    <Cloud className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Weather Service</CardTitle>
                </div>
                <Badge className="bg-green-100 text-green-800 border border-green-200">
                  Connected
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">Provides weather data for route planning</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>Connected since: {formatDate("2024-05-15")}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Used for:</span> Route optimization, range calculations
                </p>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="text-sm">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Energy Provider API */}
            <Card className="card-premium overflow-hidden">
              <CardHeader className="pb-2 flex flex-row justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-full mr-3">
                    <span className="h-5 w-5 text-yellow-600 flex items-center justify-center font-bold">⚡</span>
                  </div>
                  <CardTitle className="text-lg">Energy Provider API</CardTitle>
                </div>
                <Badge className="bg-green-100 text-green-800 border border-green-200">
                  Connected
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">Provides electricity pricing data</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>Connected since: {formatDate("2024-04-30")}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Used for:</span> Smart charging scheduling, cost analysis
                </p>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="text-sm">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Maintenance System */}
            <Card className="card-premium overflow-hidden">
              <CardHeader className="pb-2 flex flex-row justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-full mr-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                  </div>
                  <CardTitle className="text-lg">Maintenance System</CardTitle>
                </div>
                <Badge className="bg-gray-100 text-gray-800 border border-gray-200">
                  Not Connected
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">Fleet maintenance scheduling</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>Integration available for maintenance scheduling and history tracking.</span>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" className="text-sm bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-3 w-3" />
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Fleet Accounting */}
            <Card className="card-premium overflow-hidden">
              <CardHeader className="pb-2 flex flex-row justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-full mr-3">
                    <span className="h-5 w-5 text-gray-600 flex items-center justify-center font-bold">$</span>
                  </div>
                  <CardTitle className="text-lg">Fleet Accounting</CardTitle>
                </div>
                <Badge className="bg-gray-100 text-gray-800 border border-gray-200">
                  Not Connected
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">Financial management system</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>Integration available for cost tracking and financial reporting.</span>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" className="text-sm bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-3 w-3" />
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* API Management */}
        <TabsContent value="api" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">API Management</h2>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Key className="mr-2 h-4 w-4" />
              Generate New API Key
            </Button>
          </div>
          
          <p className="text-gray-600">
            Manage API keys and access for third-party applications to connect with the system.
          </p>
          
          <div className="space-y-4">
            {/* Mobile App API Key */}
            <Card className="card-premium overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <span className="h-5 w-5 text-blue-600 flex items-center justify-center font-bold">📱</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Mobile App API Key</h3>
                      <p className="text-sm text-gray-500">Used for the driver mobile application</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleKeyVisibility('mobileApp')}
                    >
                      {apiKeys.mobileApp.visible ? (
                        <>
                          Hide Key
                        </>
                      ) : (
                        <>
                          Reveal Key
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-1 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>
                </div>
                
                {apiKeys.mobileApp.visible ? (
                  <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                    {apiKeys.mobileApp.key}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                    ••••••••-••••-••••-••••-••••••••••••
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Data Export API Key */}
            <Card className="card-premium overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-full mr-3">
                      <Download className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Data Export API Key</h3>
                      <p className="text-sm text-gray-500">Used for external analytics services</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleKeyVisibility('dataExport')}
                    >
                      {apiKeys.dataExport.visible ? (
                        <>
                          Hide Key
                        </>
                      ) : (
                        <>
                          Reveal Key
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-1 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>
                </div>
                
                {apiKeys.dataExport.visible ? (
                  <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                    {apiKeys.dataExport.key}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                    ••••••••-••••-••••-••••-••••••••••••
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Import & Export */}
        <TabsContent value="data" className="space-y-6">
          <h2 className="text-xl font-semibold">Data Import & Export</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Import Data */}
            <Card className="card-premium overflow-hidden card-3d">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5 text-blue-600" />
                  Import Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Import vehicle data, routes, or other system information from CSV, Excel, or JSON files.
                </p>
                <div className="flex justify-between mt-4">
                  <Button variant="outline" className="bg-white">
                    View Templates
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Data
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Export Data */}
            <Card className="card-premium overflow-hidden card-3d">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Download className="mr-2 h-5 w-5 text-green-600" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Export system data for backup or analysis in multiple formats.
                </p>
                <div className="flex justify-end mt-4">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Backup & Restore */}
        <TabsContent value="backup" className="space-y-6">
          <h2 className="text-xl font-semibold">Backup & Restore</h2>
          
          <Card className="card-premium overflow-hidden">
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">
                Create system backups and restore from previous backups if needed.
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Available Backups</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200">
                      <div>
                        <div className="font-medium">Daily Backup</div>
                        <div className="text-sm text-gray-500">May 15, 2024 - 3:00 AM</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Restore
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200">
                      <div>
                        <div className="font-medium">Weekly Backup</div>
                        <div className="text-sm text-gray-500">May 12, 2024 - 4:00 AM</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Restore
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200">
                      <div>
                        <div className="font-medium">Monthly Backup</div>
                        <div className="text-sm text-gray-500">May 1, 2024 - 2:00 AM</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" className="bg-white">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restore from Backup
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Create Backup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Data Retention */}
        <TabsContent value="retention" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Data Retention</h2>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
          
          <p className="text-gray-600 mb-4">
            Configure how long different types of data should be stored in the system before archiving or deletion.
          </p>
          
          <Card className="card-premium overflow-hidden">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Vehicle Telemetry */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Vehicle Telemetry Data</h3>
                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200">Active</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Archive After</div>
                      <div className="font-medium">90 Days</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Delete After</div>
                      <div className="font-medium">365 Days</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Current Storage</div>
                      <div className="font-medium">42.3 GB</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Growth Rate</div>
                      <div className="font-medium">~150 MB/day</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                {/* Charging Session Data */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Charging Session Data</h3>
                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200">Active</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Archive After</div>
                      <div className="font-medium">180 Days</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Delete After</div>
                      <div className="font-medium">730 Days</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Current Storage</div>
                      <div className="font-medium">27.8 GB</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Growth Rate</div>
                      <div className="font-medium">~90 MB/day</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                {/* Route History */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Route History</h3>
                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200">Active</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Archive After</div>
                      <div className="font-medium">120 Days</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Delete After</div>
                      <div className="font-medium">540 Days</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Current Storage</div>
                      <div className="font-medium">18.5 GB</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Growth Rate</div>
                      <div className="font-medium">~75 MB/day</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                {/* System Logs */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">System Logs</h3>
                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200">Active</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Archive After</div>
                      <div className="font-medium">30 Days</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Delete After</div>
                      <div className="font-medium">90 Days</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Current Storage</div>
                      <div className="font-medium">5.2 GB</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-xs text-gray-500">Growth Rate</div>
                      <div className="font-medium">~30 MB/day</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* System Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">System Preferences</h2>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
          
          <Card className="card-premium overflow-hidden">
            <CardContent className="pt-6">
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
                
                <Separator />
                
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
                
                <Separator />
                
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
                
                <Separator />
                
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
                
                <Separator />
                
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
                        onClick={() => setDarkMode(!darkMode)}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}
                        `}
                      >
                        <span
                          className={`
                            flex h-5 w-5 rounded-full bg-white transition-transform
                            ${darkMode ? 'translate-x-5' : 'translate-x-1'}
                            items-center justify-center text-xs
                          `}
                        >
                          {darkMode ? <Moon className="h-3 w-3 text-blue-600" /> : <Sun className="h-3 w-3 text-yellow-500" />}
                        </span>
                      </button>
                      <span className="ml-3 text-sm">
                        {darkMode ? 'Dark Mode Enabled' : 'Light Mode Enabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings; 