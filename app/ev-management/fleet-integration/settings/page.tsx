"use client";
import React from 'react';
import Link from 'next/link';
import { 
  Settings, ChevronLeft, Save, Server, Clock, 
  Bell, Shield, RefreshCw, Cloud, AlertTriangle, Check, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

export default function FleetIntegrationSettingsPage() {
  // Sample integration settings
  const integrationSettings = {
    syncFrequency: '15',
    syncEnabled: true,
    syncStartTime: '22:00',
    syncEndTime: '05:00',
    errorNotifications: true,
    syncNotifications: true,
    apiKey: 'giu_fl33t_api_1a2b3c4d5e6f7g8h',
    apiEndpoint: 'https://api.giu-fleet.com/v2/',
    defaultPriority: 'balanced'
  };

  // Sample data retention settings
  const dataRetentionSettings = {
    vehicleData: '90',
    routeData: '180',
    driverData: '365',
    maintenanceData: '730',
    chargeSessionData: '365'
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/ev-management/fleet-integration" className="flex items-center hover:text-blue-600 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Fleet Integration
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Integration Settings</h1>
          <p className="text-gray-600">Configure how your fleet systems integrate with your EV charging infrastructure</p>
        </div>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6">
          <TabsList className="grid grid-cols-1 md:grid-cols-4 gap-2 p-1">
            <TabsTrigger value="general" className="rounded-md transition-all">
              <Settings className="mr-2 h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="sync" className="rounded-md transition-all">
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Synchronization</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-md transition-all">
              <Shield className="mr-2 h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-md transition-all">
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">General Integration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <p className="text-sm text-blue-700">
                    These settings control how your fleet integration behaves across all connected systems.
                    Changes to these settings will affect all integrations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="default-priority" className="block mb-2 font-medium">Default Integration Priority</Label>
                    <select 
                      id="default-priority" 
                      defaultValue={integrationSettings.defaultPriority}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="charging">Charging Priority (Prioritize vehicle readiness)</option>
                      <option value="balanced">Balanced (Default)</option>
                      <option value="fleet">Fleet Priority (Prioritize fleet operations)</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Determines whether charging or fleet operations take precedence in scheduling conflicts</p>
                  </div>

                  <div>
                    <Label htmlFor="integration-mode" className="block mb-2 font-medium">Integration Mode</Label>
                    <select 
                      id="integration-mode" 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="full">Full Integration (Bidirectional)</option>
                      <option value="read-only">Read Only (Import data only)</option>
                      <option value="write-only">Write Only (Export data only)</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Controls whether data is imported, exported, or both</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="ai-optimization" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={true}
                    />
                    <Label htmlFor="ai-optimization" className="font-medium">Enable AI Optimization</Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Use AI to optimize charging schedules based on fleet operations data</p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="conflict-resolution" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={true}
                    />
                    <Label htmlFor="conflict-resolution" className="font-medium">Automatic Conflict Resolution</Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Automatically resolve conflicts between fleet and charging schedules</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Control how long data from integrated systems is stored in your GIU EV Charging Infrastructure.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="vehicle-data" className="block mb-2 font-medium">Vehicle Data (days)</Label>
                    <Input 
                      id="vehicle-data" 
                      type="number" 
                      defaultValue={dataRetentionSettings.vehicleData}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="route-data" className="block mb-2 font-medium">Route Data (days)</Label>
                    <Input 
                      id="route-data" 
                      type="number" 
                      defaultValue={dataRetentionSettings.routeData}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="driver-data" className="block mb-2 font-medium">Driver Data (days)</Label>
                    <Input 
                      id="driver-data" 
                      type="number" 
                      defaultValue={dataRetentionSettings.driverData}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maintenance-data" className="block mb-2 font-medium">Maintenance Data (days)</Label>
                    <Input 
                      id="maintenance-data" 
                      type="number" 
                      defaultValue={dataRetentionSettings.maintenanceData}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="charge-session-data" className="block mb-2 font-medium">Charge Session Data (days)</Label>
                    <Input 
                      id="charge-session-data" 
                      type="number" 
                      defaultValue={dataRetentionSettings.chargeSessionData}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" className="mr-2">
                    Export All Data
                  </Button>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Clear All Data
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
                    Control how often your fleet management data is synchronized with your charging infrastructure.
                    More frequent synchronization provides more up-to-date data but may increase system load.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="sync-frequency" className="block mb-2 font-medium">Sync Frequency (minutes)</Label>
                    <Input 
                      id="sync-frequency" 
                      type="number" 
                      defaultValue={integrationSettings.syncFrequency}
                      min="5" 
                      max="1440"
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">How often data is synchronized between systems</p>
                  </div>

                  <div>
                    <Label htmlFor="sync-priority" className="block mb-2 font-medium">Sync Priority</Label>
                    <select 
                      id="sync-priority" 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="high">High (Real-time updates, higher resource usage)</option>
                      <option value="medium">Medium (Balance between timeliness and resources)</option>
                      <option value="low">Low (Less frequent updates, lower resource usage)</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Determines system resources allocated to synchronization</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-3">Scheduled Sync Window</h3>
                  <p className="text-sm text-gray-600 mb-4">Optionally limit larger synchronization operations to specific time windows:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="sync-start-time" className="block mb-2">Start Time</Label>
                      <Input 
                        id="sync-start-time" 
                        type="time" 
                        defaultValue={integrationSettings.syncStartTime}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sync-end-time" className="block mb-2">End Time</Label>
                      <Input 
                        id="sync-end-time" 
                        type="time" 
                        defaultValue={integrationSettings.syncEndTime}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="sync-enabled" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={integrationSettings.syncEnabled}
                    />
                    <Label htmlFor="sync-enabled" className="font-medium">Enable Scheduled Synchronization</Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-6">When enabled, data will be synchronized on the schedule above</p>
                </div>

                <div className="mt-6">
                  <Button className="mr-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                  <Button variant="outline">
                    View Sync Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Data Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Configure how data fields from your fleet systems map to your charging infrastructure.
                Fine-tune these settings to ensure accurate data integration.
              </p>
              
              <Link 
                href="/ev-management/fleet-integration/data-mapping" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                Configure Data Mapping
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">API Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                  <p className="text-sm text-yellow-700">
                    These credentials provide access to your integration API. Keep them secure and 
                    rotate them regularly to maintain security.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="api-key" className="block mb-2 font-medium">API Key</Label>
                    <div className="flex">
                      <Input 
                        id="api-key" 
                        type="password" 
                        defaultValue={integrationSettings.apiKey}
                        className="w-full rounded-r-none"
                      />
                      <Button className="rounded-l-none">Show</Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Your API key for authenticating integration requests</p>
                  </div>

                  <div>
                    <Label htmlFor="api-endpoint" className="block mb-2 font-medium">API Endpoint</Label>
                    <Input 
                      id="api-endpoint" 
                      type="text" 
                      defaultValue={integrationSettings.apiEndpoint}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">The endpoint URL for your integration API</p>
                  </div>
                </div>

                <div className="flex mt-6">
                  <Button variant="outline" className="mr-2">
                    Regenerate API Key
                  </Button>
                  <Button variant="outline">
                    Download API Credentials
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Access Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Control which systems and users can access your integration data.
                </p>

                <div className="mt-4">
                  <Label htmlFor="access-level" className="block mb-2 font-medium">Default Access Level</Label>
                  <select 
                    id="access-level" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="read-only">Read Only</option>
                    <option value="read-write">Read and Write</option>
                    <option value="admin">Administrative Access</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Default access level for new integrations</p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="ip-restriction" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={true}
                    />
                    <Label htmlFor="ip-restriction" className="font-medium">Enable IP Restrictions</Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Limit API access to specific IP addresses</p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="audit-logging" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={true}
                    />
                    <Label htmlFor="audit-logging" className="font-medium">Enable Audit Logging</Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Log all access to integration data</p>
                </div>

                <div className="mt-6">
                  <Button variant="outline">
                    View Audit Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Configure notifications for integration events and errors.
                </p>

                <div className="space-y-4 mt-6">
                  <h3 className="font-medium text-lg mb-3">Email Notifications</h3>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <Label htmlFor="sync-notifications">Synchronization Notifications</Label>
                    <input 
                      type="checkbox" 
                      id="sync-notifications" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={integrationSettings.syncNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <Label htmlFor="error-notifications">Error Notifications</Label>
                    <input 
                      type="checkbox" 
                      id="error-notifications" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={integrationSettings.errorNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <Label htmlFor="conflict-notifications">Scheduling Conflict Notifications</Label>
                    <input 
                      type="checkbox" 
                      id="conflict-notifications" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={true}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <Label htmlFor="security-notifications">Security Alert Notifications</Label>
                    <input 
                      type="checkbox" 
                      id="security-notifications" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={true}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Label htmlFor="notification-recipients" className="block mb-2 font-medium">Notification Recipients</Label>
                  <Input 
                    id="notification-recipients" 
                    type="text" 
                    placeholder="Enter email addresses separated by commas"
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">Notifications will be sent to these email addresses</p>
                </div>

                <div className="mt-6">
                  <Button variant="outline" className="mr-2">
                    Test Notification
                  </Button>
                  <Button variant="outline">
                    View Notification History
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