"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import V2GEnergyFlow3D from './V2GEnergyFlow3D';
import OCPPChargingNetwork3D from './OCPPChargingNetwork3D';
import { GridNode3D } from './GridNode3D';

// Data interfaces leveraging existing types
interface V2GDashboardProps {
  // Leverage existing V2G data streams
  v2gVehicles?: any[];
  // Leverage existing OCPP data streams  
  ocppStations?: any[];
  // Leverage existing grid data streams
  gridStatus?: any;
  // Control options
  viewMode?: 'v2g' | 'ocpp' | 'integrated';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Mock data transformer - adapts your existing data structures
function transformV2GData(existingVehicles: any[]) {
  return existingVehicles.map((vehicle, index) => ({
    id: vehicle.id || `v${index + 1}`,
    position: [
      (Math.cos((index / existingVehicles.length) * Math.PI * 2) * 8) as number,
      0 as number,
      (Math.sin((index / existingVehicles.length) * Math.PI * 2) * 8) as number
    ] as [number, number, number],
    v2g_enabled: vehicle.v2g_enabled ?? true,
    v2g_active: vehicle.v2g_enabled && Math.random() > 0.6,
    battery_soc: vehicle.current_soc || vehicle.soc || Math.random() * 100,
    battery_capacity: vehicle.nominal_battery_capacity || vehicle.battery_capacity_kwh || 75,
    current_power_flow: Math.random() > 0.5 ? (Math.random() - 0.5) * 40 : 0, // -20kW to +20kW
    earnings_potential: Math.random() * 15 + 5,
    grid_stress_response: Math.random() * 100,
    recommended_action: ['charge', 'discharge', 'standby'][Math.floor(Math.random() * 3)] as 'charge' | 'discharge' | 'standby',
    battery_chemistry: vehicle.battery_chemistry || 'NMC',
    name: vehicle.name || `Vehicle ${index + 1}`
  }));
}

function transformOCPPData(existingStations: any[]) {
  return existingStations.map((station, index) => ({
    id: station.id || index + 1,
    chargePointId: station.charge_point_id || `CP${index + 1}`,
    name: station.name || `Station ${index + 1}`,
    position: [
      (Math.cos((index / existingStations.length) * Math.PI * 2) * 12) as number,
      0 as number,
      (Math.sin((index / existingStations.length) * Math.PI * 2) * 12) as number
    ] as [number, number, number],
    status: station.status || 'available',
    connectors: (station.connectors || [{ id: 1, connector_type: 'CCS2', max_power_kw: 150, status: 'available' }]).map((conn: any) => ({
      id: conn.id,
      connectorNumber: conn.connector_number || conn.id,
      connectorType: conn.connector_type || conn.connectorType || 'CCS2',
      maxPowerKw: conn.max_power_kw || conn.maxPowerKw || 150,
      status: conn.status || 'available',
      currentPowerKw: Math.random() > 0.7 ? Math.random() * 50 : 0,
      currentSession: Math.random() > 0.8 ? {
        sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
        vehicleId: `vehicle_${Math.random().toString(36).substr(2, 9)}`,
        startTime: new Date().toISOString(),
        currentEnergy: Math.random() * 50
      } : undefined
    })),
    maxPowerKw: station.max_power_kw || 150,
    currentLoadPct: Math.random() * 100,
    lastSeen: new Date().toISOString(),
    isOnline: station.is_online ?? true,
    ocppVersion: station.ocpp_version || '1.6',
    firmwareVersion: station.firmware_version,
    errorCode: Math.random() > 0.9 ? 'ERROR_001' : undefined,
    maintenanceAlert: Math.random() > 0.8
  }));
}

function transformGridData(existingGridStatus: any) {
  return {
    position: [0, 0, 0] as [number, number, number],
    capacity_mw: existingGridStatus?.capacity_available || 100,
    current_load_pct: existingGridStatus?.current_load_pct || Math.random() * 100,
    stress_level: existingGridStatus?.grid_stress_level || (['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'),
    renewable_pct: existingGridStatus?.renewable_percentage || Math.random() * 60 + 20,
    price_per_kwh: existingGridStatus?.current_price_kwh || 0.10 + Math.random() * 0.05
  };
}

// Loading component
function Loading3D() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#0088ff" />
    </mesh>
  );
}

