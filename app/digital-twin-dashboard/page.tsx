'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart as BarChart3, TrendingUp, Sparkles as Brain, Settings
} from 'lucide-react';

// Import new components
import Header from './components/Header';
import OverviewTab from './components/OverviewTab';
import AnalyticsTab from './components/AnalyticsTab';
import FleetIntelligenceTab from './components/FleetIntelligenceTab';
import SettingsTab from './components/SettingsTab';
import NotificationPanel from './components/NotificationPanel';

export default function DigitalTwinDashboard() {
  const [selectedVehicle, setSelectedVehicle] = useState('EV-001');
  const [realTimeData, setRealTimeData] = useState({});
  const [federatedInsights, setFederatedInsights] = useState({});
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications data
  const mockNotifications = [
    { id: '1', type: 'info' as const, message: 'New global model v248 deployed successfully.', timestamp: '2 minutes ago' },
    { id: '2', type: 'warning' as const, message: 'Vehicle EV-003 battery temperature approaching critical limit.', timestamp: '15 minutes ago' },
    { id: '3', type: 'success' as const, message: 'Optimization resulted in 12% cost savings for Q2.', timestamp: '1 hour ago' },
  ];

  const digitalTwinData = {
    'EV-001': {
      vehicle_id: 'EV-001',
      twin_status: 'active',
      real_time_replica: {
        voltage: 387.5,
        current: 45.2,
        temperature: 28.5,
        soc: 73.2,
        soh: 94.8,
        internal_resistance: 0.0847,
        power_capability: 17.5,
        energy_throughput: 2847.3,
        efficiency_rating: 0.943
      },
      predictive_analytics: {
        '1h': { predicted_soh: 94.7, predicted_temperature: 29.1, confidence: 0.96 },
        '24h': { predicted_soh: 94.5, predicted_temperature: 27.8, confidence: 0.92 },
        '168h': { predicted_soh: 93.8, predicted_temperature: 28.2, confidence: 0.85 },
        '720h': { predicted_soh: 92.1, predicted_temperature: 28.0, confidence: 0.78 }
      },
      failure_prevention: {
        thermal_runaway_risk: 12.3,
        dendrite_growth_level: 8.7,
        electrolyte_degradation: 15.2,
        failure_probability_24h: 0.002,
        failure_probability_7d: 0.008,
        failure_probability_30d: 0.025
      },
      life_extension_metrics: {
        current_remaining_years: 7.2,
        optimized_remaining_years: 9.0,
        life_extension_potential: 1.8,
        optimization_benefit_percent: 25.0,
        failure_reduction_percent: 30.0
      },
      recommendations: [
        "✅ Battery operating optimally - continue monitoring",
        "🌡️ Monitor temperature during fast charging",
        "⚡ Optimize charging profile for longevity"
      ],
      confidence: 0.954
    }
  };

  const fleetData = {
    fleet_id: 'GIU_FLEET_001',
    model_update: {
      accuracy_improvement: 42.3,
      convergence_rate: 0.91,
      privacy_budget_used: 0.15,
      global_model_version: 'v247'
    },
    accuracy_improvement: 42.3,
    privacy_preserved: true,
    fleet_insights: {
      fleet_size: 47,
      average_battery_health: 89.4,
      average_efficiency: 0.887,
      total_energy_consumption: 3247.8,
      optimization_potential: 18.7,
      cost_savings_potential: 16.2
    },
    recommendations: [
      "🤖 Federated learning model updated - 42% accuracy improvement",
      "🔒 Privacy-preserving analytics active",
      "📈 High optimization potential detected across fleet",
      "⚡ Implement federated charging optimization"
    ]
  };

  const performanceHistory = [
    { time: '00:00', battery_health: 95.2, efficiency: 0.89, failures: 0, temperature: 26.5, power: 15.2 },
    { time: '04:00', battery_health: 95.1, efficiency: 0.91, failures: 0, temperature: 25.8, power: 16.1 },
    { time: '08:00', battery_health: 94.9, efficiency: 0.88, failures: 1, temperature: 28.2, power: 18.5 },
    { time: '12:00', battery_health: 94.8, efficiency: 0.90, failures: 0, temperature: 31.1, power: 17.8 },
    { time: '16:00', battery_health: 94.7, efficiency: 0.92, failures: 0, temperature: 29.7, power: 16.9 },
    { time: '20:00', battery_health: 94.8, efficiency: 0.89, failures: 0, temperature: 27.3, power: 15.6 },
    { time: '24:00', battery_health: 94.8, efficiency: 0.91, failures: 0, temperature: 26.1, power: 15.8 }
  ];

  const riskData = [
    { name: 'Thermal Runaway', value: 12.3, color: '#ef4444', severity: 'medium' },
    { name: 'Dendrite Growth', value: 8.7, color: '#f97316', severity: 'low' },
    { name: 'Electrolyte Degradation', value: 15.2, color: '#eab308', severity: 'medium' },
    { name: 'Optimal Range', value: 63.8, color: '#22c55e', severity: 'optimal' }
  ];

  const fleetComparison = [
    { metric: 'Battery Health', before: 76.2, after: 89.4, improvement: 17.3, unit: '%' },
    { metric: 'Efficiency', before: 0.72, after: 0.887, improvement: 23.2, unit: '' },
    { metric: 'Failure Rate', before: 8.5, after: 5.95, improvement: 30.0, unit: '%' },
    { metric: 'Energy Cost', before: 0.18, after: 0.151, improvement: 16.1, unit: '$/kWh' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'fleet', label: 'Fleet Intelligence', icon: <Brain className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        timestamp: new Date().toISOString(),
        voltage: 387.5 + Math.random() * 10 - 5,
        current: 45.2 + Math.random() * 10 - 5,
        temperature: 28.5 + Math.random() * 2 - 1,
        efficiency: 0.943 + Math.random() * 0.02 - 0.01
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentTwin = digitalTwinData[selectedVehicle];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <Header 
        isConnected={isConnected} 
        onShowNotifications={() => setShowNotifications(true)} 
        onTabChange={setActiveTab} 
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 bg-black/20 backdrop-blur-sm p-2 rounded-lg flex space-x-1 max-w-md mx-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-blue-500/20 hover:text-blue-200'}
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'overview' && 
            <OverviewTab 
              currentTwin={currentTwin} 
              performanceHistory={performanceHistory} 
              riskData={riskData} 
              realTimeData={realTimeData} 
            />}
          {activeTab === 'analytics' && 
            <AnalyticsTab 
              fleetComparison={fleetComparison} 
              performanceHistory={performanceHistory} 
            />}
          {activeTab === 'fleet' && 
            <FleetIntelligenceTab 
              fleetData={fleetData} 
              federatedInsights={federatedInsights} 
            />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>

      <NotificationPanel 
        show={showNotifications} 
        onClose={() => setShowNotifications(false)} 
        notifications={mockNotifications} 
      />

      {/* Footer */}
      <footer className="py-8 mt-12 border-t border-blue-500/20">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} GIU Advanced Technology Division. All Rights Reserved.</p>
          <p>Digital Twin & Federated Learning Platform for EV Battery Management.</p>
        </div>
      </footer>
    </div>
  );
} 