"use client";

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Box, 
  Text, 
  Sphere, 
  RoundedBox, 
  OrbitControls, 
  Environment,
  Cylinder,
  Html,
  Billboard
} from '@react-three/drei';
import * as THREE from 'three';

interface Vehicle {
  id: string;
  position: [number, number, number];
  health: number;
  soc: number;
  status: 'active' | 'charging' | 'idle' | 'maintenance';
  v2gActive: boolean;
}

interface FleetVisualization3DProps {
  vehicles: Vehicle[];
}

// Simplified Vehicle Component
function SimpleVehicle({ vehicle }: { vehicle: Vehicle }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Simple floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime + vehicle.position[0]) * 0.1;
    }
  });

  const vehicleColor = useMemo(() => {
    switch (vehicle.status) {
      case 'active': return '#00ff88';
      case 'charging': return '#0088ff';
      case 'idle': return '#888888';
      case 'maintenance': return '#ff4444';
      default: return '#666666';
    }
  }, [vehicle.status]);

  return (
    <group ref={meshRef} position={vehicle.position}>
      {/* Simple vehicle body */}
      <RoundedBox args={[1.5, 0.6, 3]} radius={0.1}>
        <meshStandardMaterial 
          color={vehicleColor}
          metalness={0.7}
          roughness={0.3}
        />
      </RoundedBox>

      {/* Vehicle roof */}
      <RoundedBox args={[1.2, 0.4, 1.8]} position={[0, 0.5, -0.3]} radius={0.2}>
        <meshStandardMaterial 
          color="#1a1a2e"
          metalness={0.6}
          roughness={0.4}
        />
      </RoundedBox>

      {/* Simple wheels */}
      {[[-0.6, -0.3, 1], [0.6, -0.3, 1], [-0.6, -0.3, -1], [0.6, -0.3, -1]].map((pos, i) => (
        <Cylinder key={i} args={[0.25, 0.25, 0.2]} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#222222" />
        </Cylinder>
      ))}

      {/* Status indicator */}
      <Sphere args={[0.1]} position={[0, 0.8, 1.2]}>
        <meshStandardMaterial 
          color={vehicleColor} 
          emissive={vehicleColor} 
          emissiveIntensity={0.5} 
        />
      </Sphere>

      {/* V2G indicator */}
      {vehicle.v2gActive && (
        <Sphere args={[0.08]} position={[0, 1.2, 0]}>
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={0.8} 
          />
        </Sphere>
      )}

      {/* Vehicle ID label */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {vehicle.id}
      </Text>
    </group>
  );
}

// Simple Grid Component
function SimpleGrid() {
  return (
    <group>
      {/* Grid floor */}
      <RoundedBox args={[12, 0.1, 12]} position={[0, -1, 0]} radius={0.05}>
        <meshStandardMaterial 
          color="#0a0a1a"
          metalness={0.8}
          roughness={0.2}
        />
      </RoundedBox>

      {/* Grid lines */}
      {Array.from({ length: 13 }, (_, i) => (
        <group key={`grid-${i}`}>
          <Box args={[0.02, 0.02, 12]} position={[-6 + i, -0.95, 0]}>
            <meshBasicMaterial color="#00aaff" transparent opacity={0.3} />
          </Box>
          <Box args={[12, 0.02, 0.02]} position={[0, -0.95, -6 + i]}>
            <meshBasicMaterial color="#00aaff" transparent opacity={0.3} />
          </Box>
        </group>
      ))}
    </group>
  );
}

// Simple Fleet Stats HUD
function SimpleFleetHUD({ vehicles }: { vehicles: Vehicle[] }) {
  const stats = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter(v => v.status === 'active').length;
    const charging = vehicles.filter(v => v.status === 'charging').length;
    const avgHealth = vehicles.reduce((sum, v) => sum + v.health, 0) / total;

    return { total, active, charging, avgHealth };
  }, [vehicles]);

  return (
    <Billboard position={[6, 2, 0]}>
      <Html transform distanceFactor={10}>
        <div className="bg-black/90 backdrop-blur-xl rounded-lg p-4 border border-cyan-400/30 min-w-48 shadow-xl">
          <div className="flex items-center mb-3 pb-2 border-b border-cyan-400/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            <h3 className="text-cyan-400 font-mono font-bold text-sm">FLEET STATUS</h3>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Total:</span>
              <span className="text-white font-mono font-bold">{stats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active:</span>
              <span className="text-green-400 font-mono">{stats.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Charging:</span>
              <span className="text-blue-400 font-mono">{stats.charging}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Health:</span>
              <span className="text-purple-400 font-mono">{stats.avgHealth.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </Html>
    </Billboard>
  );
}

// Main FleetVisualization3D Component
export default function FleetVisualization3D({ vehicles }: FleetVisualization3DProps) {
  return (
    <group>
      {/* Basic Environment */}
      <Environment preset="night" />
      
      {/* Simple Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#0088ff" />

      {/* Grid Infrastructure */}
      <SimpleGrid />

      {/* Vehicle Fleet */}
      {vehicles.map((vehicle) => (
        <SimpleVehicle key={vehicle.id} vehicle={vehicle} />
      ))}

      {/* Fleet Stats HUD */}
      <SimpleFleetHUD vehicles={vehicles} />

      {/* Camera Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={20}
        minDistance={8}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </group>
  );
} 