"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Box, 
  Text, 
  Sphere, 
  Cylinder, 
  RoundedBox,
  OrbitControls, 
  Environment,
  Html,
  Billboard
} from '@react-three/drei';
import * as THREE from 'three';

interface PerformanceMetric {
  label: string;
  value: number;
  maxValue: number;
  unit: string;
  color: string;
}

interface PerformanceMetrics3DProps {
  metrics: PerformanceMetric[];
}

// Simple Metric Bar Component
function SimpleMetricBar({ metric, position, index }: { metric: PerformanceMetric; position: [number, number, number]; index: number }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Simple rotation animation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + index * 0.5) * 0.1;
    }
  });

  const normalizedValue = metric.value / metric.maxValue;
  const barHeight = normalizedValue * 3;

  return (
    <group ref={meshRef} position={position}>
      {/* Base platform */}
      <RoundedBox args={[0.8, 0.1, 0.8]} position={[0, 0, 0]} radius={0.05}>
        <meshStandardMaterial 
          color="#1a1a2e"
          metalness={0.7}
          roughness={0.3}
        />
      </RoundedBox>
      
      {/* Performance bar */}
      <RoundedBox 
        args={[0.5, barHeight, 0.5]} 
        position={[0, barHeight / 2, 0]}
        radius={0.02}
      >
        <meshStandardMaterial
          color={metric.color}
          metalness={0.6}
          roughness={0.4}
          emissive={metric.color}
          emissiveIntensity={0.2}
        />
      </RoundedBox>
      
      {/* Value indicator sphere */}
      <Sphere args={[0.08]} position={[0, barHeight + 0.2, 0]}>
        <meshStandardMaterial 
          color={metric.color} 
          emissive={metric.color} 
          emissiveIntensity={0.6}
        />
      </Sphere>

      {/* Metric label */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {metric.label}
      </Text>
      
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.1}
        color={metric.color}
        anchorX="center"
        anchorY="middle"
      >
        {`${metric.value.toFixed(1)}${metric.unit}`}
      </Text>
    </group>
  );
}

// Simple Performance Overview HUD
function SimplePerformanceHUD({ metrics }: { metrics: PerformanceMetric[] }) {
  const overallPerformance = useMemo(() => {
    const avgEfficiency = metrics.reduce((sum, m) => sum + (m.value / m.maxValue), 0) / metrics.length;
    const status = avgEfficiency > 0.9 ? 'EXCELLENT' : avgEfficiency > 0.7 ? 'GOOD' : avgEfficiency > 0.5 ? 'FAIR' : 'NEEDS ATTENTION';
    const statusColor = avgEfficiency > 0.9 ? '#00ff88' : avgEfficiency > 0.7 ? '#88ff00' : avgEfficiency > 0.5 ? '#ffaa00' : '#ff4444';
    
    return { avgEfficiency, status, statusColor };
  }, [metrics]);

  return (
    <Billboard position={[5, 3, 0]}>
      <Html transform distanceFactor={8}>
        <div className="bg-black/90 backdrop-blur-xl rounded-lg p-4 border border-cyan-400/30 min-w-64 shadow-xl">
          <div className="flex items-center mb-3 pb-2 border-b border-cyan-400/30">
            <div className="w-2 h-2 rounded-full animate-pulse mr-2" style={{ backgroundColor: overallPerformance.statusColor }}></div>
            <h3 className="text-cyan-400 font-mono font-bold text-sm">PERFORMANCE</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Overall:</span>
              <span className="font-mono font-bold" style={{ color: overallPerformance.statusColor }}>
                {(overallPerformance.avgEfficiency * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="font-mono" style={{ color: overallPerformance.statusColor }}>
                {overallPerformance.status}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-cyan-400/30">
            <div className="space-y-1">
              {metrics.slice(0, 3).map((metric, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-gray-400">{metric.label}:</span>
                  <span className="font-mono" style={{ color: metric.color }}>
                    {metric.value.toFixed(1)}{metric.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Html>
    </Billboard>
  );
}

// Main PerformanceMetrics3D Component
export default function PerformanceMetrics3D({ metrics }: PerformanceMetrics3DProps) {
  return (
    <group>
      {/* Basic Environment */}
      <Environment preset="warehouse" />
      
      {/* Simple Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[8, 8, 5]} intensity={1.2} />
      <pointLight position={[-8, 5, -5]} intensity={0.6} color="#0088ff" />

      {/* Bar chart visualization */}
      <group position={[-4, 0, 0]}>
        {metrics.slice(0, 4).map((metric, index) => (
          <SimpleMetricBar
            key={metric.label}
            metric={metric}
            position={[index * 2 - 3, 0, 0]}
            index={index}
          />
        ))}
      </group>
      
      {/* Performance Overview HUD */}
      <SimplePerformanceHUD metrics={metrics} />
      
      {/* Camera Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={20}
        minDistance={6}
        autoRotate={true}
        autoRotateSpeed={0.8}
      />
    </group>
  );
} 