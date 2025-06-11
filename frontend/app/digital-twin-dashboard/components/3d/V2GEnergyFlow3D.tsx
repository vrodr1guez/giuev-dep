"use client";

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Box, 
  Text, 
  Sphere, 
  RoundedBox, 
  OrbitControls, 
  Environment,
  Html,
  Billboard,
  Cylinder,
  Tube,
  Line
} from '@react-three/drei';
import * as THREE from 'three';
import { EnergyParticleSystem } from './EnergyParticleSystem';
import { GridNode3D } from './GridNode3D';

interface V2GVehicle {
  id: string;
  position: [number, number, number];
  v2g_enabled: boolean;
  v2g_active: boolean;
  battery_soc: number;
  battery_capacity: number;
  current_power_flow: number; // Positive = discharging to grid, Negative = charging from grid
  earnings_potential: number;
  grid_stress_response: number; // 0-100 priority score
  recommended_action: 'charge' | 'discharge' | 'standby';
  battery_chemistry: string;
  name: string;
}

interface GridConnection {
  position: [number, number, number];
  capacity_mw: number;
  current_load_pct: number;
  stress_level: 'low' | 'medium' | 'high';
  renewable_pct: number;
  price_per_kwh: number;
}

interface V2GEnergyFlow3DProps {
  vehicles: V2GVehicle[];
  gridConnection: GridConnection;
  onVehicleClick?: (vehicle: V2GVehicle) => void;
  autoRotate?: boolean;
}

