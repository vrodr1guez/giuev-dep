"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var card_1 = require("../../components/ui/card");
var lucide_react_1 = require("lucide-react");
// Import our components
// Note: In a real implementation, you would ensure these paths are correct
var UserManagement_1 = require("../../components/settings/UserManagement");
var SettingsPage = function () {
    var _a, _b;
    var _c = (0, react_1.useState)('users'), activeTab = _c[0], setActiveTab = _c[1];
    // Navigation items for settings
    var navItems = [
        {
            id: 'users',
            title: 'User Management',
            icon: <lucide_react_1.Users className="h-5 w-5"/>,
            description: 'Manage users, roles, and permissions'
        },
        {
            id: 'organization',
            title: 'Organization Profile',
            icon: <lucide_react_1.Globe className="h-5 w-5"/>,
            description: 'Configure organization details and branding'
        },
        {
            id: 'api',
            title: 'API Integration',
            icon: <lucide_react_1.Key className="h-5 w-5"/>,
            description: 'API keys and third-party integrations'
        },
        {
            id: 'notifications',
            title: 'Notifications',
            icon: <lucide_react_1.Bell className="h-5 w-5"/>,
            description: 'Configure notification preferences and channels'
        },
        {
            id: 'data',
            title: 'Data Management',
            icon: <lucide_react_1.Database className="h-5 w-5"/>,
            description: 'Data backup, import, and export'
        },
        {
            id: 'geofences',
            title: 'Geofence Management',
            icon: <lucide_react_1.Map className="h-5 w-5"/>,
            description: 'Create and manage geofenced areas'
        },
        {
            id: 'system',
            title: 'System Settings',
            icon: <lucide_react_1.Server className="h-5 w-5"/>,
            description: 'General system configuration'
        },
        {
            id: 'telematics',
            title: 'Telematics Providers',
            icon: <lucide_react_1.Cloud className="h-5 w-5"/>,
            description: 'Configure telematics provider integrations'
        }
    ];
    // Placeholder component for Organization Profile
    var OrganizationProfile = function () { return (<div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Organization Profile</h1>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Organization Details</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input type="text" className="w-full p-2 border rounded-md" defaultValue="GIU EV Fleet Management"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Contact
              </label>
              <input type="text" className="w-full p-2 border rounded-md" defaultValue="John Smith"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input type="email" className="w-full p-2 border rounded-md" defaultValue="admin@giufleet.com"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea className="w-full p-2 border rounded-md" rows={3} defaultValue="123 EV Drive, Electrify City, EC 12345"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-blue-600 flex items-center justify-center text-white font-bold rounded">
                  GIU
                </div>
                <button className="px-3 py-1 border rounded text-sm">
                  Upload New Logo
                </button>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>); };
    // Placeholder component for Data Management
    var DataManagement = function () { return (<div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Data Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Backup & Restore</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Create Backup
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  Create a backup of your organization's data
                </p>
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md">
                  <lucide_react_1.Download className="h-4 w-4"/>
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
                  <input type="file" className="w-full p-2 border rounded-md text-sm"/>
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md whitespace-nowrap">
                    <lucide_react_1.Upload className="h-4 w-4"/>
                    <span>Restore</span>
                  </button>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Import & Export</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
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
                    <lucide_react_1.Download className="h-4 w-4"/>
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
                  <input type="file" className="w-full p-2 border rounded-md text-sm"/>
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md whitespace-nowrap">
                    <lucide_react_1.Upload className="h-4 w-4"/>
                    <span>Import</span>
                  </button>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Scheduled Backups</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
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
              <input type="time" className="p-2 border rounded-md text-sm" defaultValue="00:00"/>
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
                          <lucide_react_1.Download className="h-3 w-3 mr-1"/>
                          Download
                        </button>
                        <button className="flex items-center text-green-600 text-xs">
                          <lucide_react_1.RefreshCw className="h-3 w-3 mr-1"/>
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
                          <lucide_react_1.Download className="h-3 w-3 mr-1"/>
                          Download
                        </button>
                        <button className="flex items-center text-green-600 text-xs">
                          <lucide_react_1.RefreshCw className="h-3 w-3 mr-1"/>
                          Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>); };
    return (<div className="container mx-auto py-6 space-y-6">
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
          {navItems.map(function (item) { return (<button key={item.id} className={"w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ".concat(activeTab === item.id
                ? 'bg-blue-50 text-blue-800'
                : 'hover:bg-gray-100')} onClick={function () { return setActiveTab(item.id); }}>
              <div className={"".concat(activeTab === item.id ? 'text-blue-600' : 'text-gray-500')}>
                {item.icon}
              </div>
              <span>{item.title}</span>
            </button>); })}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'users' && <UserManagement_1.default />}
          {activeTab === 'organization' && <OrganizationProfile />}
          {activeTab === 'data' && <DataManagement />}
          {activeTab !== 'users' && activeTab !== 'organization' && activeTab !== 'data' && (<card_1.Card>
              <card_1.CardContent className="p-12 flex flex-col items-center justify-center">
                <lucide_react_1.Settings className="h-12 w-12 text-gray-300 mb-4"/>
                <h3 className="text-lg font-medium text-gray-500">
                  {(_a = navItems.find(function (item) { return item.id === activeTab; })) === null || _a === void 0 ? void 0 : _a.title} Settings
                </h3>
                <p className="text-gray-400 text-center mt-2 max-w-md">
                  {(_b = navItems.find(function (item) { return item.id === activeTab; })) === null || _b === void 0 ? void 0 : _b.description}
                </p>
                <p className="text-blue-500 mt-4">This section is under development</p>
              </card_1.CardContent>
            </card_1.Card>)}
        </div>
      </div>
    </div>);
};
exports.default = SettingsPage;
