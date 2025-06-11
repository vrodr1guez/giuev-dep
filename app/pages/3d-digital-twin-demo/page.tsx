"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Car, 
  Battery, 
  Gauge, 
  Activity,
  Eye,
  Settings,
  BarChart3,
  Globe,
  Cpu,
  Monitor
} from 'lucide-react';
import V2GControlDashboard3D from '../../digital-twin-dashboard/components/3d/V2GControlDashboard3D';

// Navigation component
const NavTabs = ({ activeTab, setActiveTab }: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
}) => {
  const tabs = [
    { id: 'v2g', label: 'V2G Energy Flow', icon: Zap, color: 'text-green-400' },
    { id: 'ocpp', label: 'OCPP Network', icon: Car, color: 'text-blue-400' },
    { id: 'integrated', label: 'Integrated View', icon: Globe, color: 'text-purple-400' },
    { id: 'performance', label: 'Performance', icon: Activity, color: 'text-yellow-400' },
  ];

  return (
    <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg backdrop-blur-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
            activeTab === tab.id
              ? 'bg-gray-700 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <tab.icon size={16} className={activeTab === tab.id ? tab.color : ''} />
          <span className="text-sm font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

// Performance metrics component
const PerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    renderTime: 16.7,
    drawCalls: 245,
    triangles: 12450,
    memory: 128,
    cpuUsage: 15
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        fps: 55 + Math.random() * 10,
        renderTime: 15 + Math.random() * 5,
        drawCalls: 240 + Math.random() * 20,
        triangles: 12000 + Math.random() * 1000,
        memory: 120 + Math.random() * 20,
        cpuUsage: 10 + Math.random() * 15
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ label, value, unit, color, icon: Icon }: {
    label: string;
    value: number;
    unit: string;
    color: string;
    icon: any;
  }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-2">
        <Icon size={16} className={color} />
        <span className="text-gray-300 text-sm">{label}</span>
      </div>
      <div className="flex items-baseline space-x-1">
        <span className={`text-2xl font-bold ${color}`}>
          {value.toFixed(1)}
        </span>
        <span className="text-gray-400 text-sm">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <MetricCard
        label="Frame Rate"
        value={metrics.fps}
        unit="FPS"
        color="text-green-400"
        icon={Monitor}
      />
      <MetricCard
        label="Render Time"
        value={metrics.renderTime}
        unit="ms"
        color="text-blue-400"
        icon={Activity}
      />
      <MetricCard
        label="Draw Calls"
        value={metrics.drawCalls}
        unit=""
        color="text-purple-400"
        icon={BarChart3}
      />
      <MetricCard
        label="Triangles"
        value={metrics.triangles}
        unit=""
        color="text-yellow-400"
        icon={Settings}
      />
      <MetricCard
        label="GPU Memory"
        value={metrics.memory}
        unit="MB"
        color="text-red-400"
        icon={Cpu}
      />
      <MetricCard
        label="CPU Usage"
        value={metrics.cpuUsage}
        unit="%"
        color="text-orange-400"
        icon={Gauge}
      />
    </div>
  );
};