// Optimized V2G Vehicle Component with energy flow
function V2GVehicle3D({ vehicle, gridPosition, isSelected, onClick }: {
  vehicle: V2GVehicle;
  gridPosition: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}) {
  const vehicleRef = useRef<THREE.Group>(null);
  const energyFlowRef = useRef<THREE.Group>(null);
  
  // Performance optimized animation
  useFrame((state) => {
    if (vehicleRef.current) {
      // Subtle floating animation - optimized for performance
      vehicleRef.current.position.y = vehicle.position[1] + Math.sin(state.clock.elapsedTime * 2 + vehicle.position[0]) * 0.05;
      
      // V2G activity indicator rotation
      if (vehicle.v2g_active && energyFlowRef.current) {
        energyFlowRef.current.rotation.y = state.clock.elapsedTime * 2;
      }
    }
  });

  // Memoized vehicle color based on V2G status
  const vehicleColor = useMemo(() => {
    if (!vehicle.v2g_enabled) return '#666666';
    if (!vehicle.v2g_active) return '#888888';
    
    switch (vehicle.recommended_action) {
      case 'discharge': return '#00ff88'; // Green for discharging (earning)
      case 'charge': return '#0088ff';    // Blue for charging
      case 'standby': return '#ffaa00';   // Orange for standby
      default: return '#666666';
    }
  }, [vehicle.v2g_enabled, vehicle.v2g_active, vehicle.recommended_action]);

  // Memoized energy flow intensity
  const energyFlowIntensity = useMemo(() => {
    return Math.abs(vehicle.current_power_flow) / 50; // Normalize to 0-1 range (assuming max 50kW)
  }, [vehicle.current_power_flow]);

  return (
    <group ref={vehicleRef} position={vehicle.position} onClick={onClick}>
      {/* Main Vehicle Body */}
      <RoundedBox args={[1.5, 0.6, 3]} radius={0.1}>
        <meshStandardMaterial 
          color={vehicleColor}
          metalness={0.7}
          roughness={0.3}
          emissive={vehicle.v2g_active ? vehicleColor : '#000000'}
          emissiveIntensity={vehicle.v2g_active ? 0.2 : 0}
        />
      </RoundedBox>

      {/* V2G Energy Flow Indicator */}
      {vehicle.v2g_active && (
        <group ref={energyFlowRef}>
          <Sphere args={[0.2]} position={[0, 1.2, 0]}>
            <meshStandardMaterial 
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.8}
              transparent
              opacity={0.8}
            />
          </Sphere>
          
          {/* Energy direction indicator */}
          <Cylinder 
            args={[0.05, 0.05, 0.8]} 
            position={[0, 1.6, 0]}
            rotation={vehicle.current_power_flow > 0 ? [0, 0, 0] : [Math.PI, 0, 0]}
          >
            <meshStandardMaterial 
              color={vehicle.current_power_flow > 0 ? '#00ff88' : '#0088ff'}
              emissive={vehicle.current_power_flow > 0 ? '#00ff88' : '#0088ff'}
              emissiveIntensity={0.6}
            />
          </Cylinder>
        </group>
      )}

      {/* SOC Battery Indicator */}
      <group position={[0, -0.9, 0]}>
        {/* Battery outline */}
        <Box args={[0.6, 0.2, 0.1]}>
          <meshStandardMaterial color="#333333" />
        </Box>
        {/* Battery level */}
        <Box args={[0.5 * (vehicle.battery_soc / 100), 0.15, 0.12]} position={[(-0.5 + 0.25 * (vehicle.battery_soc / 100)), 0, 0]}>
          <meshStandardMaterial 
            color={vehicle.battery_soc > 60 ? '#00ff00' : vehicle.battery_soc > 30 ? '#ffaa00' : '#ff0000'}
          />
        </Box>
      </group>

      {/* Energy Particle System for Active V2G */}
      {vehicle.v2g_active && energyFlowIntensity > 0.1 && (
        <EnergyParticleSystem
          startPosition={vehicle.position}
          endPosition={gridPosition}
          intensity={energyFlowIntensity}
          direction={vehicle.current_power_flow > 0 ? 'to-grid' : 'from-grid'}
          color={vehicle.current_power_flow > 0 ? '#00ff88' : '#0088ff'}
        />
      )}

      {/* Vehicle Info Label */}
      <Html position={[0, -1.5, 0]} center>
        <div className={`bg-black/80 text-white px-2 py-1 rounded text-xs ${isSelected ? 'border border-blue-400' : ''}`}>
          <div className="text-center">
            <div className="font-semibold">{vehicle.id}</div>
            <div className="text-gray-300">{vehicle.battery_soc}% SOC</div>
            {vehicle.v2g_active && (
              <div className={`text-xs ${vehicle.current_power_flow > 0 ? 'text-green-400' : 'text-blue-400'}`}>
                {vehicle.current_power_flow > 0 ? '→ Grid' : '← Grid'} {Math.abs(vehicle.current_power_flow).toFixed(1)}kW
              </div>
            )}
            {vehicle.v2g_active && vehicle.current_power_flow > 0 && (
              <div className="text-green-400 text-xs">
                ${vehicle.earnings_potential.toFixed(2)}/hr
              </div>
            )}
          </div>
        </div>
      </Html>

      {/* Selection indicator */}
      {isSelected && (
        <Sphere args={[2]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#0088ff"
            transparent 
            opacity={0.1}
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
}

// Main V2G Energy Flow 3D Component
export default function V2GEnergyFlow3D({ 
  vehicles, 
  gridConnection, 
  onVehicleClick,
  autoRotate = true 
}: V2GEnergyFlow3DProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const gridRef = useRef<THREE.Group>(null);
  
  // Performance optimized grid animation
  useFrame((state) => {
    if (gridRef.current) {
      // Subtle pulsing based on grid stress
      const pulseIntensity = gridConnection.current_load_pct / 100;
      gridRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.05 * pulseIntensity);
    }
  });

  // Memoized grid stress color
  const gridStressColor = useMemo(() => {
    switch (gridConnection.stress_level) {
      case 'low': return '#00ff00';
      case 'medium': return '#ffaa00';
      case 'high': return '#ff0000';
      default: return '#666666';
    }
  }, [gridConnection.stress_level]);

  // Calculate total V2G metrics (memoized for performance)
  const v2gMetrics = useMemo(() => {
    const activeVehicles = vehicles.filter(v => v.v2g_active);
    const dischargingVehicles = activeVehicles.filter(v => v.current_power_flow > 0);
    const chargingVehicles = activeVehicles.filter(v => v.current_power_flow < 0);
    
    return {
      totalActive: activeVehicles.length,
      totalDischarging: dischargingVehicles.length,
      totalCharging: chargingVehicles.length,
      totalPowerFlow: activeVehicles.reduce((sum, v) => sum + v.current_power_flow, 0),
      totalEarnings: dischargingVehicles.reduce((sum, v) => sum + v.earnings_potential, 0)
    };
  }, [vehicles]);

  const handleVehicleClick = (vehicle: V2GVehicle) => {
    setSelectedVehicle(vehicle.id);
    onVehicleClick?.(vehicle);
  };

  return (
    <group>
      {/* Environment and Lighting */}
      <Environment preset="night" />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#0088ff" />
      
      {/* Grid Node (Central Hub) */}
      <group ref={gridRef} position={gridConnection.position}>
        <GridNode3D 
          capacity={gridConnection.capacity_mw}
          currentLoad={gridConnection.current_load_pct}
          stressLevel={gridConnection.stress_level}
          renewablePct={gridConnection.renewable_pct}
          pricePerKwh={gridConnection.price_per_kwh}
        />
      </group>

      {/* V2G Vehicle Fleet */}
      {vehicles.map((vehicle) => (
        <V2GVehicle3D
          key={vehicle.id}
          vehicle={vehicle}
          gridPosition={gridConnection.position}
          isSelected={selectedVehicle === vehicle.id}
          onClick={() => handleVehicleClick(vehicle)}
        />
      ))}

      {/* V2G Summary HUD */}
      <Html position={[8, 6, 0]} center>
        <div className="bg-black/90 text-white p-4 rounded-lg min-w-64">
          <h3 className="text-lg font-semibold mb-3 text-center border-b border-gray-600 pb-2">
            V2G Energy Flow Status
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Active Vehicles:</span>
              <span className="text-blue-400 font-semibold">{v2gMetrics.totalActive}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Discharging:</span>
              <span className="text-green-400 font-semibold">{v2gMetrics.totalDischarging}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Charging:</span>
              <span className="text-blue-400 font-semibold">{v2gMetrics.totalCharging}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Net Power Flow:</span>
              <span className={`font-semibold ${v2gMetrics.totalPowerFlow > 0 ? 'text-green-400' : 'text-blue-400'}`}>
                {v2gMetrics.totalPowerFlow > 0 ? '+' : ''}{v2gMetrics.totalPowerFlow.toFixed(1)}kW
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Earnings Rate:</span>
              <span className="text-green-400 font-semibold">
                ${v2gMetrics.totalEarnings.toFixed(2)}/hr
              </span>
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-300">Grid Stress:</span>
                <span className={`font-semibold capitalize`} style={{ color: gridStressColor }}>
                  {gridConnection.stress_level}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Grid Load:</span>
                <span className="text-yellow-400 font-semibold">
                  {gridConnection.current_load_pct.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Renewable:</span>
                <span className="text-green-400 font-semibold">
                  {gridConnection.renewable_pct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Html>

      {/* Performance optimized orbit controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={25}
        minDistance={10}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </group>
  );
} 