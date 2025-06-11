"use client";
import React from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Save, Settings, Database, 
  RefreshCw, Clock, Shield, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../components/ui/tabs';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';

// Sample systems data (matching what we have in the system details page)
const systems = [
  {
    id: '1',
    name: 'GIU Fleet Management',
    status: 'Connected',
    apiVersion: 'v2.3',
    apiEndpoint: 'https://api.giu-fleet.io/v2',
    apiKey: 'giu_fleet_1a2b3c4d5e6f7g8h',
    syncFrequency: 15,
    syncWindow: {
      enabled: true,
      startTime: '22:00',
      endTime: '05:00'
    },
    accessLevel: 'read-write',
    ipRestrictions: {
      enabled: true,
      allowedIps: ['192.168.1.0/24', '10.0.0.0/8']
    },
    dataMapping: {
      vehicleId: 'vehicle_identifier',
      driverName: 'driver_full_name',
      batteryLevel: 'battery_soc_percentage',
      departureTime: 'scheduled_departure',
      returnTime: 'estimated_return'
    },
    notifications: {
      syncCompleted: true,
      syncFailed: true,
      lowBattery: true,
      schedulingConflicts: true,
      email: 'fleet-admin@example.com'
    }
  },
  {
    id: '2',
    name: 'RouteOptimizer Pro',
    status: 'Connected',
    apiVersion: 'v1.8',
    apiEndpoint: 'https://api.routeoptimizer.com/v1',
    apiKey: 'route_opt_9z8y7x6w5v4u3t2s',
    syncFrequency: 15,
    syncWindow: {
      enabled: false,
      startTime: '',
      endTime: ''
    },
    accessLevel: 'read-only',
    ipRestrictions: {
      enabled: false,
      allowedIps: []
    },
    dataMapping: {
      routeId: 'route_identifier',
      stopAddress: 'location_address',
      estimatedArrival: 'eta',
      distanceToNext: 'next_stop_distance',
      trafficLevel: 'congestion_level'
    },
    notifications: {
      syncCompleted: false,
      syncFailed: true,
      routeChanges: true,
      trafficAlerts: true,
      email: 'routes@example.com'
    }
  },
  {
    id: '3',
    name: 'Maintenance Plus',
    status: 'Connected',
    apiVersion: 'v3.1',
    apiEndpoint: 'https://maintenance-plus.api.com/v3',
    apiKey: 'maint_plus_q1w2e3r4t5y6u7i8',
    syncFrequency: 20,
    syncWindow: {
      enabled: true,
      startTime: '20:00',
      endTime: '07:00'
    },
    accessLevel: 'read-write',
    ipRestrictions: {
      enabled: true,
      allowedIps: ['192.168.1.0/24']
    },
    dataMapping: {
      serviceId: 'maintenance_id',
      serviceName: 'service_description',
      partNumber: 'part_identifier',
      maintenanceInterval: 'service_interval_days',
      lastService: 'last_service_date'
    },
    notifications: {
      syncCompleted: false,
      syncFailed: true,
      maintenanceDue: true,
      partsLow: true,
      email: 'maintenance@example.com'
    }
  },
  {
    id: '4',
    name: 'Driver Portal',
    status: 'Issue Detected',
    apiVersion: 'v1.5',
    apiEndpoint: 'https://driver-portal.api.co/v1',
    apiKey: 'driver_1q2w3e4r5t6y7u8i9o0p',
    syncFrequency: 30,
    syncWindow: {
      enabled: false,
      startTime: '',
      endTime: ''
    },
    accessLevel: 'read-only',
    ipRestrictions: {
      enabled: false,
      allowedIps: []
    },
    dataMapping: {
      driverId: 'user_id',
      licenseNumber: 'driver_license',
      trainingDate: 'training_completion_date',
      safetyScore: 'safety_rating',
      availableHours: 'availability_hours'
    },
    notifications: {
      syncCompleted: true,
      syncFailed: true,
      trainingReminders: true,
      safetyAlerts: true,
      email: 'driver-admin@example.com'
    }
  }
];

