"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Box, 
  Sphere, 
  Cylinder, 
  RoundedBox,
  Html,
  Text,
  Ring
} from '@react-three/drei';
import * as THREE from 'three';

interface GridNode3DProps {
  capacity: number; // MW
  currentLoad: number; // Percentage 0-100
  stressLevel: 'low' | 'medium' | 'high';
  renewablePct: number; // Percentage 0-100
  pricePerKwh: number; // USD per kWh
}

export function GridNode3D({
  capacity,
  currentLoad,
  stressLevel,
  renewablePct,
  pricePerKwh
}: GridNode3DProps) {
  const nodeRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const renewableRingRef = useRef<THREE.Mesh>(null);
  const loadIndicatorRef = useRef<THREE.Group>(null);
  
  // Performance optimized animations
  useFrame((state) => {
    if (nodeRef.current) {
      // Gentle rotation
      nodeRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    
    if (coreRef.current) {
      // Core pulsing based on grid stress
      const stressMultiplier = stressLevel === 'high' ? 1.5 : stressLevel === 'medium' ? 1.2 : 1.0;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3 * stressMultiplier) * 0.1;
      coreRef.current.scale.setScalar(pulse);
    }
    
    if (renewableRingRef.current) {
      // Renewable ring rotation
      renewableRingRef.current.rotation.x = state.clock.elapsedTime * 0.5;
    }
    
    if (loadIndicatorRef.current) {
      // Load indicator floating
      loadIndicatorRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  // Memoized colors based on status
  const stressColor = useMemo(() => {
    switch (stressLevel) {
      case 'low': return '#00ff00';
      case 'medium': return '#ffaa00';
      case 'high': return '#ff0000';
      default: return '#666666';
    }
  }, [stressLevel]);

  const loadColor = useMemo(() => {
    if (currentLoad > 90) return '#ff0000';
    if (currentLoad > 70) return '#ffaa00';
    return '#00ff00';
  }, [currentLoad]);

  const priceColor = useMemo(() => {
    if (pricePerKwh > 0.15) return '#ff4444';
    if (pricePerKwh > 0.10) return '#ffaa00';
    return '#00ff88';
  }, [pricePerKwh]);

  // Generate load indicator segments
  const loadSegments = useMemo(() => {
    const segments = [];
    const segmentCount = 20;
    const activeSegments = Math.floor((currentLoad / 100) * segmentCount);
    
    for (let i = 0; i < segmentCount; i++) {
      const angle = (i / segmentCount) * Math.PI * 2;
      const radius = 2.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0;
      
      const isActive = i < activeSegments;
      segments.push({
        position: [x, y, z] as [number, number, number],
        isActive,
        color: isActive ? loadColor : '#333333'
      });
    }
    
    return segments;
  }, [currentLoad, loadColor]);

  return (
    <group ref={nodeRef}>
      {/* Main Grid Core */}
      <group ref={coreRef}>
        <Sphere args={[1.2]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color={stressColor}
            emissive={stressColor}
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
        
        {/* Inner energy core */}
        <Sphere args={[0.8]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#00ffff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </Sphere>
      </group>

      {/* Capacity Pillars */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = 1 + (capacity / 1000) * 2; // Scale height with capacity
        
        return (
          <Cylinder
            key={i}
            args={[0.1, 0.1, height]}
            position={[x, height / 2, z]}
          >
            <meshStandardMaterial
              color="#0088ff"
              emissive="#0088ff"
              emissiveIntensity={0.2}
            />
          </Cylinder>
        );
      })}

      {/* Load Indicator Ring */}
      <group ref={loadIndicatorRef} position={[0, 0.5, 0]}>
        {loadSegments.map((segment, i) => (
          <Box
            key={i}
            args={[0.2, 0.1, 0.2]}
            position={segment.position}
          >
            <meshStandardMaterial
              color={segment.color}
              emissive={segment.isActive ? segment.color : '#000000'}
              emissiveIntensity={segment.isActive ? 0.4 : 0}
            />
          </Box>
        ))}
      </group>

      {/* Renewable Energy Ring */}
      <group ref={renewableRingRef} position={[0, 1.5, 0]}>
        <Ring args={[1.8, 2.2, 0, (renewablePct / 100) * Math.PI * 2]}>
          <meshStandardMaterial
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={0.6}
            side={THREE.DoubleSide}
          />
        </Ring>
        
        {/* Renewable percentage text */}
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          {renewablePct.toFixed(0)}%
        </Text>
        
        <Text
          position={[0, -0.4, 0]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Renewable
        </Text>
      </group>

      {/* Price Display */}
      <group position={[0, -2, 0]}>
        <RoundedBox args={[1.5, 0.6, 0.1]} radius={0.05}>
          <meshStandardMaterial
            color="#1a1a2e"
            emissive={priceColor}
            emissiveIntensity={0.1}
          />
        </RoundedBox>
        
        <Text
          position={[0, 0.1, 0.1]}
          fontSize={0.2}
          color={priceColor}
          anchorX="center"
          anchorY="middle"
        >
          ${pricePerKwh.toFixed(3)}/kWh
        </Text>
        
        <Text
          position={[0, -0.2, 0.1]}
          fontSize={0.12}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Current Rate
        </Text>
      </group>

      {/* Grid Status HUD */}
      <Html position={[4, 2, 0]} center>
        <div className="bg-black/90 text-white p-3 rounded-lg min-w-48">
          <h4 className="text-sm font-semibold mb-2 text-center border-b border-gray-600 pb-1">
            Grid Status
          </h4>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-300">Capacity:</span>
              <span className="text-blue-400 font-semibold">{capacity} MW</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Load:</span>
              <span 
                className="font-semibold"
                style={{ color: loadColor }}
              >
                {currentLoad.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Stress:</span>
              <span 
                className="font-semibold capitalize"
                style={{ color: stressColor }}
              >
                {stressLevel}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Renewable:</span>
              <span className="text-green-400 font-semibold">
                {renewablePct.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Price:</span>
              <span 
                className="font-semibold"
                style={{ color: priceColor }}
              >
                ${pricePerKwh.toFixed(3)}/kWh
              </span>
            </div>
          </div>
        </div>
      </Html>

      {/* Connection Points for Energy Flows */}
      <group>
        {/* Top connection point */}
        <Sphere args={[0.1]} position={[0, 2.5, 0]}>
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.8}
          />
        </Sphere>
        
        {/* Side connection points */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 1.5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <Sphere
              key={i}
              args={[0.08]}
              position={[x, 0, z]}
            >
              <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={0.6}
              />
            </Sphere>
          );
        })}
      </group>
    </group>
  );
} 