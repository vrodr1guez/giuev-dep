"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, RefreshCw, Download, Filter, Bell, Info } from 'lucide-react';

interface SettingsTabProps {
  // Add any necessary props here
}

const SettingsTab: React.FC<SettingsTabProps> = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center">
          <Settings className="w-6 h-6 mr-3 text-gray-400" />
          Platform Configuration
        </h2>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-blue-500/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="data-retention" className="block text-sm font-medium text-gray-300 mb-1">Data Retention Policy</label>
              <select id="data-retention" className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                <option>30 Days</option>
                <option>90 Days</option>
                <option>1 Year</option>
                <option>Indefinite</option>
              </select>
            </div>
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-1">API Key Management</label>
              <button className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white">Manage API Keys</button>
            </div>
            <div>
              <label htmlFor="notification-prefs" className="block text-sm font-medium text-gray-300 mb-1">Notification Preferences</label>
              <button className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white">Configure Notifications</button>
            </div>
            <div>
              <label htmlFor="theme-select" className="block text-sm font-medium text-gray-300 mb-1">Interface Theme</label>
              <select id="theme-select" className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                <option>Dark Mode (Default)</option>
                <option>Light Mode</option>
                <option>System Preference</option>
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center">
          <Info className="w-6 h-6 mr-3 text-gray-400" />
          System Information
        </h2>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-blue-500/20">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Platform Version:</span> <span className="text-white">2.3.1 (Professional Edition)</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Digital Twin Module:</span> <span className="text-white">v1.8.2</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Federated Learning Core:</span> <span className="text-white">v0.9.5</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Last System Update:</span> <span className="text-white">2024-07-15 10:30 UTC</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Server Status:</span> <span className="text-green-400">All systems operational</span></div>
          </div>
          <div className="mt-6 flex space-x-4">
            <button className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" /> Check for Updates
            </button>
            <button className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center">
              <Download className="w-4 h-4 mr-2" /> Download System Logs
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default SettingsTab; 