// Main V2G Control Dashboard Component
export default function V2GControlDashboard3D({
  v2gVehicles = [],
  ocppStations = [],
  gridStatus = {},
  viewMode = 'integrated',
  autoRefresh = true,
  refreshInterval = 5000
}: V2GDashboardProps) {
  // State management leveraging existing data streams
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [grid, setGrid] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Leverage existing data streams or use mock data for demo
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Use provided data or fetch from existing APIs
        let vehicleData = v2gVehicles;
        let stationData = ocppStations;
        let gridData = gridStatus;
        
        // If no data provided, use mock data based on existing fleet insights
        if (vehicleData.length === 0) {
          // Fetch from existing fleet insights endpoint
          try {
            const response = await fetch('http://localhost:8000/api/ml/fleet-insights');
            if (response.ok) {
              const fleetData = await response.json();
              vehicleData = fleetData.vehicle_statuses || [];
            }
          } catch (err) {
            console.warn('Could not fetch fleet data, using mock data');
            vehicleData = Array.from({ length: 8 }, (_, i) => ({
              id: `EV-${String(i + 1).padStart(3, '0')}`,
              v2g_enabled: i < 6, // 6 out of 8 are V2G capable
              current_soc: 30 + Math.random() * 70,
              nominal_battery_capacity: [75, 131, 65, 135, 62][i % 5],
              battery_chemistry: ['NMC', 'LFP', 'NCA'][i % 3],
              name: ['Tesla Model Y', 'Ford F-150 Lightning', 'Hyundai IONIQ 5', 'Rivian R1T', 'Nissan Leaf'][i % 5]
            }));
          }
        }
        
        if (stationData.length === 0) {
          stationData = Array.from({ length: 6 }, (_, i) => ({
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
          }));
        }
        
        // Transform data to component format
        const transformedVehicles = transformV2GData(vehicleData);
        const transformedStations = transformOCPPData(stationData);
        const transformedGrid = transformGridData(gridData);
        
        setVehicles(transformedVehicles);
        setStations(transformedStations);
        setGrid(transformedGrid);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Using offline mode.');
        
        // Fallback to mock data
        setVehicles(transformV2GData([]));
        setStations(transformOCPPData([]));
        setGrid(transformGridData({}));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Auto-refresh interval
    let interval: NodeJS.Timeout | undefined;
    if (autoRefresh) {
      interval = setInterval(fetchData, refreshInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [v2gVehicles, ocppStations, gridStatus, autoRefresh, refreshInterval]);

  // Performance metrics
  const dashboardMetrics = useMemo(() => {
    const activeV2G = vehicles.filter(v => v.v2g_active).length;
    const onlineStations = stations.filter(s => s.isOnline).length;
    const totalPowerFlow = vehicles.reduce((sum, v) => sum + (v.current_power_flow || 0), 0);
    const avgBatterySoC = vehicles.reduce((sum, v) => sum + v.battery_soc, 0) / vehicles.length || 0;
    
    return {
      activeV2G,
      onlineStations,
      totalPowerFlow,
      avgBatterySoC,
      gridEfficiency: grid.current_load_pct > 0 ? (100 - grid.current_load_pct) : 100
    };
  }, [vehicles, stations, grid]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading V2G Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-gray-900">
      {/* Error banner */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-900/80 text-red-200 p-2 rounded z-10">
          {error}
        </div>
      )}
      
      {/* Dashboard metrics overlay */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg z-10 min-w-64">
        <h3 className="text-lg font-semibold mb-2 border-b border-gray-600 pb-2">
          Dashboard Overview
        </h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Active V2G:</span>
            <span className="text-green-400 font-semibold">{dashboardMetrics.activeV2G}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Online Stations:</span>
            <span className="text-blue-400 font-semibold">{dashboardMetrics.onlineStations}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Net Power Flow:</span>
            <span className={`font-semibold ${dashboardMetrics.totalPowerFlow > 0 ? 'text-green-400' : 'text-blue-400'}`}>
              {dashboardMetrics.totalPowerFlow > 0 ? '+' : ''}{dashboardMetrics.totalPowerFlow.toFixed(1)}kW
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Avg Battery SoC:</span>
            <span className="text-yellow-400 font-semibold">{dashboardMetrics.avgBatterySoC.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* View mode controls */}
      <div className="absolute top-4 left-4 bg-black/80 text-white p-2 rounded-lg z-10">
        <div className="flex space-x-2">
          {(['integrated', 'v2g', 'ocpp'] as const).map((mode) => (
            <button
              key={mode}
              className={`px-3 py-1 rounded text-xs font-medium ${
                viewMode === mode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => window.location.href = `?mode=${mode}`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas
        camera={{ position: [15, 10, 15], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
        }}
        performance={{ min: 0.5 }} // Maintain 30 FPS minimum
      >
        <Suspense fallback={<Loading3D />}>
          {/* Conditional rendering based on view mode */}
          {(viewMode === 'integrated' || viewMode === 'v2g') && vehicles.length > 0 && (
            <V2GEnergyFlow3D
              vehicles={vehicles}
              gridConnection={grid}
              autoRotate={viewMode === 'v2g'}
            />
          )}
          
          {(viewMode === 'integrated' || viewMode === 'ocpp') && stations.length > 0 && (
            <OCPPChargingNetwork3D
              stations={stations}
              showLoadBalancing={true}
              autoRotate={viewMode === 'ocpp'}
            />
          )}
          
          {/* Performance monitor */}
          <mesh position={[0, -5, 0]} visible={false}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        </Suspense>
      </Canvas>

      {/* Performance indicator */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Real-time Data</span>
        </div>
      </div>
    </div>
  );
} 