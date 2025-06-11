import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Users, Shield, Settings, Globe, Database, Bell, 
  Server, Map, Cloud, Key, RefreshCw, Download, Upload
} from 'lucide-react';

// Import our components
// Note: In a real implementation, you would ensure these paths are correct
import UserManagement from '../../components/settings/UserManagement';

interface NavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');

  // Navigation items for settings
  const navItems: NavItem[] = [
    {
      id: 'users',
      title: 'User Management',
      icon: <Users className="h-5 w-5" />,
      description: 'Manage users, roles, and permissions'
    },
    {
      id: 'organization',
      title: 'Organization Profile',
      icon: <Globe className="h-5 w-5" />,
      description: 'Configure organization details and branding'
    },
    {
      id: 'api',
      title: 'API Integration',
      icon: <Key className="h-5 w-5" />,
      description: 'API keys and third-party integrations'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      description: 'Configure notification preferences and channels'
    },
    {
      id: 'data',
      title: 'Data Management',
      icon: <Database className="h-5 w-5" />,
      description: 'Data backup, import, and export'
    },
    {
      id: 'geofences',
      title: 'Geofence Management',
      icon: <Map className="h-5 w-5" />,
      description: 'Create and manage geofenced areas'
    },
    {
      id: 'system',
      title: 'System Settings',
      icon: <Server className="h-5 w-5" />,
      description: 'General system configuration'
    },
    {
      id: 'telematics',
      title: 'Telematics Providers',
      icon: <Cloud className="h-5 w-5" />,
      description: 'Configure telematics provider integrations'
    }
  ];

  // Placeholder component for Organization Profile
  const OrganizationProfile = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Organization Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                defaultValue="GIU EV Charging Infrastructure"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Contact
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                defaultValue="Victor Rodriguez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full p-2 border rounded-md"
                defaultValue="admin@giuev.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                defaultValue="300 Technology Square, Cambridge, MA 02139"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold rounded">
                  GIU
                </div>
                <button className="px-3 py-1 border rounded text-sm">
                  Upload New Logo
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Placeholder component for Data Management
  const DataManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Data Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Create Backup
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  Create a backup of your organization's data
                </p>
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md">
                  <Download className="h-4 w-4" />
                  <span>Create Backup</span>
                </button>
              </div>
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Restore from Backup
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  Restore your data from a previous backup
                </p>
                <div className="flex gap-2">
                  <input
                    type="file"
                    className="w-full p-2 border rounded-md text-sm"
                  />
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md whitespace-nowrap">
                    <Upload className="h-4 w-4" />
                    <span>Restore</span>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import & Export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Export Data
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  Export your data to CSV or JSON format
                </p>
                <div className="flex gap-2">
                  <select className="p-2 border rounded-md text-sm">
                    <option>All Data</option>
                    <option>Vehicles</option>
                    <option>Charging Sessions</option>
                    <option>Routes</option>
                    <option>Users</option>
                  </select>
                  <select className="p-2 border rounded-md text-sm">
                    <option>CSV</option>
                    <option>JSON</option>
                    <option>Excel</option>
                  </select>
                  <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md whitespace-nowrap">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Import Data
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  Import data from CSV or JSON file
                </p>
                <div className="flex gap-2">
                  <select className="p-2 border rounded-md text-sm">
                    <option>Vehicles</option>
                    <option>Charging Stations</option>
                    <option>Routes</option>
                    <option>Users</option>
                  </select>
                  <input
                    type="file"
                    className="w-full p-2 border rounded-md text-sm"
                  />
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md whitespace-nowrap">
                    <Upload className="h-4 w-4" />
                    <span>Import</span>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Backups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Backup Frequency
            </label>
            <div className="flex gap-2 mt-1">
              <select className="p-2 border rounded-md text-sm">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Never</option>
              </select>
              <input
                type="time"
                className="p-2 border rounded-md text-sm"
                defaultValue="00:00"
              />
              <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">
                Save Settings
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Recent Backups
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-2 font-medium">Date</th>
                    <th className="p-2 font-medium">Size</th>
                    <th className="p-2 font-medium">Status</th>
                    <th className="p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-2">May 15, 2024 00:00</td>
                    <td className="p-2">4.2 MB</td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Completed
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button className="flex items-center text-blue-600 text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </button>
                        <button className="flex items-center text-green-600 text-xs">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2">May 14, 2024 00:00</td>
                    <td className="p-2">4.1 MB</td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Completed
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button className="flex items-center text-blue-600 text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </button>
                        <button className="flex items-center text-green-600 text-xs">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">Configure system settings and manage users</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="md:w-64 space-y-1">
          <p className="px-3 pb-1 text-xs font-semibold text-gray-600 uppercase">
            Settings
          </p>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-800'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className={`${activeTab === item.id ? 'text-blue-600' : 'text-gray-500'}`}>
                {item.icon}
              </div>
              <span>{item.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'organization' && <OrganizationProfile />}
          {activeTab === 'data' && <DataManagement />}
          {activeTab !== 'users' && activeTab !== 'organization' && activeTab !== 'data' && (
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center">
                <Settings className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500">
                  {navItems.find(item => item.id === activeTab)?.title} Settings
                </h3>
                <p className="text-gray-400 text-center mt-2 max-w-md">
                  {navItems.find(item => item.id === activeTab)?.description}
                </p>
                <p className="text-blue-500 mt-4">This section is under development</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 