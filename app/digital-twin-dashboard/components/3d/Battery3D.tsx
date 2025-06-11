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
  ContactShadows,
  Float,
  Html,
  Billboard,
  Cylinder
} from '@react-three/drei';
import * as THREE from 'three';

interface Battery3DProps {
  batteryData: {
    soc: number;
    health: number;
    temperature: number;
    voltage: number;
    current: number;
    cycleCount: number;
    degradation: number;
  };
  isCharging: boolean;
  chargingRate?: number;
}

// Simplified Battery Cell Component
function SimpleBatteryCell({ position, soc, health, temperature, index }: {
  position: [number, number, number];
  soc: number;
  health: number;
  temperature: number;
  index: number;
}) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Simple rotation animation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + index * 0.2) * 0.1;
    }
  });

  const cellColor = health > 90 ? '#00ff88' : health > 70 ? '#ffaa00' : '#ff4444';
  const socHeight = Math.max(0.1, soc / 100);

  return (
    <group position={position}>
      {/* Cell container */}
      <RoundedBox ref={meshRef} args={[0.8, 2, 0.8]} radius={0.05}>
        <meshPhysicalMaterial 
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </RoundedBox>
      
      {/* SOC level */}
      <Box args={[0.7, socHeight * 1.8, 0.7]} position={[0, -0.9 + (socHeight * 0.9), 0]}>
        <meshStandardMaterial color={cellColor} emissive={cellColor} emissiveIntensity={0.3} />
      </Box>
      
      {/* Temperature indicator */}
      <Sphere args={[0.08]} position={[0, 1.2, 0]}>
        <meshStandardMaterial 
          color={temperature > 40 ? '#ff3333' : temperature > 30 ? '#ffaa00' : '#3388ff'}
          emissive={temperature > 40 ? '#ff3333' : temperature > 30 ? '#ffaa00' : '#3388ff'}
          emissiveIntensity={0.5}
        />
      </Sphere>
    </group>
  );
}

// Simplified HUD Display
function SimpleHUD({ batteryData, position }: { 
  batteryData: {
    soc: number;
    health: number;
    voltage: number;
    temperature: number;
  }; 
  position: [number, number, number] 
}) {
  return (
    <Billboard position={position}>
      <Html transform distanceFactor={8}>
        <div className="bg-black/90 backdrop-blur-xl rounded-lg p-4 border border-cyan-400/30 min-w-64 shadow-xl">
          <div className="flex items-center mb-3 pb-2 border-b border-cyan-400/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            <h3 className="text-cyan-400 font-mono font-bold text-sm">BATTERY STATUS</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-gray-400">SOC</div>
              <div className="text-green-400 font-mono font-bold">{batteryData.soc.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-gray-400">Health</div>
              <div className="text-blue-400 font-mono font-bold">{batteryData.health.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-gray-400">Voltage</div>
              <div className="text-yellow-400 font-mono font-bold">{batteryData.voltage.toFixed(1)}V</div>
            </div>
            <div>
              <div className="text-gray-400">Temp</div>
              <div className="text-red-400 font-mono font-bold">{batteryData.temperature.toFixed(1)}°C</div>
            </div>
          </div>
        </div>
      </Html>
    </Billboard>
  );
}

// Main Simplified Battery3D Component
export default function Battery3D({ batteryData, isCharging, chargingRate }: Battery3DProps) {
  // Create simplified battery cell grid
  const cells = useMemo(() => {
    const cellArray = [];
    const rows = 2;
    const cols = 3;
    
    for (let x = 0; x < cols; x++) {
      for (let z = 0; z < rows; z++) {
        cellArray.push({
          position: [(x - cols/2 + 0.5) * 1.2, 0, (z - rows/2 + 0.5) * 1.2],
          soc: batteryData.soc + (Math.random() - 0.5) * 5,
          health: batteryData.health + (Math.random() - 0.5) * 3,
          temperature: batteryData.temperature + (Math.random() - 0.5) * 2,
          index: x * rows + z,
        });
      }
    }
    return cellArray;
  }, [batteryData]);

  return (
    <group>
      {/* Basic Environment */}
      <Environment preset="city" />
      
      {/* Simple Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#0088ff" />

      {/* Battery Pack Base */}
      <RoundedBox args={[4, 0.3, 3]} position={[0, -1.2, 0]} radius={0.1}>
        <meshPhysicalMaterial 
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
        />
      </RoundedBox>

      {/* Simplified Battery Cells */}
      {cells.map((cell, index) => (
        <SimpleBatteryCell
          key={index}
          position={cell.position}
          soc={Math.max(0, Math.min(100, cell.soc))}
          health={Math.max(0, Math.min(100, cell.health))}
          temperature={cell.temperature}
          index={cell.index}
        />
      ))}

      {/* Charging indicator */}
      {isCharging && (
        <group>
          <Text
            position={[0, 2.5, 0]}
            fontSize={0.3}
            color="#00ffff"
            anchorX="center"
            anchorY="middle"
          >
            CHARGING
          </Text>
          
          {/* Simple charging beam */}
          <Cylinder args={[0.05, 0.05, 2]} position={[0, 1.5, 0]}>
            <meshStandardMaterial 
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </Cylinder>
        </group>
      )}

      {/* Simplified HUD */}
      <SimpleHUD batteryData={batteryData} position={[4, 1, 0]} />

      {/* Basic Camera Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={15}
        minDistance={5}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </group>
  );
} 