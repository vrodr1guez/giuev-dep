/// <reference path="../../types/react.d.ts" />
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Filter, Settings, Sun, Bell, Home, Zap, Wrench, User, BarChart2 } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  icon: string;
  path: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: '📊', path: '/' },
  { name: 'Vehicles', icon: '🚗', path: '/vehicles' },
  { name: 'Charging Stations', icon: '⚡', path: '/charging-stations' },
  { name: 'Route Planning', icon: '🗺️', path: '/route-planning' },
  { name: 'Battery Health', icon: '🔋', path: '/maintenance/battery-health' },
  { name: 'Grid Integration', icon: '🔌', path: '/grid-integration' },
  { name: 'Drivers', icon: '👤', path: '/drivers' },
  { name: 'Energy Management', icon: '📈', path: '/energy-management' },
  { name: 'Reports', icon: '📑', path: '/reports' },
  { name: 'Settings', icon: '⚙️', path: '/settings' }
];

// Sidebar links
const sidebarLinks = [
  { to: '/', icon: <Home className="w-5 h-5" />, text: 'Dashboard' },
  { to: '/charging-stations', icon: <Zap className="w-5 h-5" />, text: 'Charging Stations' },
  {
    icon: <Wrench className="w-5 h-5" />,
    text: 'Maintenance',
    submenu: [
      { to: '/maintenance/battery-health', text: 'Battery Health' },
      { to: '/maintenance/enhanced-battery-health', text: 'Enhanced Battery Health' },
    ]
  },
  { to: '/grid-integration', icon: <BarChart2 className="w-5 h-5" />, text: 'Grid Integration' },
  { to: '/profile', icon: <User className="w-5 h-5" />, text: 'Profile' },
];

const MainLayout = ({ children }: MainLayoutProps): React.ReactElement => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-lg flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              GIU
            </div>
            {!sidebarCollapsed && (
              <h1 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">GIU Fleet</h1>
            )}
          </Link>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="mt-6 flex-1 overflow-y-auto">
          <ul>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-6 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 ${
                      isActive ? 'bg-gradient-to-r from-blue-50 to-transparent dark:from-gray-700 dark:to-transparent text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-500' : ''
                    }`}
                  >
                    <span className="mr-3 text-xl">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          {!sidebarCollapsed && (
            <div className="bg-blue-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Need help?</p>
              <Link to="/support" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Contact Support</Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 transition-all duration-200"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="hidden md:flex space-x-1">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                  <Filter size={18} />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                  <Settings size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/notifications"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                aria-label="Notifications"
              >
                <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Sun size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
              <div className="h-8 border-r border-gray-200 dark:border-gray-700"></div>
              <Link to="/profile" className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  FM
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Fleet Manager</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 