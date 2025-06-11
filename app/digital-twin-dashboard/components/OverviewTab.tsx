"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Battery, Cpu, Shield, TrendingUp, AlertTriangle, CheckCircle, 
  Zap, ThermometerSun as Thermometer, Activity, Sparkles as Brain, Shield as Lock, Users, Circle as Target,
  ArrowUp, ArrowDown, Clock, Gauge, Activity as Wifi, Database, Settings,
  Download, Filter, RefreshCw, Bell, Info, ChevronRight,
  BarChart as BarChart3, PieChart as PieChartIcon, TrendingDown
} from 'lucide-react';
import MetricCard from './MetricCard';
import Battery3D from './3d/Battery3D';
import FleetVisualization3D from './3d/FleetVisualization3D';
import RiskAssessment3D from './3d/RiskAssessment3D';
import PerformanceMetrics3D from './3d/PerformanceMetrics3D';
import Canvas3DWrapper from './3d/Canvas3DWrapper';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface OverviewTabProps {
  currentTwin: any;
  performanceHistory: any[];
  riskData: any[];
  realTimeData: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ currentTwin, performanceHistory, riskData, realTimeData }) => {
  // Mock fleet data for 3D visualization
  const fleetVehicles = [
    { id: 'EV-001', position: [-2, 0, -2] as [number, number, number], health: 94.8, soc: 73.2, status: 'active' as const, v2gActive: true },
    { id: 'EV-002', position: [2, 0, -2] as [number, number, number], health: 87.5, soc: 45.0, status: 'charging' as const, v2gActive: false },
    { id: 'EV-003', position: [-2, 0, 2] as [number, number, number], health: 91.2, soc: 82.5, status: 'idle' as const, v2gActive: false },
    { id: 'EV-004', position: [2, 0, 2] as [number, number, number], health: 78.9, soc: 15.3, status: 'maintenance' as const, v2gActive: false },
    { id: 'EV-005', position: [0, 0, 0] as [number, number, number], health: 95.1, soc: 90.0, status: 'active' as const, v2gActive: true },
  ];

  // Performance metrics for 3D visualization
  const performanceMetrics = [
    { label: 'Efficiency', value: currentTwin.real_time_replica.efficiency_rating * 100, maxValue: 100, unit: '%', color: '#44ff44' },
    { label: 'Power', value: currentTwin.real_time_replica.power_capability, maxValue: 50, unit: 'kW', color: '#ff4444' },
    { label: 'Temperature', value: realTimeData.temperature || 28.5, maxValue: 60, unit: '°C', color: '#ff8844' },
    { label: 'Voltage', value: currentTwin.real_time_replica.voltage, maxValue: 450, unit: 'V', color: '#4444ff' },
    { label: 'Current', value: currentTwin.real_time_replica.current, maxValue: 100, unit: 'A', color: '#44ffff' },
    { label: 'Health', value: currentTwin.real_time_replica.soh, maxValue: 100, unit: '%', color: '#ff44ff' },
  ];

  // Risk factors for 3D visualization
  const riskFactors = riskData.map(risk => ({
    ...risk,
    severity: risk.value > 60 ? 'critical' as const : risk.value > 40 ? 'high' as const : risk.value > 20 ? 'medium' as const : 'low' as const,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
      {/* Real-time Twin Data */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center">
          <Cpu className="w-6 h-6 mr-3 text-cyan-400" />
          Real-time Digital Twin Replica (EV-001)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <MetricCard title="Voltage" value={realTimeData.voltage?.toFixed(1)} unit="V" icon={<Zap className="w-6 h-6 text-yellow-400" />} />
          <MetricCard title="Current" value={realTimeData.current?.toFixed(1)} unit="A" icon={<Activity className="w-6 h-6 text-green-400" />} />
          <MetricCard title="Temperature" value={realTimeData.temperature?.toFixed(1)} unit="°C" icon={<Thermometer className="w-6 h-6 text-red-400" />} />
          <MetricCard title="State of Charge" value={currentTwin.real_time_replica.soc} unit="%" icon={<Battery className="w-6 h-6 text-lime-400" />} />
          <MetricCard title="State of Health" value={currentTwin.real_time_replica.soh} unit="%" icon={<Shield className="w-6 h-6 text-teal-400" />} />
        </div>
      </section>

      {/* 3D Battery Visualization */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center">
          <Battery className="w-6 h-6 mr-3 text-green-400" />
          3D Battery Visualization
        </h2>
        <div className="h-96 bg-white/10 backdrop-blur-md rounded-xl border border-blue-500/20 overflow-hidden">
          <Canvas3DWrapper>
            <Battery3D
              batteryData={{
                soc: currentTwin.real_time_replica.soc,
                health: currentTwin.real_time_replica.soh,
                temperature: realTimeData.temperature || currentTwin.real_time_replica.temperature,
                voltage: currentTwin.real_time_replica.voltage,
                current: currentTwin.real_time_replica.current,
                cycleCount: currentTwin.real_time_replica.cycle_count || 0,
                degradation: 100 - currentTwin.real_time_replica.soh
              }}
              isCharging={realTimeData.charging_status === 'charging'}
              chargingRate={realTimeData.charging_rate}
            />
          </Canvas3DWrapper>
        </div>
      </section>

      {/* 3D Fleet Visualization */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center">
          <Users className="w-6 h-6 mr-3 text-purple-400" />
          3D Fleet Overview
        </h2>
        <div className="h-96 bg-white/10 backdrop-blur-md rounded-xl border border-blue-500/20 overflow-hidden">
          <Canvas3DWrapper>
            <FleetVisualization3D vehicles={fleetVehicles} />
          </Canvas3DWrapper>
        </div>
      </section>

      {/* 3D Performance Metrics */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-indigo-400" />
          3D Performance Metrics
        </h2>
        <div className="h-96 bg-white/10 backdrop-blur-md rounded-xl border border-blue-500/20 overflow-hidden">
          <Canvas3DWrapper>
            <PerformanceMetrics3D metrics={performanceMetrics} />
          </Canvas3DWrapper>
        </div>
      </section>

      {/* Predictive Analytics */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center">
          <Brain className="w-6 h-6 mr-3 text-purple-400" />
          Predictive Analytics & Diagnostics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-blue-500/20">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">Failure Prevention Insights</h3>
            <div className="space-y-3">
              {Object.entries(currentTwin.failure_prevention).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className={`font-medium ${value > 0.01 ? 'text-orange-400' : 'text-green-400'}`}>{typeof value === 'number' ? value.toFixed(3) : value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-blue-500/20">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">Life Extension Potential</h3>
            <div className="space-y-3">
              {Object.entries(currentTwin.life_extension_metrics).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-medium text-sky-400">{value}{key.includes('percent') ? '%' : key.includes('years') ? ' yrs' : ''}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-blue-500/20">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">Recommendations</h3>
            <ul className="space-y-2">
              {currentTwin.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start text-sm text-gray-300">
                  <Info className="w-4 h-4 mr-2 mt-0.5 text-cyan-400 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Performance History Chart */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-pink-400" />
          Performance History
        </h2>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-blue-500/20 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceHistory} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }} 
                labelStyle={{ color: '#e5e7eb' }} 
              />
              <Legend wrapperStyle={{ fontSize: '0.875rem', color: '#d1d5db' }} />
              <Area type="monotone" dataKey="battery_health" stroke="#60a5fa" fillOpacity={1} fill="url(#colorHealth)" name="Battery Health (%)" />
              <Area type="monotone" dataKey="efficiency" stroke="#34d399" fillOpacity={1} fill="url(#colorEfficiency)" name="Efficiency" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3D Risk Assessment */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-3 text-orange-400" />
          3D Risk Assessment
        </h2>
        <div className="h-96 bg-white/10 backdrop-blur-md rounded-xl border border-blue-500/20 overflow-hidden">
          <Canvas3DWrapper>
            <RiskAssessment3D riskFactors={riskFactors} />
          </Canvas3DWrapper>
        </div>
      </section>
    </motion.div>
  );
};

export default OverviewTab; 