export default function SystemSettingsPage({ params }) {
  const systemId = params.id;
  const system = systems.find(s => s.id === systemId) || systems[0];
  
  // Form state would be managed with React state in a real application
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href={`/ev-management/fleet-integration/systems/${systemId}`} className="flex items-center hover:text-blue-600 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to System Details
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{system.name} Settings</h1>
          <p className="text-gray-600">Configure integration settings for {system.name}</p>
        </div>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="connection" className="w-full">
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6">
          <TabsList className="grid grid-cols-1 md:grid-cols-4 gap-2 p-1">
            <TabsTrigger value="connection" className="rounded-md transition-all">
              <Database className="mr-2 h-4 w-4" />
              <span>Connection</span>
            </TabsTrigger>
            <TabsTrigger value="sync" className="rounded-md transition-all">
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Synchronization</span>
            </TabsTrigger>
            <TabsTrigger value="mapping" className="rounded-md transition-all">
              <Zap className="mr-2 h-4 w-4" />
              <span>Data Mapping</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-md transition-all">
              <Shield className="mr-2 h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Connection Settings */}
        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <p className="text-sm text-blue-700">
                    These settings control the basic connection to the {system.name} API.
                    Changes to these settings will require re-authentication with the system.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="api-endpoint" className="block mb-2 font-medium">API Endpoint</Label>
                    <Input 
                      id="api-endpoint" 
                      type="text" 
                      defaultValue={system.apiEndpoint}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">The base URL for the {system.name} API</p>
                  </div>

                  <div>
                    <Label htmlFor="api-version" className="block mb-2 font-medium">API Version</Label>
                    <Input 
                      id="api-version" 
                      type="text" 
                      defaultValue={system.apiVersion}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">The API version to use for this integration</p>
                  </div>

                  <div>
                    <Label htmlFor="api-key" className="block mb-2 font-medium">API Key</Label>
                    <div className="flex">
                      <Input 
                        id="api-key" 
                        type="password" 
                        defaultValue={system.apiKey}
                        className="w-full rounded-r-none"
                      />
                      <Button className="rounded-l-none">Show</Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">The API key for authenticating with {system.name}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline">
                    Test Connection
                  </Button>
                  <Button variant="outline">
                    Regenerate API Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Configure notifications for important events related to this integration.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <Label htmlFor="sync-complete-notifications">Sync Completed Notifications</Label>
                    <input 
                      id="sync-complete-notifications" 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={system.notifications.syncCompleted}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <Label htmlFor="sync-failed-notifications">Sync Failed Notifications</Label>
                    <input 
                      id="sync-failed-notifications" 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={system.notifications.syncFailed}
                    />
                  </div>
                  
                  {/* Show conditionally based on system type */}
                  {system.notifications.lowBattery !== undefined && (
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <Label htmlFor="low-battery-notifications">Low Battery Notifications</Label>
                      <input 
                        id="low-battery-notifications" 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        defaultChecked={system.notifications.lowBattery}
                      />
                    </div>
                  )}
                  
                  {system.notifications.schedulingConflicts !== undefined && (
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <Label htmlFor="scheduling-conflict-notifications">Scheduling Conflict Notifications</Label>
                      <input 
                        id="scheduling-conflict-notifications" 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        defaultChecked={system.notifications.schedulingConflicts}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Label htmlFor="notification-email" className="block mb-2 font-medium">Notification Email</Label>
                  <Input 
                    id="notification-email" 
                    type="email" 
                    defaultValue={system.notifications.email}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email address to receive notifications for this integration</p>
                </div>

                <div className="mt-4">
                  <Button variant="outline">
                    Test Notification
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Synchronization Settings */}
        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Synchronization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <p className="text-sm text-blue-700">
                    These settings control how often data is synchronized between your EV charging infrastructure and {system.name}.
                    More frequent synchronization provides more up-to-date data but may increase API usage.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="sync-frequency" className="block mb-2 font-medium">Sync Frequency (minutes)</Label>
                    <Input 
                      id="sync-frequency" 
                      type="number" 
                      defaultValue={system.syncFrequency}
                      min="5" 
                      max="1440"
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">How often data is synchronized with {system.name}</p>
                  </div>

                  <div>
                    <Label htmlFor="sync-priority" className="block mb-2 font-medium">Sync Priority</Label>
                    <select 
                      id="sync-priority" 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="high">High (Real-time updates, higher resource usage)</option>
                      <option value="medium" selected>Medium (Balance between timeliness and resources)</option>
                      <option value="low">Low (Less frequent updates, lower resource usage)</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Determines priority for synchronization operations</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <input 
                      id="sync-window-enabled" 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={system.syncWindow.enabled}
                    />
                    <Label htmlFor="sync-window-enabled" className="font-medium">Enable Sync Window</Label>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Limit larger synchronization operations to specific times:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="sync-start-time" className="block mb-2">Start Time</Label>
                      <Input 
                        id="sync-start-time" 
                        type="time" 
                        defaultValue={system.syncWindow.startTime}
                        className="w-full"
                        disabled={!system.syncWindow.enabled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sync-end-time" className="block mb-2">End Time</Label>
                      <Input 
                        id="sync-end-time" 
                        type="time" 
                        defaultValue={system.syncWindow.endTime}
                        className="w-full"
                        disabled={!system.syncWindow.enabled}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="mr-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                  <Button variant="outline">
                    View Sync History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Sync Conflict Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Configure how conflicts between {system.name} and your EV charging infrastructure are resolved.
                </p>

                <div className="mt-4">
                  <Label htmlFor="conflict-strategy" className="block mb-2 font-medium">Data Conflict Strategy</Label>
                  <select 
                    id="conflict-strategy" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ev-system">EV System Takes Precedence</option>
                    <option value="integration">Integration System Takes Precedence</option>
                    <option value="newest">Most Recent Data Wins</option>
                    <option value="manual">Manual Resolution (Requires Approval)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Determines which system's data is prioritized during conflicts</p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      id="notify-conflicts" 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={true}
                    />
                    <Label htmlFor="notify-conflicts" className="font-medium">Notify on Conflicts</Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Send notifications when data conflicts are detected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Mapping */}
        <TabsContent value="mapping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Data Field Mapping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <p className="text-sm text-blue-700">
                    Map data fields between {system.name} and your EV charging infrastructure.
                    Proper field mapping ensures data is correctly synchronized between systems.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3">EV System Field</th>
                        <th scope="col" className="px-4 py-3">Integration Field</th>
                        <th scope="col" className="px-4 py-3">Data Type</th>
                        <th scope="col" className="px-4 py-3">Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(system.dataMapping).map(([evField, integrationField], index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">
                            {evField}
                          </td>
                          <td className="px-4 py-3">
                            <Input 
                              type="text" 
                              defaultValue={integrationField}
                              className="w-full"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select className="w-full p-2 border border-gray-300 rounded-md">
                              <option value="string">String</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                              <option value="date">Date</option>
                              <option value="object">Object</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              defaultChecked={index < 3} // First 3 fields are required for demo
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-4">
                  <Button variant="outline" className="mr-2">
                    Add Custom Field
                  </Button>
                  <Button variant="outline">
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Data Transformation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Configure how data is transformed during synchronization to ensure compatibility.
                </p>

                <div className="mt-4">
                  <Label htmlFor="date-format" className="block mb-2 font-medium">Date Format</Label>
                  <select 
                    id="date-format" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="iso">ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)</option>
                    <option value="us">US Format (MM/DD/YYYY)</option>
                    <option value="eu">European Format (DD/MM/YYYY)</option>
                    <option value="unix">Unix Timestamp</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Format used for date/time values</p>
                </div>

                <div className="mt-4">
                  <Label htmlFor="unit-system" className="block mb-2 font-medium">Unit System</Label>
                  <select 
                    id="unit-system" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="metric">Metric (km, kWh)</option>
                    <option value="imperial">Imperial (miles, kWh)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Unit system for measurements</p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      id="validate-data" 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={true}
                    />
                    <Label htmlFor="validate-data" className="font-medium">Validate Data During Sync</Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Verify data integrity during synchronization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Access Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Configure access control for this integration to ensure secure data exchange.
                </p>

                <div className="mt-4">
                  <Label htmlFor="access-level" className="block mb-2 font-medium">Access Level</Label>
                  <select 
                    id="access-level" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={system.accessLevel}
                  >
                    <option value="read-only">Read Only (Import data from integration)</option>
                    <option value="read-write">Read and Write (Bidirectional data exchange)</option>
                    <option value="full-access">Full Access (Complete integration control)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Controls what operations this integration can perform</p>
                </div>

                <div className="mt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <input 
                      id="ip-restrictions-enabled" 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={system.ipRestrictions.enabled}
                    />
                    <Label htmlFor="ip-restrictions-enabled" className="font-medium">Enable IP Restrictions</Label>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Limit API access to specific IP addresses or ranges:</p>
                  
                  <div className="space-y-3">
                    {system.ipRestrictions.allowedIps.map((ip, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input 
                          type="text" 
                          defaultValue={ip}
                          className="w-full"
                          disabled={!system.ipRestrictions.enabled}
                        />
                        <Button variant="outline" className="flex-shrink-0" disabled={!system.ipRestrictions.enabled}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    
                    {system.ipRestrictions.enabled && (
                      <div className="flex justify-end mt-2">
                        <Button variant="outline">
                          Add IP Address
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center space-x-2">
                    <input 
                      id="enable-audit-logging" 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={true}
                    />
                    <Label htmlFor="enable-audit-logging" className="font-medium">Enable Audit Logging</Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Log all access and operations for this integration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Data Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Configure data privacy settings to control what information is shared with this integration.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <Label htmlFor="share-vehicle-data">Share Vehicle Data</Label>
                    <input 
                      id="share-vehicle-data" 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={true}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <Label htmlFor="share-driver-data">Share Driver Data</Label>
                    <input 
                      id="share-driver-data" 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={true}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <Label htmlFor="share-location-data">Share Location Data</Label>
                    <input 
                      id="share-location-data" 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={true}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <Label htmlFor="share-usage-data">Share Usage Analytics</Label>
                    <input 
                      id="share-usage-data" 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={false}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <Label htmlFor="share-charging-data">Share Charging Data</Label>
                    <input 
                      id="share-charging-data" 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={true}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Button variant="outline" className="text-red-600">
                    Delete All Integration Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 