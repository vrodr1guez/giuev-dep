"use client";

import React from 'react';
import { Cpu, Bell, Settings, ChevronRight } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  onShowNotifications: () => void;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ isConnected, onShowNotifications, onTabChange }) => {
  return (
    <div className="bg-black/30 backdrop-blur-md border-b border-blue-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Digital Twin & Federated Learning
                </h1>
                <p className="text-blue-200 text-sm">Professional Battery Management Platform</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-sm text-gray-300">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
            <button 
              onClick={onShowNotifications}
              className="p-2 rounded-full hover:bg-blue-500/20 transition-colors"
            >
              <Bell className="w-5 h-5 text-blue-300" />
            </button>
            <button 
              onClick={() => onTabChange('settings')}
              className="p-2 rounded-full hover:bg-blue-500/20 transition-colors"
            >
              <Settings className="w-5 h-5 text-blue-300" />
            </button>
            {/* Placeholder for user profile */}
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fDE?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&q=80" alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-blue-400" />
              <ChevronRight className="w-4 h-4 text-blue-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 