// Feature showcase component
const FeatureShowcase = ({ activeTab }: { activeTab: string }) => {
  const features = {
    v2g: [
      'Real-time bidirectional energy flow visualization',
      'Grid stress response indicators',
      'V2G earnings potential tracking',
      'Battery health impact modeling',
      'Fleet coordination optimization'
    ],
    ocpp: [
      'OCPP protocol version display',
      'Real-time connector status tracking',
      'Load balancing visualization',
      'Maintenance alert system',
      'Network efficiency monitoring'
    ],
    integrated: [
      'Unified V2G and OCPP visualization',
      'Cross-system data correlation',
      'Comprehensive fleet overview',
      'Multi-zone management',
      'Real-time performance metrics'
    ],
    performance: [
      '60 FPS target optimization',
      'Adaptive level-of-detail rendering',
      'Particle system performance tuning',
      'Memory-efficient data streaming',
      'WebGL performance monitoring'
    ]
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <Eye size={20} className="text-blue-400" />
        <span>Key Features</span>
      </h3>
      <ul className="space-y-2">
        {features[activeTab as keyof typeof features]?.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-2 text-gray-300"
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>{feature}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

// Main demo page component
export default function DigitalTwin3DDemo() {
  const [activeTab, setActiveTab] = useState('integrated');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Demo data - leverages existing fleet insights structure
  const demoData = {
    v2gVehicles: Array.from({ length: 8 }, (_, i) => ({
      id: `EV-${String(i + 1).padStart(3, '0')}`,
      v2g_enabled: i < 6, // 6 out of 8 are V2G capable
      current_soc: 30 + Math.random() * 70,
      nominal_battery_capacity: [75, 131, 65, 135, 62][i % 5],
      battery_chemistry: ['NMC', 'LFP', 'NCA'][i % 3],
      name: ['Tesla Model Y', 'Ford F-150 Lightning', 'Hyundai IONIQ 5', 'Rivian R1T', 'Nissan Leaf'][i % 5]
    })),
    
    ocppStations: Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      charge_point_id: `CP${String(i + 1).padStart(3, '0')}`,
      name: `Fast Charging Station ${i + 1}`,
      status: ['available', 'charging', 'preparing'][i % 3],
      is_online: i < 5, // 5 out of 6 online
      ocpp_version: i < 3 ? '1.6' : '2.0.1',
      connectors: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
        id: j + 1,
        connector_type: ['CCS2', 'CHAdeMO', 'Type2'][j % 3],
        max_power_kw: [50, 150, 350][j % 3],
        status: ['available', 'occupied'][Math.floor(Math.random() * 2)]
      }))
    })),
    
    gridStatus: {
      capacity_available: 100,
      current_load_pct: 65,
      grid_stress_level: 'medium',
      renewable_percentage: 35,
      current_price_kwh: 0.12
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
                <Battery className="text-green-400" size={28} />
                <span>3D Digital Twin Showcase</span>
              </h1>
              <p className="text-gray-400 mt-1">
                Advanced V2G Energy Flow & OCPP Charging Network Visualization
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Monitor size={16} />
                <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
          {/* 3D Visualization */}
          <div className={`${isFullscreen ? 'col-span-1 h-screen' : 'col-span-1 lg:col-span-3 h-96 lg:h-[600px]'} bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700/50`}>
            <V2GControlDashboard3D
              v2gVehicles={demoData.v2gVehicles}
              ocppStations={demoData.ocppStations}
              gridStatus={demoData.gridStatus}
              viewMode={activeTab as any}
              autoRefresh={true}
              refreshInterval={3000}
            />
          </div>

          {/* Side panel */}
          {!isFullscreen && (
            <div className="col-span-1 space-y-6">
              {/* Feature showcase */}
              <FeatureShowcase activeTab={activeTab} />
              
              {/* Real-time stats */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <BarChart3 size={20} className="text-green-400" />
                  <span>Live Statistics</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">V2G Active:</span>
                    <span className="text-green-400 font-semibold">
                      {demoData.v2gVehicles.filter(v => v.v2g_enabled).length}/8
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Stations Online:</span>
                    <span className="text-blue-400 font-semibold">
                      {demoData.ocppStations.filter(s => s.is_online).length}/6
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Grid Load:</span>
                    <span className="text-yellow-400 font-semibold">
                      {demoData.gridStatus.current_load_pct}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Renewable:</span>
                    <span className="text-green-400 font-semibold">
                      {demoData.gridStatus.renewable_percentage}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Technology stack */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Cpu size={20} className="text-purple-400" />
                  <span>Technology Stack</span>
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">React Three Fiber</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">THREE.js</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300">WebGL 2.0</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-gray-300">Performance Optimized</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance metrics (only in performance tab) */}
        {activeTab === 'performance' && !isFullscreen && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Activity size={24} className="text-green-400" />
              <span>Real-time Performance Metrics</span>
            </h2>
            <PerformanceMetrics />
          </div>
        )}
      </div>
    </div>
  );
} 