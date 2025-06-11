"use client";

import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  BatteryCharging, 
  Zap, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle, 
  BarChart2,
  Layers,
  Settings,
  PlugZap,
  History,
  Save,
  Info
} from 'lucide-react';

type VehicleSettingsProps = {
  params: {
    id: string;
  };
};

const VehicleSettings = ({ params }: VehicleSettingsProps) => {
  const { id } = params;
  const [activeTab, setActiveTab] = useState('v2g');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mock settings - in a real app these would be loaded from an API
  const [settings, setSettings] = useState({
    v2g: {
      enabled: true,
      minBatteryLevel: 30,
      maxDischargeRate: 7.2,
      maxDailyEnergy: 20,
      preferredHours: [17, 18, 19, 20], // 5pm - 8pm
      priorityMode: 'revenue',
      daysEnabled: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      pricing: {
        minimumRate: 0.12,
        smartPricing: true
      }
    },
    charging: {
      smartChargingEnabled: true,
      preferredChargingTime: 'overnight',
      targetChargeLevel: 80,
      maxChargeRate: 11
    }
  });

  // Mock vehicle data
  const vehicle = {
    id,
    name: 'Tesla Model 3 Long Range',
    licensePlate: 'EV-123-456',
    batteryCapacity: 75, // kWh
    maxPower: 11, // kW
    v2gCompatible: true
  };

  const tabs = [
    { id: 'v2g', label: 'V2G Settings', icon: <Zap className="h-5 w-5 mr-2" /> },
    { id: 'charging', label: 'Charging Settings', icon: <BatteryCharging className="h-5 w-5 mr-2" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="h-5 w-5 mr-2" /> },
    { id: 'limits', label: 'System Limits', icon: <AlertTriangle className="h-5 w-5 mr-2" /> }
  ];

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleNestedSettingChange = (category: string, parent: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [parent]: {
          ...prev[category as keyof typeof prev][parent as keyof typeof prev[keyof typeof prev]],
          [setting]: value
        }
      }
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would send the settings to an API
    console.log('Saving settings:', settings);
    setSaveSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <a href="/ev-management/smart-grid" className="hover:text-blue-600 dark:hover:text-blue-400">Smart Grid</a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <a href="/ev-management/smart-grid/vehicles" className="hover:text-blue-600 dark:hover:text-blue-400">Vehicles</a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <a href={`/ev-management/smart-grid/vehicles/${id}`} className="hover:text-blue-600 dark:hover:text-blue-400">{vehicle.name}</a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-800 dark:text-white">Settings</span>
        </div>

        {/* Vehicle Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
              <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{vehicle.name} Settings</h1>
              <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                <span className="mr-3">{vehicle.licensePlate}</span>
                <span>Battery Capacity: {vehicle.batteryCapacity} kWh</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex mt-4 md:mt-0"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg flex items-center shadow-md hover:shadow-lg transition-shadow relative overflow-hidden"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Saved Successfully
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Settings
                </>
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-t-xl shadow-md border border-gray-100 dark:border-gray-700 p-1"
        >
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium min-w-max ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-b-xl shadow-md border-x border-b border-gray-100 dark:border-gray-700 p-6"
        >
          {/* V2G Settings Tab */}
          {activeTab === 'v2g' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Main Settings Column */}
                <div className="w-full md:w-2/3 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Vehicle-to-Grid Configuration</h2>
                    <div className="flex items-center">
                      <span className={`text-sm mr-2 ${settings.v2g.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {settings.v2g.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <div 
                        onClick={() => handleSettingChange('v2g', 'enabled', !settings.v2g.enabled)}
                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                          settings.v2g.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          settings.v2g.enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 space-y-5">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Minimum Battery Level (%)
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {settings.v2g.minBatteryLevel}%
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="50" 
                        value={settings.v2g.minBatteryLevel}
                        onChange={(e) => handleSettingChange('v2g', 'minBatteryLevel', parseInt(e.target.value))} 
                        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" 
                      />
                      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                        <span>10%</span>
                        <span>30%</span>
                        <span>50%</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Maximum Discharge Rate (kW)
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {settings.v2g.maxDischargeRate} kW
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max={vehicle.maxPower} 
                        step="0.1"
                        value={settings.v2g.maxDischargeRate}
                        onChange={(e) => handleSettingChange('v2g', 'maxDischargeRate', parseFloat(e.target.value))} 
                        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" 
                      />
                      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                        <span>1 kW</span>
                        <span>{Math.round(vehicle.maxPower/2)} kW</span>
                        <span>{vehicle.maxPower} kW</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Maximum Daily Energy (kWh)
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {settings.v2g.maxDailyEnergy} kWh
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="50" 
                        value={settings.v2g.maxDailyEnergy}
                        onChange={(e) => handleSettingChange('v2g', 'maxDailyEnergy', parseInt(e.target.value))} 
                        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" 
                      />
                      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                        <span>5 kWh</span>
                        <span>25 kWh</span>
                        <span>50 kWh</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        Priority Mode
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {['revenue', 'grid_stability', 'balanced', 'minimal_impact'].map(mode => (
                          <div 
                            key={mode}
                            onClick={() => handleSettingChange('v2g', 'priorityMode', mode)}
                            className={`px-4 py-3 rounded-lg cursor-pointer border ${
                              settings.v2g.priorityMode === mode
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="font-medium text-sm capitalize">
                              {mode.replace('_', ' ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        Preferred V2G Hours
                      </label>
                      <div className="grid grid-cols-8 gap-2">
                        {[...Array(24)].map((_, i) => (
                          <div 
                            key={i}
                            onClick={() => {
                              const newHours = settings.v2g.preferredHours.includes(i)
                                ? settings.v2g.preferredHours.filter(hour => hour !== i)
                                : [...settings.v2g.preferredHours, i];
                              handleSettingChange('v2g', 'preferredHours', newHours);
                            }}
                            className={`px-2 py-1 text-center text-xs rounded cursor-pointer ${
                              settings.v2g.preferredHours.includes(i)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {i}:00
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Select hours when the vehicle is available for grid services
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Sidebar Column */}
                <div className="w-full md:w-1/3 space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5">
                    <h3 className="font-semibold text-gray-800 dark:text-blue-300 flex items-center mb-3">
                      <Info className="h-5 w-5 mr-2 text-blue-500" />
                      V2G Status Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total V2G Revenue</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white">$1,245.30</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Energy Provided to Grid</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white">3,245 kWh</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Battery Impact</div>
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">Minimal (-0.2%)</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Pricing Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Smart Pricing
                          </label>
                          <div 
                            onClick={() => handleNestedSettingChange('v2g', 'pricing', 'smartPricing', !settings.v2g.pricing.smartPricing)}
                            className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${
                              settings.v2g.pricing.smartPricing ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                              settings.v2g.pricing.smartPricing ? 'translate-x-5' : 'translate-x-0'
                            }`}></div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Automatically adjust pricing based on market conditions
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                          Minimum Rate ($/kWh)
                        </label>
                        <input 
                          type="number" 
                          value={settings.v2g.pricing.minimumRate}
                          onChange={(e) => handleNestedSettingChange('v2g', 'pricing', 'minimumRate', parseFloat(e.target.value))}
                          min="0.05"
                          max="0.30"
                          step="0.01"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs would be implemented similarly */}
          {activeTab === 'charging' && (
            <div className="py-8 px-4 text-center text-gray-500 dark:text-gray-400">
              <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Charging Settings</h3>
              <p>Smart charging settings configuration would be available here.</p>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="py-8 px-4 text-center text-gray-500 dark:text-gray-400">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Schedule Settings</h3>
              <p>Configure vehicle availability and event scheduling.</p>
            </div>
          )}

          {activeTab === 'limits' && (
            <div className="py-8 px-4 text-center text-gray-500 dark:text-gray-400">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">System Limits</h3>
              <p>Configure hardware and system limits for this vehicle.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VehicleSettings; 