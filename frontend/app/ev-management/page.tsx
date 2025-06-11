"use client";

import Link from 'next/link';
import { Battery, ChevronRight, Server, Settings, Zap } from 'lucide-react';

export default function EVManagementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4">
            EV Fleet Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl max-w-3xl mx-auto">
            Comprehensive tools to monitor, manage, and optimize your electric vehicle infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Battery className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Charging Stations</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Monitor and manage all charging stations, view status, usage metrics, and maintenance schedules.
              </p>
              <Link 
                href="/ev-management/stations" 
                className="text-blue-600 dark:text-blue-400 font-medium flex items-center hover:underline"
              >
                View Stations <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">V2G Integration</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Explore vehicle-to-grid capabilities, energy flow metrics, and grid service revenue.
              </p>
              <Link 
                href="/ev-management/v2g" 
                className="text-blue-600 dark:text-blue-400 font-medium flex items-center hover:underline"
              >
                View V2G <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Energy Management</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Track energy consumption, optimize charging schedules, and reduce operational costs.
              </p>
              <Link 
                href="/ev-management/energy" 
                className="text-blue-600 dark:text-blue-400 font-medium flex items-center hover:underline"
              >
                View Energy <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fleet Settings</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Configure fleet-wide settings, charging policies, and access controls for your EV infrastructure.
              </p>
              <Link 
                href="/ev-management/settings" 
                className="text-blue-600 dark:text-blue-400 font-medium flex items-center hover:underline"
              >
                Configure <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Demo Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 rounded-xl shadow-sm overflow-hidden text-white">
            <div className="p-6">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <Battery className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Interactive Demos</h3>
              <p className="text-blue-100 mb-4">
                Explore our interactive demos to see the platform capabilities in action with sample data.
              </p>
              <Link 
                href="/ev-management/demo" 
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium inline-flex items-center hover:bg-blue-50 transition-colors"
              >
                View Demos <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Battery className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Charging Stations</span>
              <span className="font-semibold text-gray-900 dark:text-white">Online</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Server className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-300">API Endpoints</span>
              <span className="font-semibold text-gray-900 dark:text-white">Operational</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Zap className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Grid Services</span>
              <span className="font-semibold text-gray-900 dark:text-white">Connected</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Settings className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-300">System Health</span>
              <span className="font-semibold text-gray-900 dark:text-white">Normal</span>
            </div>
          </div>
          <div className="text-right">
            <Link 
              href="/api-docs" 
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              View API Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 